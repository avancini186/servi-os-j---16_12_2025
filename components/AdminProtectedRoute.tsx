import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkIsAdmin } from '../lib/admin';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function verifyAdmin() {
      setLoading(true);
      const res = await checkIsAdmin();
      setIsAdmin(res);
      setLoading(false);
    }
    verifyAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark font-display gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Verificando privilégios de moderação...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark font-display px-4 text-center">
        <div className="bg-white dark:bg-card-dark max-w-md w-full rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">shield_lock</span>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              403 — Acesso Restrito
            </h1>
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
              Área Administrativa Protegida
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Sua conta não possui permissões de administrador para acessar o painel de moderação de prestadores.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 w-full py-3 px-4 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md"
          >
            Voltar para a Página Inicial
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
