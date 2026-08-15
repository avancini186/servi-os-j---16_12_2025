import { supabase } from './supabase';
import { getCurrentProfile } from './auth';
import { DetailedProviderProfile } from './catalog';
import {
  ProfileCompleteness,
  ProfileCompletenessItem,
  ProviderLifecycleStatus,
  ProviderStatusHistory,
  PublicationRequestResult,
} from '../types';

export interface ProviderPreviewResult {
  success: boolean;
  profile?: DetailedProviderProfile;
  completeness?: ProfileCompleteness;
  error?: 'unauthorized' | 'forbidden' | 'not_found' | 'error';
  errorMessage?: string;
}

/**
 * Validates profile completeness based on P7 requirements:
 * Mandatory: Professional Title, City, State, at least 1 Service.
 * Optional: Bio, Phone/WhatsApp, Portfolio.
 */
export function checkProfileCompleteness(profile: DetailedProviderProfile): ProfileCompleteness {
  const hasTitle = !!profile.professionalTitle && profile.professionalTitle.trim().length > 0;
  const hasCity = !!profile.locationCity && profile.locationCity.trim().length > 0;
  const hasState = !!profile.locationState && profile.locationState.trim().length > 0;
  const hasServices = !!profile.services && profile.services.length > 0;

  const isComplete = hasTitle && hasCity && hasState && hasServices;

  const items: ProfileCompletenessItem[] = [
    {
      key: 'title',
      label: 'Título Profissional',
      status: hasTitle ? 'complete' : 'pending',
      isRequired: true,
    },
    {
      key: 'location',
      label: 'Cidade e Estado Principal',
      status: hasCity && hasState ? 'complete' : 'pending',
      isRequired: true,
    },
    {
      key: 'services',
      label: 'Serviços Oferecidos',
      status: hasServices ? 'complete' : 'pending',
      isRequired: true,
    },
    {
      key: 'contact',
      label: 'Contato (Telefone / WhatsApp)',
      status: !!profile.phone || !!profile.whatsapp ? 'complete' : 'optional',
      isRequired: false,
    },
    {
      key: 'bio',
      label: 'Sobre o seu trabalho (Bio)',
      status: !!profile.bio && profile.bio.trim().length > 0 ? 'complete' : 'optional',
      isRequired: false,
    },
    {
      key: 'portfolio',
      label: 'Portfólio de Trabalhos (Fotos)',
      status: profile.portfolio && profile.portfolio.length > 0 ? 'complete' : 'optional',
      isRequired: false,
    },
  ];

  const mandatoryCount = items.filter((i) => i.isRequired).length;
  const mandatoryCompleted = items.filter((i) => i.isRequired && i.status === 'complete').length;
  const optionalCompleted = items.filter((i) => !i.isRequired && i.status === 'complete').length;
  const totalCompleted = mandatoryCompleted + optionalCompleted;

  const score = Math.round((totalCompleted / items.length) * 100);

  return {
    isComplete,
    score,
    items,
  };
}

/**
 * Fetch provider profile details specifically for preview mode.
 * Enforces ownership check against auth.uid() -> profile_id.
 * Allows viewing draft profiles for the legitimate owner.
 */
export async function getProviderProfilePreview(
  providerId: string | number
): Promise<ProviderPreviewResult> {
  try {
    // 1. Verify user authentication & role
    const currentUserProfile = await getCurrentProfile();
    if (!currentUserProfile) {
      return {
        success: false,
        error: 'unauthorized',
        errorMessage: 'Você precisa estar autenticado para visualizar a pré-visualização do perfil.',
      };
    }

    if (currentUserProfile.role !== 'provider') {
      return {
        success: false,
        error: 'forbidden',
        errorMessage: 'Apenas prestadores de serviço podem visualizar a pré-visualização do perfil.',
      };
    }

    const numericId = Number(providerId);
    if (isNaN(numericId)) {
      return {
        success: false,
        error: 'not_found',
        errorMessage: 'Identificador de perfil inválido.',
      };
    }

    // 2. Query provider profile (without requiring status = 'published')
    const { data, error } = await supabase
      .from('provider_profiles')
      .select(`
        id,
        profile_id,
        professional_title,
        bio,
        experience_years,
        phone,
        whatsapp,
        location_city,
        location_state,
        status,
        profiles (
          id,
          user_id,
          name,
          email,
          avatar_url
        ),
        provider_services (
          services (
            id,
            name,
            categories (
              name
            )
          )
        ),
        portfolio_items (
          id,
          image_url,
          title,
          description,
          sort_order
        ),
        social_links (
          id,
          platform,
          url
        ),
        service_areas (
          id,
          city,
          state
        ),
        reviews (
          id,
          author_user_id,
          rating,
          text,
          created_at
        )
      `)
      .eq('id', numericId)
      .maybeSingle();

    if (error || !data) {
      console.error('Error fetching preview profile:', error);
      return {
        success: false,
        error: 'not_found',
        errorMessage: 'Perfil profissional não encontrado.',
      };
    }

    // 3. Strict Ownership Check:
    // Verify data.profile_id matches currentUserProfile.id
    if (data.profile_id !== currentUserProfile.id) {
      return {
        success: false,
        error: 'forbidden',
        errorMessage: 'Acesso negado. Você só tem permissão para visualizar o preview do seu próprio perfil.',
      };
    }

    // Process services
    const servicesList: { id: number; name: string; categoryName: string }[] = [];
    if (data.provider_services && Array.isArray(data.provider_services)) {
      data.provider_services.forEach((ps: any) => {
        if (ps.services) {
          servicesList.push({
            id: ps.services.id,
            name: ps.services.name,
            categoryName: ps.services.categories?.name || 'Geral',
          });
        }
      });
    }

    // Process portfolio
    const portfolioList: { id: number; imageUrl: string; title?: string; description?: string; sortOrder?: number }[] = [];
    if (data.portfolio_items && Array.isArray(data.portfolio_items)) {
      data.portfolio_items.forEach((item: any) => {
        portfolioList.push({
          id: item.id,
          imageUrl: item.image_url,
          title: item.title,
          description: item.description,
          sortOrder: item.sort_order || 0,
        });
      });
      portfolioList.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    // Process social links
    const socialLinksList: { id: number; platform: string; url: string }[] = [];
    if (data.social_links && Array.isArray(data.social_links)) {
      data.social_links.forEach((link: any) => {
        socialLinksList.push({
          id: link.id,
          platform: link.platform,
          url: link.url,
        });
      });
    }

    // Process service areas
    const serviceAreasList: { id: number; city: string; state: string }[] = [];
    if (data.service_areas && Array.isArray(data.service_areas)) {
      data.service_areas.forEach((area: any) => {
        serviceAreasList.push({
          id: area.id,
          city: area.city,
          state: area.state,
        });
      });
    }

    // Process reviews
    const reviewsList: { id: number; rating: number; text: string; authorName: string; createdAt: string }[] = [];
    let totalRating = 0;
    if (data.reviews && Array.isArray(data.reviews)) {
      data.reviews.forEach((r: any) => {
        totalRating += r.rating || 0;
        reviewsList.push({
          id: r.id,
          rating: r.rating,
          text: r.text,
          authorName: 'Cliente',
          createdAt: r.created_at,
        });
      });
    }

    const reviewsCount = reviewsList.length;
    const avgRating = reviewsCount > 0 ? Number((totalRating / reviewsCount).toFixed(1)) : 0;

    const profileObj: any = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;

    const profileRecord: DetailedProviderProfile = {
      id: data.id,
      profileId: data.profile_id,
      userId: profileObj?.user_id || '',
      name: profileObj?.name || 'Prestador de Serviço',
      avatarUrl: profileObj?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      professionalTitle: data.professional_title || 'Prestador de Serviço',
      bio: data.bio || '',
      experienceYears: data.experience_years || 0,
      phone: data.phone || '',
      whatsapp: data.whatsapp || '',
      locationCity: data.location_city || '',
      locationState: data.location_state || '',
      status: data.status || 'draft',
      rating: avgRating,
      reviewsCount: reviewsCount,
      services: servicesList,
      portfolio: portfolioList,
      socialLinks: socialLinksList,
      serviceAreas: serviceAreasList,
      reviews: reviewsList,
    };

    const completeness = checkProfileCompleteness(profileRecord);

    return {
      success: true,
      profile: profileRecord,
      completeness,
    };
  } catch (err: any) {
    console.error('Error in getProviderProfilePreview:', err);
    return {
      success: false,
      error: 'error',
      errorMessage: err?.message || 'Erro ao carregar pré-visualização do perfil.',
    };
  }
}

/**
 * Request profile publication (transitions status from 'draft' to 'pending_review')
 * Validates that profile is structurally complete before requesting.
 * Inserts entry into provider_status_history for audit trail.
 */
export async function requestPublication(
  providerId: number
): Promise<PublicationRequestResult> {
  try {
    const userProfile = await getCurrentProfile();
    if (!userProfile || userProfile.role !== 'provider') {
      return {
        success: false,
        error: 'unauthorized',
        errorMessage: 'Apenas prestadores autenticados podem solicitar publicação.',
      };
    }

    // 1. Fetch current profile preview to validate ownership and completeness
    const previewRes = await getProviderProfilePreview(providerId);
    if (!previewRes.success || !previewRes.profile || !previewRes.completeness) {
      return {
        success: false,
        error: previewRes.error || 'forbidden',
        errorMessage: previewRes.errorMessage || 'Não foi possível carregar o perfil para validação.',
      };
    }

    const currentStatus = (previewRes.profile.status || 'draft') as ProviderLifecycleStatus;

    // Check if already in pending_review, published, etc.
    if (currentStatus === 'pending_review') {
      return {
        success: true,
        newStatus: 'pending_review',
        errorMessage: 'Seu perfil já está em análise aguardando ativação.',
      };
    }

    if (currentStatus === 'published') {
      return {
        success: true,
        newStatus: 'published',
        errorMessage: 'Seu perfil já está publicado no catálogo público.',
      };
    }

    // 2. Validate structural completeness
    if (!previewRes.completeness.isComplete) {
      return {
        success: false,
        error: 'incomplete_profile',
        errorMessage: 'Complete as informações obrigatórias do seu perfil (Título, Cidade, Estado e Serviços) para solicitar a publicação.',
      };
    }

    // 3. Update status in provider_profiles to 'pending_review'
    const { error: updateError } = await supabase
      .from('provider_profiles')
      .update({
        status: 'pending_review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', providerId);

    if (updateError) {
      console.error('Error updating status to pending_review:', updateError);
      return {
        success: false,
        error: 'database_error',
        errorMessage: 'Falha ao alterar o status do perfil no banco de dados.',
      };
    }

    // 4. Record audit entry in provider_status_history
    const { error: historyError } = await supabase
      .from('provider_status_history')
      .insert({
        provider_id: providerId,
        from_status: currentStatus,
        to_status: 'pending_review',
        changed_by: userProfile.userId || null,
      });

    if (historyError) {
      console.warn('Warning: Status updated to pending_review, but failed to log history:', historyError);
    }

    return {
      success: true,
      newStatus: 'pending_review',
    };
  } catch (err: any) {
    console.error('Error in requestPublication:', err);
    return {
      success: false,
      error: 'exception',
      errorMessage: err?.message || 'Erro inesperado ao solicitar publicação.',
    };
  }
}

/**
 * Fetch status change history for a provider profile
 */
export async function getProviderStatusHistory(
  providerId: number
): Promise<ProviderStatusHistory[]> {
  try {
    const { data, error } = await supabase
      .from('provider_status_history')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching status history:', error);
      return [];
    }

    return (data || []).map((h: any) => ({
      id: h.id,
      providerId: h.provider_id,
      fromStatus: h.from_status,
      toStatus: h.to_status,
      changedBy: h.changed_by,
      rejectionReason: h.rejection_reason,
      createdAt: h.created_at,
    }));
  } catch (err) {
    console.error('Error in getProviderStatusHistory:', err);
    return [];
  }
}

