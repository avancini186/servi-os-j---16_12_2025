import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { providers, categories } from '../data/mockData';

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(location.state?.category || null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Close mobile filters on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFilters) {
        setShowFilters(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFilters]);

  // Close mobile filter modal on viewport resize to desktop (md breakpoint >= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && showFilters) {
        setShowFilters(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showFilters]);

  // Derive unique locations from providers
  const uniqueLocations = Array.from(new Set(providers.map((p) => p.location))).sort();

  // Filter Logic
  const filteredProviders = providers.filter((provider) => {
    if (selectedCategory && provider.category !== selectedCategory) return false;
    if (selectedLocation && provider.location !== selectedLocation) return false;
    if (minRating && provider.rating < minRating) return false;
    return true;
  });

  const activeFilterCount = (selectedCategory ? 1 : 0) + (selectedLocation ? 1 : 0) + (minRating ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedLocation(null);
    setMinRating(null);
    setCurrentPage(1);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary overflow-x-hidden">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col md:grid md:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Mobile Filter Toggle Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between min-h-[48px] px-4 py-3 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 text-text-light-primary dark:text-text-dark-primary font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-controls="filters-panel"
              aria-label={showFilters ? 'Fechar painel de filtros' : 'Abrir painel de filtros'}
            >
              <span className="flex items-center gap-2 text-sm sm:text-base">
                <span className="material-symbols-outlined text-primary text-xl">filter_list</span>
                <span>Filtrar Resultados</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </span>
              <span className="material-symbols-outlined text-xl">
                {showFilters ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>

          {/* Filters Sidebar / Mobile Drawer */}
          <aside
            id="filters-panel"
            aria-label="Filtros de busca"
            className={`col-span-1 md:sticky md:top-24 h-fit ${
              showFilters
                ? 'fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm p-4 md:static md:z-auto md:bg-transparent md:p-0'
                : 'hidden md:block'
            }`}
            onClick={(e) => {
              if (e.target === e.currentTarget && showFilters) {
                setShowFilters(false);
              }
            }}
          >
            <div 
              className="flex flex-col rounded-2xl bg-white dark:bg-card-dark p-5 sm:p-6 shadow-xl md:shadow-sm border border-gray-200 dark:border-gray-800 max-h-[85vh] md:max-h-none overflow-y-auto w-full max-w-lg mx-auto md:max-w-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Filter Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">tune</span>
                  <h2 className="text-text-light-primary dark:text-text-dark-primary text-lg font-bold">
                    Filtros
                  </h2>
                  {activeFilterCount > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {activeFilterCount} ativo{activeFilterCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Mobile Close Button */}
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="flex h-10 w-10 md:hidden items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Fechar filtros"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>

              <div className="flex flex-col gap-5">
                {/* Categories Filter */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="filter-category" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-primary text-lg">sell</span>
                    <span>Categoria</span>
                  </label>
                  <select
                    id="filter-category"
                    value={selectedCategory || ''}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value || null);
                      setCurrentPage(1);
                    }}
                    className="w-full min-h-[44px] px-3 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="">Todas as Categorias</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="filter-location" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                    <span>Localização</span>
                  </label>
                  <select
                    id="filter-location"
                    value={selectedLocation || ''}
                    onChange={(e) => {
                      setSelectedLocation(e.target.value || null);
                      setCurrentPage(1);
                    }}
                    className="w-full min-h-[44px] px-3 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="">Todas as Cidades</option>
                    {uniqueLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-amber-500 text-lg">star</span>
                    <span>Avaliação Mínima</span>
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[4, 4.5, 4.8].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => {
                          setMinRating(minRating === rating ? null : rating);
                          setCurrentPage(1);
                        }}
                        className={`min-h-[40px] px-4 py-2 text-xs font-bold rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          minRating === rating
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-800 text-text-light-secondary dark:text-text-dark-secondary border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary'
                        }`}
                      >
                        ⭐ {rating}+
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
                {showFilters && (
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="flex w-full min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Ver {filteredProviders.length} resultados
                  </button>
                )}

                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={activeFilterCount === 0}
                  className={`flex w-full min-h-[44px] cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    activeFilterCount > 0
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </aside>

          {/* Results Content Column */}
          <div className="col-span-1 md:col-span-3">
            {/* Page Heading & Count */}
            <div className="flex flex-col gap-1 mb-6">
              <h1 className="text-text-light-primary dark:text-text-dark-primary text-2xl sm:text-3xl font-black tracking-tight break-words">
                {selectedCategory ? `Resultados para "${selectedCategory}"` : 'Profissionais Encontrados'}
              </h1>
              <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm sm:text-base font-normal">
                {filteredProviders.length} {filteredProviders.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
              </p>
            </div>

            {/* Provider Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {filteredProviders.length > 0 ? (
                filteredProviders.map((provider) => (
                  <article
                    key={provider.id}
                    className="flex flex-col sm:flex-row items-stretch gap-4 rounded-xl bg-white dark:bg-card-dark p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md hover:border-primary/30"
                  >
                    {/* Provider Avatar / Photo */}
                    <div
                      className="w-full sm:w-28 sm:h-28 h-44 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
                      aria-label={`Foto de perfil de ${provider.name}`}
                      style={{ backgroundImage: `url("${provider.imageUrl}")` }}
                    />

                    {/* Provider Info */}
                    <div className="flex flex-col flex-1 justify-between gap-3 min-w-0">
                      <div className="flex flex-col gap-1.5">
                        {/* Rating & Location */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-light-secondary dark:text-text-dark-secondary">
                            <span
                              className="material-symbols-outlined text-amber-500 text-lg shrink-0"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                            <span>{provider.rating}</span>
                            <span className="font-normal text-gray-400">({provider.reviewsCount})</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-text-light-secondary dark:text-text-dark-secondary">
                            <span className="material-symbols-outlined text-sm text-primary shrink-0">location_on</span>
                            <span className="truncate">{provider.location}</span>
                          </div>
                        </div>

                        {/* Name */}
                        <h2 className="text-text-light-primary dark:text-text-dark-primary text-base sm:text-lg font-bold leading-snug break-words">
                          {provider.name}
                        </h2>

                        {/* Category Badge */}
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary w-fit">
                            {provider.category}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-text-light-secondary dark:text-text-dark-secondary text-xs sm:text-sm font-normal line-clamp-2 leading-relaxed">
                          {provider.description}
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="flex w-full sm:w-auto sm:self-start min-h-[44px] px-5 cursor-pointer items-center justify-center rounded-lg bg-primary text-white text-sm font-bold leading-normal hover:bg-primary/90 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label={`Ver perfil completo de ${provider.name}`}
                      >
                        <span>Ver Perfil</span>
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                /* Empty State */
                <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 rounded-2xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 text-center">
                  <span className="material-symbols-outlined text-5xl text-gray-400 mb-3">search_off</span>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Nenhum profissional encontrado
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                    Não encontramos resultados com os filtros atuais. Tente alterar ou limpar os filtros para ver mais profissionais.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex min-h-[44px] items-center justify-center px-6 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Limpar Filtros
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {filteredProviders.length > 0 && (
              <nav aria-label="Paginação de resultados" className="flex items-center justify-center mt-8 sm:mt-10">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex h-11 w-11 items-center justify-center rounded-lg bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Página anterior"
                  >
                    <span className="material-symbols-outlined text-xl">chevron_left</span>
                  </button>

                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      aria-current={currentPage === page ? 'page' : undefined}
                      className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        currentPage === page
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
                    disabled={currentPage === 3}
                    className="flex h-11 w-11 items-center justify-center rounded-lg bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Próxima página"
                  >
                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                  </button>
                </div>
              </nav>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default ResultsPage;