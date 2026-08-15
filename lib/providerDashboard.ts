import { supabase } from './supabase';
import { getCurrentProfile } from './auth';
import { getProviderDraft } from './onboarding';
import { checkProfileCompleteness } from './provider';
import { getMySubscription, getActivationEligibility } from './subscription';
import { getProviderAnalyticsSummary } from './analytics';
import {
  ProfileCompleteness,
  ProviderLifecycleStatus,
  ProviderSubscription,
  ActivationEligibility,
} from '../types';

export interface ProviderDashboardData {
  providerId: number;
  profileId: number;
  userName: string;
  avatarUrl: string;
  professionalTitle: string;
  locationCity: string;
  locationState: string;
  status: ProviderLifecycleStatus;
  rejectionReason?: string;
  completeness: ProfileCompleteness;
  subscription: ProviderSubscription | null;
  eligibility: ActivationEligibility;
  portfolioCount: number;
  analytics: {
    views30d: number;
    contacts30d: number;
    impressions30d: number;
    interactionRate: number;
  };
}

/**
 * Aggregates all dashboard summary data for the authenticated provider
 */
export async function getProviderDashboardSummary(): Promise<ProviderDashboardData | null> {
  try {
    const userProfile = await getCurrentProfile();
    if (!userProfile || userProfile.role !== 'provider') {
      return null;
    }

    const draft = await getProviderDraft();
    if (!draft || !draft.id) {
      return null;
    }

    const providerId = draft.id;

    // Fetch subscription, eligibility, analytics summary, portfolio count in parallel
    const [subRes, eligRes, analyticsRes, portfolioRes] = await Promise.allSettled([
      getMySubscription(providerId),
      getActivationEligibility(providerId),
      getProviderAnalyticsSummary(providerId, '30d'),
      supabase.from('portfolio_items').select('id', { count: 'exact' }).eq('provider_id', providerId),
    ]);

    const subscription = subRes.status === 'fulfilled' ? subRes.value : null;
    const eligibility = eligRes.status === 'fulfilled' ? eligRes.value : {
      isEligible: false,
      isProfileComplete: false,
      hasActiveSubscription: false,
      reasons: [],
    };
    const analytics = analyticsRes.status === 'fulfilled' ? analyticsRes.value : {
      totalViews: 0,
      totalContacts: 0,
      totalImpressions: 0,
      viewToContactRate: 0,
    };
    const portfolioCount = portfolioRes.status === 'fulfilled' ? (portfolioRes.value.count || 0) : 0;

    // Build DetailedProviderProfile format for checkProfileCompleteness
    const dummyProfile = {
      id: draft.id,
      profileId: draft.profileId,
      userId: userProfile.userId,
      name: userProfile.name,
      avatarUrl: userProfile.avatarUrl || '',
      professionalTitle: draft.professionalTitle || '',
      bio: draft.bio || '',
      experienceYears: draft.experienceYears || 0,
      phone: draft.phone || '',
      whatsapp: draft.whatsapp || '',
      locationCity: draft.locationCity || '',
      locationState: draft.locationState || '',
      status: draft.status || 'draft',
      rating: 0,
      reviewsCount: 0,
      services: (draft.serviceIds || []).map((id) => ({ id, name: 'Serviço', categoryName: 'Geral' })),
      portfolio: [],
      socialLinks: [],
      serviceAreas: (draft.additionalCities || []).map((city, id) => ({ id, city, state: draft.locationState || 'SP' })),
      reviews: [],
    };

    const completeness = checkProfileCompleteness(dummyProfile as any);

    return {
      providerId: draft.id,
      profileId: draft.profileId,
      userName: userProfile.name,
      avatarUrl: userProfile.avatarUrl || '',
      professionalTitle: draft.professionalTitle || 'Prestador de Serviço',
      locationCity: draft.locationCity || '',
      locationState: draft.locationState || '',
      status: (draft.status as ProviderLifecycleStatus) || 'draft',
      rejectionReason: draft.rejectionReason,
      completeness,
      subscription,
      eligibility,
      portfolioCount,
      analytics: {
        views30d: analytics.totalViews,
        contacts30d: analytics.totalContacts,
        impressions30d: analytics.totalImpressions,
        interactionRate: analytics.viewToContactRate,
      },
    };
  } catch (err) {
    console.error('Error in getProviderDashboardSummary:', err);
    return null;
  }
}
