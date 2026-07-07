/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_ZEFFY_MEMBERSHIP_URL?: string
  /** Help Scout Beacon for general site pages (default inbox). */
  readonly VITE_HELPSCOUT_WEBSITE_BEACON_ID?: string
  /** Help Scout Beacon for /membership — create a second Beacon in Help Scout for a separate inbox. */
  readonly VITE_HELPSCOUT_MEMBERSHIP_BEACON_ID?: string
  /** @deprecated Use VITE_SUPABASE_PUBLISHABLE_KEY */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
