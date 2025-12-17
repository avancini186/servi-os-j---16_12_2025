import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserTypeSelectionPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSelection = (type: 'client' | 'provider') => {
        navigate(`/auth/${type}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background-light dark:bg-background-dark font-display relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent -z-10" />

            {/* Logo */}
            <div className="mb-8 flex items-center gap-2" onClick={() => navigate('/')}>
                <span className="material-symbols-outlined text-primary text-4xl">hub</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer">Serviços Já</span>
            </div>

            <div className="w-full max-w-2xl bg-white dark:bg-card-dark rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-800">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-100 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl">handshake</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Bem-vindo ao ServiçosJá
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Conectando você aos melhores profissionais. <br className="hidden md:block" />
                        Como você deseja usar o app hoje?
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                    {/* Client Option */}
                    <button
                        onClick={() => handleSelection('client')}
                        className="group flex flex-col items-center text-center p-6 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl text-primary">person_search</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sou Cliente</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Encontre serviços rápidos e qualificados
                        </p>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                            <span className="material-symbols-outlined text-primary">arrow_forward</span>
                        </div>
                    </button>

                    {/* Provider Option */}
                    <button
                        onClick={() => handleSelection('provider')}
                        className="group flex flex-col items-center text-center p-6 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-orange-400/50 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl text-orange-500">engineering</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sou Prestador</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Ofereça seus serviços e aumente sua renda
                        </p>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                            <span className="material-symbols-outlined text-orange-500">arrow_forward</span>
                        </div>
                    </button>
                </div>

                <div className="text-center pt-6 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-gray-600 dark:text-gray-400">
                        Já possui uma conta?{' '}
                        <a href="#" className="font-bold text-primary hover:underline">
                            Fazer Login
                        </a>
                    </p>
                    <div className="flex justify-center gap-6 mt-6 text-xs text-gray-400">
                        <a href="#" className="hover:text-gray-600 dark:hover:text-gray-200">Termos de Uso</a>
                        <span>•</span>
                        <a href="#" className="hover:text-gray-600 dark:hover:text-gray-200">Política de Privacidade</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserTypeSelectionPage;
