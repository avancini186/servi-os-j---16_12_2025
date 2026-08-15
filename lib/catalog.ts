import { supabase } from './supabase';
import type { Category, Provider } from '../types';

export interface SearchOptions {
  query?: string;
  category?: string;
  city?: string;
  minRating?: number;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  providers: Provider[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DetailedProviderProfile {
  id: number;
  profileId: number;
  userId: string;
  name: string;
  avatarUrl: string;
  professionalTitle: string;
  bio: string;
  experienceYears?: number;
  phone?: string;
  whatsapp?: string;
  locationCity?: string;
  locationState?: string;
  status: string;
  rating: number;
  reviewsCount: number;
  services: { id: number; name: string; categoryName: string }[];
  portfolio: { id: number; imageUrl: string; title?: string; description?: string; sortOrder?: number }[];
  socialLinks: { id: number; platform: string; url: string }[];
  serviceAreas: { id: number; city: string; state: string }[];
  reviews: { id: number; rating: number; text: string; authorName: string; createdAt: string }[];
}

/**
 * Fetch all categories from Supabase database
 */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, icon, slug')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories from Supabase:', error);
    throw error;
  }

  return (data || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    slug: cat.slug,
  }));
}

/**
 * Fetch unique available cities from published providers & service areas
 */
export async function getAvailableCities(): Promise<string[]> {
  try {
    const { data: providerCities, error: pError } = await supabase
      .from('provider_profiles')
      .select('location_city')
      .eq('status', 'published');

    if (pError) throw pError;

    const { data: areaCities, error: aError } = await supabase
      .from('service_areas')
      .select('city');

    if (aError) throw aError;

    const citiesSet = new Set<string>();

    (providerCities || []).forEach((p) => {
      if (p.location_city && p.location_city.trim()) {
        citiesSet.add(p.location_city.trim());
      }
    });

    (areaCities || []).forEach((a) => {
      if (a.city && a.city.trim()) {
        citiesSet.add(a.city.trim());
      }
    });

    return Array.from(citiesSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  } catch (err) {
    console.error('Error fetching available cities:', err);
    return [];
  }
}

/**
 * Query published providers with filter & pagination from Supabase
 */
export async function searchProviders(options: SearchOptions = {}): Promise<SearchResult> {
  const {
    query = '',
    category = '',
    city = '',
    minRating = 0,
    page = 1,
    limit = 10,
  } = options;

  try {
    let dbQuery = supabase
      .from('provider_profiles')
      .select(`
        id,
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
          name,
          email,
          avatar_url,
          role
        ),
        provider_services (
          services (
            id,
            name,
            slug,
            categories (
              id,
              name,
              slug
            )
          )
        ),
        service_areas (
          city,
          state
        ),
        reviews (
          id,
          rating,
          text
        )
      `, { count: 'exact' })
      .eq('status', 'published');

    const { data, error } = await dbQuery;

    if (error) {
      console.error('Error querying provider_profiles:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return {
        providers: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }

    let resultList: Provider[] = data.map((item: any) => {
      const profileName = item.profiles?.name || 'Prestador de Serviço';
      const avatarUrl = item.profiles?.avatar_url || '';
      
      const reviews = item.reviews || [];
      const reviewsCount = reviews.length;
      const totalRatingSum = reviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0);
      const rating = reviewsCount > 0 ? Number((totalRatingSum / reviewsCount).toFixed(1)) : 0;

      const servicesList: string[] = [];
      let categoryName = 'Geral';

      if (item.provider_services && Array.isArray(item.provider_services)) {
        item.provider_services.forEach((ps: any) => {
          if (ps.services) {
            if (ps.services.name) servicesList.push(ps.services.name);
            if (ps.services.categories?.name) {
              categoryName = ps.services.categories.name;
            }
          }
        });
      }

      const location = item.location_city
        ? `${item.location_city}${item.location_state ? ', ' + item.location_state : ''}`
        : 'Brasil';

      return {
        id: item.id,
        name: profileName,
        category: categoryName,
        description: item.bio || item.professional_title || 'Prestador qualificado no Serviços Já.',
        rating: rating,
        reviewsCount: reviewsCount,
        imageUrl: avatarUrl,
        location: location,
        professionalTitle: item.professional_title || '',
        services: servicesList,
      };
    });

    if (category && category.trim()) {
      const catLower = category.trim().toLowerCase();
      resultList = resultList.filter((p) =>
        p.category.toLowerCase() === catLower ||
        p.category.toLowerCase().includes(catLower)
      );
    }

    if (city && city.trim()) {
      const cityLower = city.trim().toLowerCase();
      resultList = resultList.filter((p) =>
        p.location.toLowerCase().includes(cityLower)
      );
    }

    if (minRating && minRating > 0) {
      resultList = resultList.filter((p) => p.rating >= minRating);
    }

    if (query && query.trim()) {
      const qLower = query.trim().toLowerCase();
      resultList = resultList.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(qLower);
        const titleMatch = (p.professionalTitle || '').toLowerCase().includes(qLower);
        const catMatch = p.category.toLowerCase().includes(qLower);
        const descMatch = p.description.toLowerCase().includes(qLower);
        const servicesMatch = (p.services || []).some((s) => s.toLowerCase().includes(qLower));

        return nameMatch || titleMatch || catMatch || descMatch || servicesMatch;
      });
    }

    const totalFiltered = resultList.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;

    const startIndex = (page - 1) * limit;
    const paginatedProviders = resultList.slice(startIndex, startIndex + limit);

    return {
      providers: paginatedProviders,
      total: totalFiltered,
      page: page,
      totalPages: totalPages,
    };
  } catch (err) {
    console.error('Error in searchProviders:', err);
    throw err;
  }
}

/**
 * Fetch detailed public profile for a single provider by ID from Supabase
 */
export async function getProviderProfile(providerId: string | number): Promise<DetailedProviderProfile | null> {
  const numericId = Number(providerId);
  if (isNaN(numericId)) return null;

  try {
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
      .eq('status', 'published')
      .single();

    if (error || !data) {
      console.log('Provider profile not found or not published:', error?.message);
      return null;
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
      data.social_links.forEach((sl: any) => {
        socialLinksList.push({
          id: sl.id,
          platform: sl.platform,
          url: sl.url,
        });
      });
    }

    // Process service areas
    const serviceAreasList: { id: number; city: string; state: string }[] = [];
    if (data.service_areas && Array.isArray(data.service_areas)) {
      data.service_areas.forEach((sa: any) => {
        serviceAreasList.push({
          id: sa.id,
          city: sa.city,
          state: sa.state,
        });
      });
    }

    // Process reviews & calculate rating
    const rawReviews = data.reviews || [];
    const reviewsCount = rawReviews.length;
    const totalRatingSum = rawReviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0);
    const rating = reviewsCount > 0 ? Number((totalRatingSum / reviewsCount).toFixed(1)) : 0;

    // Fetch author names for reviews from profiles table
    const authorUserIds = Array.from(new Set(rawReviews.map((r: any) => r.author_user_id).filter(Boolean)));
    const authorNamesMap = new Map<string, string>();

    if (authorUserIds.length > 0) {
      const { data: authorsData } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', authorUserIds);

      (authorsData || []).forEach((a: any) => {
        if (a.user_id && a.name) {
          authorNamesMap.set(a.user_id, a.name);
        }
      });
    }

    const reviewsList = rawReviews.map((r: any) => ({
      id: r.id,
      rating: Number(r.rating || 5),
      text: r.text || '',
      authorName: authorNamesMap.get(r.author_user_id) || 'Cliente',
      createdAt: r.created_at || new Date().toISOString(),
    }));

    const profileName = (data.profiles as any)?.name || 'Prestador de Serviço';
    const avatarUrl = (data.profiles as any)?.avatar_url || '';

    return {
      id: data.id,
      profileId: data.profile_id,
      userId: (data.profiles as any)?.user_id || '',
      name: profileName,
      avatarUrl: avatarUrl,
      professionalTitle: data.professional_title || 'Profissional Autônomo',
      bio: data.bio || '',
      experienceYears: data.experience_years,
      phone: data.phone,
      whatsapp: data.whatsapp,
      locationCity: data.location_city,
      locationState: data.location_state,
      status: data.status,
      rating: rating,
      reviewsCount: reviewsCount,
      services: servicesList,
      portfolio: portfolioList,
      socialLinks: socialLinksList,
      serviceAreas: serviceAreasList,
      reviews: reviewsList,
    };
  } catch (err) {
    console.error('Error in getProviderProfile:', err);
    return null;
  }
}
