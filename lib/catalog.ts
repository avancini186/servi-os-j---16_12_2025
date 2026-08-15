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
    // 1. Fetch published provider profiles with related profile, services, and reviews
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

    const { data, error, count } = await dbQuery;

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

    // 2. Map and filter in memory for composite search criteria
    let resultList: Provider[] = data.map((item: any) => {
      const profileName = item.profiles?.name || 'Prestador de Serviço';
      const avatarUrl = item.profiles?.avatar_url || '';
      
      // Calculate rating & reviews count from real reviews
      const reviews = item.reviews || [];
      const reviewsCount = reviews.length;
      const totalRatingSum = reviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0);
      const rating = reviewsCount > 0 ? Number((totalRatingSum / reviewsCount).toFixed(1)) : 0;

      // Extract service names & categories
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

      // Location
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

    // Filter by category (if specified)
    if (category && category.trim()) {
      const catLower = category.trim().toLowerCase();
      resultList = resultList.filter((p) =>
        p.category.toLowerCase() === catLower ||
        p.category.toLowerCase().includes(catLower)
      );
    }

    // Filter by city (if specified)
    if (city && city.trim()) {
      const cityLower = city.trim().toLowerCase();
      resultList = resultList.filter((p) =>
        p.location.toLowerCase().includes(cityLower)
      );
    }

    // Filter by min rating
    if (minRating && minRating > 0) {
      resultList = resultList.filter((p) => p.rating >= minRating);
    }

    // Text search query (name, professional title, services, category)
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

    // Apply pagination slice
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
