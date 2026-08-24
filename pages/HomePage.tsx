import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { categories } from '../data/mockData';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  const handleSearch = (category?: string) => {
    navigate('/results', { state: { category: category || searchTerm } });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const mapLimit = 11;
  const displayedCategories = showAllCategories ? categories : categories.slice(0, mapLimit);

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary overflow-x-hidden">
      <Header />
      <div className="flex h-full grow flex-col">
        {/* Main Content */}
        <main className="flex flex-1 justify-center py-6 sm:py-8 md:py-10 lg:py-12">
          <div className="flex flex-col w-full max-w-5xl flex-1 px-4 sm:px-6 lg:px-8">
            
            {/* Headline / Hero Section */}
            <section className="text-center mb-5 sm:mb-6 md:mb-7">
              <h1 className="text-gray-900 dark:text-white text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold tracking-tight leading-tight">
                Que tipo de ajuda precisa hoje?
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                Encontre profissionais qualificados e de confiança para qualquer serviço em sua região.
              </p>
            </section>

            {/* Search Area */}
            <section 
              aria-label="Busca de serviços"
              className="bg-white dark:bg-gray-900/50 p-3 sm:p-4 md:p-5 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 w-full max-w-2xl mx-auto"
            >
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3"
              >
                {/* SearchBar Input */}
                <div className="flex flex-1 items-center rounded-lg h-12 sm:h-12 bg-background-light dark:bg-background-dark border border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center pl-3 sm:pl-3.5 shrink-0">
                    <span className="material-symbols-outlined text-xl sm:text-xl">search</span>
                  </div>
                  <input
                    id="search-input"
                    type="search"
                    aria-label="Qual serviço você precisa?"
                    className="flex w-full min-w-0 flex-1 border-none bg-transparent h-full px-2 sm:px-3 text-sm sm:text-base font-normal leading-normal text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-0"
                    placeholder="Qual serviço você precisa?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                {/* Submit Search Button */}
                <button
                  type="submit"
                  className="flex w-full sm:w-auto h-12 sm:h-12 px-6 sm:px-7 cursor-pointer items-center justify-center rounded-lg bg-primary text-white text-sm sm:text-base font-bold leading-normal hover:bg-primary/90 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shrink-0"
                >
                  <span>Buscar</span>
                </button>
              </form>
            </section>

            {/* Categories Section */}
            <section id="categorias" className="mt-8 sm:mt-10 lg:mt-12">
              <div className="text-center mb-5 sm:mb-6">
                <h2 className="text-gray-900 dark:text-white text-xl sm:text-2xl md:text-2xl font-bold tracking-tight">
                  Navegue por Categorias
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Selecione uma categoria para ver os especialistas disponíveis
                </p>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5 md:gap-4 lg:gap-4">
                {displayedCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSearch(cat.name)}
                    className="flex flex-col items-center justify-center p-3 sm:p-4 lg:p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 text-center hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[92px] sm:min-h-[96px] lg:min-h-[96px]"
                    aria-label={`Categoria ${cat.name}`}
                  >
                    <span className="material-symbols-outlined text-2xl sm:text-3xl lg:text-3xl text-primary mb-1.5 sm:mb-2 shrink-0">
                      {cat.icon}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 break-words leading-tight">
                      {cat.name}
                    </span>
                  </button>
                ))}

                {categories.length > mapLimit && (
                  !showAllCategories ? (
                    <button
                      type="button"
                      onClick={() => setShowAllCategories(true)}
                      className="flex flex-col items-center justify-center p-3 sm:p-4 lg:p-4 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20 dark:border-primary/30 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[92px] sm:min-h-[96px] lg:min-h-[96px]"
                      aria-label="Ver todas as categorias"
                    >
                      <span className="material-symbols-outlined text-2xl sm:text-3xl lg:text-3xl mb-1.5 sm:mb-2 shrink-0">
                        apps
                      </span>
                      <span className="text-xs sm:text-sm font-semibold">Ver todas</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAllCategories(false)}
                      className="flex flex-col items-center justify-center p-3 sm:p-4 lg:p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-gray-600 dark:text-gray-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[92px] sm:min-h-[96px] lg:min-h-[96px]"
                      aria-label="Ver menos categorias"
                    >
                      <span className="material-symbols-outlined text-2xl sm:text-3xl lg:text-3xl mb-1.5 sm:mb-2 shrink-0">
                        expand_less
                      </span>
                      <span className="text-xs sm:text-sm font-semibold">Ver menos</span>
                    </button>
                  )
                )}
              </div>
            </section>

          </div>
        </main>

        {/* Footer */}
        <footer className="flex justify-center bg-white dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 mt-10 sm:mt-12 lg:mt-16">
          <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-center md:text-left">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                © 2024 Serviços Já. Todos os direitos reservados.
              </div>
              <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
                >
                  Sobre Nós
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
                >
                  Contato
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
                >
                  Termos de Serviço
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;