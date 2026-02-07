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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
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
      charity_requests: {
        Row: {
          approved_amount: number | null
          beneficiary_id: string | null
          created_at: string
          id: string
          notes: string | null
          priority: number | null
          reason: string | null
          reason_ar: string | null
          requested_amount: number
          requester_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status: string | null
          supporting_documents: Json | null
          updated_at: string
        }
        Insert: {
          approved_amount?: number | null
          beneficiary_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          priority?: number | null
          reason?: string | null
          reason_ar?: string | null
          requested_amount: number
          requester_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status?: string | null
          supporting_documents?: Json | null
          updated_at?: string
        }
        Update: {
          approved_amount?: number | null
          beneficiary_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          priority?: number | null
          reason?: string | null
          reason_ar?: string | null
          requested_amount?: number
          requester_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: string | null
          supporting_documents?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "charity_requests_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      completion_certificates: {
        Row: {
          all_steps_verified: boolean | null
          beneficiary_name: string
          beneficiary_name_ar: string | null
          booking_id: string
          certificate_number: string
          completed_date: string
          created_at: string | null
          hijri_date: string | null
          id: string
          issued_at: string | null
          location: string | null
          pilgrim_id: string
          qr_verification_code: string
          service_type: Database["public"]["Enums"]["service_type"]
        }
        Insert: {
          all_steps_verified?: boolean | null
          beneficiary_name: string
          beneficiary_name_ar?: string | null
          booking_id: string
          certificate_number: string
          completed_date: string
          created_at?: string | null
          hijri_date?: string | null
          id?: string
          issued_at?: string | null
          location?: string | null
          pilgrim_id: string
          qr_verification_code: string
          service_type: Database["public"]["Enums"]["service_type"]
        }
        Update: {
          all_steps_verified?: boolean | null
          beneficiary_name?: string
          beneficiary_name_ar?: string | null
          booking_id?: string
          certificate_number?: string
          completed_date?: string
          created_at?: string | null
          hijri_date?: string | null
          id?: string
          issued_at?: string | null
          location?: string | null
          pilgrim_id?: string
          qr_verification_code?: string
          service_type?: Database["public"]["Enums"]["service_type"]
        }
        Relationships: [
          {
            foreignKeyName: "completion_certificates_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_certificates_pilgrim_id_fkey"
            columns: ["pilgrim_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_allocations: {
        Row: {
          allocated_at: string
          amount: number
          charity_request_id: string
          donation_id: string
          id: string
        }
        Insert: {
          allocated_at?: string
          amount: number
          charity_request_id: string
          donation_id: string
          id?: string
        }
        Update: {
          allocated_at?: string
          amount?: number
          charity_request_id?: string
          donation_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_allocations_charity_request_id_fkey"
            columns: ["charity_request_id"]
            isOneToOne: false
            referencedRelation: "charity_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_allocations_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_allocations_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          allocated_amount: number | null
          amount: number
          created_at: string
          currency: string | null
          donor_email: string | null
          donor_id: string | null
          donor_name: string | null
          id: string
          is_anonymous: boolean | null
          message: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          remaining_amount: number | null
          updated_at: string
        }
        Insert: {
          allocated_amount?: number | null
          amount: number
          created_at?: string
          currency?: string | null
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          remaining_amount?: number | null
          updated_at?: string
        }
        Update: {
          allocated_amount?: number | null
          amount?: number
          created_at?: string
          currency?: string | null
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          remaining_amount?: number | null
          updated_at?: string
        }
        Relationships: []
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
      notification_queue: {
        Row: {
          body: string
          channel: string
          created_at: string
          error_message: string | null
          failed_at: string | null
          id: string
          max_retries: number
          notification_type: string
          payload: Json
          priority: number
          retry_count: number
          scheduled_at: string
          sent_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          channel?: string
          created_at?: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number
          notification_type: string
          payload?: Json
          priority?: number
          retry_count?: number
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number
          notification_type?: string
          payload?: Json
          priority?: number
          retry_count?: number
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      offline_sync_queue: {
        Row: {
          created_at: string | null
          id: string
          operation: string
          payload: Json
          record_id: string | null
          synced: boolean | null
          synced_at: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          operation: string
          payload: Json
          record_id?: string | null
          synced?: boolean | null
          synced_at?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          operation?: string
          payload?: Json
          record_id?: string | null
          synced?: boolean | null
          synced_at?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_idempotency_keys: {
        Row: {
          booking_id: string | null
          completed_at: string | null
          created_at: string
          expires_at: string
          id: string
          idempotency_key: string
          request_hash: string | null
          response_data: Json | null
          status: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          idempotency_key: string
          request_hash?: string | null
          response_data?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          idempotency_key?: string
          request_hash?: string | null
          response_data?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_idempotency_keys_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pilgrim_certifications: {
        Row: {
          created_at: string | null
          current_active_badal: number | null
          government_id_url: string | null
          government_id_verified: boolean | null
          has_completed_own_hajj: boolean | null
          has_completed_own_umrah: boolean | null
          id: string
          last_violation_date: string | null
          max_active_badal: number | null
          own_hajj_date: string | null
          own_umrah_date: string | null
          photo_verification_url: string | null
          photo_verified: boolean | null
          provider_id: string
          scholar_approval_date: string | null
          scholar_approved: boolean | null
          scholar_id: string | null
          scholar_notes: string | null
          status: Database["public"]["Enums"]["pilgrim_status"] | null
          submitted_at: string | null
          suspended_at: string | null
          suspension_reason: string | null
          total_completed_rituals: number | null
          trust_score: number | null
          umrah_permit_history: Json | null
          updated_at: string | null
          verified_at: string | null
          video_oath_transcript: string | null
          video_oath_url: string | null
          video_oath_verified: boolean | null
          video_oath_verified_at: string | null
          video_oath_verified_by: string | null
          violation_count: number | null
          violations: Json | null
        }
        Insert: {
          created_at?: string | null
          current_active_badal?: number | null
          government_id_url?: string | null
          government_id_verified?: boolean | null
          has_completed_own_hajj?: boolean | null
          has_completed_own_umrah?: boolean | null
          id?: string
          last_violation_date?: string | null
          max_active_badal?: number | null
          own_hajj_date?: string | null
          own_umrah_date?: string | null
          photo_verification_url?: string | null
          photo_verified?: boolean | null
          provider_id: string
          scholar_approval_date?: string | null
          scholar_approved?: boolean | null
          scholar_id?: string | null
          scholar_notes?: string | null
          status?: Database["public"]["Enums"]["pilgrim_status"] | null
          submitted_at?: string | null
          suspended_at?: string | null
          suspension_reason?: string | null
          total_completed_rituals?: number | null
          trust_score?: number | null
          umrah_permit_history?: Json | null
          updated_at?: string | null
          verified_at?: string | null
          video_oath_transcript?: string | null
          video_oath_url?: string | null
          video_oath_verified?: boolean | null
          video_oath_verified_at?: string | null
          video_oath_verified_by?: string | null
          violation_count?: number | null
          violations?: Json | null
        }
        Update: {
          created_at?: string | null
          current_active_badal?: number | null
          government_id_url?: string | null
          government_id_verified?: boolean | null
          has_completed_own_hajj?: boolean | null
          has_completed_own_umrah?: boolean | null
          id?: string
          last_violation_date?: string | null
          max_active_badal?: number | null
          own_hajj_date?: string | null
          own_umrah_date?: string | null
          photo_verification_url?: string | null
          photo_verified?: boolean | null
          provider_id?: string
          scholar_approval_date?: string | null
          scholar_approved?: boolean | null
          scholar_id?: string | null
          scholar_notes?: string | null
          status?: Database["public"]["Enums"]["pilgrim_status"] | null
          submitted_at?: string | null
          suspended_at?: string | null
          suspension_reason?: string | null
          total_completed_rituals?: number | null
          trust_score?: number | null
          umrah_permit_history?: Json | null
          updated_at?: string | null
          verified_at?: string | null
          video_oath_transcript?: string | null
          video_oath_url?: string | null
          video_oath_verified?: boolean | null
          video_oath_verified_at?: string | null
          video_oath_verified_by?: string | null
          violation_count?: number | null
          violations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pilgrim_certifications_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_id: string | null
          full_name: string | null
          full_name_ar: string | null
          id: string
          last_login_at: string | null
          last_login_device: string | null
          last_login_ip: string | null
          last_login_location: string | null
          phone: string | null
          phone_verified: boolean | null
          preferred_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_id?: string | null
          full_name?: string | null
          full_name_ar?: string | null
          id?: string
          last_login_at?: string | null
          last_login_device?: string | null
          last_login_ip?: string | null
          last_login_location?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          preferred_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_id?: string | null
          full_name?: string | null
          full_name_ar?: string | null
          id?: string
          last_login_at?: string | null
          last_login_device?: string | null
          last_login_ip?: string | null
          last_login_location?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provider_availability: {
        Row: {
          created_at: string
          current_bookings: number | null
          date: string
          end_time: string | null
          id: string
          is_available: boolean
          max_bookings: number | null
          notes: string | null
          notes_ar: string | null
          provider_id: string
          start_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_bookings?: number | null
          date: string
          end_time?: string | null
          id?: string
          is_available?: boolean
          max_bookings?: number | null
          notes?: string | null
          notes_ar?: string | null
          provider_id: string
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_bookings?: number | null
          date?: string
          end_time?: string | null
          id?: string
          is_available?: boolean
          max_bookings?: number | null
          notes?: string | null
          notes_ar?: string | null
          provider_id?: string
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_bids: {
        Row: {
          bid_amount: number
          booking_id: string
          created_at: string
          currency: string | null
          id: string
          message: string | null
          provider_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          bid_amount: number
          booking_id: string
          created_at?: string
          currency?: string | null
          id?: string
          message?: string | null
          provider_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          bid_amount?: number
          booking_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          message?: string | null
          provider_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_bids_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_bids_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
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
          is_suspended: boolean | null
          kyc_notes: string | null
          kyc_reviewed_at: string | null
          kyc_status: Database["public"]["Enums"]["kyc_status"] | null
          kyc_submitted_at: string | null
          nationality: string | null
          rating: number | null
          suspension_reason: string | null
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
          is_suspended?: boolean | null
          kyc_notes?: string | null
          kyc_reviewed_at?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          kyc_submitted_at?: string | null
          nationality?: string | null
          rating?: number | null
          suspension_reason?: string | null
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
          is_suspended?: boolean | null
          kyc_notes?: string | null
          kyc_reviewed_at?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          kyc_submitted_at?: string | null
          nationality?: string | null
          rating?: number | null
          suspension_reason?: string | null
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
      ritual_events: {
        Row: {
          beneficiary_id: string
          beneficiary_name_mentioned: boolean | null
          booking_id: string
          created_at: string | null
          device_fingerprint: string | null
          dua_audio_url: string | null
          dua_transcript: string | null
          exif_data: Json | null
          flag_reason: string | null
          geo_location: Json | null
          id: string
          is_flagged: boolean | null
          media_hash: string | null
          media_type: string | null
          media_url: string | null
          provider_id: string
          ritual_step: string
          step_order: number
          timestamp: string
          verification_notes: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          beneficiary_id: string
          beneficiary_name_mentioned?: boolean | null
          booking_id: string
          created_at?: string | null
          device_fingerprint?: string | null
          dua_audio_url?: string | null
          dua_transcript?: string | null
          exif_data?: Json | null
          flag_reason?: string | null
          geo_location?: Json | null
          id?: string
          is_flagged?: boolean | null
          media_hash?: string | null
          media_type?: string | null
          media_url?: string | null
          provider_id: string
          ritual_step: string
          step_order: number
          timestamp?: string
          verification_notes?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          beneficiary_id?: string
          beneficiary_name_mentioned?: boolean | null
          booking_id?: string
          created_at?: string | null
          device_fingerprint?: string | null
          dua_audio_url?: string | null
          dua_transcript?: string | null
          exif_data?: Json | null
          flag_reason?: string | null
          geo_location?: Json | null
          id?: string
          is_flagged?: boolean | null
          media_hash?: string | null
          media_type?: string | null
          media_url?: string | null
          provider_id?: string
          ritual_step?: string
          step_order?: number
          timestamp?: string
          verification_notes?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ritual_events_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ritual_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ritual_events_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_allocations: {
        Row: {
          accepted_at: string | null
          allocation_type: string | null
          assigned_at: string | null
          assigned_by: string | null
          booking_id: string
          created_at: string
          id: string
          notes: string | null
          priority: number | null
          provider_id: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          allocation_type?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          booking_id: string
          created_at?: string
          id?: string
          notes?: string | null
          priority?: number | null
          provider_id?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          allocation_type?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          booking_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          priority?: number | null
          provider_id?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_allocations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_allocations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_allocations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
          gallery_urls: Json | null
          hero_image_url: string | null
          id: string
          includes: Json | null
          is_active: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: string | null
          price: number
          provider_id: string
          rejection_reason: string | null
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
          gallery_urls?: Json | null
          hero_image_url?: string | null
          id?: string
          includes?: Json | null
          is_active?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string | null
          price: number
          provider_id: string
          rejection_reason?: string | null
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
          gallery_urls?: Json | null
          hero_image_url?: string | null
          id?: string
          includes?: Json | null
          is_active?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string | null
          price?: number
          provider_id?: string
          rejection_reason?: string | null
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
      system_notices: {
        Row: {
          content: string
          content_ar: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          notice_type: string | null
          priority: number | null
          starts_at: string | null
          target_roles: Json | null
          title: string
          title_ar: string | null
          updated_at: string
        }
        Insert: {
          content: string
          content_ar?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          notice_type?: string | null
          priority?: number | null
          starts_at?: string | null
          target_roles?: Json | null
          title: string
          title_ar?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          content_ar?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          notice_type?: string | null
          priority?: number | null
          starts_at?: string | null
          target_roles?: Json | null
          title?: string
          title_ar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
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
      user_locations: {
        Row: {
          city: string | null
          country_code: string | null
          country_name: string | null
          created_at: string | null
          currency_code: string | null
          id: string
          last_updated: string | null
          latitude: number | null
          longitude: number | null
          timezone: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string | null
          currency_code?: string | null
          id?: string
          last_updated?: string | null
          latitude?: number | null
          longitude?: number | null
          timezone?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string | null
          currency_code?: string | null
          id?: string
          last_updated?: string | null
          latitude?: number | null
          longitude?: number | null
          timezone?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_sessions: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          is_current: boolean | null
          logged_in_at: string
          logged_out_at: string | null
          os: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          logged_in_at?: string
          logged_out_at?: string | null
          os?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          logged_in_at?: string
          logged_out_at?: string | null
          os?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          address_ar: string | null
          commercial_registration: string | null
          company_name: string
          company_name_ar: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_saudi_registered: boolean | null
          is_suspended: boolean | null
          kyc_notes: string | null
          kyc_reviewed_at: string | null
          kyc_status: Database["public"]["Enums"]["kyc_status"] | null
          kyc_submitted_at: string | null
          logo_url: string | null
          rating: number | null
          subscription_expires_at: string | null
          subscription_plan: string | null
          suspension_reason: string | null
          tax_number: string | null
          total_bookings: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          address_ar?: string | null
          commercial_registration?: string | null
          company_name: string
          company_name_ar?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_saudi_registered?: boolean | null
          is_suspended?: boolean | null
          kyc_notes?: string | null
          kyc_reviewed_at?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          kyc_submitted_at?: string | null
          logo_url?: string | null
          rating?: number | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          suspension_reason?: string | null
          tax_number?: string | null
          total_bookings?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          address_ar?: string | null
          commercial_registration?: string | null
          company_name?: string
          company_name_ar?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_saudi_registered?: boolean | null
          is_suspended?: boolean | null
          kyc_notes?: string | null
          kyc_reviewed_at?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          kyc_submitted_at?: string | null
          logo_url?: string | null
          rating?: number | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          suspension_reason?: string | null
          tax_number?: string | null
          total_bookings?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      donations_safe: {
        Row: {
          allocated_amount: number | null
          amount: number | null
          created_at: string | null
          currency: string | null
          donor_email: string | null
          donor_id: string | null
          donor_name: string | null
          id: string | null
          is_anonymous: boolean | null
          message: string | null
          payment_method: string | null
          payment_status: string | null
          remaining_amount: number | null
          updated_at: string | null
        }
        Insert: {
          allocated_amount?: number | null
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          donor_email?: never
          donor_id?: string | null
          donor_name?: never
          id?: string | null
          is_anonymous?: boolean | null
          message?: string | null
          payment_method?: string | null
          payment_status?: string | null
          remaining_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          allocated_amount?: number | null
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          donor_email?: never
          donor_id?: string | null
          donor_name?: never
          id?: string | null
          is_anonymous?: boolean | null
          message?: string | null
          payment_method?: string | null
          payment_status?: string | null
          remaining_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          full_name_ar: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          full_name_ar?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          full_name_ar?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_idempotency_keys: { Args: never; Returns: number }
      get_donation_display_info: {
        Args: { donation_row: Database["public"]["Tables"]["donations"]["Row"] }
        Returns: Json
      }
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
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      log_audit_action: {
        Args: {
          _action: string
          _entity_id?: string
          _entity_type: string
          _metadata?: Json
          _new_values?: Json
          _old_values?: Json
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "traveler" | "provider" | "super_admin" | "vendor"
      beneficiary_status: "deceased" | "sick" | "elderly" | "disabled" | "other"
      booking_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
      kyc_status: "pending" | "under_review" | "approved" | "rejected"
      pilgrim_status:
        | "pending"
        | "under_review"
        | "verified"
        | "suspended"
        | "inactive"
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
      app_role: ["admin", "traveler", "provider", "super_admin", "vendor"],
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
      pilgrim_status: [
        "pending",
        "under_review",
        "verified",
        "suspended",
        "inactive",
      ],
      service_type: ["umrah", "hajj", "ziyarat"],
    },
  },
} as const
