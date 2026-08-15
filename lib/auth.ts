import { supabase } from './supabase';

export interface UserProfile {
  id: number;
  userId: string;
  role: 'client' | 'provider';
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
}

/**
 * Get current authenticated user profile from profiles table
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return null;
    }

    const userId = userData.user.id;

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, role, name, email, avatar_url, created_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    if (!profileData) {
      return null;
    }

    return {
      id: profileData.id,
      userId: profileData.user_id,
      role: (profileData.role === 'provider' ? 'provider' : 'client') as 'client' | 'provider',
      name: profileData.name || userData.user.email?.split('@')[0] || 'Usuário',
      email: profileData.email || userData.user.email || '',
      avatarUrl: profileData.avatar_url || '',
      createdAt: profileData.created_at,
    };
  } catch (err) {
    console.error('Error in getCurrentProfile:', err);
    return null;
  }
}

/**
 * Send password reset email via Supabase Auth
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/auth/client`,
    });

    if (error) {
      return { success: false, message: error.message || 'Não foi possível enviar o email de recuperação.' };
    }

    return {
      success: true,
      message: 'Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Erro ao processar solicitação de recuperação de senha.',
    };
  }
}
