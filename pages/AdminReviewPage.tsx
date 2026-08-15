import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ProfileCompletenessChecklist from '../components/ProfileCompletenessChecklist';
import {
  getAdminProviderDetails,
  adminApproveProvider,
  adminRejectProvider,
  adminSuspendProvider,
} from '../lib/admin';
import {
  DetailedProviderProfile,
} from '../lib/catalog';
import {
  ProfileCompleteness,
  ProviderStatusHistory,
} from '../types';

const AdminReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const providerId = Number(id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [profile, setProfile] = useState<DetailedProviderProfile | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
  const [history, setHistory] = useState<ProviderStatusHistory[]>([]);

  // Modals & Action States
  const [submittingAction, setSubmittingAction] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [rejectionInput, setRejectionInput] = useState('');
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(providerId) || providerId <= 0) {
      setError('ID de prestador inválido.');
      setLoading(false);
      return;
    }

    loadProviderDetails();
  }, [providerId]);

  const loadProviderDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getAdminProviderDetails(providerId);
      if (!res) {
        setError('Não foi possível carregar os detalhes do prestador.');
      } else {
        setProfile(res.profile);
        setCompleteness(res.completeness);
        setHistory(res.history);
      }
    } catch (err: any) {
      console.error('Error loading provider details:', err);
      setError('Erro ao carregar os dados de revisão.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!profile) return;

    setSubmittingAction(true);
    setError(null);
    try {
      const res = await adminApproveProvider(profile.id);
      if (!res.success) {
        setError(res.errorMessage || 'Falha ao aprovar perfil.');
      } else {
        setSuccessBanner(`O perfil de "${profile.name}" foi APROVADO com sucesso (Status: published).`);
        setShowApproveModal(false);
        loadProviderDetails();
      }
    } catch (err: any) {
      console.error('Error approving provider:', err);
      setError('Erro inesperado ao aprovar perfil.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!profile) return;

    if (!rejectionInput.trim()) {
      setRejectionError('Por favor, informe o motivo da recusa.');
      return;
    }

    setSubmittingAction(true);
    setRejectionError(null);
    setError(null);

    try {
      const res = await adminRejectProvider(profile.id, rejectionInput);
      if (!res.success) {
        setRejectionError(res.errorMessage || 'Falha ao recusar perfil.');
      } else {
        setSuccessBanner(`O perfil de "${profile.name}" foi RECUSADO com sucesso (Status: rejected).`);
        setShowRejectModal(false);
        setRejectionInput('');
        loadProviderDetails();
      }
    } catch (err: any) {
      console.error('Error rejecting provider:', err);
      setRejectionError('Erro inesperado ao recusar perfil.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSuspend = async () => {
    if (!profile) return;

    setSubmittingAction(true);
    setError(null);
    try {
      const res = await adminSuspendProvider(profile.id, rejectionInput.trim() || undefined);
      if (!res.success) {
        setError(res.errorMessage || 'Falha ao suspender perfil.');
      } else {
        setSuccessBanner(`O perfil de "${profile.name}" foi SUSPENSO (Status: suspended).`);
        setShowSuspendModal(false);
        loadProviderDetails();
      }
    } catch (err: any) {
      console.error('Error suspending provider:', err);
      setError('Erro inesperado ao suspender perfil.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getAvatarUrl = () => {
    if (profile?.avatarUrl && profile.avatarUrl.trim()) return profile.avatarUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=137fec&color=fff`;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending_review':
        return (
          <span className="px-3.5 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-extrabold text-xs rounded-full border border-blue-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            <span>Solicitação em Análise (Pending Review)</span>
          </span>
        );
      case 'published':
        return (
          <span className="px-3.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs rounded-full border border-emerald-300">
            ● Publicado (Published)
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3.5 py-1 bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-extrabold text-xs rounded-full border border-red-300">
            ● Recusado (Rejected)
          </span>
        );
      case 'suspended':
        return (
          <span className="px-3.5 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-extrabold text-xs rounded-full border border-gray-400">
            ● Suspenso (Suspended)
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs rounded-full border border-amber-300">
            ● Rascunho (Draft)
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate('/admin/providers')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Voltar para lista de moderação</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-slate-500">Carregando dados para revisão...</span>
          </div>
        ) : error || !profile ? (
          <div className="bg-white dark:bg-card-dark rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-800 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Erro de Moderação</h2>
            <p className="text-xs text-slate-500">{error || 'Prestador não encontrado.'}</p>
            <button
              onClick={() => navigate('/admin/providers')}
              className="mt-2 px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl"
            >
              Voltar para lista
            </button>
          </div>
        ) : (
          <>
            {/* Success Banner */}
            {successBanner && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-sm font-semibold rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-emerald-600">check_circle</span>
                <span>{successBanner}</span>
              </div>
            )}

            {/* Moderation Header Bar */}
            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={getAvatarUrl()}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full border-2 border-primary object-cover"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      {profile.name}
                    </h1>
                    <span className="text-xs text-slate-400">(ID: #{profile.id})</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{profile.professionalTitle}</span>
                  <span className="text-xs text-slate-500">
                    {profile.locationCity} - {profile.locationState}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                {getStatusBadge(profile.status)}
              </div>
            </div>

            {/* Action Bar (Approve / Reject / Suspend) */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col text-center sm:text-left">
                <span className="font-extrabold text-base">Ações de Moderação</span>
                <span className="text-xs text-slate-400">
                  Execute decisões controladas sobre o ciclo de vida deste perfil profissional.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {profile.status === 'pending_review' && (
                  <>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">cancel</span>
                      <span>Recusar Perfil</span>
                    </button>
                    <button
                      onClick={() => setShowApproveModal(true)}
                      className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span>Aprovar Perfil</span>
                    </button>
                  </>
                )}

                {profile.status === 'published' && (
                  <button
                    onClick={() => setShowSuspendModal(true)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">pause_circle</span>
                    <span>Suspender Perfil</span>
                  </button>
                )}

                {profile.status === 'rejected' && (
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">published_with_changes</span>
                    <span>Aprovar Perfil Recusado</span>
                  </button>
                )}
              </div>
            </div>

            {/* Completeness Checklist & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 Cols: Detailed Information */}
              <div className="md:col-span-2 flex flex-col gap-6">
                {/* Section: Bio / Experience */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-800 flex flex-col gap-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">person</span>
                    <span>Biografia e Experiência</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    {profile.bio || 'Nenhuma biografia informada.'}
                  </p>
                  <div className="text-xs font-semibold text-slate-500">
                    Anos de experiência declarados: <strong>{profile.experienceYears} ano(s)</strong>
                  </div>
                </div>

                {/* Section: Services List */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-800 flex flex-col gap-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">handyman</span>
                    <span>Serviços Vinculados ({profile.services?.length || 0})</span>
                  </h3>

                  {profile.services && profile.services.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {profile.services.map((svc) => (
                        <span
                          key={svc}
                          className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-xl border border-primary/20"
                        >
                          {svc}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600">Nenhum serviço selecionado.</p>
                  )}
                </div>

                {/* Section: Service Areas */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-800 flex flex-col gap-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">map</span>
                    <span>Áreas de Atendimento</span>
                  </h3>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    Cidade Principal: <strong>{profile.locationCity} ({profile.locationState})</strong>
                  </div>
                  {profile.serviceAreas && profile.serviceAreas.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {profile.serviceAreas.map((area) => (
                        <span
                          key={area.city}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg"
                        >
                          {area.city} {area.state ? `(${area.state})` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section: Real Portfolio Gallery */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-800 flex flex-col gap-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">photo_library</span>
                    <span>Portfólio de Trabalhos ({profile.portfolio?.length || 0} fotos)</span>
                  </h3>

                  {profile.portfolio && profile.portfolio.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {profile.portfolio.map((item) => (
                        <div
                          key={item.id}
                          className="group relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden aspect-square border border-gray-200 dark:border-gray-700 shadow-sm"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title || 'Foto de trabalho'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {item.title && (
                            <div className="absolute inset-x-0 bottom-0 bg-slate-950/70 p-2 text-white text-[11px] font-medium truncate">
                              {item.title}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">O prestador ainda não adicionou fotos ao portfólio.</p>
                  )}
                </div>
              </div>

              {/* Right Col: Checklist & Immutable Audit Timeline */}
              <div className="flex flex-col gap-6">
                {/* Checklist Widget P7 */}
                {completeness && <ProfileCompletenessChecklist completeness={completeness} />}

                {/* Contact Info Widget */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-800 flex flex-col gap-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">call</span>
                    <span>Contatos Cadastrados</span>
                  </h4>
                  <div className="flex flex-col gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Telefone:</span>
                      <span>{profile.phone || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">WhatsApp:</span>
                      <span>{profile.whatsapp || 'Não informado'}</span>
                    </div>
                  </div>
                </div>

                {/* Immutable Status History Timeline */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-800 flex flex-col gap-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
                    <span className="material-symbols-outlined text-primary text-lg">history</span>
                    <span>Histórico de Status (Auditável)</span>
                  </h4>

                  {history.length === 0 ? (
                    <p className="text-xs text-slate-400">Nenhum histórico registrado até o momento.</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {history.map((h) => (
                        <div key={h.id} className="relative pl-5 border-l-2 border-primary/40 flex flex-col gap-1">
                          <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary"></div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            <span>{h.fromStatus} → {h.toStatus}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(h.createdAt).toLocaleString('pt-BR')}
                          </span>
                          {h.rejectionReason && (
                            <span className="text-[11px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-1.5 rounded mt-1">
                              Motivo: {h.rejectionReason}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
            <div className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Aprovar Perfil Profissional?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Deseja aprovar o perfil de <strong>"{profile?.name}"</strong>? O status será alterado para <strong>published</strong>.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-gray-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={submittingAction}
                className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-md"
              >
                {submittingAction ? 'Aprovando...' : 'Confirmar Aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Mandatory Reason */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">cancel</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Recusar Perfil Profissional
                </h3>
                <p className="text-xs text-slate-500">
                  Informe o motivo da recusa. O prestador visualizará esta mensagem no seu painel.
                </p>
              </div>

              {rejectionError && (
                <div className="w-full text-left text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {rejectionError}
                </div>
              )}

              <textarea
                rows={3}
                required
                value={rejectionInput}
                onChange={(e) => setRejectionInput(e.target.value)}
                placeholder="Explicitar o motivo da recusa (ex: fotos do portfólio desfocadas, título genérico...)"
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowRejectModal(false); setRejectionInput(''); }}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-gray-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={submittingAction}
                className="px-5 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 shadow-md"
              >
                {submittingAction ? 'Recusando...' : 'Confirmar Recusa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
            <div className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">pause_circle</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Suspender Perfil Profissional?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Deseja suspender o perfil de <strong>"{profile?.name}"</strong>? O prestador será temporariamente removido do catálogo público.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-gray-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSuspend}
                disabled={submittingAction}
                className="px-5 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl hover:bg-amber-700 shadow-md"
              >
                {submittingAction ? 'Suspendendo...' : 'Confirmar Suspensão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewPage;
