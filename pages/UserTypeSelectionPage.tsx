import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserTypeSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSelection = (type: 'client' | 'provider') => {
    navigate(`/auth/${type}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-background-light dark:bg-background-dark font-display relative overflow-x-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent -z-10" />

      {/* Brand Logo Header */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mb-5 sm:mb-6 flex items-center gap-2 rounded-xl p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Serviços Já - Ir para página inicial"
      >
        <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">hub</span>
        <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Serviços Já</span>
      </button>

      {/* Main Card */}
      <div className="w-full max-w-xl bg-white dark:bg-card-dark rounded-2xl shadow-xl p-5 sm:p-7 md:p-8 border border-gray-100 dark:border-gray-800">
        
        {/* Header Content */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
            <span className="material-symbols-outlined text-2xl sm:text-3xl">handshake</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 tracking-tight">
            Bem-vindo ao Serviços Já
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Conectando você aos melhores profissionais. Como você deseja usar o app hoje?
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
          
          {/* Client Option */}
          <button
            type="button"
            onClick={() => handleSelection('client')}
            className="group flex flex-col items-center text-center p-4 sm:p-5 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[130px]"
            aria-label="Acessar como Cliente: Encontre serviços rápidos e qualificados"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-2xl sm:text-2xl text-primary">person_search</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-0.5">
              Sou Cliente
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-snug">
              Encontre serviços rápidos e profissionais qualificados
            </p>
            <div className="hidden sm:block absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
              <span className="material-symbols-outlined text-primary text-lg">arrow_forward</span>
            </div>
          </button>

          {/* Provider Option */}
          <button
            type="button"
            onClick={() => handleSelection('provider')}
            className="group flex flex-col items-center text-center p-4 sm:p-5 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-orange-400/50 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all duration-300 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[130px]"
            aria-label="Acessar como Prestador: Ofereça seus serviços e aumente sua renda"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-50 dark:bg-slate-800 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-2xl sm:text-2xl text-orange-500">engineering</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-0.5">
              Sou Prestador
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-snug">
              Ofereça seus serviços e aumente sua clientela
            </p>
            <div className="hidden sm:block absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
              <span className="material-symbols-outlined text-orange-500 text-lg">arrow_forward</span>
            </div>
          </button>
        </div>

        {/* Footer / Links */}
        <div className="text-center pt-4 sm:pt-5 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Já possui uma conta?{' '}
            <button
              type="button"
              onClick={() => handleSelection('client')}
              className="font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
            >
              Fazer Login
            </button>
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-5 mt-3.5 sm:mt-4 text-xs text-gray-400">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
            >
              Termos de Uso
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
            >
              Política de Privacidade
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserTypeSelectionPage;
