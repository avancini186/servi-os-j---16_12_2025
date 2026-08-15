import { supabase } from './supabase';
import { normalizeString } from './catalog';
import {
  AnalyticsEventType,
  AnalyticsPeriod,
  AnalyticsSummary,
  AnalyticsTimelinePoint,
  TopSearchTerm,
  TopPortfolioItemMetrics,
} from '../types';

interface TrackEventParams {
  providerId?: number;
  eventType: AnalyticsEventType;
  searchTerm?: string;
  channel?: string;
  portfolioItemId?: number;
}

/**
 * Track an aggregate analytics event safely with client-side deduplication
 */
export async function trackAnalyticsEvent(params: TrackEventParams): Promise<void> {
  try {
    const { providerId, eventType, searchTerm, channel, portfolioItemId } = params;

    // Deduplication key in sessionStorage (5 minutes window)
    const normalizedTerm = searchTerm ? normalizeString(searchTerm) : '';
    const dedupeKey = `an_evt_${eventType}_${providerId || 0}_${channel || ''}_${portfolioItemId || 0}_${normalizedTerm}`;

    const now = Date.now();
    const lastTracked = sessionStorage.getItem(dedupeKey);

    if (lastTracked && now - Number(lastTracked) < 5 * 60 * 1000) {
      // Skip duplicate event within 5 minutes
      return;
    }

    // Set deduplication timestamp
    sessionStorage.setItem(dedupeKey, String(now));

    // Call server-side SECURITY DEFINER RPC
    await supabase.rpc('log_analytics_event', {
      p_provider_id: providerId || null,
      p_event_type: eventType,
      p_search_term: normalizedTerm || null,
      p_channel: channel ? channel.toLowerCase() : null,
      p_portfolio_item_id: portfolioItemId || null,
    });
  } catch (err) {
    // Silent fail for analytics tracking so user experience is never impacted
    console.warn('Analytics tracking notice:', err);
  }
}

/**
 * Calculate start date for a period
 */
function getPeriodStartDate(period: AnalyticsPeriod): Date {
  const now = new Date();
  if (period === 'today') {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return today;
  }
  if (period === '7d') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (period === '90d') {
    const d = new Date(now);
    d.setDate(d.getDate() - 90);
    return d;
  }
  if (period === 'all') {
    return new Date(2020, 0, 1);
  }
  // Default '30d'
  const d = new Date(now);
  d.setDate(d.getDate() - 30);
  return d;
}

/**
 * Fetch and aggregate provider analytics summary for private dashboard
 */
export async function getProviderAnalyticsSummary(
  providerId: number,
  period: AnalyticsPeriod = '30d'
): Promise<AnalyticsSummary> {
  try {
    const startDate = getPeriodStartDate(period);
    const startDateIso = startDate.toISOString();

    // 1. Fetch all analytics events for this provider in current period
    const { data: events, error } = await supabase
      .from('provider_analytics_events')
      .select('id, event_type, search_term, channel, portfolio_item_id, created_at')
      .eq('provider_id', providerId)
      .gte('created_at', startDateIso)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching provider analytics events:', error);
      throw error;
    }

    const eventList = events || [];

    // Counters
    let totalViews = 0;
    let totalImpressions = 0;
    let totalContacts = 0;

    const contactBreakdown = { whatsapp: 0, phone: 0, email: 0, website: 0 };
    const socialBreakdown = { instagram: 0, facebook: 0, linkedin: 0, other: 0 };

    const searchTermsMap = new Map<string, number>();
    const portfolioViewsMap = new Map<number, number>();
    const timelineMap = new Map<string, { views: number; impressions: number; contacts: number }>();

    eventList.forEach((evt) => {
      const dateKey = new Date(evt.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });

      if (!timelineMap.has(dateKey)) {
        timelineMap.set(dateKey, { views: 0, impressions: 0, contacts: 0 });
      }

      const point = timelineMap.get(dateKey)!;

      if (evt.event_type === 'profile_view') {
        totalViews++;
        point.views++;
      } else if (evt.event_type === 'provider_impression') {
        totalImpressions++;
        point.impressions++;
      } else if (evt.event_type === 'contact_click') {
        totalContacts++;
        point.contacts++;
        const ch = (evt.channel || '').toLowerCase();
        if (ch === 'whatsapp') contactBreakdown.whatsapp++;
        else if (ch === 'phone' || ch === 'telefone') contactBreakdown.phone++;
        else if (ch === 'email') contactBreakdown.email++;
        else if (ch === 'website' || ch === 'site') contactBreakdown.website++;
        else contactBreakdown.phone++;
      } else if (evt.event_type === 'social_click') {
        const ch = (evt.channel || '').toLowerCase();
        if (ch === 'instagram') socialBreakdown.instagram++;
        else if (ch === 'facebook') socialBreakdown.facebook++;
        else if (ch === 'linkedin') socialBreakdown.linkedin++;
        else socialBreakdown.other++;
      } else if (evt.event_type === 'portfolio_view' && evt.portfolio_item_id) {
        const pId = Number(evt.portfolio_item_id);
        portfolioViewsMap.set(pId, (portfolioViewsMap.get(pId) || 0) + 1);
      }

      if (evt.search_term && evt.search_term.trim()) {
        const term = evt.search_term.trim();
        searchTermsMap.set(term, (searchTermsMap.get(term) || 0) + 1);
      }
    });

    // 2. Fetch Top Portfolio Items metadata if any portfolio views exist
    const topPortfolioItems: TopPortfolioItemMetrics[] = [];
    if (portfolioViewsMap.size > 0) {
      const pIds = Array.from(portfolioViewsMap.keys());
      const { data: pItems } = await supabase
        .from('portfolio_items')
        .select('id, title, image_url')
        .in('id', pIds);

      (pItems || []).forEach((item: any) => {
        topPortfolioItems.push({
          id: item.id,
          title: item.title || 'Foto de Trabalho',
          imageUrl: item.image_url,
          views: portfolioViewsMap.get(item.id) || 0,
        });
      });

      topPortfolioItems.sort((a, b) => b.views - a.views);
    }

    // 3. Process Top Search Terms
    const topSearchTerms: TopSearchTerm[] = Array.from(searchTermsMap.entries())
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 4. Process Timeline Points
    const timeline: AnalyticsTimelinePoint[] = Array.from(timelineMap.entries()).map(
      ([date, stats]) => ({
        date,
        views: stats.views,
        impressions: stats.impressions,
        contacts: stats.contacts,
      })
    );

    // 5. Rates
    const impressionToViewRate =
      totalImpressions > 0 ? Number(((totalViews / totalImpressions) * 100).toFixed(1)) : 0;
    const viewToContactRate =
      totalViews > 0 ? Number(((totalContacts / totalViews) * 100).toFixed(1)) : 0;

    // 6. Previous Period Comparison
    let previousPeriodComparison: AnalyticsSummary['previousPeriodComparison'] = undefined;

    if (period !== 'all' && period !== 'today') {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const prevEnd = new Date(startDate);
      const prevStart = new Date(startDate);
      prevStart.setDate(prevStart.getDate() - days);

      const { data: prevEvents } = await supabase
        .from('provider_analytics_events')
        .select('event_type')
        .eq('provider_id', providerId)
        .gte('created_at', prevStart.toISOString())
        .lt('created_at', prevEnd.toISOString());

      let prevViews = 0;
      let prevImpressions = 0;
      let prevContacts = 0;

      (prevEvents || []).forEach((e: any) => {
        if (e.event_type === 'profile_view') prevViews++;
        else if (e.event_type === 'provider_impression') prevImpressions++;
        else if (e.event_type === 'contact_click') prevContacts++;
      });

      const calcChange = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return Number((((curr - prev) / prev) * 100).toFixed(1));
      };

      previousPeriodComparison = {
        viewsChangePercent: calcChange(totalViews, prevViews),
        impressionsChangePercent: calcChange(totalImpressions, prevImpressions),
        contactsChangePercent: calcChange(totalContacts, prevContacts),
      };
    }

    return {
      period,
      totalViews,
      totalImpressions,
      totalContacts,
      impressionToViewRate,
      viewToContactRate,
      previousPeriodComparison,
      contactBreakdown,
      socialBreakdown,
      topSearchTerms,
      topPortfolioItems,
      timeline,
    };
  } catch (err) {
    console.error('Error in getProviderAnalyticsSummary:', err);
    return {
      period,
      totalViews: 0,
      totalImpressions: 0,
      totalContacts: 0,
      impressionToViewRate: 0,
      viewToContactRate: 0,
      contactBreakdown: { whatsapp: 0, phone: 0, email: 0, website: 0 },
      socialBreakdown: { instagram: 0, facebook: 0, linkedin: 0, other: 0 },
      topSearchTerms: [],
      topPortfolioItems: [],
      timeline: [],
    };
  }
}
