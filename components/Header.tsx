import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getCurrentProfile, UserProfile } from '../lib/auth';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = async () => {
    const userProfile = await getCurrentProfile();
    setProfile(userProfile);
  };

  useEffect(() => {
    fetchProfile();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    navigate('/');
    closeMenu();
  };

  const getAvatarUrl = () => {
    if (profile?.avatarUrl && profile.avatarUrl.trim()) {
      return profile.avatarUrl;
    }
    const name = profile?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=137fec&color=fff`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => { navigate('/'); closeMenu(); }}
        >
          <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Serviços Já</h2>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-8">
          <a onClick={() => navigate('/')} className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary cursor-pointer transition-colors">
            Início
          </a>
          <a onClick={() => navigate('/results')} className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary cursor-pointer transition-colors">
            Buscar Serviços
          </a>
        </nav>

        {/* Desktop Auth/User & Mobile Toggle */}
        <div className="flex items-center gap-4">
          {/* Desktop User Info & SignOut */}
          <div className="hidden md:flex items-center gap-4">
            {profile ? (
              <div className="flex items-center gap-3">
                <img
                  src={getAvatarUrl()}
                  alt="User Avatar"
                  className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {profile.name}
                  </span>
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                    {profile.role === 'provider' ? 'Prestador' : 'Cliente'}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sair"
                  className="ml-2 flex items-center justify-center p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth/client', { state: { mode: 'login' } })}
                  className="rounded-lg px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/auth/client', { state: { mode: 'signup' } })}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Cadastrar
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex md:hidden items-center justify-center rounded-lg p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={toggleMenu}
            aria-label="Menu Principal"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col p-4 space-y-4">
            <a
              onClick={() => { navigate('/'); closeMenu(); }}
              className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-medium"
            >
              <span className="material-symbols-outlined text-gray-500">home</span>
              Início
            </a>
            <a
              onClick={() => { navigate('/results'); closeMenu(); }}
              className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-medium"
            >
              <span className="material-symbols-outlined text-gray-500">search</span>
              Buscar Serviços
            </a>
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
            <div className="flex flex-col gap-3 px-2">
              {profile ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <img src={getAvatarUrl()} alt="User Avatar" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {profile.name}
                      </span>
                      <span className="text-xs text-primary font-semibold uppercase">
                        {profile.role === 'provider' ? 'Prestador' : 'Cliente'} ({profile.email})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 rounded-lg h-10 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { navigate('/auth/client', { state: { mode: 'login' } }); closeMenu(); }}
                    className="w-full rounded-lg h-10 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { navigate('/auth/client', { state: { mode: 'signup' } }); closeMenu(); }}
                    className="w-full rounded-lg h-10 bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors"
                  >
                    Cadastrar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
