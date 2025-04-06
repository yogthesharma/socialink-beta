import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

// Create a singleton instance of the Supabase client for client components
// This avoids creating a new instance on every component render
let supabaseClient: ReturnType<
  typeof createClientComponentClient<Database>
> | null = null;

export function getSupabaseBrowser() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>();
  }
  return supabaseClient;
}
