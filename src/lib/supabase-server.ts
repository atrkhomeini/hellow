import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Storage bucket name
export const STORAGE_BUCKET = "uploads";

// Lazy-initialized Supabase client
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables: SUPABASE_PROJECT_URL or SUPABASE_ANON_KEY");
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Export for convenience (calls getSupabase internally)
export const supabase = {
  get storage() {
    return getSupabase().storage;
  },
  get from() {
    return getSupabase().from.bind(getSupabase());
  },
  get auth() {
    return getSupabase().auth;
  },
};