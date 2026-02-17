import { createClient } from "@supabase/supabase-js";
import configurations from "./configurations.js";

const supabaseUrl = configurations.SUPABASE_URL;
const supabaseKey = configurations.SUPABASE_SERVICE_ROLE_KEY;

export const supabase =
	supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const STORAGE_BUCKET =
	configurations.SUPABASE_STORAGE_BUCKET || "uploads";
export const isSupabaseConfigured = !!supabase;
