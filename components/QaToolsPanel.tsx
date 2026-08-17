import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { checkProfileCompleteness } from '../lib/provider';

interface QaPersonaData {
  persona: 'client' | 'provider' | 'admin';
  userName: string;
  userEmail: string;
  role: string;
  userId: string;
  providerId?: number;
  status?: string;
  rejectionReason?: string;
  completenessPercent?: number;
  analyticsEventsCount?: number;
  subscriptionStatus?: string;
}

export const QaToolsPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [personas, setPersonas] = useState<QaPersonaData[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchQaData();
  }, []);

  const fetchQaData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // 1. Query qa_test_accounts
      const { data: qaAccounts, error: qaErr } = await supabase
        .from('qa_test_accounts')
        .select('id, user_id, persona, description');

      if (qaErr) throw qaErr;

      const loadedPersonas: QaPersonaData[] = [];

      for (const item of qaAccounts || []) {
        // Query user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, user_id, name, email, role')
          .eq('user_id', item.user_id)
          .maybeSingle();

        if (!profile) continue;

        if (item.persona === 'provider') {
          // Fetch provider profile details
          const { data: provProf } = await supabase
            .from('provider_profiles')
            .select('id, status, rejection_reason, professional_title, bio, location_city, location_state')
            .eq('profile_id', profile.id)
            .maybeSingle();

          let completenessPercent = 0;
          let providerId = provProf?.id;
          let status = provProf?.status || 'draft';
          let rejectionReason = provProf?.rejection_reason;
          let analyticsCount = 0;
          let subStatus = 'Nenhum';

          if (provProf) {
            // Check completeness
            const completeness = checkProfileCompleteness({
              id: provProf.id,
              profileId: profile.id,
              userId: profile.user_id,
              name: profile.name,
              avatarUrl: '',
              professionalTitle: provProf.professional_title || '',
              bio: provProf.bio || '',
              experienceYears: 5,
              phone: '19999999999',
              whatsapp: '19999999999',
              locationCity: provProf.location_city || '',
              locationState: provProf.location_state || '',
              status: provProf.status,
              rating: 0,
              reviewsCount: 0,
              services: [{ id: 1, name: 'Serviço de Teste', categoryName: 'Geral' }],
              portfolio: [],
              socialLinks: [],
              serviceAreas: [],
              reviews: [],
            } as any);
            completenessPercent = completeness.score;

            // Analytics count
            const { count } = await supabase
              .from('provider_analytics_events')
              .select('id', { count: 'exact' })
              .eq('provider_id', provProf.id);
            analyticsCount = count || 0;

            // Subscription
            const { data: sub } = await supabase
              .from('provider_subscriptions')
              .select('status')
              .eq('provider_id', provProf.id)
              .maybeSingle();

            if (sub) subStatus = sub.status;
          }

          loadedPersonas.push({
            persona: 'provider',
            userName: profile.name || 'Prestador Teste',
            userEmail: profile.email,
            role: profile.role,
            userId: profile.user_id,
            providerId,
            status,
            rejectionReason,
            completenessPercent,
            analyticsEventsCount: analyticsCount,
            subscriptionStatus: subStatus,
          });
        } else {
          loadedPersonas.push({
            persona: item.persona as 'client' | 'admin',
            userName: profile.name || (item.persona === 'admin' ? 'Admin Teste' : 'Cliente Teste'),
            userEmail: profile.email,
            role: profile.role,
            userId: profile.user_id,
          });
        }
      }

      setPersonas(loadedPersonas);
    } catch (err: any) {
      console.error('Error fetching QA personas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetProvider = async (providerId: number) => {
    if (!window.confirm('Tem certeza que deseja resetar os dados do Prestador Teste para o estado draft inicial? Esta ação é exclusiva para a conta de QA.')) {
      return;
    }

    setResetting(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.rpc('reset_qa_test_provider', {
        p_provider_id: providerId,
      });

      if (error) throw error;

      if (data?.success) {
        setMessage({ type: 'success', text: 'Prestador Teste resetado com sucesso para o estado "draft"!' });
        await fetchQaData();
      } else {
        setMessage({ type: 'error', text: data?.message || 'Falha ao resetar prestador de teste.' });
      }
    } catch (err: any) {
      console.error('Error resetting QA test provider:', err);
      setMessage({ type: 'error', text: err.message || 'Erro de execução ao resetar o prestador de teste.' });
    } finally {
      setResetting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'published':
        return <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-300">● Publicado</span>;
      case 'pending_review':
        return <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-xs rounded-full border border-blue-300">● Em Análise</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-bold text-xs rounded-full border border-red-300">● Recusado</span>;
      case 'suspended':
        return <span className="px-2.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-full border border-gray-400">● Suspenso</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs rounded-full border border-amber-300">● Rascunho (Draft)</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-md border border-purple-200 dark:border-purple-900/50 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xl">
            🧪
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <span>Ferramentas de QA — Contas de Teste Controladas</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gerencie e resete com segurança o estado das personas de teste do ambiente de QA.
            </p>
          </div>
        </div>

        <button
          onClick={fetchQaData}
          disabled={loading}
          className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-xl border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1.5 self-start sm:self-center"
        >
          <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
          <span>Atualizar Personas</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {message.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-xs font-semibold text-slate-500">
          Carregando informações das contas de QA...
        </div>
      ) : personas.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
          Nenhuma conta registrada em <code>qa_test_accounts</code> encontrada. Execute a migration de seed para disponibilizar as personas de teste.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {personas.map((p) => (
            <div
              key={p.userId}
              className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-5 border border-gray-200 dark:border-gray-800 flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xl">
                    {p.persona === 'client' ? '👤' : p.persona === 'provider' ? '⚡' : '🛡️'}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-extrabold text-[10px] uppercase tracking-wider rounded-md border border-purple-200 dark:border-purple-800">
                    Role: {p.role}
                  </span>
                </div>

                <div className="flex flex-col">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {p.userName}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {p.userEmail}
                  </span>
                </div>

                {p.persona === 'provider' && (
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-200 dark:border-gray-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Status Atual:</span>
                      {getStatusBadge(p.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Completude:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.completenessPercent || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Eventos Analytics:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.analyticsEventsCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Assinatura:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{p.subscriptionStatus}</span>
                    </div>
                  </div>
                )}
              </div>

              {p.persona === 'provider' && p.providerId && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => handleResetProvider(p.providerId!)}
                    disabled={resetting}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">restart_alt</span>
                    <span>{resetting ? 'Resetando...' : 'Resetar Prestador Teste (QA)'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
