import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getAdminProviders } from '../lib/admin';
import { AdminProviderListItem, AdminProviderFilter } from '../types';
import { QaToolsPanel } from '../components/QaToolsPanel';

const AdminProvidersPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<AdminProviderListItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<AdminProviderFilter>('pending_review');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQaTools, setShowQaTools] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedFilter, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminProviders(selectedFilter, searchQuery);
      setProviders(res);
    } catch (err: any) {
      console.error('Error loading admin providers:', err);
      setError('Não foi possível carregar a lista de prestadores para moderação.');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (item: AdminProviderListItem) => {
    if (item.avatarUrl && item.avatarUrl.trim()) return item.avatarUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userName)}&background=137fec&color=fff`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-extrabold text-xs rounded-full border border-blue-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            <span>Aguardando Moderação (Pending Review)</span>
          </span>
        );
      case 'published':
        return (
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs rounded-full border border-emerald-300">
            ● Publicado
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-extrabold text-xs rounded-full border border-red-300">
            ● Recusado
          </span>
        );
      case 'suspended':
        return (
          <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-extrabold text-xs rounded-full border border-gray-400">
            ● Suspenso
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs rounded-full border border-amber-300">
            ● Rascunho (Draft)
          </span>
        );
    }
  };

  const filterTabs: { key: AdminProviderFilter; label: string }[] = [
    { key: 'pending_review', label: 'Em Análise (Aguardando)' },
    { key: 'published', label: 'Publicados' },
    { key: 'rejected', label: 'Recusados' },
    { key: 'suspended', label: 'Suspensos' },
    { key: 'draft', label: 'Rascunhos' },
    { key: 'all', label: 'Todos' },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Painel de Moderação
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Revise as solicitações de publicação e gerencie o ciclo de vida dos prestadores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQaTools(!showQaTools)}
              className={`px-3 py-1.5 font-bold text-xs rounded-lg border transition-colors flex items-center gap-1.5 ${
                showQaTools
                  ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                  : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100'
              }`}
            >
              <span>🧪 Ferramentas de QA</span>
              <span className="material-symbols-outlined text-sm">
                {showQaTools ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
              Modo Administrador
            </span>
          </div>
        </div>

        {/* QA Tools Section */}
        {showQaTools && <QaToolsPanel />}

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedFilter(tab.key)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  selectedFilter === tab.key
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-white dark:bg-card-dark text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, título ou cidade..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-900/50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">error</span>
              <span>{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-red-600 text-white font-bold text-xs rounded-lg hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Providers List Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-slate-500">Carregando prestadores para moderação...</span>
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white dark:bg-card-dark rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-slate-400 text-5xl">inbox</span>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              Nenhum prestador encontrado
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Não há solicitações ou perfis correspondentes ao filtro <strong>"{selectedFilter}"</strong> selecionado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-800 flex flex-col justify-between gap-4 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col gap-3">
                  {/* Top Row: User Avatar, Name & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrl(item)}
                        alt={item.userName}
                        className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                          {item.userName}
                        </span>
                        <span className="text-xs text-slate-400">{item.userEmail}</span>
                      </div>
                    </div>

                    {getStatusBadge(item.status)}
                  </div>

                  {/* Professional Title & Location */}
                  <div className="flex flex-col gap-1 pt-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {item.professionalTitle}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {item.locationCity} - {item.locationState}
                    </span>
                  </div>

                  {/* Counts & Completeness Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        item.isComplete
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200'
                      }`}
                    >
                      {item.isComplete ? '✓ Perfil Completo' : '⚠ Perfil Incompleto'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
                      {item.servicesCount} serviço(s)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
                      {item.portfolioCount} foto(s)
                    </span>
                  </div>

                  {item.rejectionReason && item.status === 'rejected' && (
                    <div className="mt-1 p-2.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs rounded-lg border border-red-200 dark:border-red-900/40">
                      <strong>Motivo recusa:</strong> {item.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Atualizado em {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                  <button
                    onClick={() => navigate(`/admin/providers/${item.id}`)}
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>Revisar Perfil</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProvidersPage;
