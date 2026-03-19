import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

/**
 * Client Supabase.
 * Se le variabili d'ambiente non sono configurate, il client non funzionerà
 * e l'app ricadrà automaticamente su localStorage (vedi storageProvider).
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = () =>
  !!(supabaseUrl && supabaseAnonKey && supabase);
