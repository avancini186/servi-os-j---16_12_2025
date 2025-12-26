
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // Console warn instead of throwing error to prevent app crash during development if keys are missing
    console.warn('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
