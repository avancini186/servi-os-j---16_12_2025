import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getProviderDraft } from '../lib/onboarding';
import { getProviderAnalyticsSummary } from '../lib/analytics';
import type { AnalyticsPeriod, AnalyticsSummary } from '../types';

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();

  const [providerId, setProviderId] = useState<number | null>(null);
  const [providerStatus, setProviderStatus] = useState<string>('draft');
  const [providerName, setProviderName] = useState<string>('');
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load Provider Profile Draft / ID
  useEffect(() => {
    async function loadProvider() {
      setLoading(true);
      setError(null);
      try {
        const draft = await getProviderDraft();
        if (!draft || !draft.id) {
          navigate('/onboarding');
          return;
        }
        setProviderId(draft.id);
        setProviderStatus(draft.status || 'draft');
        setProviderName(draft.professionalTitle || 'Prestador');
      } catch (err: any) {
        console.error('Error loading provider profile for analytics:', err);
        setError('Não foi possível identificar seu perfil profissional.');
      } finally {
        setLoading(false);
      }
    }
    loadProvider();
  }, [navigate]);

  // Load Analytics Data whenever Provider ID or Period changes
  useEffect(() => {
    if (!providerId) return;

    async function loadAnalytics() {
      setAnalyticsLoading(true);
      try {
        const data = await getProviderAnalyticsSummary(providerId!, period);
        setSummary(data);
      } catch (err: any) {
        console.error('Error loading analytics data:', err);
      } finally {
        setAnalyticsLoading(false);
      }
    }
    loadAnalytics();
  }, [providerId, period]);

  const renderStatusBanner = () => {
    if (providerStatus === 'draft') {
      return (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-200 text-sm mb-6">
          <span className="material-symbols-outlined text-xl text-amber-500">info</span>
          <div>
            <strong>Seu perfil ainda não está publicado.</strong> As métricas públicas do catálogo começarão a ser contabilizadas assim que seu perfil for publicado.
          </div>
        </div>
      );
    }
    if (providerStatus === 'pending_review') {
      return (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl text-blue-800 dark:text-blue-200 text-sm mb-6">
          <span className="material-symbols-outlined text-xl text-blue-500">schedule</span>
          <div>
            <strong>Seu perfil está em análise.</strong> Suas métricas públicas estarão ativas após a aprovação do seu cadastro.
          </div>
        </div>
      );
    }
    if (providerStatus === 'suspended') {
      return (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-800 dark:text-red-200 text-sm mb-6">
          <span className="material-symbols-outlined text-xl text-red-500">block</span>
          <div>
            <strong>Seu perfil está temporariamente suspenso.</strong> O histórico de estatísticas foi preservado abaixo.
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Header Title & Period Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Desempenho & Analytics
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Acompanhe como seu perfil é descoberto no catálogo e quais canais geram contatos.
            </p>
          </div>

          {/* Period Selector Tabs */}
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
            {[
              { id: 'today', label: 'Hoje' },
              { id: '7d', label: '7 dias' },
              { id: '30d', label: '30 dias' },
              { id: '90d', label: '90 dias' },
              { id: 'all', label: 'Total' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id as AnalyticsPeriod)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  period === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Banner */}
        {renderStatusBanner()}

        {/* Loading State */}
        {(loading || analyticsLoading) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
            ))}
          </div>
        )}

        {/* Analytics Summary */}
        {!loading && summary && (
          <div className="space-y-8">
            {/* Top 4 Indicator Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Visualizações */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Visualizações do Perfil
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500">
                    <span className="material-symbols-outlined text-xl">visibility</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {summary.totalViews.toLocaleString('pt-BR')}
                  </span>
                  {summary.previousPeriodComparison && (
                    <div className="flex items-center gap-1 text-xs mt-1 font-semibold">
                      <span
                        className={
                          summary.previousPeriodComparison.viewsChangePercent >= 0
                            ? 'text-emerald-500'
                            : 'text-red-500'
                        }
                      >
                        {summary.previousPeriodComparison.viewsChangePercent >= 0 ? '+' : ''}
                        {summary.previousPeriodComparison.viewsChangePercent}%
                      </span>
                      <span className="text-slate-400">vs período anterior</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Aparições em Buscas */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Aparições nas Buscas
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-500">
                    <span className="material-symbols-outlined text-xl">search</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {summary.totalImpressions.toLocaleString('pt-BR')}
                  </span>
                  {summary.previousPeriodComparison && (
                    <div className="flex items-center gap-1 text-xs mt-1 font-semibold">
                      <span
                        className={
                          summary.previousPeriodComparison.impressionsChangePercent >= 0
                            ? 'text-emerald-500'
                            : 'text-red-500'
                        }
                      >
                        {summary.previousPeriodComparison.impressionsChangePercent >= 0 ? '+' : ''}
                        {summary.previousPeriodComparison.impressionsChangePercent}%
                      </span>
                      <span className="text-slate-400">vs período anterior</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Cliques de Contato */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Cliques de Contato
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500">
                    <span className="material-symbols-outlined text-xl">touch_app</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {summary.totalContacts.toLocaleString('pt-BR')}
                  </span>
                  {summary.previousPeriodComparison && (
                    <div className="flex items-center gap-1 text-xs mt-1 font-semibold">
                      <span
                        className={
                          summary.previousPeriodComparison.contactsChangePercent >= 0
                            ? 'text-emerald-500'
                            : 'text-red-500'
                        }
                      >
                        {summary.previousPeriodComparison.contactsChangePercent >= 0 ? '+' : ''}
                        {summary.previousPeriodComparison.contactsChangePercent}%
                      </span>
                      <span className="text-slate-400">vs período anterior</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 4: Taxa de Interação */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Taxa de Interação
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
                    <span className="material-symbols-outlined text-xl">trending_up</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {summary.viewToContactRate}%
                  </span>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    dos visitantes clicaram em contato
                  </p>
                </div>
              </div>
            </div>

            {/* Zero Data Empty State */}
            {summary.totalViews === 0 && summary.totalImpressions === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">
                  insights
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Seu perfil ainda não possui dados suficientes para este período
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
                  Conforme os visitantes encontrarem seu perfil publicado no catálogo do Serviços Já, as estatísticas de visualizações e contatos aparecerão aqui em tempo real.
                </p>
              </div>
            )}

            {/* Detailed Analytics Grid */}
            {(summary.totalViews > 0 || summary.totalImpressions > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Discovery Funnel Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">filter_alt</span>
                    Funil de Descoberta
                  </h3>

                  <div className="space-y-4">
                    {/* Step 1: Aparições */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                        <span>1. Aparições nas Buscas</span>
                        <span className="text-slate-900 dark:text-white">{summary.totalImpressions}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full w-full"></div>
                      </div>
                    </div>

                    {/* Transition 1 */}
                    <div className="text-center text-xs font-bold text-primary py-0.5">
                      ↓ {summary.impressionToViewRate}% clicaram no perfil
                    </div>

                    {/* Step 2: Visualizações */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                        <span>2. Visualizações do Perfil</span>
                        <span className="text-slate-900 dark:text-white">{summary.totalViews}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(10, summary.impressionToViewRate))}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Transition 2 */}
                    <div className="text-center text-xs font-bold text-primary py-0.5">
                      ↓ {summary.viewToContactRate}% acionaram contato
                    </div>

                    {/* Step 3: Contatos */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                        <span>3. Cliques de Contato</span>
                        <span className="text-slate-900 dark:text-white">{summary.totalContacts}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(10, summary.viewToContactRate))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Channels Breakdown */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">forum</span>
                    Canais de Contato Preferidos
                  </h3>

                  <div className="space-y-4">
                    {[
                      { label: 'WhatsApp', count: summary.contactBreakdown.whatsapp, color: 'bg-emerald-500', icon: 'chat' },
                      { label: 'Telefone', count: summary.contactBreakdown.phone, color: 'bg-blue-500', icon: 'call' },
                      { label: 'E-mail', count: summary.contactBreakdown.email, color: 'bg-amber-500', icon: 'mail' },
                      { label: 'Website / Links', count: summary.contactBreakdown.website, color: 'bg-purple-500', icon: 'language' },
                    ].map((channel) => {
                      const percentage =
                        summary.totalContacts > 0
                          ? Math.round((channel.count / summary.totalContacts) * 100)
                          : 0;
                      return (
                        <div key={channel.label} className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base text-slate-400">
                                {channel.icon}
                              </span>
                              {channel.label}
                            </span>
                            <span>
                              {channel.count} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`${channel.color} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Search Terms */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">search</span>
                    Como Encontram seu Perfil
                  </h3>

                  {summary.topSearchTerms.length > 0 ? (
                    <div className="space-y-2.5">
                      {summary.topSearchTerms.map((termItem, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                            "{termItem.term}"
                          </span>
                          <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-md">
                            {termItem.count} busca(s)
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Nenhum termo de pesquisa específico registrado para este período.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Top Portfolio Items Section */}
            {summary.topPortfolioItems.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">photo_library</span>
                  Trabalhos do Portfólio Mais Acessados
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {summary.topPortfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                    >
                      <div
                        className="w-14 h-14 bg-cover bg-center rounded-lg flex-shrink-0 border border-slate-200 dark:border-slate-700"
                        style={{ backgroundImage: `url("${item.imageUrl}")` }}
                      ></div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.views} visualização(ões)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsPage;
