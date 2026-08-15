import { supabase } from './supabase';
import { getCurrentProfile } from './auth';

export interface ProviderDraftInput {
  professionalTitle: string;
  bio?: string;
  experienceYears?: number;
  phone?: string;
  whatsapp?: string;
  locationCity: string;
  locationState: string;
  serviceIds: number[];
  additionalCities?: string[];
}

export interface ExistingProviderDraft {
  id: number;
  profileId: number;
  professionalTitle: string;
  bio: string;
  experienceYears: number;
  phone: string;
  whatsapp: string;
  locationCity: string;
  locationState: string;
  status: string;
  serviceIds: number[];
  additionalCities: string[];
}

/**
 * Get existing provider profile draft for current authenticated provider
 */
export async function getProviderDraft(): Promise<ExistingProviderDraft | null> {
  try {
    const userProfile = await getCurrentProfile();
    if (!userProfile || userProfile.role !== 'provider') {
      return null;
    }

    const { data: providerProfile, error } = await supabase
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
        status
      `)
      .eq('profile_id', userProfile.id)
      .maybeSingle();

    if (error || !providerProfile) {
      return null;
    }

    // Fetch associated service IDs
    const { data: servicesData } = await supabase
      .from('provider_services')
      .select('service_id')
      .eq('provider_id', providerProfile.id);

    const serviceIds = (servicesData || []).map((s) => s.service_id);

    // Fetch additional service areas
    const { data: areasData } = await supabase
      .from('service_areas')
      .select('city')
      .eq('provider_id', providerProfile.id);

    const additionalCities = (areasData || []).map((a) => a.city);

    return {
      id: providerProfile.id,
      profileId: providerProfile.profile_id,
      professionalTitle: providerProfile.professional_title || '',
      bio: providerProfile.bio || '',
      experienceYears: providerProfile.experience_years || 0,
      phone: providerProfile.phone || '',
      whatsapp: providerProfile.whatsapp || '',
      locationCity: providerProfile.location_city || '',
      locationState: providerProfile.location_state || 'SP',
      status: providerProfile.status || 'draft',
      serviceIds: serviceIds,
      additionalCities: additionalCities,
    };
  } catch (err) {
    console.error('Error in getProviderDraft:', err);
    return null;
  }
}

/**
 * Save or update provider profile draft in provider_profiles with status = 'draft'
 */
export async function saveProviderDraft(input: ProviderDraftInput): Promise<{ success: boolean; providerId?: number; error?: string }> {
  try {
    const userProfile = await getCurrentProfile();
    if (!userProfile) {
      return { success: false, error: 'Usuário não autenticado.' };
    }
    if (userProfile.role !== 'provider') {
      return { success: false, error: 'Apenas usuários cadastrados como prestadores podem criar perfil profissional.' };
    }

    if (!input.professionalTitle.trim()) {
      return { success: false, error: 'Por favor, informe seu título profissional.' };
    }
    if (!input.locationCity.trim() || !input.locationState.trim()) {
      return { success: false, error: 'Por favor, informe sua cidade e estado principais.' };
    }
    if (!input.serviceIds || input.serviceIds.length === 0) {
      return { success: false, error: 'Selecione pelo menos um serviço para continuar.' };
    }

    // 1. Upsert provider_profiles record with status = 'draft'
    const { data: providerProfile, error: profileError } = await supabase
      .from('provider_profiles')
      .upsert({
        profile_id: userProfile.id,
        professional_title: input.professionalTitle.trim(),
        bio: (input.bio || '').trim(),
        experience_years: Math.max(0, Number(input.experienceYears) || 0),
        phone: (input.phone || '').trim(),
        whatsapp: (input.whatsapp || '').trim(),
        location_city: input.locationCity.trim(),
        location_state: input.locationState.trim().toUpperCase(),
        status: 'draft', // MUST STAY 'draft'
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id' })
      .select('id')
      .single();

    if (profileError || !providerProfile) {
      console.error('Error saving provider_profile draft:', profileError);
      return { success: false, error: profileError?.message || 'Falha ao salvar perfil profissional.' };
    }

    const providerId = providerProfile.id;

    // 2. Sync provider_services
    await supabase
      .from('provider_services')
      .delete()
      .eq('provider_id', providerId);

    const serviceInserts = input.serviceIds.map((sId) => ({
      provider_id: providerId,
      service_id: sId,
    }));

    const { error: servicesError } = await supabase
      .from('provider_services')
      .insert(serviceInserts);

    if (servicesError) {
      console.error('Error saving provider_services:', servicesError);
      return { success: false, error: 'Perfil criado, mas ocorreu um erro ao salvar os serviços.' };
    }

    // 3. Sync service_areas
    await supabase
      .from('service_areas')
      .delete()
      .eq('provider_id', providerId);

    if (input.additionalCities && input.additionalCities.length > 0) {
      const areaInserts = input.additionalCities
        .filter((c) => c.trim())
        .map((city) => ({
          provider_id: providerId,
          city: city.trim(),
          state: input.locationState.trim().toUpperCase(),
        }));

      if (areaInserts.length > 0) {
        await supabase
          .from('service_areas')
          .insert(areaInserts);
      }
    }

    return { success: true, providerId: providerId };
  } catch (err: any) {
    console.error('Error in saveProviderDraft:', err);
    return { success: false, error: err?.message || 'Erro inesperado ao salvar onboarding.' };
  }
}
