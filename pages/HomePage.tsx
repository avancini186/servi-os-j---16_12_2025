import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

import { categories } from '../data/mockData';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    navigate('/results');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <Header />
      <div className="layout-container flex h-full grow flex-col">
        {/* Main Content */}
        <main className="flex flex-1 justify-center py-10 sm:py-16 md:py-20">
          <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1 px-6">
            {/* HeadlineText */}
            <div className="text-center mb-8">
              <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Encontre os melhores profissionais perto de você
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Tudo o que você precisa, de reparos domésticos a aulas particulares, ao seu alcance.
              </p>
            </div>
            {/* Search Area */}
            <div className="bg-white dark:bg-gray-900/50 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 w-full max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* SearchBar */}
                <label className="flex flex-col h-14 w-full flex-1">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-background-light dark:bg-background-dark">
                    <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center pl-4">
                      <span className="material-symbols-outlined text-2xl">search</span>
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-gray-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 pl-2 text-base font-normal leading-normal"
                      placeholder="Qual serviço você precisa?"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </label>
                {/* TextField */}
                <label className="flex flex-col h-14 w-full sm:max-w-xs flex-1">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-background-light dark:bg-background-dark">
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-gray-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-base font-normal leading-normal"
                      placeholder="Sua cidade ou CEP"
                    />
                    <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center pr-4">
                      <span className="material-symbols-outlined text-2xl">location_on</span>
                    </div>
                  </div>
                </label>
                <button
                  onClick={handleSearch}
                  className="flex w-full sm:w-auto min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-6 bg-primary text-white text-base font-bold leading-normal hover:bg-primary/90 transition-colors"
                >
                  <span className="truncate">Buscar</span>
                </button>
              </div>
            </div>
            {/* SectionHeader */}
            <div className="mt-16 sm:mt-20 text-center">
              <h2 className="text-gray-900 dark:text-white text-2xl md:text-3xl font-bold tracking-tight">
                Navegue por Categorias
              </h2>
            </div>
            {/* Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 mt-8">
              {categories.map((cat, idx) => (
                <a
                  key={idx}
                  className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={handleSearch}
                >
                  <span className="material-symbols-outlined text-4xl text-primary mb-3">{cat.icon}</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{cat.name}</span>
                </a>
              ))}
              <a
                className="flex flex-col items-center justify-center p-6 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20 dark:border-primary/30 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-primary cursor-pointer"
                onClick={handleSearch}
              >
                <span className="material-symbols-outlined text-4xl mb-3">apps</span>
                <span className="text-sm font-semibold">Ver todas</span>
              </a>
            </div>
          </div>
        </main>
        {/* Footer */}
        <footer className="flex justify-center bg-white dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 mt-20">
          <div className="w-full max-w-6xl px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                © 2024 Serviços Já. Todos os direitos reservados.
              </div>
              <div className="flex gap-6">
                <a className="text-gray-600 dark:text-gray-400 hover:text-primary cursor-pointer">Sobre Nós</a>
                <a className="text-gray-600 dark:text-gray-400 hover:text-primary cursor-pointer">Contato</a>
                <a className="text-gray-600 dark:text-gray-400 hover:text-primary cursor-pointer">Termos de Serviço</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;