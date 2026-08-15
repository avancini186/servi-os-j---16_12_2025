import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getProviderDashboardSummary, ProviderDashboardData } from '../lib/providerDashboard';

const ProviderDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ProviderDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getProviderDashboardSummary();
      if (!summary) {
        // If user is not provider or has no profile draft
        navigate('/onboarding');
        return;
      }
      setData(summary);
    } catch (err: any) {
      console.error('Error loading provider dashboard:', err);
      setError('Não foi possível carregar as informações do seu painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getAvatarUrl = () => {
    if (data?.avatarUrl && data.avatarUrl.trim()) {
      return data.avatarUrl;
    }
    const name = data?.userName || 'Prestador';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=137fec&color=fff`;
  };

  // Helper for Status Card rendering
  const renderStatusCard = () => {
    if (!data) return null;

    const { status, completeness, rejectionReason, providerId } = data;

    if (status === 'draft') {
      const isComplete = completeness.isComplete;
      return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">edit_note</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  {isComplete ? 'Pronto para publicação' : 'Rascunho em preenchimento'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {isComplete ? 'Seu perfil atende aos requisitos estruturais!' : 'Complete seu cadastro profissional'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                {isComplete
                  ? 'Você pode enviar seu perfil para análise administrativa e publicação no catálogo.'
                  : 'Preencha o título profissional, cidade e os serviços oferecidos para habilitar a solicitação de publicação.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/onboarding')}
            className="flex-shrink-0 px-6 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 flex items-center justify-center gap-2"
          >
            <span>{isComplete ? 'Solicitar publicação' : 'Completar perfil'}</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      );
    }

    if (status === 'pending_review') {
      return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">schedule</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Em análise administrativa
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Solicitação de publicação em análise
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Seu perfil foi enviado para moderação. Assim que for revisado, você receberá a ativação no catálogo público.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/profile-preview/${providerId}`)}
            className="flex-shrink-0 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">visibility</span>
            <span>Pré-visualizar perfil</span>
          </button>
        </div>
      );
    }

    if (status === 'published') {
      return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Publicado no Catálogo
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Seu perfil está visível publicamente!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Visitantes de todo o catálogo podem encontrar seus serviços, visualizar seu portfólio e entrar em contato.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/profile/${providerId}`)}
            className="flex-shrink-0 px-6 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">open_in_new</span>
            <span>Ver meu perfil público</span>
          </button>
        </div>
      );
    }

    if (status === 'rejected') {
      return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">error_medial</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                  Precisa de ajustes
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Sua publicação não foi aprovada
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Motivo: <strong className="text-red-600 dark:text-red-400">{rejectionReason || 'Preencha as informações com clareza e envie fotos de alta qualidade.'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/onboarding')}
            className="flex-shrink-0 px-6 py-3 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            <span>Corrigir perfil</span>
          </button>
        </div>
      );
    }

    // Suspended
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">block</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Perfil Suspenso
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Seu perfil está temporariamente indisponível
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Entre em contato com o suporte administrativo do Serviços Já para mais detalhes sobre a reativação.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Loading Skeleton State */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
            <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/50 text-center my-8">
            <span className="material-symbols-outlined text-5xl text-red-500 mb-3">error</span>
            <p className="text-slate-900 dark:text-white text-lg font-bold mb-1">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Main Dashboard Content */}
        {!loading && !error && data && (
          <div className="space-y-8">
            {/* Header Greeting */}
            <div className="flex items-center gap-4">
              <img
                src={getAvatarUrl()}
                alt={data.userName}
                className="w-16 h-16 rounded-2xl border-2 border-primary/20 object-cover shadow-sm"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Olá, {data.userName}!
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
                  {data.professionalTitle} • {data.locationCity}{data.locationState ? `, ${data.locationState}` : ''}
                </p>
              </div>
            </div>

            {/* Lifecycle Status Banner */}
            {renderStatusCard()}

            {/* 4 Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Perfil & Completude */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Completude do Perfil
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500">
                      <span className="material-symbols-outlined text-xl">account_circle</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {data.completeness.score}%
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {data.completeness.isComplete ? 'Requisitos atendidos' : 'Pendente'}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          data.completeness.isComplete ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${data.completeness.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/onboarding')}
                  className="mt-6 w-full flex items-center justify-between text-xs font-bold text-primary hover:underline"
                >
                  <span>Editar meu perfil</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Card 2: Desempenho (30 dias) */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Desempenho (30 dias)
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-500">
                      <span className="material-symbols-outlined text-xl">insights</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Visualizações:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{data.analytics.views30d}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Contatos:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.analytics.contacts30d}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/analytics')}
                  className="mt-6 w-full flex items-center justify-between text-xs font-bold text-primary hover:underline"
                >
                  <span>Ver desempenho completo</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Card 3: Assinatura & Plano */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Situação Comercial
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
                      <span className="material-symbols-outlined text-xl">credit_card</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    {data.subscription ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              data.subscription.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          ></span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white capitalize">
                            {data.subscription.status === 'active' ? 'Assinatura Ativa' : 'Aguardando Processamento'}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {data.subscription.plan?.name || 'Plano Registrado'}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-bold text-slate-400">Sem assinatura ativa</span>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                          Escolha um plano de divulgação
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate('/assinatura')}
                  className="mt-6 w-full flex items-center justify-between text-xs font-bold text-primary hover:underline"
                >
                  <span>Gerenciar assinatura</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Card 4: Portfólio */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Portfólio de Trabalhos
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500">
                      <span className="material-symbols-outlined text-xl">photo_library</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {data.portfolioCount}
                    </span>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      {data.portfolioCount === 1 ? 'trabalho cadastrado' : 'trabalhos cadastrados no perfil'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/onboarding')}
                  className="mt-6 w-full flex items-center justify-between text-xs font-bold text-primary hover:underline"
                >
                  <span>Gerenciar portfólio</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderDashboardPage;
