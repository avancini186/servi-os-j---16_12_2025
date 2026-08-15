import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getCategories } from '../lib/catalog';
import { getProviderDraft, saveProviderDraft, ExistingProviderDraft } from '../lib/onboarding';
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
  const [success, setSuccess] = useState(false);
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
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Error saving onboarding:', err);
      setError('Ocorreu um erro ao salvar suas informações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Carregando dados de onboarding...</p>
          </div>
        ) : success ? (
          <div className="bg-white dark:bg-card-dark rounded-2xl p-8 sm:p-12 shadow-xl border border-gray-200 dark:border-gray-800 text-center animate-in zoom-in-95 duration-300 max-w-2xl mx-auto my-8">
            <span className="material-symbols-outlined text-6xl text-green-500 mb-4">check_circle</span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Perfil Salvo com Sucesso!</h2>
            <div className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold mb-4">
              Status: Rascunho (Draft)
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6">
              Seu perfil profissional foi registrado como <strong>rascunho</strong>. A publicação no catálogo público acontecerá após as próximas etapas de ativação do perfil.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3.5 bg-primary text-white font-bold text-base rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Voltar para o Início
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-10 shadow-lg border border-gray-200 dark:border-gray-800">
            {/* Header Section */}
            <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Onboarding Profissional
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Preencha os dados do seu perfil para criar seu rascunho de prestador de serviço.
                  </p>
                </div>
                {existingDraft && (
                  <span className="hidden sm:inline-block px-3 py-1 bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-full">
                    Editando Rascunho
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">error</span>
                <span>{error}</span>
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
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-sm"
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
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
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
        )}
      </main>
    </div>
  );
};

export default OnboardingPage;
