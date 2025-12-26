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
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display bg-background-light dark:bg-background-dark">
      <Header />
      <div className="layout-container flex h-full grow flex-col">

        <main className="flex flex-1 justify-center py-5 sm:py-10 px-4 sm:px-10">
          <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1 gap-8">
            {/* ProfileHeader */}
            <section className="flex p-6 @container bg-white dark:bg-slate-900 rounded-xl shadow-sm">
              <div className="flex w-full flex-col gap-6 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
                <div className="flex gap-6 items-center">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0"
                    data-alt="Profile picture of Júlio César"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDGxsHV-1RwmJYYDvv0W8XMEg9rNZj3fDb8W4PQLMCebjU7A6bXFx5iqAiZfwZGUDkY0sKShca77u4dhJ5Fm4_XBWdtT1pyofUNjqD5_hgmK4BI7WL0ncLiRHVMMqW9DGsfy3CCVPF4PMTkhOURHtnVkLkctdPAPXysShm5yHhxOSQBFQFFCMJqMhLddjSPT6cy8oizYBCrMyNf7v0TeepR17i5LcOMhbJ33OQjqcDDE8-zeakj39yGaZjHUqYAc2gvmmOPVIeBStI")',
                    }}
                  ></div>
                  <div className="flex flex-col justify-center">
                    <h1 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
                      Júlio César
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                      Eletricista Residencial e Predial
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400">
                      <span
                        className="material-symbols-outlined text-lg text-amber-500"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <p className="text-sm font-normal leading-normal">4.8 (89 avaliações)</p>
                    </div>
                  </div>
                </div>
                <div className="flex w-full flex-col sm:flex-row max-w-[480px] gap-3 @[480px]:w-auto">
                  <button
                    onClick={() => window.location.href = 'tel:+5511988887777'}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">call</span>
                    <span className="truncate">Ligar</span>
                  </button>
                  <button
                    onClick={() => window.open('https://wa.me/5511988887777', '_blank')}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto gap-2 hover:bg-primary/90 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.75 13.96c.25.13.41.32.46.52.12.48-.13 1.05-.24 1.2l-.2.26c-.25.33-.58.6-1.11.66-.43.05-.85-.04-1.25-.22-1.42-.64-2.75-1.57-3.96-2.78-1.2-1.2-2.14-2.54-2.78-3.96-.18-.4-.27-.82-.22-1.25.06-.53.33-.86.66-1.11l.26-.2c.16-.12.62-.3 1.05-.24.2.05.39.21.52.46.48.97.98 1.94 1.46 2.9.1.2.13.41.08.6-.2.68-.42 1.35-.42 1.35s-.04.1.07.21c.43.43.95.84 1.54 1.25l.72.54c.12.08.26.06.36-.04.28-.28.56-.56.84-.85.2-.21.41-.17.6-.08.97.48 1.94.98 2.9 1.46zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path>
                    </svg>
                    <span className="truncate">WhatsApp</span>
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={handleShare}
                      className="flex min-w-[60px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-1 sm:flex-none"
                    >
                      <span className="material-symbols-outlined text-lg">share</span>
                    </button>
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
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
                { id: 'portfolio', label: 'Portfólio' },
                { id: 'reviews', label: 'Avaliações' }
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
                    <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed">
                      Eletricista profissional com mais de 10 anos de experiência em instalações e manutenções residenciais e
                      prediais. Comprometido com a segurança e a qualidade, ofereço soluções eficientes para todos os tipos de
                      projetos elétricos, desde pequenas reparações a instalações completas.
                    </p>
                  </section>

                  {/* Services (New) */}
                  <section>
                    <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
                      Serviços
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {['Instalação Elétrica', 'Manutenção Predial', 'Reparos Rápidos', 'Quadros de Energia', 'Iluminação LED', 'Automação'].map((service, i) => (
                        <span key={i} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-semibold">
                          {service}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* Social Media */}
                  <section>
                    <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
                      Redes Sociais
                    </h3>
                    <div className="flex flex-col gap-3">
                      <a
                        href="https://www.instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-500 transition-colors cursor-pointer group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.012-3.584.07-4.85c.148-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.644-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44c0-.795-.645-1.44-1.441-1.44z"></path>
                        </svg>
                        <span>@juliocesar.eletricista</span>
                      </a>
                      <a
                        href="https://www.facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors cursor-pointer group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                        </svg>
                        <span>Júlio César Eletricista</span>
                      </a>
                    </div>
                  </section>

                  {/* Location Section */}
                  <section>
                    <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
                      Localização
                    </h3>
                    <div className="">
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=São+Paulo+SP"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-48 bg-center bg-no-repeat bg-cover rounded-lg overflow-hidden cursor-pointer hover:opacity-90 hover:shadow-lg transition-all group relative"
                        style={{
                          backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAZrv8QigSFXh9RLZqZaVWXBLRgdOIedTEQWoBc9MQEM7jQ85d9JENC8zDrrsrpSEuxdCp-H_s9hD_ZRwV0jSyQ86NdyxH86Jd5e-ZC1gA4_oG1r34HADD7RyAK61A7Zkkuy3zTdZMRH4viygiW1wYBJaZKKV_1q-BIR_UmzkI4PhrcHC2pYSobJD6kVdIjbDuIEVaROkvmDGoPmB98VI0E74ITlkq8MAhn0fTg9ufdQUviVVI2UANo34aoBC04nUkTQNfMgIU6-K4")',
                        }}
                      >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="material-symbols-outlined text-transparent group-hover:text-white text-4xl drop-shadow-lg transition-all transform scale-0 group-hover:scale-100">
                            open_in_new
                          </span>
                        </div>
                      </a>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
                        Atendimento em São Paulo, SP e região metropolitana.
                      </p>
                    </div>
                  </section>
                </div>
              )}

              {/* Portfolio Tab */}
              {activeTab === 'portfolio' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {portfolioImages.map((img, index) => (
                      <div
                        key={index}
                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundImage: `url("${img}")` }}
                        onClick={() => setSelectedImageIndex(index)}
                      ></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className="material-symbols-outlined text-amber-500 text-lg"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
                      "Serviço impecável! Júlio foi rápido, profissional e resolveu o problema da minha instalação
                      elétrica com muita eficiência. Recomendo!"
                    </p>
                    <p className="text-slate-900 dark:text-slate-300 text-sm font-semibold mt-3">- Mariana Silva</p>
                  </div>
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map((star) => (
                        <span
                          key={star}
                          className="material-symbols-outlined text-amber-500 text-lg"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                      <span
                        className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-lg"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
                      "Bom profissional, pontual e honesto. O serviço ficou ótimo."
                    </p>
                    <p className="text-slate-900 dark:text-slate-300 text-sm font-semibold mt-3">- Roberto Costa</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-6xl w-full h-full flex items-center justify-center">

            {/* Prev Button */}
            <button
              className="absolute left-4 z-50 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-opacity hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) => (prev !== null ? (prev - 1 + portfolioImages.length) % portfolioImages.length : null));
              }}
            >
              <span className="material-symbols-outlined text-4xl">chevron_left</span>
            </button>

            <img
              src={portfolioImages[selectedImageIndex]}
              alt={`Imagem ${selectedImageIndex + 1} do portfólio`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in duration-300 select-none"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next Button */}
            <button
              className="absolute right-4 z-50 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-opacity hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) => (prev !== null ? (prev + 1) % portfolioImages.length : null));
              }}
            >
              <span className="material-symbols-outlined text-4xl">chevron_right</span>
            </button>

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 z-50 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-opacity hover:scale-110"
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