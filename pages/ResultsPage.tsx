import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { getCategories, getAvailableCities, searchProviders } from '../lib/catalog';
import { trackAnalyticsEvent } from '../lib/analytics';
import type { Provider, Category } from '../types';

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract URL Params
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const cityParam = searchParams.get('city') || '';
  const minRatingParam = Number(searchParams.get('minRating')) || 0;
  const pageParam = Number(searchParams.get('page')) || 1;

  // Local Component State
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Load Categories and Available Cities on Mount
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [catsData, citiesData] = await Promise.all([
          getCategories(),
          getAvailableCities(),
        ]);
        setCategories(catsData);
        setAvailableCities(citiesData);
      } catch (err) {
        console.error('Error loading metadata filters:', err);
      }
    }
    loadMetadata();
  }, []);

  // Fetch Providers whenever URL Search Params Change
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchProviders({
        query: queryParam,
        category: categoryParam,
        city: cityParam,
        minRating: minRatingParam,
        page: pageParam,
        limit: 10,
      });

      setProviders(result.providers);
      setTotalCount(result.total);
      setTotalPages(result.totalPages);

      // Track Search Term if present
      if (queryParam && queryParam.trim()) {
        trackAnalyticsEvent({ eventType: 'search', searchTerm: queryParam.trim() });
      }

      // Track Impression for each provider rendered on results
      result.providers.forEach((p) => {
        trackAnalyticsEvent({
          providerId: p.id,
          eventType: 'provider_impression',
          searchTerm: queryParam || undefined,
        });
      });
    } catch (err: any) {
      console.error('Error fetching providers:', err);
      setError('Não foi possível carregar os prestadores de serviço.');
    } finally {
      setLoading(false);
    }
  }, [queryParam, categoryParam, cityParam, minRatingParam, pageParam]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Update URL Query Params Helper
  const updateFilters = (newParams: Record<string, string | number | null>) => {
    const updated = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === 0) {
        updated.delete(key);
      } else {
        updated.set(key, String(value));
      }
    });

    // Reset to page 1 whenever filters change (unless page is explicitly updated)
    if (!('page' in newParams)) {
      updated.delete('page');
    }

    setSearchParams(updated);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Avatar Fallback Helper
  const getProviderAvatar = (provider: Provider) => {
    if (provider.imageUrl && provider.imageUrl.trim()) {
      return provider.imageUrl;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=137fec&color=fff`;
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:grid md:grid-cols-4 gap-8">
          {/* Mobile Filter Toggle */}
          <button
            className="md:hidden w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-card-dark rounded-lg shadow-sm mb-4"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
              <span className="material-symbols-outlined">filter_list</span>
              Filtrar Resultados
            </span>
            <span className="material-symbols-outlined">
              {showFilters ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* SideNavBar - Collapsible on Mobile */}
          <aside className={`col-span-1 md:sticky md:top-24 h-fit ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="flex h-full flex-col justify-between rounded-xl bg-white dark:bg-card-dark p-6 shadow-sm">
              <div className="flex flex-col gap-6">
                <h3 className="text-text-light-primary dark:text-text-dark-primary text-lg font-bold">Filtros</h3>

                {/* Categories Filter */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary">sell</span>
                    <p className="text-primary text-sm font-bold">Categorias</p>
                  </div>
                  <div className="px-3">
                    <select
                      value={categoryParam}
                      onChange={(e) => updateFilters({ category: e.target.value || null })}
                      className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="">Todas as Categorias</option>
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location Filter */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                    <span className="material-symbols-outlined text-text-light-secondary dark:text-text-dark-secondary">
                      location_on
                    </span>
                    <p className="text-text-light-primary dark:text-text-dark-primary text-sm font-medium">
                      Localização
                    </p>
                  </div>
                  <div className="px-3">
                    <select
                      value={cityParam}
                      onChange={(e) => updateFilters({ city: e.target.value || null })}
                      className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="">Todas as Cidades</option>
                      {availableCities.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                    <span className="material-symbols-outlined text-text-light-secondary dark:text-text-dark-secondary">
                      star
                    </span>
                    <p className="text-text-light-primary dark:text-text-dark-primary text-sm font-medium">Avaliação Mínima</p>
                  </div>
                  <div className="pl-4 flex flex-wrap gap-2">
                    {[4, 4.5, 4.8].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => updateFilters({ minRating: minRatingParam === rating ? null : rating })}
                        className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${minRatingParam === rating
                            ? 'bg-primary text-white border-primary'
                            : 'bg-transparent text-text-light-secondary border-gray-300 hover:border-primary hover:text-primary'
                          }`}
                      >
                        {rating}+
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <button
                onClick={clearFilters}
                className="mt-8 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 dark:bg-primary/20 text-primary text-sm font-bold tracking-wide hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
              >
                <span className="truncate">Limpar Filtros</span>
              </button>
            </div>
          </aside>

          {/* Results Main Content */}
          <div className="col-span-1 md:col-span-3">
            {/* PageHeading & Search Input */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-text-light-primary dark:text-text-dark-primary text-2xl sm:text-3xl font-black tracking-tighter">
                  {queryParam
                    ? `Resultados para "${queryParam}"`
                    : categoryParam
                      ? `Resultados em "${categoryParam}"`
                      : 'Prestadores de Serviço'}
                </h1>
                <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm font-normal">
                  {loading ? 'Buscando prestadores...' : `${totalCount} prestador(es) encontrado(s)`}
                </p>
              </div>

              {/* Inline Search Bar */}
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  key={queryParam}
                  defaultValue={queryParam}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateFilters({ q: (e.target as HTMLInputElement).value || null });
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value !== queryParam) {
                      updateFilters({ q: e.target.value || null });
                    }
                  }}
                  placeholder="Pesquisar serviço (ex: Eletricista)..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Loading Skeleton State */}
            {loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-44 bg-white dark:bg-card-dark rounded-xl p-4 shadow-sm"></div>
                ))}
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-12 px-6 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 text-center">
                <span className="material-symbols-outlined text-5xl text-red-500 mb-3">error</span>
                <p className="text-gray-900 dark:text-white text-lg font-bold mb-1">{error}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Não conseguimos carregar os resultados do banco de dados.</p>
                <button
                  onClick={fetchProviders}
                  className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Cards Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {providers.length > 0 ? (
                  providers.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex items-stretch justify-between gap-4 rounded-xl bg-white dark:bg-card-dark p-4 shadow-sm transition-shadow hover:shadow-lg border border-gray-100 dark:border-gray-800"
                    >
                      <div
                        className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        style={{ backgroundImage: `url("${getProviderAvatar(provider)}")` }}
                      ></div>
                      <div className="flex flex-col gap-2 flex-1 justify-between">
                        <div className="flex flex-col gap-1">
                          {/* Rating Display */}
                          {provider.reviewsCount > 0 ? (
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                              <span className="material-symbols-outlined text-sm text-amber-500">star</span>
                              <span>{provider.rating.toFixed(1)}</span>
                              <span className="text-slate-400 font-normal">
                                ({provider.reviewsCount} {provider.reviewsCount === 1 ? 'avaliação' : 'avaliações'})
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                              <span className="material-symbols-outlined text-sm text-slate-300">star_outline</span>
                              <span>Ainda sem avaliações</span>
                            </div>
                          )}

                          <p className="text-text-light-primary dark:text-text-dark-primary text-base font-bold leading-tight">
                            {provider.name}
                          </p>
                          {provider.professionalTitle && (
                            <p className="text-xs text-primary font-bold">
                              {provider.professionalTitle}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-text-light-secondary dark:text-text-dark-secondary text-xs">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            <span>{provider.location}</span>
                          </div>
                          <p className="text-text-light-secondary dark:text-text-dark-secondary text-xs font-normal line-clamp-2 mt-0.5">
                            {provider.description}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 w-fit">
                            {provider.category}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/profile/${provider.id}`)}
                          className="flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary text-white text-xs font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <span className="truncate">Ver Perfil</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-800">
                    <span className="material-symbols-outlined text-5xl text-gray-400 mb-3">search_off</span>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">Nenhum prestador encontrado</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                      {queryParam || categoryParam || cityParam
                        ? 'Não encontramos nenhum prestador publicado com os filtros selecionados.'
                        : 'Ainda não há prestadores de serviços publicados no catálogo.'}
                    </p>
                    <button
                      onClick={clearFilters}
                      className="px-5 py-2.5 bg-primary/10 text-primary font-bold text-sm rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <nav aria-label="Paginação" className="flex items-center justify-center mt-8">
                <ul className="flex items-center -space-x-px h-10 text-base">
                  <li>
                    <button
                      disabled={pageParam <= 1}
                      onClick={() => updateFilters({ page: pageParam - 1 })}
                      className={`flex items-center justify-center px-4 h-10 ms-0 leading-tight bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-700 rounded-s-lg ${pageParam <= 1
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white cursor-pointer'
                        }`}
                    >
                      <span className="sr-only">Anterior</span>
                      <span className="material-symbols-outlined !text-xl">chevron_left</span>
                    </button>
                  </li>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === pageParam;
                    return (
                      <li key={pageNum}>
                        <button
                          onClick={() => updateFilters({ page: pageNum })}
                          className={`flex items-center justify-center px-4 h-10 leading-tight border ${isActive
                              ? 'z-10 text-white bg-primary border-primary font-bold'
                              : 'text-text-light-secondary dark:text-text-dark-secondary bg-white dark:bg-card-dark border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white'
                            }`}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}

                  <li>
                    <button
                      disabled={pageParam >= totalPages}
                      onClick={() => updateFilters({ page: pageParam + 1 })}
                      className={`flex items-center justify-center px-4 h-10 leading-tight bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-700 rounded-e-lg ${pageParam >= totalPages
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'text-text-light-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white cursor-pointer'
                        }`}
                    >
                      <span className="sr-only">Próximo</span>
                      <span className="material-symbols-outlined !text-xl">chevron_right</span>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;