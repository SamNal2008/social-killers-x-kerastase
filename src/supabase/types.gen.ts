// Temporary placeholder Supabase types.
// The real contents should be generated via:
// supabase gen types typescript --schema public > src/supabase/types.gen.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: Record<string, never>;
}