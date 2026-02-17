import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CONFIG } from "@/configurations";

let supabase: SupabaseClient | null = null;

if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) {
	supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
}

export { supabase };
export const isSupabaseConfigured = !!supabase;
