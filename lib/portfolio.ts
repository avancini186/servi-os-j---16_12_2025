import { supabase } from './supabase';
import { PortfolioItem } from '../types';

export const MAX_PORTFOLIO_IMAGES = 20;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Client-side image compression using HTMLCanvasElement
 */
export async function compressImageIfNeeded(file: File): Promise<Blob | File> {
  // If file is SVG, GIF, PDF, etc., return original (validation will reject invalid types)
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1920;

      let width = img.width;
      let height = img.height;

      // If dimensions are small and file size < 1MB, no compression needed
      if (width <= MAX_WIDTH && height <= MAX_HEIGHT && file.size < 1024 * 1024) {
        resolve(file);
        return;
      }

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Export as webp if supported, or jpeg
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Fetch portfolio items for a specific provider
 */
export async function fetchPortfolioItems(providerId: number): Promise<PortfolioItem[]> {
  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('provider_id', providerId)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching portfolio items:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      providerId: item.provider_id,
      imageUrl: item.image_url,
      title: item.title || '',
      description: item.description || '',
      sortOrder: item.sort_order || 0,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (err) {
    console.error('Error in fetchPortfolioItems:', err);
    return [];
  }
}

/**
 * Upload a new image to Storage and insert portfolio_items record.
 * Handles automatic rollback if DB insertion fails.
 */
export async function uploadPortfolioImage(
  providerId: number,
  file: File,
  title?: string,
  description?: string
): Promise<{ success: boolean; data?: PortfolioItem; error?: string }> {
  try {
    // 1. Validate File Type
    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return {
        success: false,
        error: 'Formato de arquivo não suportado. Utilize apenas imagens JPEG, PNG ou WebP.',
      };
    }

    // 2. Validate File Size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: 'A imagem deve ter no máximo 5 MB.',
      };
    }

    // 3. Check current item count limit (max 20)
    const existingItems = await fetchPortfolioItems(providerId);
    if (existingItems.length >= MAX_PORTFOLIO_IMAGES) {
      return {
        success: false,
        error: `Limite de ${MAX_PORTFOLIO_IMAGES} imagens atingido para o portfólio.`,
      };
    }

    // 4. Compress image if needed
    const uploadBlob = await compressImageIfNeeded(file);

    // 5. Generate unique filename (UUID) and storage path
    const fileExt = mimeType === 'image/png' ? 'png' : mimeType === 'image/jpeg' ? 'jpg' : 'webp';
    const uuid = crypto.randomUUID();
    const storagePath = `${providerId}/${uuid}.${fileExt}`;

    // 6. Upload to Supabase Storage bucket 'portfolio'
    const { error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(storagePath, uploadBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return {
        success: false,
        error: 'Falha ao enviar a imagem para o servidor de armazenamento. Tente novamente.',
      };
    }

    // 7. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from('portfolio')
      .getPublicUrl(storagePath);

    const imageUrl = publicUrlData.publicUrl;

    // Determine sort_order for new item
    const maxSortOrder = existingItems.reduce((max, item) => Math.max(max, item.sortOrder || 0), 0);

    // 8. Insert row into portfolio_items
    const { data: insertedData, error: dbError } = await supabase
      .from('portfolio_items')
      .insert({
        provider_id: providerId,
        image_url: imageUrl,
        title: title?.trim() || null,
        description: description?.trim() || null,
        sort_order: maxSortOrder + 1,
      })
      .select('*')
      .single();

    if (dbError || !insertedData) {
      console.error('DB insert error after storage upload:', dbError);
      // Clean up orphaned storage file
      await supabase.storage.from('portfolio').remove([storagePath]);

      return {
        success: false,
        error: 'Não foi possível adicionar esta imagem. Tente novamente.',
      };
    }

    const newItem: PortfolioItem = {
      id: insertedData.id,
      providerId: insertedData.provider_id,
      imageUrl: insertedData.image_url,
      title: insertedData.title || '',
      description: insertedData.description || '',
      sortOrder: insertedData.sort_order || 0,
      createdAt: insertedData.created_at,
      updatedAt: insertedData.updated_at,
    };

    return { success: true, data: newItem };
  } catch (err: any) {
    console.error('Error in uploadPortfolioImage:', err);
    return {
      success: false,
      error: err?.message || 'Não foi possível adicionar esta imagem. Tente novamente.',
    };
  }
}

/**
 * Update title and description of a portfolio item
 */
export async function updatePortfolioItem(
  itemId: number,
  title?: string,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('portfolio_items')
      .update({
        title: title?.trim() || null,
        description: description?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating portfolio item:', error);
      return { success: false, error: 'Falha ao atualizar o item do portfólio.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error in updatePortfolioItem:', err);
    return { success: false, error: err?.message || 'Erro inesperado ao atualizar item.' };
  }
}

/**
 * Helper to extract Storage path from full image URL
 */
export function extractStoragePath(imageUrl: string): string | null {
  try {
    // Example URL: https://[ref].supabase.co/storage/v1/object/public/portfolio/12/uuid.webp
    const marker = '/portfolio/';
    const index = imageUrl.indexOf(marker);
    if (index !== -1) {
      return imageUrl.substring(index + marker.length);
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Delete a portfolio item from DB and Storage
 */
export async function deletePortfolioItem(
  itemId: number,
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Delete DB record
    const { error: dbError } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', itemId);

    if (dbError) {
      console.error('Error deleting portfolio item from DB:', dbError);
      return { success: false, error: 'Falha ao excluir item do portfólio no banco de dados.' };
    }

    // 2. Delete file from Storage if path can be extracted
    const storagePath = extractStoragePath(imageUrl);
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('portfolio')
        .remove([storagePath]);

      if (storageError) {
        console.warn('Storage file deletion warning:', storageError);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error in deletePortfolioItem:', err);
    return { success: false, error: err?.message || 'Erro inesperado ao excluir item.' };
  }
}

/**
 * Reorder portfolio items
 */
export async function reorderPortfolioItems(
  items: { id: number; sortOrder: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    for (const item of items) {
      await supabase
        .from('portfolio_items')
        .update({ sort_order: item.sortOrder })
        .eq('id', item.id);
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error reordering portfolio items:', err);
    return { success: false, error: 'Falha ao reorganizar a ordem dos trabalhos.' };
  }
}
