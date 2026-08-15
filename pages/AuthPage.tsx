import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { requestPasswordReset } from '../lib/auth';

const AuthPage: React.FC = () => {
  const { type } = useParams<{ type: string }>(); // 'client' or 'provider'
  const navigate = useNavigate();
  const location = useLocation();
  const initialMode = location.state?.mode || 'login';

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.mode) {
      setMode(location.state.mode);
    }
  }, [location.state]);

  const isProvider = type === 'provider';

  // Translate technical Supabase error codes to friendly Portuguese messages
  const getFriendlyErrorMessage = (errMessage: string) => {
    const msg = errMessage.toLowerCase();
    if (msg.includes('user already registered') || msg.includes('already exists')) {
      return 'Este e-mail já está cadastrado. Tente fazer login ou recupere sua senha.';
    }
    if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
      return 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
    }
    if (msg.includes('password should be at least')) {
      return 'A senha deve conter no mínimo 6 caracteres.';
    }
    if (msg.includes('rate limit')) {
      return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';
    }
    return errMessage || 'Ocorreu um erro durante a autenticação.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const redirectPath = location.state?.from?.pathname || '/';

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Por favor, informe seu nome completo.');
          setLoading(false);
          return;
        }

        const roleToAssign = isProvider ? 'provider' : 'client';

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name.trim(),
              role: roleToAssign,
            },
          },
        });

        if (signUpError) throw signUpError;

        setSuccessMessage('Conta criada com sucesso! Redirecionando...');
        setTimeout(() => {
          navigate(redirectPath);
        }, 1200);
      } else if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        setSuccessMessage('Login realizado com sucesso!');
        setTimeout(() => {
          navigate(redirectPath);
        }, 800);
      } else if (mode === 'forgot') {
        const result = await requestPasswordReset(email);
        if (!result.success) {
          setError(result.message);
        } else {
          setSuccessMessage(result.message);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(getFriendlyErrorMessage(err?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const theme = isProvider
    ? {
        primary: 'bg-orange-500 hover:bg-orange-600',
        text: 'text-orange-500',
        border: 'focus:ring-orange-500 focus:border-orange-500',
        bg: 'bg-orange-50',
        title: 'Área do Prestador',
        subtitle: 'Ofereça seus serviços no catálogo',
        heroImage:
          'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      }
    : {
        primary: 'bg-primary hover:bg-primary/90',
        text: 'text-primary',
        border: 'focus:ring-primary focus:border-primary',
        bg: 'bg-blue-50',
        title: 'Serviços Já',
        subtitle: 'Encontre os melhores profissionais da sua região',
        heroImage:
          'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark flex items-center justify-center p-4 font-display">
      <div className="w-full max-w-5xl bg-white dark:bg-card-dark rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Visual Side (Left) */}
        <div className="relative md:w-1/2 bg-gray-900 text-white overflow-hidden">
          <img
            src={theme.heroImage}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 to-transparent" />

          <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-12">
            <div
              className="flex items-center gap-2 cursor-pointer w-fit"
              onClick={() => navigate('/')}
            >
              <span className="material-symbols-outlined text-white text-3xl">hub</span>
              <span className="text-xl font-bold">Serviços Já</span>
            </div>

            <div className="mb-8 md:mb-0">
              <p className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">
                {theme.title}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                {theme.subtitle}
              </h2>
            </div>
          </div>
        </div>

        {/* Form Side (Right) */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm font-medium"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Voltar
          </button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            {mode === 'login' && 'Bem-vindo de volta!'}
            {mode === 'signup' && (isProvider ? 'Cadastro de Prestador' : 'Crie sua conta')}
            {mode === 'forgot' && 'Recuperar Senha'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-6 text-sm">
            {mode === 'login' && 'Acesse sua conta para continuar.'}
            {mode === 'signup' && (isProvider ? 'Cadastre-se para divulgar seus serviços.' : 'Cadastre-se para salvar preferências e avaliações.')}
            {mode === 'forgot' && 'Digite seu email para receber as instruções de redefinição.'}
          </p>

          {/* Mode Switch Tabs */}
          {mode !== 'forgot' && (
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                Cadastrar
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg border border-red-200 dark:border-red-900/40 text-center">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg border border-green-200 dark:border-green-900/40 text-center">
              {successMessage}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${theme.border} outline-none transition-all`}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                E-mail {isProvider && 'Profissional'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${theme.border} outline-none transition-all`}
              />
            </div>

            {mode !== 'forgot' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Senha
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className={`text-xs font-bold ${theme.text} hover:underline cursor-pointer`}
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${theme.border} outline-none transition-all pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 w-full py-3.5 rounded-xl text-white font-bold text-base shadow-lg transition-all active:scale-[0.98] ${theme.primary} ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading
                ? 'Processando...'
                : mode === 'login'
                ? 'Entrar'
                : mode === 'signup'
                ? 'Criar Conta'
                : 'Enviar Email de Recuperação'}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-center mt-2"
              >
                Voltar para o Login
              </button>
            )}
          </form>

          {/* Social Auth Option (Disabled / Em breve as per Rule 37) */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-card-dark px-2 text-gray-400">ou continue com</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 opacity-60 pointer-events-none">
            <button disabled className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-xs text-gray-500 bg-gray-50 dark:bg-gray-800">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
              Google (Em breve)
            </button>
            <button disabled className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-xs text-gray-500 bg-gray-50 dark:bg-gray-800">
              <img src="https://www.svgrepo.com/show/448234/apple.svg" className="w-4 h-4 dark:invert" alt="Apple" />
              Apple (Em breve)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
