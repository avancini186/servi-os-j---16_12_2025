import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Close menu on viewport resize to desktop (md breakpoint >= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        closeMenu();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Close menu automatically on route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          type="button"
          onClick={() => {
            navigate('/');
            closeMenu();
          }}
          className="flex shrink-0 items-center gap-2 rounded-lg p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Serviços Já - Ir para página inicial"
        >
          <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl shrink-0">
            hub
          </span>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
            Serviços Já
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav
          aria-label="Navegação principal desktop"
          className="hidden md:flex flex-1 justify-center items-center gap-6 lg:gap-8"
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              location.pathname === '/'
                ? 'text-primary font-semibold'
                : 'text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary'
            }`}
          >
            Início
          </button>
          <button
            type="button"
            onClick={() => navigate('/results')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              location.pathname === '/results'
                ? 'text-primary font-semibold'
                : 'text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary'
            }`}
          >
            Buscar Serviços
          </button>
          <button
            type="button"
            onClick={() => {
              navigate('/');
              const categoriesEl = document.getElementById('categorias');
              if (categoriesEl) {
                categoriesEl.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Categorias
          </button>
        </nav>

        {/* Desktop Auth / Mobile Menu Trigger */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/auth/selection')}
              className="rounded-lg px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth/selection')}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Cadastrar
            </button>
          </div>

          {/* Mobile Menu Button (Hamburger) with 44px touch target */}
          <button
            type="button"
            onClick={toggleMenu}
            className="flex h-11 w-11 md:hidden items-center justify-center rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={isMobileMenuOpen ? 'Fechar menu principal' : 'Abrir menu principal'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Navigation Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 top-16 bg-black/40 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Mobile Navigation Dropdown */}
          <nav
            id="mobile-navigation"
            aria-label="Navegação principal móvel"
            className="absolute top-16 left-0 z-40 w-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark shadow-xl animate-in slide-in-from-top-2 duration-200 md:hidden"
          >
            <div className="flex flex-col p-4 gap-1">
              <button
                type="button"
                onClick={() => {
                  navigate('/');
                  closeMenu();
                }}
                className={`flex w-full min-h-[48px] items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  location.pathname === '/'
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="material-symbols-outlined text-xl text-primary">home</span>
                <span>Início</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/results');
                  closeMenu();
                }}
                className={`flex w-full min-h-[48px] items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  location.pathname === '/results'
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="material-symbols-outlined text-xl text-primary">search</span>
                <span>Buscar Serviços</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/');
                  closeMenu();
                  const categoriesEl = document.getElementById('categorias');
                  if (categoriesEl) {
                    categoriesEl.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex w-full min-h-[48px] items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-900 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="material-symbols-outlined text-xl text-primary">category</span>
                <span>Categorias</span>
              </button>

              <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

              <div className="flex flex-col gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/auth/selection');
                    closeMenu();
                  }}
                  className="flex w-full min-h-[44px] items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/auth/selection');
                    closeMenu();
                  }}
                  className="flex w-full min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Cadastrar
                </button>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
};

export default Header;
