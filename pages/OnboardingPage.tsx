import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PortfolioManager from '../components/PortfolioManager';
import { getCategories } from '../lib/catalog';
import { getProviderDraft, saveProviderDraft, ExistingProviderDraft } from '../lib/onboarding';
import { requestPublication } from '../lib/provider';
import { supabase } from '../lib/supabase';
import type { Category } from '../types';

interface ServiceItemDB {
  id: number;
  category_id: number;
  name: string;
}

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [existingDraft, setExistingDraft] = useState<ExistingProviderDraft | null>(null);

  // Form Fields
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationState, setLocationState] = useState('SP');
  const [newCityInput, setNewCityInput] = useState('');
  const [additionalCities, setAdditionalCities] = useState<string[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  // Publication Request Modal & State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestingPublication, setRequestingPublication] = useState(false);

  // DB Metadata
  const [categories, setCategories] = useState<Category[]>([]);
  const [servicesMap, setServicesMap] = useState<Record<number, ServiceItemDB[]>>({});

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      setError(null);

      try {
        // 1. Load Categories and Services from Supabase
        const cats = await getCategories();
        setCategories(cats);

        const { data: servicesData } = await supabase
          .from('services')
          .select('id, category_id, name')
          .eq('active', true)
          .order('name');

        const groupedServices: Record<number, ServiceItemDB[]> = {};
        (servicesData || []).forEach((s: any) => {
          if (!groupedServices[s.category_id]) {
            groupedServices[s.category_id] = [];
          }
          groupedServices[s.category_id].push(s);
        });
        setServicesMap(groupedServices);

        // 2. Check for existing provider profile draft
        const draft = await getProviderDraft();
        if (draft) {
          setExistingDraft(draft);
          setProfessionalTitle(draft.professionalTitle);
          setBio(draft.bio);
          setExperienceYears(draft.experienceYears);
          setPhone(draft.phone);
          setWhatsapp(draft.whatsapp);
          setLocationCity(draft.locationCity);
          setLocationState(draft.locationState);
          setSelectedServiceIds(draft.serviceIds);
          setAdditionalCities(draft.additionalCities);
        }
      } catch (err: any) {
        console.error('Error loading onboarding data:', err);
        setError('Não foi possível carregar o formulário de cadastro.');
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const toggleService = (serviceId: number) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        if (prev.length >= 20) {
          alert('Você pode selecionar no máximo 20 serviços.');
          return prev;
        }
        return [...prev, serviceId];
      }
    });
  };

  const handleAddCity = () => {
    const trimmed = newCityInput.trim();
    if (trimmed && !additionalCities.includes(trimmed)) {
      setAdditionalCities([...additionalCities, trimmed]);
      setNewCityInput('');
    }
  };

  const handleRemoveCity = (cityToRemove: string) => {
    setAdditionalCities(additionalCities.filter((c) => c !== cityToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessBanner(null);
    setSaving(true);

    if (!professionalTitle.trim()) {
      setError('Por favor, informe seu título profissional.');
      setSaving(false);
      return;
    }

    if (!locationCity.trim() || !locationState.trim()) {
      setError('Por favor, informe sua cidade e estado principais.');
      setSaving(false);
      return;
    }

    if (selectedServiceIds.length === 0) {
      setError('Selecione pelo menos um serviço para continuar.');
      setSaving(false);
      return;
    }

    try {
      const result = await saveProviderDraft({
        professionalTitle,
        bio,
        experienceYears: Number(experienceYears) || 0,
        phone,
        whatsapp,
        locationCity,
        locationState,
        serviceIds: selectedServiceIds,
        additionalCities: additionalCities,
      });

      if (!result.success) {
        setError(result.error || 'Falha ao salvar rascunho do perfil.');
      } else {
        // Refresh provider draft to ensure providerId is available
        const updatedDraft = await getProviderDraft();
        if (updatedDraft) {
          setExistingDraft(updatedDraft);
        }
        setSuccessBanner('Perfil salvo com sucesso! Você pode gerenciar seu portfólio e solicitar a publicação abaixo.');
      }
    } catch (err: any) {
      console.error('Error saving onboarding:', err);
      setError('Ocorreu um erro ao salvar suas informações.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmRequestPublication = async () => {
    if (!existingDraft) return;

    setRequestingPublication(true);
    setError(null);

    try {
      const res = await requestPublication(existingDraft.id);
      if (!res.success) {
        setError(res.errorMessage || 'Falha ao solicitar publicação do perfil.');
      } else {
        setExistingDraft((prev) => (prev ? { ...prev, status: 'pending_review' } : prev));
        setShowRequestModal(false);
        setSuccessBanner('Solicitação de publicação enviada com sucesso! Seu perfil está em análise.');
      }
    } catch (err: any) {
      console.error('Error requesting publication:', err);
      setError('Erro inesperado ao solicitar publicação.');
    } finally {
      setRequestingPublication(false);
    }
  };

  // Check structural completeness (P7 criteria: Title, City, State, >= 1 Service)
  const isProfileComplete =
    !!professionalTitle.trim() &&
    !!locationCity.trim() &&
    !!locationState.trim() &&
    selectedServiceIds.length > 0;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Carregando dados de onboarding...</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-10 shadow-lg border border-gray-200 dark:border-gray-800">
              {/* Header Section */}
              <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      Onboarding Profissional
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Preencha os dados do seu perfil para criar e gerenciar seu perfil de prestador de serviço.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        existingDraft?.status === 'published'
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                          : existingDraft?.status === 'pending_review'
                          ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300'
                          : existingDraft?.status === 'rejected'
                          ? 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300'
                          : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      Status: {existingDraft?.status === 'published'
                        ? 'Publicado'
                        : existingDraft?.status === 'pending_review'
                        ? 'Em Análise'
                        : existingDraft?.status === 'rejected'
                        ? 'Recusado'
                        : 'Rascunho (Draft)'}
                    </span>
                    {existingDraft && (
                      <button
                        type="button"
                        onClick={() => navigate(`/profile-preview/${existingDraft.id}`)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        <span className="material-symbols-outlined text-base">visibility</span>
                        <span>Visualizar meu perfil</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">error</span>
                  <span>{error}</span>
                </div>
              )}

              {successBanner && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-sm font-semibold rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-emerald-600">check_circle</span>
                  <span>{successBanner}</span>
                </div>
              )}

              {/* Rejection Notice Banner */}
              {existingDraft?.status === 'rejected' && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-900/50 flex flex-col gap-1">
                  <div className="flex items-center gap-2 font-bold text-red-800 dark:text-red-200">
                    <span className="material-symbols-outlined text-xl">cancel</span>
                    <span>Seu perfil foi recusado durante a análise.</span>
                  </div>
                  {existingDraft.rejectionReason && (
                    <p className="text-xs text-red-600 dark:text-red-400 pl-7">
                      Motivo da recusa: {existingDraft.rejectionReason}
                    </p>
                  )}
                  <p className="text-xs text-red-500 pl-7 mt-1">
                    Corrija as informações necessárias abaixo e envie uma nova solicitação.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* Step 1: Dados Profissionais */}
                <section className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-extrabold">1</span>
                    Dados Profissionais
                  </h2>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Título Profissional <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      placeholder="ex: Eletricista Residencial e Predial"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-white text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Anos de Experiência
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="ex: 5"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Sobre seu trabalho (Bio / Descrição)
                    </label>
                    <textarea
                      rows={4}
                      maxLength={1000}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Descreva suas principais especialidades, serviços prestados e experiência..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-white text-sm resize-none"
                    />
                    <span className="text-xs text-slate-400 text-right">{bio.length}/1000 caracteres</span>
                  </div>
                </section>

                {/* Step 2: Contato */}
                <section className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-extrabold">2</span>
                    Informações de Contato
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Telefone Principal
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(11) 98888-7777"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-white text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        WhatsApp Profissional
                      </label>
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="(11) 98888-7777"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                </section>

                {/* Step 3: Localização */}
                <section className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-extrabold">3</span>
                    Localização e Atendimento
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Cidade Principal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={locationCity}
                        onChange={(e) => setLocationCity(e.target.value)}
                        placeholder="ex: Itapira"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-white text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Estado (UF) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={2}
                        value={locationState}
                        onChange={(e) => setLocationState(e.target.value.toUpperCase())}
                        placeholder="SP"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-white text-sm uppercase"
                      />
                    </div>
                  </div>

                  {/* Additional Cities */}
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Cidades Adicionais de Atendimento
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCityInput}
                        onChange={(e) => setNewCityInput(e.target.value)}
                        placeholder="ex: Mogi Mirim"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-sm text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddCity}
                        className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-slate-800 dark:text-white font-bold text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>

                    {additionalCities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {additionalCities.map((city) => (
                          <span
                            key={city}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold"
                          >
                            {city}
                            <button
                              type="button"
                              onClick={() => handleRemoveCity(city)}
                              className="hover:text-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* Step 4: Serviços */}
                <section className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-extrabold">4</span>
                      Serviços Oferecidos <span className="text-red-500">*</span>
                    </h2>
                    <span className="text-xs font-bold text-primary">
                      {selectedServiceIds.length} selecionado(s)
                    </span>
                  </div>

                  <div className="flex flex-col gap-6">
                    {categories.map((cat) => {
                      const catServices = servicesMap[cat.id || 0] || [];
                      if (catServices.length === 0) return null;

                      return (
                        <div key={cat.name} className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-xl">{cat.icon}</span>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{cat.name}</h3>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                            {catServices.map((service) => {
                              const isChecked = selectedServiceIds.includes(service.id);
                              return (
                                <label
                                  key={service.id}
                                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors border ${
                                    isChecked
                                      ? 'bg-primary/10 border-primary text-primary font-bold'
                                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 hover:border-gray-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleService(service.id)}
                                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                                  />
                                  <span className="text-xs leading-normal">{service.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Submit Action */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-end gap-3">
                  {existingDraft && (
                    <button
                      type="button"
                      onClick={() => navigate(`/profile-preview/${existingDraft.id}`)}
                      className="w-full sm:w-auto px-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-base rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-xl">visibility</span>
                      <span>Visualizar meu perfil</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className={`w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-bold text-base rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 ${
                      saving ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {saving ? 'Salvando Rascunho...' : 'Salvar Perfil Profissional'} →
                  </button>
                </div>
              </form>
            </div>

            {/* Step 5: Portfolio Manager (Rendered when profile draft exists) */}
            {existingDraft?.id ? (
              <PortfolioManager providerId={existingDraft.id} />
            ) : (
              <section className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm font-extrabold">
                    5
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Portfólio de Trabalhos (Fotos)
                  </h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Salve o seu perfil profissional (Etapas 1 a 4 acima) para habilitar o envio de fotos do seu portfólio.
                </p>
              </section>
            )}

            {/* Step 6: Publication Request Section */}
            {existingDraft?.id && (
              <section className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-extrabold">
                        6
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Solicitação de Publicação
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Envie seu perfil profissional estruturalmente completo para análise e ativação.
                    </p>
                  </div>

                  <span
                    className={`px-3.5 py-1 rounded-full text-xs font-extrabold border ${
                      existingDraft.status === 'published'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                        : existingDraft.status === 'pending_review'
                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300'
                        : existingDraft.status === 'rejected'
                        ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300'
                    }`}
                  >
                    {existingDraft.status === 'published'
                      ? '● Publicado'
                      : existingDraft.status === 'pending_review'
                      ? '● Solicitação em Análise'
                      : existingDraft.status === 'rejected'
                      ? '● Recusado'
                      : '● Rascunho (Draft)'}
                  </span>
                </div>

                {/* Status Box for Pending Review */}
                {existingDraft.status === 'pending_review' && (
                  <div className="p-5 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 rounded-xl border border-blue-200 dark:border-blue-900/50 flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600 text-2xl mt-0.5">hourglass_top</span>
                    <div className="flex flex-col gap-1 text-xs sm:text-sm">
                      <span className="font-bold text-sm">Solicitação enviada. Seu perfil está aguardando ativação.</span>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                        Sua solicitação de publicação foi registrada com sucesso. Enquanto seu perfil é analisado, ele permanece invisível no catálogo público e disponível em modo de pré-visualização privada.
                      </p>
                    </div>
                  </div>
                )}

                {/* Status Box for Published */}
                {existingDraft.status === 'published' && (
                  <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
                    <div className="flex flex-col text-xs sm:text-sm">
                      <span className="font-bold text-sm">Seu perfil está publicado e ativo no catálogo público!</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        Clientes já conseguem encontrar seu perfil em buscas e visualizar seus serviços.
                      </span>
                    </div>
                  </div>
                )}

                {/* Draft / Rejected Action Area */}
                {(existingDraft.status === 'draft' || existingDraft.status === 'rejected') && (
                  <div className="flex flex-col gap-4">
                    {isProfileComplete ? (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm block">
                              Seu perfil está pronto para ser enviado!
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Todas as informações obrigatórias (Título, Cidade, Estado e Serviços) foram preenchidas.
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowRequestModal(true)}
                          disabled={requestingPublication}
                          className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <span className="material-symbols-outlined text-lg">send</span>
                          <span>Solicitar publicação</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 text-sm">
                          <span className="material-symbols-outlined text-xl">warning</span>
                          <span>Ainda faltam algumas informações para solicitar a publicação.</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">
                          Complete as informações obrigatórias do seu perfil (Título profissional, Cidade principal, Estado UF e pelo menos 1 Serviço) nas etapas 1 a 4 acima.
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      ℹ️ <strong>Ativação Comercial:</strong> A exibição do seu perfil no catálogo dependerá da futura validação comercial e integração de pagamentos.
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {/* Confirmation Modal for Publication Request */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
            <div className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">send</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Enviar perfil para análise?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Seu perfil será enviado para análise. Deseja continuar?
              </p>
              <p className="text-xs text-slate-400">
                O status do seu perfil será alterado para <strong className="text-blue-500">pending_review</strong> enquanto aguarda a ativação comercial.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                disabled={requestingPublication}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRequestPublication}
                disabled={requestingPublication}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                {requestingPublication ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Solicitar publicação</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
