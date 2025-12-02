export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string
          name: string
          tribe_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url: string
          name: string
          tribe_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string
          name?: string
          tribe_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          created_at: string | null
          id: string
          name: string
          tribe_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          tribe_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          tribe_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "keywords_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      moodboard_brands: {
        Row: {
          brand_id: string
          created_at: string | null
          id: string
          moodboard_id: string
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          id?: string
          moodboard_id: string
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          id?: string
          moodboard_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moodboard_brands_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moodboard_brands_moodboard_id_fkey"
            columns: ["moodboard_id"]
            isOneToOne: false
            referencedRelation: "moodboards"
            referencedColumns: ["id"]
          },
        ]
      }
      moodboards: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          subculture_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          subculture_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          subculture_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moodboards_subculture_id_fkey"
            columns: ["subculture_id"]
            isOneToOne: false
            referencedRelation: "subcultures"
            referencedColumns: ["id"]
          },
        ]
      }
      subcultures: {
        Row: {
          created_at: string | null
          description: string
          donts: Json
          dos: Json
          id: string
          name: string
          subtitle: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          donts?: Json
          dos?: Json
          id?: string
          name: string
          subtitle?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          donts?: Json
          dos?: Json
          id?: string
          name?: string
          subtitle?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tribe_subcultures: {
        Row: {
          created_at: string | null
          id: string
          subculture_id: string
          tribe_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          subculture_id: string
          tribe_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          subculture_id?: string
          tribe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tribe_subcultures_subculture_id_fkey"
            columns: ["subculture_id"]
            isOneToOne: false
            referencedRelation: "subcultures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tribe_subcultures_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      tribes: {
        Row: {
          created_at: string | null
          description: string
          dos: Json | null
          donts: Json | null
          id: string
          name: string
          subtitle: string | null
          text: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          dos?: Json | null
          donts?: Json | null
          id?: string
          name: string
          subtitle?: string | null
          text?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          dos?: Json | null
          donts?: Json | null
          id?: string
          name?: string
          subtitle?: string | null
          text?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_answers: {
        Row: {
          brands: string[]
          created_at: string | null
          id: string
          keywords: string[]
          moodboard_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brands?: string[]
          created_at?: string | null
          id?: string
          keywords?: string[]
          moodboard_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brands?: string[]
          created_at?: string | null
          id?: string
          keywords?: string[]
          moodboard_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_moodboard_id_fkey"
            columns: ["moodboard_id"]
            isOneToOne: false
            referencedRelation: "moodboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_result_tribes: {
        Row: {
          created_at: string | null
          id: string
          percentage: number
          tribe_id: string | null
          user_result_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          percentage: number
          tribe_id?: string | null
          user_result_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          percentage?: number
          tribe_id?: string | null
          user_result_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_result_subcultures_user_result_id_fkey"
            columns: ["user_result_id"]
            isOneToOne: false
            referencedRelation: "user_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_result_tribes_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_results: {
        Row: {
          created_at: string | null
          id: string
          tribe_id: string
          updated_at: string | null
          user_answer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tribe_id: string
          updated_at?: string | null
          user_answer_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tribe_id?: string
          updated_at?: string | null
          user_answer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_results_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_results_user_answer_id_fkey"
            columns: ["user_answer_id"]
            isOneToOne: true
            referencedRelation: "user_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          connection_date: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          connection_date?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          connection_date?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
