export type MembershipType = 'premium' | 'diaspora' | 'regular'

export const MEMBERSHIP_TYPE_IDS: Record<MembershipType, string> = {
  premium: '56f6be17-ebcd-43ca-9dc6-0e2545e88cac',
  diaspora: 'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad',
  regular: 'b9aabd89-7ea5-4da2-aa66-ef09dfb7b4a0',
}

export type MemberInsert = {
  title: string
  first_name: string
  middle_name?: string | null
  last_name: string
  phone_number: string
  country_residence: string
  state_residence?: string | null
  email: string
  is_student: boolean
  education_level: string
  employment_status: string
  licence_status: string
  nurse_licences: string[]
  licence_speciality?: string | null
  country_practice: string
  state_practice?: string | null
  nursing_education_country: string
  position_title: string
  practice_setting: string
  specialties: string[]
  membership_type_id: string
  status?: number
  is_active?: boolean
  is_first_login?: boolean
}

export type Database = {
  public: {
    Tables: {
      membership_types: {
        Row: {
          id: string
          alias: string
          label: string
          amount: number
        }
        Insert: {
          id: string
          alias: string
          label: string
          amount: number
        }
        Update: Partial<{
          alias: string
          label: string
          amount: number
        }>
      }
      members: {
        Row: MemberInsert & {
          id: string
          created_at: string
          last_login_at: string | null
          deactivated: boolean
          deactivated_at: string | null
        }
        Insert: MemberInsert
        Update: Partial<MemberInsert>
      }
      member_dues: {
        Row: {
          id: string
          member_id: string | null
          member_email: string
          order_id: string | null
          currency: string
          amount: number
          status: string
          year: number | null
          created_at: string
        }
        Insert: never
        Update: never
      }
    }
    Functions: {
      login_member: {
        Args: { p_email: string; p_password: string }
        Returns: Json
      }
      get_member_profile: {
        Args: { p_token: string }
        Returns: Json
      }
      logout_member: {
        Args: { p_token: string }
        Returns: Json
      }
      reset_member_password: {
        Args: { p_token: string; p_password: string }
        Returns: Json
      }
    }
  }
}
