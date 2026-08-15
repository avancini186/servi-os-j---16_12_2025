import { supabase } from './supabase';
import { getCurrentProfile } from './auth';
import { getProviderProfilePreview, getProviderStatusHistory, checkProfileCompleteness } from './provider';
import {
  AdminProviderFilter,
  AdminProviderListItem,
  ProviderLifecycleStatus,
  ProviderStatusHistory,
  ProfileCompleteness,
} from '../types';
import { DetailedProviderProfile } from './catalog';

/**
 * Check if the currently authenticated user has administrative privileges
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const userProfile = await getCurrentProfile();
    if (!userProfile) return false;

    if (userProfile.role === 'admin') return true;

    // Call server-side SECURITY DEFINER RPC function
    const { data, error } = await supabase.rpc('is_admin', {
      p_user_id: userProfile.userId,
    });

    if (error) {
      console.warn('RPC is_admin error, fallback to table check:', error);
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', userProfile.userId)
        .maybeSingle();

      return !!adminData;
    }

    return !!data;
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
}

/**
 * Fetch provider profiles list for administration and moderation
 */
export async function getAdminProviders(
  statusFilter: AdminProviderFilter = 'all',
  searchQuery: string = ''
): Promise<AdminProviderListItem[]> {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      console.error('Access denied: User is not an admin.');
      return [];
    }

    let query = supabase
      .from('provider_profiles')
      .select(`
        id,
        profile_id,
        professional_title,
        location_city,
        location_state,
        status,
        rejection_reason,
        created_at,
        updated_at,
        profiles (
          id,
          name,
          email,
          avatar_url
        ),
        provider_services (
          id
        ),
        portfolio_items (
          id
        )
      `)
      .order('updated_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching admin providers list:', error);
      return [];
    }

    let items: AdminProviderListItem[] = (data || []).map((row: any) => {
      const profileObj = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const servicesCount = Array.isArray(row.provider_services) ? row.provider_services.length : 0;
      const portfolioCount = Array.isArray(row.portfolio_items) ? row.portfolio_items.length : 0;

      const hasTitle = !!row.professional_title && row.professional_title.trim().length > 0;
      const hasCity = !!row.location_city && row.location_city.trim().length > 0;
      const hasState = !!row.location_state && row.location_state.trim().length > 0;
      const isComplete = hasTitle && hasCity && hasState && servicesCount > 0;

      return {
        id: row.id,
        profileId: row.profile_id,
        userName: profileObj?.name || 'Prestador de Serviço',
        userEmail: profileObj?.email || '',
        avatarUrl: profileObj?.avatar_url || '',
        professionalTitle: row.professional_title || 'Sem título',
        locationCity: row.location_city || '',
        locationState: row.location_state || '',
        status: row.status as ProviderLifecycleStatus,
        rejectionReason: row.rejection_reason || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        servicesCount,
        portfolioCount,
        isComplete,
      };
    });

    // Client-side search filtering (name, title, city)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.userName.toLowerCase().includes(q) ||
          item.professionalTitle.toLowerCase().includes(q) ||
          item.locationCity.toLowerCase().includes(q) ||
          item.userEmail.toLowerCase().includes(q)
      );
    }

    // Sort: 'pending_review' first, then latest updated
    items.sort((a, b) => {
      if (a.status === 'pending_review' && b.status !== 'pending_review') return -1;
      if (a.status !== 'pending_review' && b.status === 'pending_review') return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return items;
  } catch (err) {
    console.error('Error in getAdminProviders:', err);
    return [];
  }
}

/**
 * Fetch full provider details, completeness checklist, and immutable status history for admin review
 */
export async function getAdminProviderDetails(
  providerId: number
): Promise<{
  profile: DetailedProviderProfile;
  completeness: ProfileCompleteness;
  history: ProviderStatusHistory[];
} | null> {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      console.error('Access denied: User is not an admin.');
      return null;
    }

    const previewRes = await getProviderProfilePreview(providerId);
    if (!previewRes.success || !previewRes.profile || !previewRes.completeness) {
      return null;
    }

    const history = await getProviderStatusHistory(providerId);

    return {
      profile: previewRes.profile,
      completeness: previewRes.completeness,
      history,
    };
  } catch (err) {
    console.error('Error in getAdminProviderDetails:', err);
    return null;
  }
}

/**
 * Admin action: Approve provider profile (pending_review -> published) via RPC
 */
export async function adminApproveProvider(
  providerId: number
): Promise<{ success: boolean; errorMessage?: string }> {
  try {
    const { data, error } = await supabase.rpc('admin_approve_provider', {
      p_provider_id: providerId,
    });

    if (error) {
      console.error('RPC admin_approve_provider error:', error);
      return { success: false, errorMessage: error.message || 'Falha ao aprovar perfil.' };
    }

    if (data && data.success === false) {
      return { success: false, errorMessage: data.message || 'Falha ao aprovar perfil.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error in adminApproveProvider:', err);
    return { success: false, errorMessage: err?.message || 'Erro inesperado ao aprovar perfil.' };
  }
}

/**
 * Admin action: Reject provider profile (pending_review -> rejected) with mandatory reason via RPC
 */
export async function adminRejectProvider(
  providerId: number,
  reason: string
): Promise<{ success: boolean; errorMessage?: string }> {
  try {
    if (!reason.trim()) {
      return { success: false, errorMessage: 'Por favor, informe o motivo da recusa.' };
    }

    const { data, error } = await supabase.rpc('admin_reject_provider', {
      p_provider_id: providerId,
      p_reason: reason.trim(),
    });

    if (error) {
      console.error('RPC admin_reject_provider error:', error);
      return { success: false, errorMessage: error.message || 'Falha ao recusar perfil.' };
    }

    if (data && data.success === false) {
      return { success: false, errorMessage: data.message || 'Falha ao recusar perfil.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error in adminRejectProvider:', err);
    return { success: false, errorMessage: err?.message || 'Erro inesperado ao recusar perfil.' };
  }
}

/**
 * Admin action: Suspend provider profile (published -> suspended) via RPC
 */
export async function adminSuspendProvider(
  providerId: number,
  reason?: string
): Promise<{ success: boolean; errorMessage?: string }> {
  try {
    const { data, error } = await supabase.rpc('admin_suspend_provider', {
      p_provider_id: providerId,
      p_reason: reason?.trim() || null,
    });

    if (error) {
      console.error('RPC admin_suspend_provider error:', error);
      return { success: false, errorMessage: error.message || 'Falha ao suspender perfil.' };
    }

    if (data && data.success === false) {
      return { success: false, errorMessage: data.message || 'Falha ao suspender perfil.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error in adminSuspendProvider:', err);
    return { success: false, errorMessage: err?.message || 'Erro inesperado ao suspender perfil.' };
  }
}
