import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getProviderDraft, ExistingProviderDraft } from '../lib/onboarding';
import { getProviderProfilePreview } from '../lib/provider';
import {
  getSubscriptionPlans,
  getMySubscription,
  createPendingSubscription,
  getActivationEligibility,
} from '../lib/subscription';
import {
  SubscriptionPlan,
  ProviderSubscription,
  ActivationEligibility,
  ProfileCompleteness,
} from '../types';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerDraft, setProviderDraft] = useState<ExistingProviderDraft | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [mySubscription, setMySubscription] = useState<ProviderSubscription | null>(null);
  const [eligibility, setEligibility] = useState<ActivationEligibility | null>(null);

  // Modal / Selection Notice
  const [selectedPlanNotice, setSelectedPlanNotice] = useState<SubscriptionPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch current provider draft
      const draft = await getProviderDraft();
      if (!draft) {
        setError('Você precisa cadastrar seu perfil profissional antes de acessar a área de assinaturas.');
        setLoading(false);
        return;
      }
      setProviderDraft(draft);

      // 2. Fetch profile completeness from P7
      const previewRes = await getProviderProfilePreview(draft.id);
      if (previewRes.completeness) {
        setCompleteness(previewRes.completeness);
      }

      // 3. Fetch commercial plans
      const fetchedPlans = await getSubscriptionPlans();
      setPlans(fetchedPlans);

      // 4. Fetch current provider subscription
      const sub = await getMySubscription(draft.id);
      setMySubscription(sub);

      // 5. Calculate eligibility
      const el = await getActivationEligibility(draft.id);
      setEligibility(el);
    } catch (err: any) {
      console.error('Error loading subscription page:', err);
      setError('Não foi possível carregar os dados de assinatura.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!providerDraft) return;

    setSubmitting(true);
    try {
      const res = await createPendingSubscription(providerDraft.id, plan.id);
      if (res.success && res.data) {
        setMySubscription(res.data);
        setSelectedPlanNotice(plan);
        // Refresh eligibility
        const el = await getActivationEligibility(providerDraft.id);
        setEligibility(el);
      } else {
        alert(res.error || 'Não foi possível registrar a escolha do plano.');
      }
    } catch (err: any) {
      console.error('Error selecting plan:', err);
      alert('Erro ao registrar escolha do plano.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatMoney = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">payments</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Planos e Assinatura
                </h1>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Estrutura comercial dos planos de divulgação profissional do Serviços Já.
              </p>
            </div>

            {/* Profile Completeness Badge */}
            {completeness && (
              <div className="flex flex-col items-start md:items-end gap-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold ${
                    completeness.isComplete
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {completeness.isComplete ? 'verified' : 'warning'}
                  </span>
                  {completeness.isComplete ? 'Perfil Profissional Completo' : 'Perfil Profissional Incompleto'}
                </span>
                {!completeness.isComplete && (
                  <button
                    onClick={() => navigate('/onboarding')}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Completar cadastro no onboarding →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Current Subscription Status */}
          {!loading && mySubscription && (
            <div className="mt-6 p-5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-xl">card_membership</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Seu Plano Atual: {mySubscription.plan?.name || 'Assinatura'}
                    </h3>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        mySubscription.status === 'active'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : mySubscription.status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {mySubscription.status === 'active'
                        ? 'Ativa'
                        : mySubscription.status === 'pending'
                        ? 'Pendente (Aguardando Confirmação)'
                        : mySubscription.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {mySubscription.status === 'pending'
                      ? 'Sua escolha de plano foi registrada no sistema como Pendente. A integração de pagamentos confirmará este plano futuramente.'
                      : `Ciclo de cobrança: ${formatMoney(mySubscription.plan?.price || 0)}`}
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col gap-1 text-xs text-slate-500">
                <span>Registrado em: {new Date(mySubscription.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          )}

          {/* Activation Eligibility Box */}
          {!loading && eligibility && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 flex items-start gap-3">
              <span className="material-symbols-outlined text-slate-500 text-xl mt-0.5">info</span>
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                  Status da Elegibilidade para Ativação do Perfil:
                </span>
                {eligibility.isEligible ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ Seu perfil atende a todos os critérios de completude e assinatura para futura publicação.
                  </span>
                ) : (
                  <span>
                    Perfil profissional: status <strong>draft (rascunho)</strong>. {eligibility.reasons.join(' ')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Commercial Plans Grid */}
        <section className="flex flex-col gap-6">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Escolha seu Plano de Divulgação
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Todos os planos garantem acesso às mesmas funcionalidades. A diferença está no desconto pelo período contratado.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Carregando planos comerciais...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isSelected = mySubscription?.planId === plan.id;
                const isAnnual = plan.slug === 'annual';
                const isQuarterly = plan.slug === 'quarterly';

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white dark:bg-card-dark rounded-2xl p-6 shadow-lg border flex flex-col justify-between transition-all hover:shadow-xl ${
                      isAnnual
                        ? 'border-2 border-primary ring-2 ring-primary/20 scale-[1.02]'
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    {/* Annual / Special Badge */}
                    {isAnnual && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                        ★ Maior Economia
                      </div>
                    )}

                    {isQuarterly && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                        Desconto Trimestral
                      </div>
                    )}

                    <div className="flex flex-col gap-4 mt-2">
                      <div className="border-b border-gray-200 dark:border-gray-800 pb-4 text-center">
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                          {plan.description}
                        </p>
                      </div>

                      {/* Pricing Display */}
                      <div className="text-center py-2">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            {formatMoney(plan.monthlyEquivalent)}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">/mês</span>
                        </div>

                        <div className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-gray-50 dark:bg-gray-800/60 p-2 rounded-lg inline-block">
                          {plan.billingIntervalCount === 1
                            ? `Cobrança mensal de ${formatMoney(plan.price)}`
                            : plan.billingIntervalCount === 3
                            ? `${formatMoney(plan.price)} cobrados a cada 3 meses`
                            : `${formatMoney(plan.price)} cobrados a cada 12 meses (anual)`}
                        </div>
                      </div>

                      {/* Benefits Checklist */}
                      <div className="flex flex-col gap-2.5 pt-2 text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-500 text-base">check</span>
                          <span>Exibição no catálogo de buscas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-500 text-base">check</span>
                          <span>Portfólio de fotos completo</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-500 text-base">check</span>
                          <span>Botões de Telefone e WhatsApp</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-500 text-base">check</span>
                          <span>Suporte ao prestador</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-6 mt-4 border-t border-gray-200 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => handleSelectPlan(plan)}
                        disabled={submitting || isSelected}
                        className={`w-full py-3 px-4 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                          isSelected
                            ? 'bg-emerald-600 text-white cursor-default'
                            : isAnnual
                            ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                            : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white'
                        } ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {isSelected ? (
                          <>
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            <span>Plano Selecionado</span>
                          </>
                        ) : (
                          <span>Escolher Plano {plan.name}</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Honest Commercial Notice */}
        <div className="p-5 bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 text-center max-w-2xl mx-auto shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            💡 <strong>Transparência Comercial:</strong> Todos os planos dão acesso exatamente aos mesmos recursos no Serviços Já. A única diferença entre eles é o período de cobrança contratado e o desconto progressivo oferecido.
          </p>
        </div>
      </main>

      {/* Selection Informational Modal */}
      {selectedPlanNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">info</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Plano {selectedPlanNotice.name} Selecionado
                </h3>
                <span className="text-xs font-bold text-primary">
                  {formatMoney(selectedPlanNotice.price)} no ciclo contratado
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Sua solicitação de assinatura para o plano <strong>{selectedPlanNotice.name}</strong> foi registrada como <strong>Pendente (Pending)</strong> no sistema.
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 font-semibold leading-normal">
                ⚠️ <strong>Ambiente de Desenvolvimento:</strong> A integração real com gateway de pagamento será disponibilizada em breve. Nenhum valor foi cobrado no momento.
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-center">
              <button
                type="button"
                onClick={() => setSelectedPlanNotice(null)}
                className="px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-md"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
