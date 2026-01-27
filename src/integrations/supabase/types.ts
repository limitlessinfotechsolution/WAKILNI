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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      beneficiaries: {
        Row: {
          created_at: string
          date_of_birth: string | null
          documents: Json | null
          full_name: string
          full_name_ar: string | null
          id: string
          nationality: string | null
          status: Database["public"]["Enums"]["beneficiary_status"]
          status_notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          documents?: Json | null
          full_name: string
          full_name_ar?: string | null
          id?: string
          nationality?: string | null
          status: Database["public"]["Enums"]["beneficiary_status"]
          status_notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          documents?: Json | null
          full_name?: string
          full_name_ar?: string | null
          id?: string
          nationality?: string | null
          status?: Database["public"]["Enums"]["beneficiary_status"]
          status_notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      booking_activities: {
        Row: {
          action: string
          actor_id: string | null
          booking_id: string
          created_at: string
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          booking_id: string
          created_at?: string
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          booking_id?: string
          created_at?: string
          details?: Json | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_activities_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          beneficiary_id: string | null
          completed_at: string | null
          created_at: string
          currency: string | null
          id: string
          proof_gallery: Json | null
          provider_id: string | null
          scheduled_date: string | null
          service_id: string | null
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number | null
          traveler_id: string | null
          updated_at: string
        }
        Insert: {
          beneficiary_id?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          proof_gallery?: Json | null
          provider_id?: string | null
          scheduled_date?: string | null
          service_id?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number | null
          traveler_id?: string | null
          updated_at?: string
        }
        Update: {
          beneficiary_id?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          proof_gallery?: Json | null
          provider_id?: string | null
          scheduled_date?: string | null
          service_id?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number | null
          traveler_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          booking_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          booking_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          full_name_ar: string | null
          id: string
          phone: string | null
          phone_verified: boolean | null
          preferred_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          full_name_ar?: string | null
          id?: string
          phone?: string | null
          phone_verified?: boolean | null
          preferred_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          full_name_ar?: string | null
          id?: string
          phone?: string | null
          phone_verified?: boolean | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          bio: string | null
          bio_ar: string | null
          certifications: Json | null
          company_name: string | null
          company_name_ar: string | null
          created_at: string
          id: string
          is_active: boolean | null
          kyc_notes: string | null
          kyc_reviewed_at: string | null
          kyc_status: Database["public"]["Enums"]["kyc_status"] | null
          kyc_submitted_at: string | null
          rating: number | null
          total_bookings: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          bio_ar?: string | null
          certifications?: Json | null
          company_name?: string | null
          company_name_ar?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          kyc_notes?: string | null
          kyc_reviewed_at?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          kyc_submitted_at?: string | null
          rating?: number | null
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          bio_ar?: string | null
          certifications?: Json | null
          company_name?: string | null
          company_name_ar?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          kyc_notes?: string | null
          kyc_reviewed_at?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          kyc_submitted_at?: string | null
          rating?: number | null
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          comment_ar: string | null
          created_at: string
          id: string
          provider_id: string
          rating: number
          reviewer_id: string | null
        }
        Insert: {
          booking_id: string
          comment?: string | null
          comment_ar?: string | null
          created_at?: string
          id?: string
          provider_id: string
          rating: number
          reviewer_id?: string | null
        }
        Update: {
          booking_id?: string
          comment?: string | null
          comment_ar?: string | null
          created_at?: string
          id?: string
          provider_id?: string
          rating?: number
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          description_ar: string | null
          duration_days: number | null
          id: string
          includes: Json | null
          is_active: boolean | null
          price: number
          provider_id: string
          service_type: Database["public"]["Enums"]["service_type"]
          title: string
          title_ar: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          description_ar?: string | null
          duration_days?: number | null
          id?: string
          includes?: Json | null
          is_active?: boolean | null
          price: number
          provider_id: string
          service_type: Database["public"]["Enums"]["service_type"]
          title: string
          title_ar?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          description_ar?: string | null
          duration_days?: number | null
          id?: string
          includes?: Json | null
          is_active?: boolean | null
          price?: number
          provider_id?: string
          service_type?: Database["public"]["Enums"]["service_type"]
          title?: string
          title_ar?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          currency: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "traveler" | "provider"
      beneficiary_status: "deceased" | "sick" | "elderly" | "disabled" | "other"
      booking_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
      kyc_status: "pending" | "under_review" | "approved" | "rejected"
      service_type: "umrah" | "hajj" | "ziyarat"
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
    Enums: {
      app_role: ["admin", "traveler", "provider"],
      beneficiary_status: ["deceased", "sick", "elderly", "disabled", "other"],
      booking_status: [
        "pending",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
      ],
      kyc_status: ["pending", "under_review", "approved", "rejected"],
      service_type: ["umrah", "hajj", "ziyarat"],
    },
  },
} as const
