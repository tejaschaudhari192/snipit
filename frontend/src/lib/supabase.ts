import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CONFIG } from "@/configurations";

let supabase: SupabaseClient | null = null;

if (CONFIG.supabaseUrl && CONFIG.supabaseAnonKey) {
	supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
}

export { supabase };
export const isSupabaseConfigured = !!supabase;
