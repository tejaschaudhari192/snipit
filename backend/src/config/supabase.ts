import { createClient } from "@supabase/supabase-js";
import configurations from "./configurations.js";

const supabaseUrl = configurations.supabase_url;
const supabaseKey = configurations.supabase_service_role_key;

export const supabase =
	supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const STORAGE_BUCKET =
	configurations.supabase_storage_bucket || "uploads";
export const isSupabaseConfigured = !!supabase;
