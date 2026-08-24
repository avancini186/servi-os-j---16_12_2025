import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { providers, categories } from '../data/mockData';

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state as { category?: string; term?: string } | undefined;

  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams?.category || '');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter providers based on active filters
  const filteredProviders = providers.filter((provider) => {
    if (selectedCategory && provider.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (selectedRating && provider.rating < selectedRating) {
      return false;
    }
    if (selectedPrice && (provider as any).priceRange && (provider as any).priceRange !== selectedPrice) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage) || 1;
  const paginatedProviders = filteredProviders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeFilterCount =
    (selectedCategory ? 1 : 0) + (selectedRating ? 1 : 0) + (selectedPrice ? 1 : 0);

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedRating(null);
    setSelectedPrice(null);
    setCurrentPage(1);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary overflow-x-hidden">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-6">
        <div className="flex flex-col md:grid md:grid-cols-4 gap-5 lg:gap-6">
          
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
              className="flex flex-col rounded-2xl bg-white dark:bg-card-dark p-4 sm:p-5 shadow-xl md:shadow-sm border border-gray-200 dark:border-gray-800 max-h-[85vh] md:max-h-none overflow-y-auto w-full max-w-lg mx-auto md:max-w-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Filter Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">tune</span>
                  <h2 className="text-text-light-primary dark:text-text-dark-primary text-base sm:text-lg font-bold">
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

              <div className="flex flex-col gap-4 sm:gap-5">
                {/* Categories Filter */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="filter-category" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-primary text-base">sell</span>
                    <span>Categoria</span>
                  </label>
                  <select
                    id="filter-category"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full min-h-[44px] px-3 py-2 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="">Todas as Categorias</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="filter-rating" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-amber-500 text-base">star</span>
                    <span>Avaliação Mínima</span>
                  </label>
                  <select
                    id="filter-rating"
                    value={selectedRating || ''}
                    onChange={(e) => {
                      setSelectedRating(e.target.value ? Number(e.target.value) : null);
                      setCurrentPage(1);
                    }}
                    className="w-full min-h-[44px] px-3 py-2 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="">Qualquer Avaliação</option>
                    <option value="4.5">⭐ 4.5 ou mais</option>
                    <option value="4.0">⭐ 4.0 ou mais</option>
                    <option value="3.5">⭐ 3.5 ou mais</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-primary text-base">payments</span>
                    <span>Faixa de Preço</span>
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {['$', '$$', '$$$'].map((price) => (
                      <button
                        key={price}
                        type="button"
                        onClick={() => {
                          setSelectedPrice(selectedPrice === price ? null : price);
                          setCurrentPage(1);
                        }}
                        className={`min-h-[40px] px-3 py-2 text-xs font-bold rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          selectedPrice === price
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {price}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply Filters (Mobile Drawer only) */}
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="flex w-full min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Ver Resultados
                </button>

                {/* Clear Filters Button */}
                <button
                  type="button"
                  onClick={handleClearFilters}
                  disabled={activeFilterCount === 0}
                  className={`flex w-full min-h-[44px] cursor-pointer items-center justify-center rounded-lg px-4 text-xs sm:text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    activeFilterCount > 0
                      ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-900/30'
                      : 'text-gray-400 bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed border border-transparent'
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
            <div className="flex flex-col gap-1 mb-5">
              <h1 className="text-text-light-primary dark:text-text-dark-primary text-xl sm:text-2xl lg:text-2xl font-black tracking-tight break-words">
                {selectedCategory ? `Resultados para "${selectedCategory}"` : 'Profissionais Encontrados'}
              </h1>
              <p className="text-text-light-secondary dark:text-text-dark-secondary text-xs sm:text-sm font-normal">
                {filteredProviders.length} {filteredProviders.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
              </p>
            </div>

            {/* Provider Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 lg:gap-4">
              {paginatedProviders.length > 0 ? (
                paginatedProviders.map((provider) => (
                  <article
                    key={provider.id}
                    className="flex flex-col sm:flex-row items-stretch gap-3.5 sm:gap-4 rounded-xl bg-white dark:bg-card-dark p-3.5 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md hover:border-primary/30"
                  >
                    {/* Provider Avatar / Photo */}
                    <div
                      className="w-full sm:w-28 sm:h-28 h-40 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
                      aria-label={`Foto de perfil de ${provider.name}`}
                      style={{ backgroundImage: `url("${provider.imageUrl}")` }}
                    />

                    {/* Provider Info */}
                    <div className="flex flex-col flex-1 justify-between gap-2.5 min-w-0">
                      <div className="flex flex-col gap-1">
                        {/* Rating & Location */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1 text-xs font-semibold text-text-light-secondary dark:text-text-dark-secondary">
                            <span
                              className="material-symbols-outlined text-amber-500 text-base shrink-0"
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
                        <h2 className="text-text-light-primary dark:text-text-dark-primary text-sm sm:text-base font-bold leading-snug break-words">
                          {provider.name}
                        </h2>

                        {/* Category Badge */}
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary w-fit">
                            {provider.category}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-text-light-secondary dark:text-text-dark-secondary text-xs font-normal line-clamp-2 leading-relaxed">
                          {provider.description}
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="flex w-full sm:w-auto sm:self-start min-h-[40px] px-4 cursor-pointer items-center justify-center rounded-lg bg-primary text-white text-xs sm:text-sm font-bold leading-normal hover:bg-primary/90 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label={`Ver perfil completo de ${provider.name}`}
                      >
                        <span>Ver Perfil</span>
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                /* Empty State */
                <div className="col-span-full flex flex-col items-center justify-center py-10 px-4 rounded-2xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 text-center">
                  <span className="material-symbols-outlined text-4xl text-gray-400 mb-2.5">search_off</span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Nenhum profissional encontrado
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-5">
                    Tente ajustar os filtros selecionados ou busque por outra categoria.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="flex min-h-[44px] items-center justify-center px-5 rounded-lg bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Limpar Todos os Filtros
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Página anterior"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs sm:text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      currentPage === page
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    aria-current={currentPage === page ? 'page' : undefined}
                    aria-label={`Página ${page}`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Próxima página"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;