import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const { type } = useParams<{ type: string }>(); // 'client' or 'provider'
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  const isProvider = type === 'provider';

  // Theme Config based on type
  const theme = isProvider
    ? {
        primary: 'bg-orange-500 hover:bg-orange-600',
        text: 'text-orange-500',
        border: 'focus:ring-orange-500 focus:border-orange-500',
        bg: 'bg-orange-50',
        title: 'Área do Parceiro',
        subtitle: 'Expanda seu negócio',
        heroImage:
          'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        welcome: 'Bem-vindo de volta, parceiro!',
      }
    : {
        primary: 'bg-primary hover:bg-primary/90',
        text: 'text-primary',
        border: 'focus:ring-primary focus:border-primary',
        bg: 'bg-blue-50',
        title: 'Serviços Já',
        subtitle: 'Encontre o profissional ideal',
        heroImage:
          'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        welcome: 'Bem-vindo ao Serviços Já',
      };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark flex flex-col justify-center items-center p-3 sm:p-6 md:p-8 font-display overflow-y-auto">
      <div className="w-full max-w-5xl bg-white dark:bg-card-dark rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row my-auto border border-gray-100 dark:border-gray-800">
        
        {/* Visual / Branding Side */}
        <div className="relative md:w-1/2 bg-gray-900 text-white overflow-hidden p-6 sm:p-8 md:p-12 flex flex-col justify-between min-h-[160px] sm:min-h-[220px] md:min-h-[auto]">
          <img
            src={theme.heroImage}
            alt="Fundo temático"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/50 to-black/30" />

          <div className="relative z-10 flex items-center justify-between md:justify-start gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg p-1"
              aria-label="Serviços Já - Ir para página inicial"
            >
              <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">hub</span>
              <span className="text-lg sm:text-xl font-bold tracking-tight">Serviços Já</span>
            </button>
          </div>

          <div className="relative z-10 mt-6 sm:mt-10 md:mt-0">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-1 opacity-80">
              {theme.title}
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight break-words">
              {theme.subtitle}
            </h1>
          </div>
        </div>

        {/* Form Container Side */}
        <div className="w-full md:w-1/2 p-5 sm:p-8 md:p-12 flex flex-col justify-center relative">
          
          {/* Back Navigation Button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => navigate('/auth/selection')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 text-xs sm:text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg py-1 px-1.5 -ml-1 transition-colors min-h-[40px]"
              aria-label="Voltar para seleção de perfil"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Trocar perfil</span>
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
              {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
              {mode === 'login'
                ? 'Acesse seus serviços e gerencie suas solicitações.'
                : 'Junte-se a milhares de usuários e profissionais.'}
            </p>
          </div>

          {/* Mode Switch Tabs (Login / Signup) */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                mode === 'login'
                  ? 'bg-white dark:bg-card-dark text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                mode === 'signup'
                  ? 'bg-white dark:bg-card-dark text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Credentials Form */}
          <form className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="auth-name" className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                  Nome Completo
                </label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  className={`w-full min-h-[48px] px-4 py-2.5 text-sm sm:text-base rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 ${theme.border} outline-none transition-all text-gray-900 dark:text-white`}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-email" className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                E-mail {isProvider ? 'Profissional' : ''}
              </label>
              <input
                id="auth-email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                className={`w-full min-h-[48px] px-4 py-2.5 text-sm sm:text-base rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 ${theme.border} outline-none transition-all text-gray-900 dark:text-white`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="auth-password" className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                  Senha
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className={`text-xs font-bold ${theme.text} hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded`}
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className={`w-full min-h-[48px] px-4 py-2.5 pr-12 text-sm sm:text-base rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 ${theme.border} outline-none transition-all text-gray-900 dark:text-white`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`mt-2 w-full min-h-[48px] py-3.5 rounded-xl text-white font-bold text-sm sm:text-base shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${theme.primary}`}
            >
              <span>{mode === 'login' ? (isProvider ? 'Acessar Painel' : 'Entrar') : 'Criar Conta'}</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-card-dark px-3 text-gray-400 font-medium">ou continue com</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              className="flex min-h-[44px] items-center justify-center gap-2.5 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 shrink-0" alt="Google" />
              <span>Google</span>
            </button>
            <button
              type="button"
              className="flex min-h-[44px] items-center justify-center gap-2.5 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <img src="https://www.svgrepo.com/show/448234/apple.svg" className="w-5 h-5 dark:invert shrink-0" alt="Apple" />
              <span>Apple</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
