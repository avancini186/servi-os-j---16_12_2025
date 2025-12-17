import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
    const { type } = useParams<{ type: string }>(); // 'client' or 'provider'
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [showPassword, setShowPassword] = useState(false);

    const isProvider = type === 'provider';

    // Theme Config based on type
    const theme = isProvider ? {
        primary: 'bg-orange-500 hover:bg-orange-600',
        text: 'text-orange-500',
        border: 'focus:ring-orange-500 focus:border-orange-500',
        bg: 'bg-orange-50',
        title: 'Área do Parceiro',
        subtitle: 'Expanda seu negócio',
        heroImage: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Worker image
        welcome: 'Bem-vindo de volta, parceiro!'
    } : {
        primary: 'bg-primary hover:bg-primary/90',
        text: 'text-primary',
        border: 'focus:ring-primary focus:border-primary',
        bg: 'bg-blue-50',
        title: 'Serviços Já',
        subtitle: 'Encontre o profissional ideal',
        heroImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Networking/people image
        welcome: 'Bem-vindo ao ServiçosJá'
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark flex items-center justify-center p-4 font-display">
            <div className="w-full max-w-5xl bg-white dark:bg-card-dark rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Visual Side (Left on Desktop) */}
                <div className="relative md:w-1/2 bg-gray-900 text-white overflow-hidden">
                    <img
                        src={theme.heroImage}
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 to-transparent`} />

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
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                                {theme.subtitle}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Form Side (Right) */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/auth/selection')}
                        className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm font-medium"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Voltar
                    </button>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                        {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm">
                        {mode === 'login' ? 'Gerencie seus serviços e encontre o que precisa.' : 'Junte-se a milhares de usuários e profissionais.'}
                    </p>

                    {/* Tabs */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-8">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'login'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'signup'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            Cadastrar
                        </button>
                    </div>

                    <form className="flex flex-col gap-4">
                        {mode === 'signup' && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    placeholder="Seu nome"
                                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-900 border border-gray-200 dark:border-gray-700 ${theme.border} outline-none transition-all`}
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                E-mail {isProvider && 'Profissional'}
                            </label>
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-900 border border-gray-200 dark:border-gray-700 ${theme.border} outline-none transition-all`}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Senha
                                </label>
                                {mode === 'login' && (
                                    <a className={`text-xs font-bold ${theme.text} hover:opacity-80 cursor-pointer`}>
                                        Esqueceu a senha?
                                    </a>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-900 border border-gray-200 dark:border-gray-700 ${theme.border} outline-none transition-all pr-12`}
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

                        <button
                            type="button"
                            className={`mt-4 w-full py-3.5 rounded-xl text-white font-bold text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] ${theme.primary}`}
                        >
                            {mode === 'login' ? (isProvider ? 'Acessar Painel' : 'Entrar') : 'Criar Conta'} <span className="ml-1">→</span>
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-card-dark px-2 text-gray-400">ou continue com</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold text-gray-700 dark:text-gray-300">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold text-gray-700 dark:text-gray-300">
                            <img src="https://www.svgrepo.com/show/448234/apple.svg" className="w-5 h-5 dark:invert" alt="Apple" />
                            Apple
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AuthPage;
