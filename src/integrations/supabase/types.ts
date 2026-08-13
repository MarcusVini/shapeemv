export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          created_at: string
          email: string
          id: string
          nome_completo: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nome_completo?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome_completo?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          created_at: string
          id: string
          respostas_json: Json
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          respostas_json?: Json
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          respostas_json?: Json
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          action_type: string | null
          amount: number | null
          browser: string | null
          button_name: string | null
          button_text: string | null
          checkout_url: string | null
          created_at: string
          device_type: string | null
          event_name: string
          fbclid: string | null
          funnel_step: string | null
          gclid: string | null
          id: string
          lead_id: string | null
          metadata: Json
          offer_name: string | null
          os: string | null
          page_path: string | null
          page_title: string | null
          product_name: string | null
          quiz_answer: string | null
          quiz_question: string | null
          quiz_step: number | null
          referrer: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          action_type?: string | null
          amount?: number | null
          browser?: string | null
          button_name?: string | null
          button_text?: string | null
          checkout_url?: string | null
          created_at?: string
          device_type?: string | null
          event_name: string
          fbclid?: string | null
          funnel_step?: string | null
          gclid?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json
          offer_name?: string | null
          os?: string | null
          page_path?: string | null
          page_title?: string | null
          product_name?: string | null
          quiz_answer?: string | null
          quiz_question?: string | null
          quiz_step?: number | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          action_type?: string | null
          amount?: number | null
          browser?: string | null
          button_name?: string | null
          button_text?: string | null
          checkout_url?: string | null
          created_at?: string
          device_type?: string | null
          event_name?: string
          fbclid?: string | null
          funnel_step?: string | null
          gclid?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json
          offer_name?: string | null
          os?: string | null
          page_path?: string | null
          page_title?: string | null
          product_name?: string | null
          quiz_answer?: string | null
          quiz_question?: string | null
          quiz_step?: number | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome_completo: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome_completo?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome_completo?: string
        }
        Relationships: []
      }
      quiz_drafts: {
        Row: {
          respostas_json: Json
          step_idx: number
          updated_at: string
          user_id: string
        }
        Insert: {
          respostas_json?: Json
          step_idx?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          respostas_json?: Json
          step_idx?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      terms_acceptances: {
        Row: {
          accepted_at: string
          email: string | null
          id: string
          source: string
          terms_version: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string
          email?: string | null
          id?: string
          source?: string
          terms_version: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string
          email?: string | null
          id?: string
          source?: string
          terms_version?: string
          user_id?: string | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          assessment_id: string | null
          created_at: string
          id: string
          treinos_json: Json
          unlock_date: string
          user_id: string
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          treinos_json?: Json
          unlock_date: string
          user_id: string
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          treinos_json?: Json
          unlock_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
