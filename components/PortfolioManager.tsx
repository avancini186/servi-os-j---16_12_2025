import React, { useState, useEffect, useRef } from 'react';
import { PortfolioItem } from '../types';
import {
  fetchPortfolioItems,
  uploadPortfolioImage,
  updatePortfolioItem,
  deletePortfolioItem,
  reorderPortfolioItems,
  MAX_PORTFOLIO_IMAGES,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
} from '../lib/portfolio';

interface PortfolioManagerProps {
  providerId: number;
}

const PortfolioManager: React.FC<PortfolioManagerProps> = ({ providerId }) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<PortfolioItem | null>(null);

  // Add Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [addTitle, setAddTitle] = useState('');
  const [addDescription, setAddDescription] = useState('');

  // Edit Form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPortfolio();
  }, [providerId]);

  const loadPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPortfolioItems(providerId);
      setItems(data);
    } catch (err) {
      console.error('Error loading portfolio:', err);
      setError('Não foi possível carregar o portfólio.');
    } finally {
      setLoading(false);
    }
  };

  // Preview local file before upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // 1. Check type
    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      setError('Formato de arquivo não suportado. Utilize apenas JPEG, PNG ou WebP.');
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Check size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('A imagem deve ter no máximo 5 MB.');
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const resetAddForm = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setAddTitle('');
    setAddDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError(null);
  };

  const handleOpenAddModal = () => {
    if (items.length >= MAX_PORTFOLIO_IMAGES) {
      setError(`Limite de ${MAX_PORTFOLIO_IMAGES} imagens atingido para o seu portfólio.`);
      return;
    }
    resetAddForm();
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    if (uploading) return;
    resetAddForm();
    setShowAddModal(false);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Por favor, selecione uma imagem para adicionar.');
      return;
    }

    if (items.length >= MAX_PORTFOLIO_IMAGES) {
      setError(`Limite de ${MAX_PORTFOLIO_IMAGES} imagens atingido.`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const res = await uploadPortfolioImage(
        providerId,
        selectedFile,
        addTitle,
        addDescription
      );

      if (!res.success || !res.data) {
        setError(res.error || 'Não foi possível adicionar esta imagem. Tente novamente.');
      } else {
        setItems((prev) => [...prev, res.data!]);
        setShowAddModal(false);
        resetAddForm();
        setSuccessMessage('Imagem adicionada ao portfólio com sucesso!');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Error uploading:', err);
      setError('Não foi possível adicionar esta imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  // Edit Handlers
  const handleOpenEditModal = (item: PortfolioItem) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditDescription(item.description || '');
    setError(null);
  };

  const handleCloseEditModal = () => {
    if (saving) return;
    setEditingItem(null);
    setEditTitle('');
    setEditDescription('');
    setError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    setError(null);

    try {
      const res = await updatePortfolioItem(editingItem.id, editTitle, editDescription);

      if (!res.success) {
        setError(res.error || 'Falha ao atualizar o item do portfólio.');
      } else {
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? { ...item, title: editTitle.trim(), description: editDescription.trim() }
              : item
          )
        );
        handleCloseEditModal();
        setSuccessMessage('Item atualizado com sucesso!');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Error updating:', err);
      setError('Erro ao atualizar item do portfólio.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Handlers
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await deletePortfolioItem(deletingItem.id, deletingItem.imageUrl);

      if (!res.success) {
        setError(res.error || 'Falha ao excluir item do portfólio.');
      } else {
        setItems((prev) => prev.filter((item) => item.id !== deletingItem.id));
        setDeletingItem(null);
        setSuccessMessage('Trabalho removido do portfólio com sucesso.');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Error deleting:', err);
      setError('Erro ao excluir item do portfólio.');
    } finally {
      setDeleting(false);
    }
  };

  // Basic Reordering (Move Up / Move Down)
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Update sort_order property
    const reordered = newItems.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));

    setItems(reordered);

    // Save to DB
    await reorderPortfolioItems(reordered.map((i) => ({ id: i.id, sortOrder: i.sortOrder })));
  };

  return (
    <section className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-extrabold">
              5
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Portfólio de Trabalhos (Fotos)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mostre fotos reais dos seus melhores serviços para passar mais confiança aos clientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 rounded-full border border-gray-200 dark:border-gray-700">
            {items.length} / {MAX_PORTFOLIO_IMAGES} fotos
          </span>
          <button
            type="button"
            onClick={handleOpenAddModal}
            disabled={items.length >= MAX_PORTFOLIO_IMAGES}
            className={`flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-primary/20 hover:bg-primary/90 ${
              items.length >= MAX_PORTFOLIO_IMAGES ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
            <span>Adicionar trabalho</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {error && !showAddModal && !editingItem && !deletingItem && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2">
          <span className="material-symbols-outlined text-xl">error</span>
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 animate-in fade-in duration-300">
          <span className="material-symbols-outlined text-xl">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500 dark:text-slate-400">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Carregando portfólio...</span>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">collections</span>
          </div>
          <div className="max-w-md flex flex-col gap-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Você ainda não adicionou trabalhos ao seu portfólio.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Adicione fotos dos seus melhores trabalhos para apresentar seu serviço.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-2 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
            <span>Adicionar fotos dos seus trabalhos</span>
          </button>
        </div>
      ) : (
        /* Gallery Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="group bg-gray-50 dark:bg-gray-800/60 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/60 flex flex-col transition-all hover:shadow-lg"
            >
              {/* Image Thumbnail Container */}
              <div className="relative aspect-video bg-gray-900 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title || `Trabalho realizado ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Quick Action Badges */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'up')}
                      title="Mover para cima/esquerda"
                      aria-label="Mover para cima"
                      className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">arrow_back</span>
                    </button>
                  )}
                  {index < items.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'down')}
                      title="Mover para baixo/direita"
                      aria-label="Mover para baixo"
                      className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Info Body */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                    {item.title || 'Sem título'}
                  </h4>
                  {item.description ? (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-1">
                      Sem descrição
                    </p>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700/50 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label={`Editar ${item.title || 'item'}`}
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingItem(item)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    aria-label={`Excluir ${item.title || 'item'}`}
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD IMAGE MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_photo_alternate</span>
                Adicionar Trabalho ao Portfólio
              </h3>
              <button
                type="button"
                onClick={handleCloseAddModal}
                disabled={uploading}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* File Selector & Preview */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Imagem do Trabalho <span className="text-red-500">*</span>
                </label>

                {previewUrl ? (
                  <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                    <img
                      src={previewUrl}
                      alt="Pré-visualização do trabalho"
                      className="w-full h-full object-contain"
                    />
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (previewUrl) URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 px-3 py-1.5 bg-red-600/90 text-white font-bold text-xs rounded-lg hover:bg-red-600 transition-colors shadow"
                      >
                        Trocar imagem
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors text-center gap-2"
                  >
                    <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Clique para selecionar uma imagem
                    </span>
                    <span className="text-xs text-slate-400">
                      Formatos aceitos: JPG, PNG ou WebP (máx. 5 MB)
                    </span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                  id="portfolio-file-input"
                />
              </div>

              {/* Title Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Título do Trabalho (Opcional)
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  disabled={uploading}
                  placeholder="ex: Instalação elétrica residencial"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Description Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Descrição do Trabalho (Opcional)
                  </label>
                  <span className="text-xs text-slate-400">{addDescription.length}/500</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  disabled={uploading}
                  placeholder="Detalhes adicionais sobre os materiais utilizados, tempo de execução, etc..."
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  disabled={uploading}
                  className="px-4 py-2.5 font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className={`flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 ${
                    uploading || !selectedFile ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enviando imagem...</span>
                    </>
                  ) : (
                    <span>Salvar Trabalho</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT ITEM MODAL --- */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit</span>
                Editar Trabalho
              </h3>
              <button
                type="button"
                onClick={handleCloseEditModal}
                disabled={saving}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Thumbnail Display */}
              <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={editingItem.imageUrl}
                  alt={editingItem.title || 'Imagem em edição'}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Título do Trabalho
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={saving}
                  placeholder="ex: Instalação elétrica residencial"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Description Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Descrição (até 500 caracteres)
                  </label>
                  <span className="text-xs text-slate-400">{editDescription.length}/500</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={saving}
                  placeholder="Descreva detalhes do serviço..."
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={saving}
                  className="px-4 py-2.5 font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Alterações</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
            <div className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Excluir trabalho?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Deseja realmente excluir este trabalho?
              </p>
              <p className="text-xs text-slate-400">
                A foto será removida permanentemente do seu portfólio e do servidor de armazenamento.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-600/20"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <span>Sim, excluir</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PortfolioManager;
