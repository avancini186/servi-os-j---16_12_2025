export interface Provider {
  id: number;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  location: string;
  professionalTitle?: string;
  services?: string[];
}

export interface Category {
  id?: number;
  icon: string;
  name: string;
  slug?: string;
}

export interface Review {
  id?: number;
  author: string;
  rating: number;
  text: string;
  createdAt?: string;
}

export interface ServiceItem {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
}

export interface PortfolioItem {
  id: number;
  providerId: number;
  imageUrl: string;
  title?: string;
  description?: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileCompletenessItem {
  key: string;
  label: string;
  status: 'complete' | 'pending' | 'optional';
  isRequired: boolean;
}

export interface ProfileCompleteness {
  isComplete: boolean;
  score: number;
  items: ProfileCompletenessItem[];
}

export type BillingInterval = 'month' | 'year';

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number; // Preço do ciclo
  monthlyEquivalent: number; // Valor equivalente por mês
  billingInterval: BillingInterval;
  billingIntervalCount: number; // 1, 3, 12
  isActive: boolean;
  sortOrder: number;
}

export type SubscriptionStatus = 'pending' | 'active' | 'past_due' | 'cancelled' | 'expired';

export interface ProviderSubscription {
  id: number;
  providerId: number;
  planId: number;
  plan?: SubscriptionPlan;
  status: SubscriptionStatus;
  startedAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelledAt?: string;
  gateway?: string;
  gatewayCustomerId?: string;
  gatewaySubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivationEligibility {
  isEligible: boolean;
  isProfileComplete: boolean;
  hasActiveSubscription: boolean;
  reasons: string[];
}

export type ProviderLifecycleStatus = 'draft' | 'pending_review' | 'published' | 'suspended' | 'rejected';

export interface ProviderStatusHistory {
  id: number;
  providerId: number;
  fromStatus: ProviderLifecycleStatus;
  toStatus: ProviderLifecycleStatus;
  changedBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface PublicationRequestResult {
  success: boolean;
  newStatus?: ProviderLifecycleStatus;
  error?: string;
  errorMessage?: string;
}

export type AdminProviderFilter = 'all' | 'pending_review' | 'published' | 'rejected' | 'suspended' | 'draft';

export interface AdminProviderListItem {
  id: number;
  profileId: number;
  userName: string;
  userEmail: string;
  avatarUrl: string;
  professionalTitle: string;
  locationCity: string;
  locationState: string;
  status: ProviderLifecycleStatus;
  rejectionReason?: string;
  updatedAt: string;
  createdAt: string;
  servicesCount: number;
  portfolioCount: number;
  isComplete: boolean;
}

export type AnalyticsEventType = 'search' | 'provider_impression' | 'profile_view' | 'contact_click' | 'social_click' | 'portfolio_view';

export type AnalyticsPeriod = 'today' | '7d' | '30d' | '90d' | 'all';

export interface AnalyticsTimelinePoint {
  date: string;
  views: number;
  impressions: number;
  contacts: number;
}

export interface TopSearchTerm {
  term: string;
  count: number;
}

export interface TopPortfolioItemMetrics {
  id: number;
  title: string;
  imageUrl: string;
  views: number;
}

export interface AnalyticsSummary {
  period: AnalyticsPeriod;
  totalViews: number;
  totalImpressions: number;
  totalContacts: number;
  impressionToViewRate: number; // % (visualizações / aparições)
  viewToContactRate: number; // % (contatos / visualizações)
  previousPeriodComparison?: {
    viewsChangePercent: number;
    impressionsChangePercent: number;
    contactsChangePercent: number;
  };
  contactBreakdown: {
    whatsapp: number;
    phone: number;
    email: number;
    website: number;
  };
  socialBreakdown: {
    instagram: number;
    facebook: number;
    linkedin: number;
    other: number;
  };
  topSearchTerms: TopSearchTerm[];
  topPortfolioItems: TopPortfolioItemMetrics[];
  timeline: AnalyticsTimelinePoint[];
}






