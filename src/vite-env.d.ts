/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  /** WordPress ADNA Membership REST base, e.g. https://example.com/wp-json/adna-membership/v1 */
  readonly VITE_ADNA_API_URL?: string
  readonly VITE_ZEFFY_MEMBERSHIP_URL?: string
  /** @deprecated Use VITE_SUPABASE_PUBLISHABLE_KEY */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
