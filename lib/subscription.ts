import { supabase } from './supabase';
import { getCurrentProfile } from './auth';
import { getProviderProfilePreview } from './provider';
import {
  SubscriptionPlan,
  ProviderSubscription,
  ActivationEligibility,
} from '../types';

/**
 * Fetch all active commercial subscription plans ordered by sort_order
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }

    return (data || []).map((p: any) => {
      const price = Number(p.price) || 0;
      const count = Number(p.billing_interval_count) || 1;
      const monthlyEquivalent = Number((price / count).toFixed(2));

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description || '',
        price,
        monthlyEquivalent,
        billingInterval: p.billing_interval,
        billingIntervalCount: count,
        isActive: p.is_active,
        sortOrder: p.sort_order || 0,
      };
    });
  } catch (err) {
    console.error('Error in getSubscriptionPlans:', err);
    return [];
  }
}

/**
 * Fetch current subscription (pending or active) for a provider
 */
export async function getMySubscription(providerId: number): Promise<ProviderSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('provider_subscriptions')
      .select(`
        id,
        provider_id,
        plan_id,
        status,
        started_at,
        current_period_start,
        current_period_end,
        cancelled_at,
        gateway,
        gateway_customer_id,
        gateway_subscription_id,
        created_at,
        updated_at,
        subscription_plans (
          id,
          name,
          slug,
          description,
          price,
          billing_interval,
          billing_interval_count,
          is_active,
          sort_order
        )
      `)
      .eq('provider_id', providerId)
      .in('status', ['pending', 'active'])
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const planData: any = Array.isArray(data.subscription_plans)
      ? data.subscription_plans[0]
      : data.subscription_plans;

    let plan: SubscriptionPlan | undefined = undefined;
    if (planData) {
      const price = Number(planData.price) || 0;
      const count = Number(planData.billing_interval_count) || 1;
      plan = {
        id: planData.id,
        name: planData.name,
        slug: planData.slug,
        description: planData.description || '',
        price,
        monthlyEquivalent: Number((price / count).toFixed(2)),
        billingInterval: planData.billing_interval,
        billingIntervalCount: count,
        isActive: planData.is_active,
        sortOrder: planData.sort_order || 0,
      };
    }

    return {
      id: data.id,
      providerId: data.provider_id,
      planId: data.plan_id,
      plan,
      status: data.status as any,
      startedAt: data.started_at,
      currentPeriodStart: data.current_period_start,
      currentPeriodEnd: data.current_period_end,
      cancelledAt: data.cancelled_at,
      gateway: data.gateway,
      gatewayCustomerId: data.gateway_customer_id,
      gatewaySubscriptionId: data.gateway_subscription_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.error('Error in getMySubscription:', err);
    return null;
  }
}

/**
 * Register intent to subscribe to a commercial plan (creates status = 'pending')
 */
export async function createPendingSubscription(
  providerId: number,
  planId: number
): Promise<{ success: boolean; data?: ProviderSubscription; error?: string }> {
  try {
    const userProfile = await getCurrentProfile();
    if (!userProfile || userProfile.role !== 'provider') {
      return { success: false, error: 'Apenas prestadores de serviço podem assinar um plano.' };
    }

    // Check if there is an existing pending or active subscription
    const existing = await getMySubscription(providerId);
    if (existing) {
      if (existing.status === 'active') {
        return {
          success: false,
          error: 'Você já possui uma assinatura ativa no momento.',
        };
      }
      if (existing.status === 'pending' && existing.planId === planId) {
        return {
          success: true,
          data: existing,
        };
      }
      // If there is an existing pending subscription for a different plan, delete/cancel old pending before creating new
      await supabase
        .from('provider_subscriptions')
        .delete()
        .eq('id', existing.id)
        .eq('status', 'pending');
    }

    const { data: inserted, error } = await supabase
      .from('provider_subscriptions')
      .insert({
        provider_id: providerId,
        plan_id: planId,
        status: 'pending',
      })
      .select(`
        id,
        provider_id,
        plan_id,
        status,
        created_at,
        updated_at,
        subscription_plans (
          id,
          name,
          slug,
          price,
          billing_interval,
          billing_interval_count,
          is_active,
          sort_order
        )
      `)
      .single();

    if (error || !inserted) {
      console.error('Error creating pending subscription:', error);
      return { success: false, error: 'Falha ao registrar a assinatura pendente.' };
    }

    const planData: any = Array.isArray(inserted.subscription_plans)
      ? inserted.subscription_plans[0]
      : inserted.subscription_plans;

    let plan: SubscriptionPlan | undefined = undefined;
    if (planData) {
      const price = Number(planData.price) || 0;
      const count = Number(planData.billing_interval_count) || 1;
      plan = {
        id: planData.id,
        name: planData.name,
        slug: planData.slug,
        description: planData.description || '',
        price,
        monthlyEquivalent: Number((price / count).toFixed(2)),
        billingInterval: planData.billing_interval,
        billingIntervalCount: count,
        isActive: planData.is_active,
        sortOrder: planData.sort_order || 0,
      };
    }

    const newSub: ProviderSubscription = {
      id: inserted.id,
      providerId: inserted.provider_id,
      planId: inserted.plan_id,
      plan,
      status: inserted.status as any,
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
    };

    return { success: true, data: newSub };
  } catch (err: any) {
    console.error('Error in createPendingSubscription:', err);
    return { success: false, error: err?.message || 'Erro ao registrar assinatura.' };
  }
}

/**
 * Calculates activation eligibility for a provider.
 * Requires:
 * 1. Profile Completeness (Mandatory Title, City, State, >= 1 Service)
 * 2. Active Subscription (status === 'active')
 */
export async function getActivationEligibility(
  providerId: number
): Promise<ActivationEligibility> {
  try {
    const previewRes = await getProviderProfilePreview(providerId);
    const isProfileComplete = previewRes.completeness?.isComplete || false;

    const sub = await getMySubscription(providerId);
    const hasActiveSubscription = sub?.status === 'active';

    const reasons: string[] = [];

    if (!isProfileComplete) {
      reasons.push('Seu perfil profissional ainda possui informações obrigatórias pendentes.');
    }

    if (!hasActiveSubscription) {
      if (sub?.status === 'pending') {
        reasons.push('Sua assinatura foi registrada mas está aguardando confirmação do pagamento (Status: Pending).');
      } else {
        reasons.push('Você ainda não possui uma assinatura ativa para o seu perfil.');
      }
    }

    const isEligible = isProfileComplete && hasActiveSubscription;

    return {
      isEligible,
      isProfileComplete,
      hasActiveSubscription,
      reasons,
    };
  } catch (err) {
    console.error('Error calculating activation eligibility:', err);
    return {
      isEligible: false,
      isProfileComplete: false,
      hasActiveSubscription: false,
      reasons: ['Erro ao verificar elegibilidade de ativação.'],
    };
  }
}
