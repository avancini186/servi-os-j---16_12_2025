import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const portfolioImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCbKKRdEEnZaatctiyCxHPWCnmNQ3eFZrxjtI9-nJWJLFyzod1ZxcxA0aVBSr_kKQejlbIzPZ2DuvIBeOh113smucNNEa2LeptAUnG8HlrG5qoMpjke2zvMbaDdRNyHl1YIHxoM_fQWllFdjS1ZN_6f6RrEzVHjN1r3sot9nspzASh9OEq5sp75pJZpAxqjbmKq8JYJmFURgk7y6FJIHFDogYcliKUIVrv-r6Pudd3GR8olrBNGcObEmCo791l9WOuhs3pluICy5c4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAeko4Tjd0gyb5gfySqTCF_qnYMyERdNVCmaO6HqecBWgWgAWslu1EBSZ_PXTSOOTIpVO9ghwK1whLX8c4Qd8PpYdyrqI4kT7_tb0vm3Qx608UVu-2UPyux2STwiXqb_dGBqa6VZ6sgsc1kdw5ON4PAM3ioQUouemBjKPkCoKZEtg95iHXeW58MM31GpUnOcFa7PcfjjYjYBlBQRcxgdj2AjolyixCUG6b12NbdMx5zuFprJLjD750ZXW9v2TAGkE8k6sORv_NqHkY',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA2QpQIb1XS35e_Jxec-gz3-Gt59ykccCtyZ5VlhFXJAO08nD5OAn8rQa97tW9kdLJfsYTovyE5RwR1IFzroUovkBPXKOTwLOd8FwEy_kSt703NV51xTkmDWn2KwsHN2cD1RYQkkbmbbf-0zOdHXtAaYNdfPMT1FGL-Pns4zLW1GfO5KNqc-YVOvlnUOtJZrHQr3d1rm_egZ_8rimBHOM7Gpp1BjAaG_7cKq_ZBuT7PMxyPfChhPhL9Sm-SUiDLyD2jamSImmF4g_I',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCDu_Tl5YDYx7wRN6GR0ZFax9E-dcquI7yLifAjZ7Atn9gH8rKN3BeOBZeea6ZHOMY2kCpjl9zrVTzuVmz-JJR9BmQOJ-OB2wC-3_4mV-7BdSsxG-UCoFg3J4z9hBpiMgLtL0vEJCx05OthtW4OYaiRWNHHGEPrm7DxkUaxIF3KDkvefuJOfwiGTAE-qjrJFQh9pdjxI3j6uaQZ9GMC2f3rkOHv074XX6sEcG_6PzdtqTw2wLaJep0tQ8xfY6G887-3yxah_ogJu-Q',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDWY4pytf7aKavcBX7ktGsv07qAgCLDuludGDJWdR5T-maeuzq0QkrTu4pN85b8ENlhDejgpNa2iRuD5SWp4sdPMa-MXpTglHEwiWbJ2YfNAUPvXDNwarJJgzPkHDraDuIBXKvazZgWF--qxBVMr6cJrI2gwjEDswJrE-K11jRmx8A0sxan4ByjnAHdvaaRMC9zuYKrVmENuO-aranB1QDxGNECwYFBRFhIwDJKUrGr4doNYSNe-HPe9BO8nf8ZW9bTryA69j0omn4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCVwIKbThtnBfV1Eaei8QgITWIthKcDSRRWk-ad8d9YFV_MVKOpuYRqsSQXU5klP11di_HVNWVvHAnwwhoVs_qy6_gNfbtppSmJiO07udV7HExKvHWHrd0P2utR8qJsntdCcPD5BQtKsx0STJKhmu2bOY2ovpBC9DNI6xlGIVUrb2i-iygPPZwmrxHtnfKCMA0fCfT5L9dOim21QVeZQur0yZZFN7wLnqTsfHmh_N9YzITnpLeGBhUKF0dKCqG_ZrYMyF_QuSaZmkM',
];

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'basicinfo' | 'portfolio' | 'reviews'>('basicinfo');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;

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
  }, [selectedImageIndex]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Júlio César - Eletricista',
          text: 'Confira este perfil no Serviços Já!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiado para a área de transferência!');
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary overflow-x-hidden">
      <Header />

      <main className="flex flex-1 justify-center py-5 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col w-full max-w-4xl flex-1 gap-5 sm:gap-6">
          
          {/* Profile Header Card */}
          <section className="flex flex-col gap-5 p-4 sm:p-5 lg:p-6 bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              
              {/* Professional Avatar & Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 sm:h-28 sm:w-28 lg:h-28 lg:w-28 flex-shrink-0 shadow-md ring-4 ring-primary/10"
                  aria-label="Foto de perfil de Júlio César"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDGxsHV-1RwmJYYDvv0W8XMEg9rNZj3fDb8W4PQLMCebjU7A6bXFx5iqAiZfwZGUDkY0sKShca77u4dhJ5Fm4_XBWdtT1pyofUNjqD5_hgmK4BI7WL0ncLiRHVMMqW9DGsfy3CCVPF4PMTkhOURHtnVkLkctdPAPXysShm5yHhxOSQBFQFFCMJqMhLddjSPT6cy8oizYBCrMyNf7v0TeepR17i5LcOMhbJ33OQjqcDDE8-zeakj39yGaZjHUqYAc2gvmmOPVIeBStI")',
                  }}
                />

                <div className="flex flex-col justify-center min-w-0">
                  <h1 className="text-gray-900 dark:text-white text-xl sm:text-2xl lg:text-2xl font-bold leading-tight tracking-tight break-words">
                    Júlio César
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-normal mt-0.5">
                    Eletricista Residencial e Predial
                  </p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1.5 text-gray-600 dark:text-gray-400">
                    <span
                      className="material-symbols-outlined text-amber-500 text-base shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <p className="text-xs sm:text-sm font-medium">
                      4.8 <span className="font-normal text-gray-500">(89 avaliações)</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-sm text-primary shrink-0">location_on</span>
                    <span>São Paulo, SP e Região Metropolitana</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 w-full lg:w-auto lg:min-w-[280px]">
                {/* Primary Actions */}
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => window.location.href = 'tel:+5511988887777'}
                    className="flex w-full sm:flex-1 min-h-[44px] cursor-pointer items-center justify-center rounded-xl px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-bold leading-normal hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Ligar para Júlio César"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                    <span>Ligar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.open('https://wa.me/5511988887777', '_blank')}
                    className="flex w-full sm:flex-1 min-h-[44px] cursor-pointer items-center justify-center rounded-xl px-4 bg-primary text-white text-xs sm:text-sm font-bold leading-normal hover:bg-primary/90 transition-colors shadow-sm gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-label="Conversar no WhatsApp com Júlio César"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.75 13.96c.25.13.41.32.46.52.12.48-.13 1.05-.24 1.2l-.2.26c-.25.33-.58.6-1.11.66-.43.05-.85-.04-1.25-.22-1.42-.64-2.75-1.57-3.96-2.78-1.2-1.2-2.14-2.54-2.78-3.96-.18-.4-.27-.82-.22-1.25.06-.53.33-.86.66-1.11l.26-.2c.16-.12.62-.3 1.05-.24.2.05.39.21.52.46.48.97.98 1.94 1.46 2.9.1.2.13.41.08.6-.2.68-.42 1.35-.42 1.35s-.04.1.07.21c.43.43.95.84 1.54 1.25l.72.54c.12.08.26.06.36-.04.28-.28.56-.56.84-.85.2-.21.41-.17.6-.08.97.48 1.94.98 2.9 1.46zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                    </svg>
                    <span>WhatsApp</span>
                  </button>
                </div>

                {/* Secondary Actions (Share & Favorite) */}
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex flex-1 min-h-[40px] cursor-pointer items-center justify-center rounded-xl px-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Compartilhar perfil de Júlio César"
                  >
                    <span className="material-symbols-outlined text-base">share</span>
                    <span>Compartilhar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="flex flex-1 min-h-[40px] cursor-pointer items-center justify-center rounded-xl px-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors gap-1.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    <span
                      className={`material-symbols-outlined text-base transition-colors ${
                        isFavorite ? 'text-red-500' : 'text-slate-700 dark:text-slate-300 group-hover:text-red-500'
                      }`}
                      style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      favorite
                    </span>
                    <span>{isFavorite ? 'Salvo' : 'Favoritar'}</span>
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* Tabs Navigation */}
          <nav
            aria-label="Seções do perfil"
            className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none"
          >
            {[
              { id: 'basicinfo', label: 'Sobre mim', icon: 'person' },
              { id: 'portfolio', label: 'Portfólio', icon: 'photo_library' },
              { id: 'reviews', label: 'Avaliações', icon: 'reviews' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'basicinfo' | 'portfolio' | 'reviews')}
                className={`flex items-center gap-2 px-4 sm:px-5 lg:px-5 py-3 text-xs sm:text-sm font-bold leading-normal tracking-wide transition-colors whitespace-nowrap border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  activeTab === tab.id
                    ? 'text-primary border-primary'
                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300'
                }`}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Tab Content Section */}
          <div className="flex flex-col gap-5">

            {/* Basic Info Tab */}
            {activeTab === 'basicinfo' && (
              <div className="flex flex-col gap-5 sm:gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                {/* About Description */}
                <section className="bg-white dark:bg-card-dark p-4 sm:p-5 lg:p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h2 className="text-gray-900 dark:text-white text-base sm:text-lg font-bold tracking-tight mb-2">
                    Sobre o Profissional
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-normal leading-relaxed break-words">
                    Eletricista profissional com mais de 10 anos de experiência em instalações e manutenções residenciais e
                    prediais. Comprometido com a segurança e a qualidade, ofereço soluções eficientes para todos os tipos de
                    projetos elétricos, desde pequenas reparações a instalações completas.
                  </p>
                </section>

                {/* Services Provided */}
                <section className="bg-white dark:bg-card-dark p-4 sm:p-5 lg:p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h2 className="text-gray-900 dark:text-white text-base sm:text-lg font-bold tracking-tight mb-3">
                    Serviços Oferecidos
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {['Instalação Elétrica', 'Manutenção Predial', 'Reparos Rápidos', 'Quadros de Energia', 'Iluminação LED', 'Automação'].map((service, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Social Networks */}
                <section className="bg-white dark:bg-card-dark p-4 sm:p-5 lg:p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h2 className="text-gray-900 dark:text-white text-base sm:text-lg font-bold tracking-tight mb-3">
                    Redes Sociais e Contato
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                    <a
                      href="https://www.instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-300 transition-all cursor-pointer group flex-1 min-h-[42px]"
                    >
                      <svg className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.012-3.584.07-4.85c.148-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.644-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44c0-.795-.645-1.44-1.441-1.44z" />
                      </svg>
                      <span className="text-xs font-medium truncate">@juliocesar.eletricista</span>
                    </a>

                    <a
                      href="https://www.facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-all cursor-pointer group flex-1 min-h-[42px]"
                    >
                      <svg className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                      <span className="text-xs font-medium truncate">Júlio César Eletricista</span>
                    </a>
                  </div>
                </section>

                {/* Location / Map Section */}
                <section className="bg-white dark:bg-card-dark p-4 sm:p-5 lg:p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h2 className="text-gray-900 dark:text-white text-base sm:text-lg font-bold tracking-tight mb-2.5">
                    Área de Atendimento
                  </h2>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=São+Paulo+SP"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-40 sm:h-44 md:h-48 bg-center bg-no-repeat bg-cover rounded-xl overflow-hidden cursor-pointer hover:opacity-90 hover:shadow-md transition-all group relative border border-gray-200 dark:border-gray-700"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAZrv8QigSFXh9RLZqZaVWXBLRgdOIedTEQWoBc9MQEM7jQ85d9JENC8zDrrsrpSEuxdCp-H_s9hD_ZRwV0jSyQ86NdyxH86Jd5e-ZC1gA4_oG1r34HADD7RyAK61A7Zkkuy3zTdZMRH4viygiW1wYBJaZKKV_1q-BIR_UmzkI4PhrcHC2pYSobJD6kVdIjbDuIEVaROkvmDGoPmB98VI0E74ITlkq8MAhn0fTg9ufdQUviVVI2UANo34aoBC04nUkTQNfMgIU6-K4")',
                    }}
                    aria-label="Abrir mapa de atendimento no Google Maps"
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="material-symbols-outlined text-transparent group-hover:text-white text-3xl drop-shadow-lg transition-all transform scale-0 group-hover:scale-100">
                        open_in_new
                      </span>
                    </div>
                  </a>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-2.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                    <span>Atendimento em São Paulo, SP e região metropolitana.</span>
                  </p>
                </section>
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                  {portfolioImages.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all border border-gray-100 dark:border-gray-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[90px]"
                      style={{ backgroundImage: `url("${img}")` }}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`Ver foto ${index + 1} em tamanho expandido`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="flex flex-col gap-3 sm:gap-3.5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div className="p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-card-dark shadow-sm">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className="material-symbols-outlined text-amber-500 text-base"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    "Serviço impecável! Júlio foi rápido, profissional e resolveu o problema da minha instalação
                    elétrica com muita eficiência. Recomendo!"
                  </p>
                  <p className="text-slate-900 dark:text-slate-300 text-xs font-bold mt-2">- Mariana Silva</p>
                </div>

                <div className="p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-card-dark shadow-sm">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((star) => (
                      <span
                        key={star}
                        className="material-symbols-outlined text-amber-500 text-base"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                    <span
                      className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    "Bom profissional, pontual e honesto. O serviço ficou ótimo."
                  </p>
                  <p className="text-slate-900 dark:text-slate-300 text-xs font-bold mt-2">- Roberto Costa</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImageIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Visualizador de fotos do portfólio"
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">

            {/* Prev Button */}
            <button
              type="button"
              className="absolute left-2 sm:left-4 z-50 h-11 w-11 flex items-center justify-center text-white bg-black/60 hover:bg-black/80 rounded-full transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) => (prev !== null ? (prev - 1 + portfolioImages.length) % portfolioImages.length : null));
              }}
              aria-label="Foto anterior"
            >
              <span className="material-symbols-outlined text-2xl sm:text-3xl">chevron_left</span>
            </button>

            {/* Main Image */}
            <img
              src={portfolioImages[selectedImageIndex]}
              alt={`Imagem ${selectedImageIndex + 1} do portfólio de Júlio César`}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 select-none"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next Button */}
            <button
              type="button"
              className="absolute right-2 sm:right-4 z-50 h-11 w-11 flex items-center justify-center text-white bg-black/60 hover:bg-black/80 rounded-full transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) => (prev !== null ? (prev + 1) % portfolioImages.length : null));
              }}
              aria-label="Próxima foto"
            >
              <span className="material-symbols-outlined text-2xl sm:text-3xl">chevron_right</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 h-11 w-11 flex items-center justify-center text-white bg-black/60 hover:bg-black/80 rounded-full transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setSelectedImageIndex(null)}
              aria-label="Fechar visualizador de foto"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;