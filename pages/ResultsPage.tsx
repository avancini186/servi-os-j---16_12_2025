import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { providers } from '../data/mockData';

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

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
                <div className="flex flex-col gap-2">
                  <a
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 dark:bg-primary/20 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-primary">sell</span>
                    <p className="text-primary text-sm font-bold">Categorias</p>
                  </a>
                  <a
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-text-light-secondary dark:text-text-dark-secondary">
                      location_on
                    </span>
                    <p className="text-text-light-primary dark:text-text-dark-primary text-sm font-medium">
                      Localização
                    </p>
                  </a>
                  <a
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-text-light-secondary dark:text-text-dark-secondary">
                      star
                    </span>
                    <p className="text-text-light-primary dark:text-text-dark-primary text-sm font-medium">Avaliação</p>
                  </a>
                  <a
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-text-light-secondary dark:text-text-dark-secondary">
                      paid
                    </span>
                    <p className="text-text-light-primary dark:text-text-dark-primary text-sm font-medium">Preço</p>
                  </a>
                </div>
              </div>
              <button className="mt-8 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 dark:bg-primary/20 text-primary text-sm font-bold tracking-wide hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                <span className="truncate">Limpar Filtros</span>
              </button>
            </div>
          </aside>

          <div className="col-span-1 md:col-span-3">
            {/* PageHeading */}
            <div className="flex flex-wrap justify-between gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-text-light-primary dark:text-text-dark-primary text-3xl font-black tracking-tighter">
                  Resultados encontrados
                </h1>
                <p className="text-text-light-secondary dark:text-text-dark-secondary text-base font-normal">
                  {providers.length} prestadores encontrados
                </p>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-stretch justify-between gap-4 rounded-xl bg-white dark:bg-card-dark p-4 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div
                    className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
                    data-alt={`Foto de perfil de ${provider.name}`}
                    style={{ backgroundImage: `url("${provider.imageUrl}")` }}
                  ></div>
                  <div className="flex flex-col gap-2 flex-1 justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span
                          className="material-symbols-outlined !text-xl text-yellow-500"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm font-medium">
                          {provider.rating} <span className="font-normal">({provider.reviewsCount} avaliações)</span>
                        </p>
                      </div>
                      <p className="text-text-light-primary dark:text-text-dark-primary text-lg font-bold leading-tight">
                        {provider.name}
                      </p>
                      <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm font-normal">
                        {provider.description}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/profile')}
                      className="flex w-fit cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors"
                    >
                      <span className="truncate">Ver Perfil</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <nav aria-label="Pagination" className="flex items-center justify-center mt-8">
              <ul className="flex items-center -space-x-px h-10 text-base">
                <li>
                  <a
                    className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-text-light-secondary dark:text-text-dark-secondary bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-700 rounded-s-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                  >
                    <span className="sr-only">Previous</span>
                    <span className="material-symbols-outlined !text-xl">chevron_left</span>
                  </a>
                </li>
                <li>
                  <a
                    aria-current="page"
                    className="z-10 flex items-center justify-center px-4 h-10 leading-tight text-white bg-primary border border-primary hover:bg-primary/90 cursor-pointer"
                  >
                    1
                  </a>
                </li>
                <li>
                  <a
                    className="flex items-center justify-center px-4 h-10 leading-tight text-text-light-secondary dark:text-text-dark-secondary bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                  >
                    2
                  </a>
                </li>
                <li>
                  <a
                    className="flex items-center justify-center px-4 h-10 leading-tight text-text-light-secondary dark:text-text-dark-secondary bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                  >
                    3
                  </a>
                </li>
                <li>
                  <a
                    className="flex items-center justify-center px-4 h-10 leading-tight text-text-light-secondary dark:text-text-dark-secondary bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-700 rounded-e-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                  >
                    <span className="sr-only">Next</span>
                    <span className="material-symbols-outlined !text-xl">chevron_right</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;