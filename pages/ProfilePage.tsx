import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getProviderProfile, DetailedProviderProfile } from '../lib/catalog';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<DetailedProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'basicinfo' | 'portfolio' | 'reviews'>('basicinfo');
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchProfileData = async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const data = await getProviderProfile(id);
      if (!data) {
        setNotFound(true);
      } else {
        setProfile(data);
      }
    } catch (err: any) {
      console.error('Error loading provider profile:', err);
      setError('Não foi possível carregar as informações do prestador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const portfolioImages = profile?.portfolio || [];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null || portfolioImages.length === 0) return;

      if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) => (prev !== null ? (prev - 1 + portfolioImages.length) % portfolioImages.length : null));
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) => (prev !== null ? (prev + 1) % portfolioImages.length : null));
      } else if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      }
    };

    if (selectedImageIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageIndex, profile?.portfolio]);

  const handleShare = async () => {
    const title = profile ? `${profile.name} - ${profile.professionalTitle}` : 'Serviços Já';
    const currentUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: 'Confira este perfil no Serviços Já!',
          url: currentUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(currentUrl);
        alert('Link do perfil copiado para a área de transferência!');
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  // Helper to format WhatsApp URL safely
  const getWhatsAppUrl = (phoneStr?: string) => {
    if (!phoneStr) return '#';
    const cleanNumber = phoneStr.replace(/\D/g, '');
    const waNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    return `https://wa.me/${waNumber}`;
  };

  // Helper to format Call URL
  const getCallUrl = (phoneStr?: string) => {
    if (!phoneStr) return '#';
    const cleanNumber = phoneStr.replace(/[^\d+]/g, '');
    return `tel:${cleanNumber}`;
  };

  // Avatar Fallback Helper
  const getAvatarUrl = () => {
    if (profile?.avatarUrl && profile.avatarUrl.trim()) {
      return profile.avatarUrl;
    }
    const name = profile?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=137fec&color=fff`;
  };

  const portfolioImages = profile?.portfolio || [];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display bg-background-light dark:bg-background-dark">
      <Header />
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex flex-1 justify-center py-5 sm:py-10 px-4 sm:px-10">
          <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1 gap-8">

            {/* Loading Skeleton */}
            {loading && (
              <div className="flex flex-col gap-8 animate-pulse">
                <div className="h-44 bg-white dark:bg-slate-900 rounded-xl shadow-sm"></div>
                <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded-lg w-64"></div>
                <div className="h-64 bg-white dark:bg-slate-900 rounded-xl shadow-sm"></div>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 text-center my-8">
                <span className="material-symbols-outlined text-5xl text-red-500 mb-3">error</span>
                <p className="text-slate-900 dark:text-white text-lg font-bold mb-1">{error}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Ocorreu um erro ao buscar os dados do perfil.</p>
                <button
                  onClick={fetchProfileData}
                  className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Not Found / Unpublished State */}
            {!loading && !error && (notFound || !profile) && (
              <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center my-8 shadow-sm">
                <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">person_off</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Prestador não encontrado</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md">
                  O perfil solicitado não está disponível, foi removido ou ainda não está publicado no catálogo.
                </p>
                <button
                  onClick={() => navigate('/results')}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Voltar para resultados
                </button>
              </div>
            )}

            {/* Profile Content */}
            {!loading && !error && profile && (
              <>
                {/* ProfileHeader */}
                <section className="flex p-6 @container bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                  <div className="flex w-full flex-col gap-6 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
                    <div className="flex gap-6 items-center">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 bg-gray-100 dark:bg-gray-800"
                        style={{ backgroundImage: `url("${getAvatarUrl()}")` }}
                      ></div>
                      <div className="flex flex-col justify-center">
                        <h1 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
                          {profile.name}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                          {profile.professionalTitle}
                        </p>

                        <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400">
                          <span
                            className="material-symbols-outlined text-lg text-amber-500"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          <p className="text-sm font-normal leading-normal">
                            {profile.reviewsCount > 0
                              ? `${profile.rating} (${profile.reviewsCount} avaliações)`
                              : 'Ainda não possui avaliações'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex w-full flex-col sm:flex-row max-w-[480px] gap-3 @[480px]:w-auto">
                      {profile.phone && (
                        <button
                          onClick={() => window.location.href = getCallUrl(profile.phone)}
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">call</span>
                          <span className="truncate">Ligar</span>
                        </button>
                      )}

                      {profile.whatsapp && (
                        <button
                          onClick={() => window.open(getWhatsAppUrl(profile.whatsapp), '_blank')}
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto gap-2 hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.75 13.96c.25.13.41.32.46.52.12.48-.13 1.05-.24 1.2l-.2.26c-.25.33-.58.6-1.11.66-.43.05-.85-.04-1.25-.22-1.42-.64-2.75-1.57-3.96-2.78-1.2-1.2-2.14-2.54-2.78-3.96-.18-.4-.27-.82-.22-1.25.06-.53.33-.86.66-1.11l.26-.2c.16-.12.62-.3 1.05-.24.2.05.39.21.52.46.48.97.98 1.94 1.46 2.9.1.2.13.41.08.6-.2.68-.42 1.35-.42 1.35s-.04.1.07.21c.43.43.95.84 1.54 1.25l.72.54c.12.08.26.06.36-.04.28-.28.56-.56.84-.85.2-.21.41-.17.6-.08.97.48 1.94.98 2.9 1.46zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path>
                          </svg>
                          <span className="truncate">WhatsApp</span>
                        </button>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={handleShare}
                          title="Compartilhar Perfil"
                          className="flex min-w-[60px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-1 sm:flex-none"
                        >
                          <span className="material-symbols-outlined text-lg">share</span>
                        </button>
                        <button
                          onClick={() => setIsFavorite(!isFavorite)}
                          title="Salvar nos Favoritos"
                          className="flex min-w-[60px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group flex-1 sm:flex-none"
                        >
                          <span
                            className={`material-symbols-outlined text-lg transition-colors ${isFavorite ? 'text-red-500' : 'text-slate-900 dark:text-white group-hover:text-red-500'}`}
                            style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : {}}
                          >
                            favorite
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
                  {[
                    { id: 'basicinfo', label: 'Sobre mim' },
                    { id: 'portfolio', label: `Portfólio (${profile.portfolio.length})` },
                    { id: 'reviews', label: `Avaliações (${profile.reviewsCount})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'basicinfo' | 'portfolio' | 'reviews')}
                      className={`px-6 py-4 text-sm font-bold leading-normal tracking-[0.015em] transition-colors whitespace-nowrap border-b-2 ${activeTab === tab.id
                        ? 'text-primary border-primary'
                        : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">

                  {/* Basic Info Tab */}
                  {activeTab === 'basicinfo' && (
                    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* About Me */}
                      <section>
                        <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-3">
                          Sobre mim
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed whitespace-pre-line">
                          {profile.bio && profile.bio.trim()
                            ? profile.bio
                            : 'Este prestador ainda não adicionou uma descrição.'}
                        </p>
                        {profile.experienceYears !== undefined && profile.experienceYears !== null && profile.experienceYears > 0 && (
                          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                            <span className="material-symbols-outlined text-base">verified</span>
                            <span>{profile.experienceYears} anos de experiência</span>
                          </div>
                        )}
                      </section>

                      {/* Services */}
                      {profile.services.length > 0 && (
                        <section>
                          <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
                            Serviços Oferecidos
                          </h2>
                          <div className="flex flex-wrap gap-2">
                            {profile.services.map((service) => (
                              <span
                                key={service.id}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-semibold"
                              >
                                {service.name}
                              </span>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Social Media Links */}
                      {profile.socialLinks.length > 0 && (
                        <section>
                          <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
                            Redes Sociais & Links
                          </h3>
                          <div className="flex flex-col gap-3">
                            {profile.socialLinks.map((link) => (
                              <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer group w-fit"
                              >
                                <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
                                  link
                                </span>
                                <span className="font-medium text-sm">
                                  {link.platform}: {link.url}
                                </span>
                              </a>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Location / Service Areas */}
                      <section>
                        <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
                          Áreas de Atendimento
                        </h3>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                          <span className="material-symbols-outlined text-primary text-2xl mt-0.5">location_on</span>
                          <div>
                            <p className="text-slate-900 dark:text-white font-bold text-sm">
                              {profile.locationCity
                                ? `${profile.locationCity}${profile.locationState ? ' - ' + profile.locationState : ''}`
                                : 'Localização principal'}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                              {profile.serviceAreas.length > 0
                                ? `Atendimento nas cidades: ${profile.serviceAreas.map((sa) => sa.city).join(', ')}.`
                                : 'Atendimento na região local.'}
                            </p>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* Portfolio Tab */}
                  {activeTab === 'portfolio' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {portfolioImages.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {portfolioImages.map((item, index) => (
                            <div
                              key={item.id || index}
                              className="group/img relative w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all"
                              style={{ backgroundImage: `url("${item.imageUrl}")` }}
                              onClick={() => setSelectedImageIndex(index)}
                            >
                              {item.title && (
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-xs font-semibold truncate opacity-0 group-hover/img:opacity-100 transition-opacity">
                                  {item.title}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="material-symbols-outlined text-5xl mb-2">photo_library</span>
                          <p className="text-base font-bold text-slate-700 dark:text-slate-300">Portfólio vazio</p>
                          <p className="text-xs">Este prestador ainda não adicionou fotos ao seu portfólio.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === 'reviews' && (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {profile.reviews.length > 0 ? (
                        profile.reviews.map((rev) => (
                          <div
                            key={rev.id}
                            className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`material-symbols-outlined text-lg ${star <= rev.rating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'}`}
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                  >
                                    star
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-slate-400">
                                {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                              "{rev.text}"
                            </p>
                            <p className="text-slate-900 dark:text-slate-200 text-sm font-bold mt-3">
                              - {rev.authorName}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="material-symbols-outlined text-5xl mb-2">rate_review</span>
                          <p className="text-base font-bold text-slate-700 dark:text-slate-300">Ainda não possui avaliações</p>
                          <p className="text-xs">Este prestador ainda não recebeu avaliações de clientes.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && portfolioImages[selectedImageIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
            {/* Prev Button */}
            {portfolioImages.length > 1 && (
              <button
                className="absolute left-4 z-50 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-opacity hover:scale-110 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev !== null ? (prev - 1 + portfolioImages.length) % portfolioImages.length : null));
                }}
              >
                <span className="material-symbols-outlined text-4xl">chevron_left</span>
              </button>
            )}

            <div className="flex flex-col items-center max-w-full max-h-[90vh]">
              <img
                src={portfolioImages[selectedImageIndex].imageUrl}
                alt={portfolioImages[selectedImageIndex].title || `Imagem ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in duration-300 select-none"
                onClick={(e) => e.stopPropagation()}
              />
              {portfolioImages[selectedImageIndex].title && (
                <div className="mt-3 text-white text-center" onClick={(e) => e.stopPropagation()}>
                  <p className="font-bold text-lg">{portfolioImages[selectedImageIndex].title}</p>
                  {portfolioImages[selectedImageIndex].description && (
                    <p className="text-sm text-gray-300 mt-1">{portfolioImages[selectedImageIndex].description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Next Button */}
            {portfolioImages.length > 1 && (
              <button
                className="absolute right-4 z-50 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-opacity hover:scale-110 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev !== null ? (prev + 1) % portfolioImages.length : null));
                }}
              >
                <span className="material-symbols-outlined text-4xl">chevron_right</span>
              </button>
            )}

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 z-50 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-opacity hover:scale-110 cursor-pointer"
              onClick={() => setSelectedImageIndex(null)}
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;