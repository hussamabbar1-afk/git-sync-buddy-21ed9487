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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          actor_type: string
          actor_user_id: string | null
          company_id: string
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          event_type: string
          id: string
          title: string
        }
        Insert: {
          actor_type?: string
          actor_user_id?: string | null
          company_id: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          event_type: string
          id?: string
          title: string
        }
        Update: {
          actor_type?: string
          actor_user_id?: string | null
          company_id?: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          event_type?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          auto_detect_language: boolean
          company_id: string
          created_at: string
          description: string | null
          fallback_message: string | null
          human_handoff_enabled: boolean
          id: string
          is_active: boolean
          language: string
          name: string
          response_style: string
          staff_summary_language: string
          supported_languages: string[]
          translate_staff_summary: boolean
          updated_at: string | null
          welcome_message: string | null
          widget_key: string
        }
        Insert: {
          auto_detect_language?: boolean
          company_id: string
          created_at?: string
          description?: string | null
          fallback_message?: string | null
          human_handoff_enabled?: boolean
          id?: string
          is_active?: boolean
          language?: string
          name: string
          response_style?: string
          staff_summary_language?: string
          supported_languages?: string[]
          translate_staff_summary?: boolean
          updated_at?: string | null
          welcome_message?: string | null
          widget_key?: string
        }
        Update: {
          auto_detect_language?: boolean
          company_id?: string
          created_at?: string
          description?: string | null
          fallback_message?: string | null
          human_handoff_enabled?: boolean
          id?: string
          is_active?: boolean
          language?: string
          name?: string
          response_style?: string
          staff_summary_language?: string
          supported_languages?: string[]
          translate_staff_summary?: boolean
          updated_at?: string | null
          welcome_message?: string | null
          widget_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_terminology: {
        Row: {
          aliases: string[]
          canonical_label: string | null
          category: string | null
          company_id: string
          created_at: string
          definition: string | null
          id: string
          is_active: boolean
          term: string
          translations: Json
          updated_at: string
        }
        Insert: {
          aliases?: string[]
          canonical_label?: string | null
          category?: string | null
          company_id: string
          created_at?: string
          definition?: string | null
          id?: string
          is_active?: boolean
          term: string
          translations?: Json
          updated_at?: string
        }
        Update: {
          aliases?: string[]
          canonical_label?: string | null
          category?: string | null
          company_id?: string
          created_at?: string
          definition?: string | null
          id?: string
          is_active?: boolean
          term?: string
          translations?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_terminology_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_waitlist: {
        Row: {
          address: string | null
          company_id: string
          conversation_id: string | null
          created_at: string
          customer_name: string | null
          email: string | null
          id: string
          last_notified_at: string | null
          lead_id: string | null
          matched_appointment_id: string | null
          matched_date: string | null
          matched_start_time: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          preferred_date_from: string
          preferred_date_to: string
          preferred_time_from: string | null
          preferred_time_to: string | null
          priority: string
          service_name: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id: string
          conversation_id?: string | null
          created_at?: string
          customer_name?: string | null
          email?: string | null
          id?: string
          last_notified_at?: string | null
          lead_id?: string | null
          matched_appointment_id?: string | null
          matched_date?: string | null
          matched_start_time?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_date_from: string
          preferred_date_to: string
          preferred_time_from?: string | null
          preferred_time_to?: string | null
          priority?: string
          service_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          conversation_id?: string | null
          created_at?: string
          customer_name?: string | null
          email?: string | null
          id?: string
          last_notified_at?: string | null
          lead_id?: string | null
          matched_appointment_id?: string | null
          matched_date?: string | null
          matched_start_time?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_date_from?: string
          preferred_date_to?: string
          preferred_time_from?: string | null
          preferred_time_to?: string | null
          priority?: string
          service_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_waitlist_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_waitlist_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_waitlist_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_waitlist_matched_appointment_id_fkey"
            columns: ["matched_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          address: string | null
          appointment_date: string | null
          company_id: string
          conversation_id: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          email: string | null
          end_time: string | null
          id: string
          lead_id: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          search_text: string | null
          service_type: string | null
          start_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          appointment_date?: string | null
          company_id: string
          conversation_id?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          email?: string | null
          end_time?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          search_text?: string | null
          service_type?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          appointment_date?: string | null
          company_id?: string
          conversation_id?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          email?: string | null
          end_time?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          search_text?: string | null
          service_type?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          entity_id: string
          entity_type: string
          file_name: string
          id: string
          mime_type: string
          size_bytes: number | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          entity_id: string
          entity_type: string
          file_name: string
          id?: string
          mime_type: string
          size_bytes?: number | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_type?: string
          file_name?: string
          id?: string
          mime_type?: string
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_closures: {
        Row: {
          company_id: string
          created_at: string
          end_date: string
          id: string
          reason: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_closures_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_feed_settings: {
        Row: {
          company_id: string
          created_at: string
          enabled: boolean
          future_days: number
          include_cancelled: boolean
          include_contact_details: boolean
          include_notes: boolean
          past_days: number
          token_hash: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          enabled?: boolean
          future_days?: number
          include_cancelled?: boolean
          include_contact_details?: boolean
          include_notes?: boolean
          past_days?: number
          token_hash: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          enabled?: boolean
          future_days?: number
          include_cancelled?: boolean
          include_contact_details?: boolean
          include_notes?: boolean
          past_days?: number
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_feed_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          body_template: string
          channel: string
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          locale: string
          name: string
          purpose: string
          subject_template: string | null
          template_key: string
          updated_at: string
        }
        Insert: {
          body_template: string
          channel: string
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          locale?: string
          name: string
          purpose?: string
          subject_template?: string | null
          template_key: string
          updated_at?: string
        }
        Update: {
          body_template?: string
          channel?: string
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          locale?: string
          name?: string
          purpose?: string
          subject_template?: string | null
          template_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          appointment_duration_minutes: number
          appointment_reminder_minutes: number
          bank_account_holder: string | null
          bank_bic: string | null
          bank_iban: string | null
          created_at: string
          daily_digest_enabled: boolean
          daily_digest_hour: number
          data_retention_days: number | null
          default_tax_rate: number
          description: string | null
          email: string | null
          feedback_review_min_rating: number
          google_review_url: string | null
          handoff_sla_minutes: number
          id: string
          imprint_url: string | null
          industry: string | null
          invoice_payment_terms_days: number
          lead_response_sla_minutes: number
          legal_name: string | null
          minimum_booking_notice_minutes: number
          name: string
          phone: string | null
          privacy_policy_url: string | null
          privacy_policy_version: string | null
          quote_default_tax_rate: number
          quote_default_valid_days: number
          quote_footer: string | null
          quote_terms: string | null
          require_job_assignee_before_start: boolean
          require_job_checklist_before_completion: boolean
          tax_number: string | null
          timezone: string
          vat_id: string | null
        }
        Insert: {
          address?: string | null
          appointment_duration_minutes?: number
          appointment_reminder_minutes?: number
          bank_account_holder?: string | null
          bank_bic?: string | null
          bank_iban?: string | null
          created_at?: string
          daily_digest_enabled?: boolean
          daily_digest_hour?: number
          data_retention_days?: number | null
          default_tax_rate?: number
          description?: string | null
          email?: string | null
          feedback_review_min_rating?: number
          google_review_url?: string | null
          handoff_sla_minutes?: number
          id?: string
          imprint_url?: string | null
          industry?: string | null
          invoice_payment_terms_days?: number
          lead_response_sla_minutes?: number
          legal_name?: string | null
          minimum_booking_notice_minutes?: number
          name?: string
          phone?: string | null
          privacy_policy_url?: string | null
          privacy_policy_version?: string | null
          quote_default_tax_rate?: number
          quote_default_valid_days?: number
          quote_footer?: string | null
          quote_terms?: string | null
          require_job_assignee_before_start?: boolean
          require_job_checklist_before_completion?: boolean
          tax_number?: string | null
          timezone?: string
          vat_id?: string | null
        }
        Update: {
          address?: string | null
          appointment_duration_minutes?: number
          appointment_reminder_minutes?: number
          bank_account_holder?: string | null
          bank_bic?: string | null
          bank_iban?: string | null
          created_at?: string
          daily_digest_enabled?: boolean
          daily_digest_hour?: number
          data_retention_days?: number | null
          default_tax_rate?: number
          description?: string | null
          email?: string | null
          feedback_review_min_rating?: number
          google_review_url?: string | null
          handoff_sla_minutes?: number
          id?: string
          imprint_url?: string | null
          industry?: string | null
          invoice_payment_terms_days?: number
          lead_response_sla_minutes?: number
          legal_name?: string | null
          minimum_booking_notice_minutes?: number
          name?: string
          phone?: string | null
          privacy_policy_url?: string | null
          privacy_policy_version?: string | null
          quote_default_tax_rate?: number
          quote_default_valid_days?: number
          quote_footer?: string | null
          quote_terms?: string | null
          require_job_assignee_before_start?: boolean
          require_job_checklist_before_completion?: boolean
          tax_number?: string | null
          timezone?: string
          vat_id?: string | null
        }
        Relationships: []
      }
      company_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          company_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          company_id: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          role?: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          company_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_invites_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          channel: string
          company_id: string
          created_at: string
          customer_id: string | null
          customer_language: string | null
          detected_language: string | null
          external_session_id: string | null
          handoff_reason: string | null
          handoff_requested_at: string | null
          id: string
          page_title: string | null
          page_url: string | null
          preferred_language: string | null
          privacy_consent_at: string | null
          privacy_policy_version: string | null
          referrer: string | null
          search_text: string | null
          staff_summary: string | null
          status: string
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_email: string | null
          visitor_name: string | null
          visitor_phone: string | null
          widget_key: string
        }
        Insert: {
          channel?: string
          company_id: string
          created_at?: string
          customer_id?: string | null
          customer_language?: string | null
          detected_language?: string | null
          external_session_id?: string | null
          handoff_reason?: string | null
          handoff_requested_at?: string | null
          id?: string
          page_title?: string | null
          page_url?: string | null
          preferred_language?: string | null
          privacy_consent_at?: string | null
          privacy_policy_version?: string | null
          referrer?: string | null
          search_text?: string | null
          staff_summary?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
          widget_key: string
        }
        Update: {
          channel?: string
          company_id?: string
          created_at?: string
          customer_id?: string | null
          customer_language?: string | null
          detected_language?: string | null
          external_session_id?: string | null
          handoff_reason?: string | null
          handoff_requested_at?: string | null
          id?: string
          page_title?: string | null
          page_url?: string | null
          preferred_language?: string | null
          privacy_consent_at?: string | null
          privacy_policy_version?: string | null
          referrer?: string | null
          search_text?: string | null
          staff_summary?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
          widget_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_assets: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          customer_id: string | null
          id: string
          installed_on: string | null
          job_id: string | null
          lead_id: string | null
          location: string | null
          manufacturer: string | null
          model: string | null
          name: string
          next_maintenance_date: string | null
          notes: string | null
          search_text: string | null
          serial_number: string | null
          service_contract_id: string | null
          status: string
          updated_at: string
          warranty_until: string | null
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          customer_id?: string | null
          id?: string
          installed_on?: string | null
          job_id?: string | null
          lead_id?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          next_maintenance_date?: string | null
          notes?: string | null
          search_text?: string | null
          serial_number?: string | null
          service_contract_id?: string | null
          status?: string
          updated_at?: string
          warranty_until?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          installed_on?: string | null
          job_id?: string | null
          lead_id?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          next_maintenance_date?: string | null
          notes?: string | null
          search_text?: string | null
          serial_number?: string | null
          service_contract_id?: string | null
          status?: string
          updated_at?: string
          warranty_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_assets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_assets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_assets_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_assets_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_assets_service_contract_id_fkey"
            columns: ["service_contract_id"]
            isOneToOne: false
            referencedRelation: "service_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contact_preferences: {
        Row: {
          captured_at: string | null
          channel: string
          company_id: string
          created_at: string
          customer_id: string
          id: string
          note: string | null
          purpose: string
          source: string | null
          status: string
          updated_at: string
          withdrawn_at: string | null
        }
        Insert: {
          captured_at?: string | null
          channel: string
          company_id: string
          created_at?: string
          customer_id: string
          id?: string
          note?: string | null
          purpose?: string
          source?: string | null
          status?: string
          updated_at?: string
          withdrawn_at?: string | null
        }
        Update: {
          captured_at?: string | null
          channel?: string
          company_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          note?: string | null
          purpose?: string
          source?: string | null
          status?: string
          updated_at?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_contact_preferences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_contact_preferences_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_feedback: {
        Row: {
          appointment_id: string | null
          comment: string | null
          company_id: string
          consent_to_publish: boolean
          created_at: string
          customer_name: string | null
          id: string
          job_id: string | null
          lead_id: string | null
          rating: number
          source: string
          submitted_at: string
        }
        Insert: {
          appointment_id?: string | null
          comment?: string | null
          company_id: string
          consent_to_publish?: boolean
          created_at?: string
          customer_name?: string | null
          id?: string
          job_id?: string | null
          lead_id?: string | null
          rating: number
          source?: string
          submitted_at?: string
        }
        Update: {
          appointment_id?: string | null
          comment?: string | null
          company_id?: string
          consent_to_publish?: boolean
          created_at?: string
          customer_name?: string | null
          id?: string
          job_id?: string | null
          lead_id?: string | null
          rating?: number
          source?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_feedback_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_feedback_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_feedback_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_feedback_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          company_id: string
          company_name: string | null
          country_code: string
          created_at: string
          customer_number: string
          customer_type: string
          display_name: string
          email: string | null
          email_normalized: string | null
          first_name: string | null
          id: string
          last_activity_at: string
          last_name: string | null
          notes: string | null
          phone: string | null
          phone_normalized: string | null
          postal_code: string | null
          preferred_language: string | null
          source: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id: string
          company_name?: string | null
          country_code?: string
          created_at?: string
          customer_number: string
          customer_type?: string
          display_name: string
          email?: string | null
          email_normalized?: string | null
          first_name?: string | null
          id?: string
          last_activity_at?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          phone_normalized?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          source?: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string
          company_name?: string | null
          country_code?: string
          created_at?: string
          customer_number?: string
          customer_type?: string
          display_name?: string
          email?: string | null
          email_normalized?: string | null
          first_name?: string | null
          id?: string
          last_activity_at?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          phone_normalized?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          source?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          attachment_id: string | null
          category: string
          company_id: string
          created_at: string
          created_by: string | null
          description: string
          expense_date: string
          gross_cents: number
          id: string
          job_id: string | null
          net_cents: number
          reference: string | null
          supplier_name: string | null
          tax_cents: number
          updated_at: string
        }
        Insert: {
          attachment_id?: string | null
          category?: string
          company_id: string
          created_at?: string
          created_by?: string | null
          description: string
          expense_date?: string
          gross_cents?: number
          id?: string
          job_id?: string | null
          net_cents?: number
          reference?: string | null
          supplier_name?: string | null
          tax_cents?: number
          updated_at?: string
        }
        Update: {
          attachment_id?: string | null
          category?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          expense_date?: string
          gross_cents?: number
          id?: string
          job_id?: string | null
          net_cents?: number
          reference?: string | null
          supplier_name?: string | null
          tax_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_attachment_id_fkey"
            columns: ["attachment_id"]
            isOneToOne: false
            referencedRelation: "attachments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      external_integrations: {
        Row: {
          auto_sync_enabled: boolean
          company_id: string
          config: Json
          created_at: string
          credentials_configured: boolean
          display_name: string | null
          external_account_id: string | null
          id: string
          last_cursor: string | null
          last_error_at: string | null
          last_error_message: string | null
          last_success_at: string | null
          last_sync_at: string | null
          provider: string
          status: string
          sync_customers: boolean
          sync_direction: string
          sync_invoices: boolean
          sync_payments: boolean
          sync_quotes: boolean
          updated_at: string
          webhook_configured: boolean
        }
        Insert: {
          auto_sync_enabled?: boolean
          company_id: string
          config?: Json
          created_at?: string
          credentials_configured?: boolean
          display_name?: string | null
          external_account_id?: string | null
          id?: string
          last_cursor?: string | null
          last_error_at?: string | null
          last_error_message?: string | null
          last_success_at?: string | null
          last_sync_at?: string | null
          provider: string
          status?: string
          sync_customers?: boolean
          sync_direction?: string
          sync_invoices?: boolean
          sync_payments?: boolean
          sync_quotes?: boolean
          updated_at?: string
          webhook_configured?: boolean
        }
        Update: {
          auto_sync_enabled?: boolean
          company_id?: string
          config?: Json
          created_at?: string
          credentials_configured?: boolean
          display_name?: string | null
          external_account_id?: string | null
          id?: string
          last_cursor?: string | null
          last_error_at?: string | null
          last_error_message?: string | null
          last_success_at?: string | null
          last_sync_at?: string | null
          provider?: string
          status?: string
          sync_customers?: boolean
          sync_direction?: string
          sync_invoices?: boolean
          sync_payments?: boolean
          sync_quotes?: boolean
          updated_at?: string
          webhook_configured?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "external_integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_object_links: {
        Row: {
          company_id: string
          entity_type: string
          external_id: string
          external_version: string | null
          id: string
          integration_id: string
          last_synced_at: string
          local_id: string
          metadata: Json
        }
        Insert: {
          company_id: string
          entity_type: string
          external_id: string
          external_version?: string | null
          id?: string
          integration_id: string
          last_synced_at?: string
          local_id: string
          metadata?: Json
        }
        Update: {
          company_id?: string
          entity_type?: string
          external_id?: string
          external_version?: string | null
          id?: string
          integration_id?: string
          last_synced_at?: string
          local_id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "integration_object_links_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_object_links_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "external_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_provider_catalog: {
        Row: {
          auth_mode: string
          category: string
          display_name: string
          docs_url: string | null
          notes: string | null
          provider: string
          readiness: string
          supports_customers: boolean
          supports_einvoice: boolean
          supports_invoices: boolean
          supports_payments: boolean
          supports_quotes: boolean
          supports_webhooks: boolean
          updated_at: string
        }
        Insert: {
          auth_mode: string
          category: string
          display_name: string
          docs_url?: string | null
          notes?: string | null
          provider: string
          readiness?: string
          supports_customers?: boolean
          supports_einvoice?: boolean
          supports_invoices?: boolean
          supports_payments?: boolean
          supports_quotes?: boolean
          supports_webhooks?: boolean
          updated_at?: string
        }
        Update: {
          auth_mode?: string
          category?: string
          display_name?: string
          docs_url?: string | null
          notes?: string | null
          provider?: string
          readiness?: string
          supports_customers?: boolean
          supports_einvoice?: boolean
          supports_invoices?: boolean
          supports_payments?: boolean
          supports_quotes?: boolean
          supports_webhooks?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      integration_sync_runs: {
        Row: {
          company_id: string
          created_at: string
          created_count: number
          direction: string
          entity_type: string
          error_summary: string | null
          failed_count: number
          finished_at: string | null
          id: string
          integration_id: string
          processed_count: number
          skipped_count: number
          started_at: string | null
          status: string
          updated_count: number
        }
        Insert: {
          company_id: string
          created_at?: string
          created_count?: number
          direction: string
          entity_type: string
          error_summary?: string | null
          failed_count?: number
          finished_at?: string | null
          id?: string
          integration_id: string
          processed_count?: number
          skipped_count?: number
          started_at?: string | null
          status?: string
          updated_count?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          created_count?: number
          direction?: string
          entity_type?: string
          error_summary?: string | null
          failed_count?: number
          finished_at?: string | null
          id?: string
          integration_id?: string
          processed_count?: number
          skipped_count?: number
          started_at?: string | null
          status?: string
          updated_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_runs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_sync_runs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "external_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          invoice_id: string
          position: number
          quantity: number
          service_id: string | null
          tax_rate: number
          unit: string
          unit_price_cents: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          position?: number
          quantity?: number
          service_id?: string | null
          tax_rate?: number
          unit?: string
          unit_price_cents?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          position?: number
          quantity?: number
          service_id?: string | null
          tax_rate?: number
          unit?: string
          unit_price_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount_cents: number
          company_id: string
          created_at: string
          id: string
          invoice_id: string
          method: string
          note: string | null
          paid_at: string
          recorded_by: string | null
          reference: string | null
        }
        Insert: {
          amount_cents: number
          company_id: string
          created_at?: string
          id?: string
          invoice_id: string
          method?: string
          note?: string | null
          paid_at?: string
          recorded_by?: string | null
          reference?: string | null
        }
        Update: {
          amount_cents?: number
          company_id?: string
          created_at?: string
          id?: string
          invoice_id?: string
          method?: string
          note?: string | null
          paid_at?: string
          recorded_by?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          address: string | null
          balance_cents: number
          cancelled_at: string | null
          company_id: string
          created_at: string
          currency: string
          customer_id: string | null
          customer_name: string | null
          customer_viewed_at: string | null
          due_date: string | null
          email: string | null
          id: string
          invoice_number: string
          issue_date: string
          job_id: string | null
          lead_id: string | null
          notes: string | null
          paid_at: string | null
          paid_cents: number
          payment_reference: string | null
          phone: string | null
          postal_code: string | null
          quote_id: string | null
          search_text: string | null
          sent_at: string | null
          share_expires_at: string | null
          share_last_viewed_at: string | null
          share_token_hash: string | null
          status: string
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          balance_cents?: number
          cancelled_at?: string | null
          company_id: string
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_viewed_at?: string | null
          due_date?: string | null
          email?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          job_id?: string | null
          lead_id?: string | null
          notes?: string | null
          paid_at?: string | null
          paid_cents?: number
          payment_reference?: string | null
          phone?: string | null
          postal_code?: string | null
          quote_id?: string | null
          search_text?: string | null
          sent_at?: string | null
          share_expires_at?: string | null
          share_last_viewed_at?: string | null
          share_token_hash?: string | null
          status?: string
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          balance_cents?: number
          cancelled_at?: string | null
          company_id?: string
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_viewed_at?: string | null
          due_date?: string | null
          email?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          job_id?: string | null
          lead_id?: string | null
          notes?: string | null
          paid_at?: string | null
          paid_cents?: number
          payment_reference?: string | null
          phone?: string | null
          postal_code?: string | null
          quote_id?: string | null
          search_text?: string | null
          sent_at?: string | null
          share_expires_at?: string | null
          share_last_viewed_at?: string | null
          share_token_hash?: string | null
          status?: string
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assignment_role: string
          company_id: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_role?: string
          company_id: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_role?: string
          company_id?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_checklist_items: {
        Row: {
          company_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          is_required: boolean
          job_id: string
          label: string
          note: string | null
          position: number
          source_template_id: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          is_required?: boolean
          job_id: string
          label: string
          note?: string | null
          position?: number
          source_template_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          is_required?: boolean
          job_id?: string
          label?: string
          note?: string | null
          position?: number
          source_template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_checklist_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_checklist_items_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_checklist_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_checklist_items_source_template_id_fkey"
            columns: ["source_template_id"]
            isOneToOne: false
            referencedRelation: "service_checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      job_items: {
        Row: {
          company_id: string
          cost_total_cents: number
          created_at: string
          description: string
          id: string
          item_type: string
          job_id: string
          position: number
          purchase_reference: string | null
          quantity: number
          source_quote_item_id: string | null
          supplier_name: string | null
          total_cents: number | null
          unit: string
          unit_cost_cents: number
          unit_price_cents: number
          updated_at: string
        }
        Insert: {
          company_id: string
          cost_total_cents?: number
          created_at?: string
          description: string
          id?: string
          item_type?: string
          job_id: string
          position?: number
          purchase_reference?: string | null
          quantity?: number
          source_quote_item_id?: string | null
          supplier_name?: string | null
          total_cents?: number | null
          unit?: string
          unit_cost_cents?: number
          unit_price_cents?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          cost_total_cents?: number
          created_at?: string
          description?: string
          id?: string
          item_type?: string
          job_id?: string
          position?: number
          purchase_reference?: string | null
          quantity?: number
          source_quote_item_id?: string | null
          supplier_name?: string | null
          total_cents?: number | null
          unit?: string
          unit_cost_cents?: number
          unit_price_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_items_source_quote_item_id_fkey"
            columns: ["source_quote_item_id"]
            isOneToOne: false
            referencedRelation: "quote_items"
            referencedColumns: ["id"]
          },
        ]
      }
      job_reports: {
        Row: {
          acceptance_note: string | null
          accepted_at: string | null
          accepted_by_name: string | null
          checklist_snapshot: Json
          company_id: string
          created_at: string
          created_by: string | null
          customer_note: string | null
          id: string
          issue_reported_at: string | null
          items_snapshot: Json
          job_id: string
          job_snapshot: Json
          status: string
          time_snapshot: Json
          title: string
          updated_at: string
          work_summary: string | null
        }
        Insert: {
          acceptance_note?: string | null
          accepted_at?: string | null
          accepted_by_name?: string | null
          checklist_snapshot?: Json
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_note?: string | null
          id?: string
          issue_reported_at?: string | null
          items_snapshot?: Json
          job_id: string
          job_snapshot?: Json
          status?: string
          time_snapshot?: Json
          title?: string
          updated_at?: string
          work_summary?: string | null
        }
        Update: {
          acceptance_note?: string | null
          accepted_at?: string | null
          accepted_by_name?: string | null
          checklist_snapshot?: Json
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_note?: string | null
          id?: string
          issue_reported_at?: string | null
          items_snapshot?: Json
          job_id?: string
          job_snapshot?: Json
          status?: string
          time_snapshot?: Json
          title?: string
          updated_at?: string
          work_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_time_entries: {
        Row: {
          company_id: string
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          job_id: string
          note: string | null
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          job_id: string
          note?: string | null
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          job_id?: string
          note?: string | null
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_time_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_time_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address: string | null
          appointment_id: string | null
          company_id: string
          completed_at: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          description: string | null
          email: string | null
          estimated_value_cents: number | null
          final_value_cents: number | null
          id: string
          job_number: string
          lead_id: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          priority: string
          quote_id: string | null
          scheduled_date: string | null
          scheduled_end_time: string | null
          scheduled_start_time: string | null
          search_text: string | null
          started_at: string | null
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          appointment_id?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          description?: string | null
          email?: string | null
          estimated_value_cents?: number | null
          final_value_cents?: number | null
          id?: string
          job_number: string
          lead_id?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          priority?: string
          quote_id?: string | null
          scheduled_date?: string | null
          scheduled_end_time?: string | null
          scheduled_start_time?: string | null
          search_text?: string | null
          started_at?: string | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          appointment_id?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          description?: string | null
          email?: string | null
          estimated_value_cents?: number | null
          final_value_cents?: number | null
          id?: string
          job_number?: string
          lead_id?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          priority?: string
          quote_id?: string | null
          scheduled_date?: string | null
          scheduled_end_time?: string | null
          scheduled_start_time?: string | null
          search_text?: string | null
          started_at?: string | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_gaps: {
        Row: {
          company_id: string
          created_at: string
          first_seen_at: string
          id: string
          last_seen_at: string
          occurrence_count: number
          question: string
          question_hash: string
          resolution_note: string | null
          sample_conversation_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          occurrence_count?: number
          question: string
          question_hash: string
          resolution_note?: string | null
          sample_conversation_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          occurrence_count?: number
          question?: string
          question_hash?: string
          resolution_note?: string | null
          sample_conversation_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_gaps_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_gaps_sample_conversation_id_fkey"
            columns: ["sample_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_items: {
        Row: {
          category: string
          company_id: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          keywords: string[]
          search_text: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          company_id: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          keywords?: string[]
          search_text?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          company_id?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          keywords?: string[]
          search_text?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          author_id: string
          company_id: string
          content: string
          created_at: string
          id: string
          lead_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          company_id: string
          content: string
          created_at?: string
          id?: string
          lead_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          company_id?: string
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_notes_lead_company_fkey"
            columns: ["lead_id", "company_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id", "company_id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          appointment_reason: string | null
          booking_confirmation_received: boolean | null
          cancellation_selection_pending: boolean
          company_id: string
          contacted_at: string | null
          conversation_id: string | null
          created_at: string
          customer_id: string | null
          customer_language: string | null
          draft_appointment_date: string | null
          draft_start_time: string | null
          email: string | null
          estimated_value_cents: number | null
          follow_up_at: string | null
          human_handoff_pending: boolean
          human_handoff_reason: string | null
          id: string
          issue_description: string | null
          issue_type: string | null
          last_activity_at: string
          lead_score: number
          lost_at: string | null
          lost_reason: string | null
          name: string | null
          page_url: string | null
          pending_appointment_date: string | null
          pending_service_type: string | null
          pending_start_time: string | null
          phone: string | null
          postal_code: string | null
          preferred_appointment: string | null
          preferred_contact_method: string | null
          priority: string
          quote_sent_at: string | null
          referrer: string | null
          reschedule_confirmation_received: boolean
          reschedule_new_date: string | null
          reschedule_new_start_time: string | null
          reschedule_selection_pending: boolean
          reschedule_target_appointment_id: string | null
          score_factors: Json
          search_text: string | null
          source: string
          status: string
          tags: string[]
          temperature: string
          updated_at: string
          urgency: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          won_at: string | null
        }
        Insert: {
          address?: string | null
          appointment_reason?: string | null
          booking_confirmation_received?: boolean | null
          cancellation_selection_pending?: boolean
          company_id: string
          contacted_at?: string | null
          conversation_id?: string | null
          created_at?: string
          customer_id?: string | null
          customer_language?: string | null
          draft_appointment_date?: string | null
          draft_start_time?: string | null
          email?: string | null
          estimated_value_cents?: number | null
          follow_up_at?: string | null
          human_handoff_pending?: boolean
          human_handoff_reason?: string | null
          id?: string
          issue_description?: string | null
          issue_type?: string | null
          last_activity_at?: string
          lead_score?: number
          lost_at?: string | null
          lost_reason?: string | null
          name?: string | null
          page_url?: string | null
          pending_appointment_date?: string | null
          pending_service_type?: string | null
          pending_start_time?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_appointment?: string | null
          preferred_contact_method?: string | null
          priority?: string
          quote_sent_at?: string | null
          referrer?: string | null
          reschedule_confirmation_received?: boolean
          reschedule_new_date?: string | null
          reschedule_new_start_time?: string | null
          reschedule_selection_pending?: boolean
          reschedule_target_appointment_id?: string | null
          score_factors?: Json
          search_text?: string | null
          source?: string
          status?: string
          tags?: string[]
          temperature?: string
          updated_at?: string
          urgency?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          won_at?: string | null
        }
        Update: {
          address?: string | null
          appointment_reason?: string | null
          booking_confirmation_received?: boolean | null
          cancellation_selection_pending?: boolean
          company_id?: string
          contacted_at?: string | null
          conversation_id?: string | null
          created_at?: string
          customer_id?: string | null
          customer_language?: string | null
          draft_appointment_date?: string | null
          draft_start_time?: string | null
          email?: string | null
          estimated_value_cents?: number | null
          follow_up_at?: string | null
          human_handoff_pending?: boolean
          human_handoff_reason?: string | null
          id?: string
          issue_description?: string | null
          issue_type?: string | null
          last_activity_at?: string
          lead_score?: number
          lost_at?: string | null
          lost_reason?: string | null
          name?: string | null
          page_url?: string | null
          pending_appointment_date?: string | null
          pending_service_type?: string | null
          pending_start_time?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_appointment?: string | null
          preferred_contact_method?: string | null
          priority?: string
          quote_sent_at?: string | null
          referrer?: string | null
          reschedule_confirmation_received?: boolean
          reschedule_new_date?: string | null
          reschedule_new_start_time?: string | null
          reschedule_selection_pending?: boolean
          reschedule_target_appointment_id?: string | null
          score_factors?: Json
          search_text?: string | null
          source?: string
          status?: string
          tags?: string[]
          temperature?: string
          updated_at?: string
          urgency?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: true
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      message_feedback: {
        Row: {
          comment: string | null
          company_id: string
          conversation_id: string
          created_at: string
          id: string
          message_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          company_id: string
          conversation_id: string
          created_at?: string
          id?: string
          message_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          company_id?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "message_feedback_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: true
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          customer_visible_content: string | null
          id: string
          language: string | null
          role: string
          source_channel: string
          staff_translation: string | null
          translation_language: string | null
          translation_status: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          customer_visible_content?: string | null
          id?: string
          language?: string | null
          role: string
          source_channel?: string
          staff_translation?: string | null
          translation_language?: string | null
          translation_status?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          customer_visible_content?: string | null
          id?: string
          language?: string | null
          role?: string
          source_channel?: string
          staff_translation?: string | null
          translation_language?: string | null
          translation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          company_id: string
          created_at: string
          dedupe_key: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          company_id: string
          created_at?: string
          dedupe_key?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          company_id?: string
          created_at?: string
          dedupe_key?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_hours: {
        Row: {
          close_time: string | null
          company_id: string
          created_at: string
          day_of_week: number
          id: string
          is_open: boolean
          open_time: string | null
          updated_at: string
        }
        Insert: {
          close_time?: string | null
          company_id: string
          created_at?: string
          day_of_week: number
          id?: string
          is_open?: boolean
          open_time?: string | null
          updated_at?: string
        }
        Update: {
          close_time?: string | null
          company_id?: string
          created_at?: string
          day_of_week?: number
          id?: string
          is_open?: boolean
          open_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opening_hours_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      outbound_messages: {
        Row: {
          attempt_count: number
          body: string
          channel: string
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          entity_id: string | null
          entity_type: string | null
          failed_at: string | null
          failure_code: string | null
          failure_message: string | null
          id: string
          locale: string
          metadata: Json
          provider: string | null
          provider_message_id: string | null
          purpose: string
          queued_at: string | null
          recipient: string
          scheduled_at: string | null
          sending_at: string | null
          sent_at: string | null
          status: string
          subject: string | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          body: string
          channel: string
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          failed_at?: string | null
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          locale?: string
          metadata?: Json
          provider?: string | null
          provider_message_id?: string | null
          purpose?: string
          queued_at?: string | null
          recipient: string
          scheduled_at?: string | null
          sending_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          body?: string
          channel?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          failed_at?: string | null
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          locale?: string
          metadata?: Json
          provider?: string | null
          provider_message_id?: string | null
          purpose?: string
          queued_at?: string | null
          recipient?: string
          scheduled_at?: string | null
          sending_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outbound_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outbound_messages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outbound_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outbound_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "communication_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string | null
          full_name: string | null
          id: string
          preferences: Json
          role: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          preferences?: Json
          role?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          preferences?: Json
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          position: number
          quantity: number
          quote_id: string
          service_id: string | null
          tax_rate: number
          unit: string
          unit_price_cents: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          position?: number
          quantity?: number
          quote_id: string
          service_id?: string | null
          tax_rate?: number
          unit?: string
          unit_price_cents?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          position?: number
          quantity?: number
          quote_id?: string
          service_id?: string | null
          tax_rate?: number
          unit?: string
          unit_price_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          accepted_at: string | null
          address: string | null
          company_id: string
          created_at: string
          currency: string
          customer_id: string | null
          customer_name: string | null
          email: string | null
          id: string
          lead_id: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          quote_number: string
          rejected_at: string | null
          search_text: string | null
          sent_at: string | null
          status: string
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          accepted_at?: string | null
          address?: string | null
          company_id: string
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_name?: string | null
          email?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          quote_number: string
          rejected_at?: string | null
          search_text?: string | null
          sent_at?: string | null
          status?: string
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          accepted_at?: string | null
          address?: string | null
          company_id?: string
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_name?: string | null
          email?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          quote_number?: string
          rejected_at?: string | null
          search_text?: string | null
          sent_at?: string | null
          status?: string
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      service_areas: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          postal_codes: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          postal_codes?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          postal_codes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_areas_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      service_checklist_items: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_required: boolean
          label: string
          position: number
          service_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_required?: boolean
          label: string
          position?: number
          service_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_required?: boolean
          label?: string
          position?: number
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_checklist_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_checklist_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_contracts: {
        Row: {
          address: string | null
          company_id: string
          created_at: string
          customer_id: string | null
          customer_name: string | null
          email: string | null
          estimated_value_cents: number | null
          id: string
          interval_months: number
          last_completed_at: string | null
          lead_id: string | null
          next_due_date: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          reminder_days: number
          search_text: string | null
          service_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          email?: string | null
          estimated_value_cents?: number | null
          id?: string
          interval_months?: number
          last_completed_at?: string | null
          lead_id?: string | null
          next_due_date: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          reminder_days?: number
          search_text?: string | null
          service_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          email?: string | null
          estimated_value_cents?: number | null
          id?: string
          interval_months?: number
          last_completed_at?: string | null
          lead_id?: string | null
          next_due_date?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          reminder_days?: number
          search_text?: string | null
          service_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_contracts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_contracts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          booking_enabled: boolean
          company_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          price_from_cents: number | null
          price_note: string | null
          updated_at: string
        }
        Insert: {
          booking_enabled?: boolean
          company_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price_from_cents?: number | null
          price_note?: string | null
          updated_at?: string
        }
        Update: {
          booking_enabled?: boolean
          company_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_from_cents?: number | null
          price_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          appointment_id: string | null
          assigned_to: string | null
          company_id: string
          completed_at: string | null
          contract_id: string | null
          conversation_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          invoice_id: string | null
          job_id: string | null
          lead_id: string | null
          priority: string
          quote_id: string | null
          status: string
          task_type: string
          title: string
          updated_at: string
          voice_call_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          assigned_to?: string | null
          company_id: string
          completed_at?: string | null
          contract_id?: string | null
          conversation_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          lead_id?: string | null
          priority?: string
          quote_id?: string | null
          status?: string
          task_type?: string
          title: string
          updated_at?: string
          voice_call_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          assigned_to?: string | null
          company_id?: string
          completed_at?: string | null
          contract_id?: string | null
          conversation_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          lead_id?: string | null
          priority?: string
          quote_id?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
          voice_call_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "service_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_voice_call_id_fkey"
            columns: ["voice_call_id"]
            isOneToOne: false
            referencedRelation: "voice_calls"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_calls: {
        Row: {
          ai_agent_id: string | null
          ai_disclosed_at: string | null
          appointment_id: string | null
          called_number: string | null
          caller_number: string | null
          company_id: string
          conversation_id: string | null
          cost_micros: number | null
          created_at: string
          customer_id: string | null
          direction: string
          duration_seconds: number | null
          ended_at: string | null
          extracted_data: Json
          handoff_reason: string | null
          human_handoff_required: boolean
          id: string
          language: string | null
          lead_id: string | null
          outcome: string | null
          provider: string
          provider_call_id: string
          provider_latency_ms: number | null
          provider_metadata: Json
          recording_available: boolean
          recording_consent_at: string | null
          recording_consent_method: string | null
          recording_storage_path: string | null
          sentiment: string | null
          staff_summary: string | null
          started_at: string | null
          status: string
          summary: string | null
          transcript: Json | null
          transcript_consent_at: string | null
          transcript_text: string | null
          updated_at: string
        }
        Insert: {
          ai_agent_id?: string | null
          ai_disclosed_at?: string | null
          appointment_id?: string | null
          called_number?: string | null
          caller_number?: string | null
          company_id: string
          conversation_id?: string | null
          cost_micros?: number | null
          created_at?: string
          customer_id?: string | null
          direction?: string
          duration_seconds?: number | null
          ended_at?: string | null
          extracted_data?: Json
          handoff_reason?: string | null
          human_handoff_required?: boolean
          id?: string
          language?: string | null
          lead_id?: string | null
          outcome?: string | null
          provider?: string
          provider_call_id: string
          provider_latency_ms?: number | null
          provider_metadata?: Json
          recording_available?: boolean
          recording_consent_at?: string | null
          recording_consent_method?: string | null
          recording_storage_path?: string | null
          sentiment?: string | null
          staff_summary?: string | null
          started_at?: string | null
          status?: string
          summary?: string | null
          transcript?: Json | null
          transcript_consent_at?: string | null
          transcript_text?: string | null
          updated_at?: string
        }
        Update: {
          ai_agent_id?: string | null
          ai_disclosed_at?: string | null
          appointment_id?: string | null
          called_number?: string | null
          caller_number?: string | null
          company_id?: string
          conversation_id?: string | null
          cost_micros?: number | null
          created_at?: string
          customer_id?: string | null
          direction?: string
          duration_seconds?: number | null
          ended_at?: string | null
          extracted_data?: Json
          handoff_reason?: string | null
          human_handoff_required?: boolean
          id?: string
          language?: string | null
          lead_id?: string | null
          outcome?: string | null
          provider?: string
          provider_call_id?: string
          provider_latency_ms?: number | null
          provider_metadata?: Json
          recording_available?: boolean
          recording_consent_at?: string | null
          recording_consent_method?: string | null
          recording_storage_path?: string | null
          sentiment?: string | null
          staff_summary?: string | null
          started_at?: string | null
          status?: string
          summary?: string | null
          transcript?: Json | null
          transcript_consent_at?: string | null
          transcript_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_calls_ai_agent_id_fkey"
            columns: ["ai_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_calls_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_calls_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_calls_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_calls_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_settings: {
        Row: {
          after_hours_behavior: string
          ai_agent_id: string | null
          auto_detect_language: boolean
          call_recording_enabled: boolean
          company_id: string
          create_conversation_automatically: boolean
          create_lead_automatically: boolean
          created_at: string
          default_language: string
          disclose_ai: boolean
          disclosure_text: string
          enabled: boolean
          external_agent_id: string | null
          external_phone_number_id: string | null
          greeting: string | null
          human_transfer_number: string | null
          max_call_minutes: number
          phone_number: string | null
          provider: string
          require_recording_consent: boolean
          require_transcript_consent: boolean
          staff_summary_language: string
          store_transcript: boolean
          supported_languages: string[]
          transcript_enabled: boolean
          transcript_retention_days: number
          updated_at: string
        }
        Insert: {
          after_hours_behavior?: string
          ai_agent_id?: string | null
          auto_detect_language?: boolean
          call_recording_enabled?: boolean
          company_id: string
          create_conversation_automatically?: boolean
          create_lead_automatically?: boolean
          created_at?: string
          default_language?: string
          disclose_ai?: boolean
          disclosure_text?: string
          enabled?: boolean
          external_agent_id?: string | null
          external_phone_number_id?: string | null
          greeting?: string | null
          human_transfer_number?: string | null
          max_call_minutes?: number
          phone_number?: string | null
          provider?: string
          require_recording_consent?: boolean
          require_transcript_consent?: boolean
          staff_summary_language?: string
          store_transcript?: boolean
          supported_languages?: string[]
          transcript_enabled?: boolean
          transcript_retention_days?: number
          updated_at?: string
        }
        Update: {
          after_hours_behavior?: string
          ai_agent_id?: string | null
          auto_detect_language?: boolean
          call_recording_enabled?: boolean
          company_id?: string
          create_conversation_automatically?: boolean
          create_lead_automatically?: boolean
          created_at?: string
          default_language?: string
          disclose_ai?: boolean
          disclosure_text?: string
          enabled?: boolean
          external_agent_id?: string | null
          external_phone_number_id?: string | null
          greeting?: string | null
          human_transfer_number?: string | null
          max_call_minutes?: number
          phone_number?: string | null
          provider?: string
          require_recording_consent?: boolean
          require_transcript_consent?: boolean
          staff_summary_language?: string
          store_transcript?: boolean
          supported_languages?: string[]
          transcript_enabled?: boolean
          transcript_retention_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_settings_agent_company_fkey"
            columns: ["ai_agent_id", "company_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "voice_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_display_settings: {
        Row: {
          ai_agent_id: string
          company_id: string
          created_at: string
          enabled: boolean
          launcher_icon: string
          launcher_label: string
          mobile_fullscreen: boolean
          position: string
          primary_color: string
          public_widget_base_url: string | null
          show_branding: boolean
          updated_at: string
          z_index: number
        }
        Insert: {
          ai_agent_id: string
          company_id: string
          created_at?: string
          enabled?: boolean
          launcher_icon?: string
          launcher_label?: string
          mobile_fullscreen?: boolean
          position?: string
          primary_color?: string
          public_widget_base_url?: string | null
          show_branding?: boolean
          updated_at?: string
          z_index?: number
        }
        Update: {
          ai_agent_id?: string
          company_id?: string
          created_at?: string
          enabled?: boolean
          launcher_icon?: string
          launcher_label?: string
          mobile_fullscreen?: boolean
          position?: string
          primary_color?: string
          public_widget_base_url?: string | null
          show_branding?: boolean
          updated_at?: string
          z_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "widget_display_settings_ai_agent_id_fkey"
            columns: ["ai_agent_id"]
            isOneToOne: true
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "widget_display_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_installations: {
        Row: {
          ai_agent_id: string
          company_id: string
          created_at: string
          first_seen_at: string
          id: string
          last_seen_at: string
          last_user_agent: string | null
          loads_count: number
          origin: string
          platform: string
        }
        Insert: {
          ai_agent_id: string
          company_id: string
          created_at?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          last_user_agent?: string | null
          loads_count?: number
          origin: string
          platform?: string
        }
        Update: {
          ai_agent_id?: string
          company_id?: string
          created_at?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          last_user_agent?: string | null
          loads_count?: number
          origin?: string
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_installations_ai_agent_id_fkey"
            columns: ["ai_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "widget_installations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_security_settings: {
        Row: {
          ai_agent_id: string
          allowed_origins: string[]
          company_id: string
          created_at: string
          enabled: boolean
          hourly_request_limit: number
          max_message_length: number
          updated_at: string
        }
        Insert: {
          ai_agent_id: string
          allowed_origins?: string[]
          company_id: string
          created_at?: string
          enabled?: boolean
          hourly_request_limit?: number
          max_message_length?: number
          updated_at?: string
        }
        Update: {
          ai_agent_id?: string
          allowed_origins?: string[]
          company_id?: string
          created_at?: string
          enabled?: boolean
          hourly_request_limit?: number
          max_message_length?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_security_settings_ai_agent_id_fkey"
            columns: ["ai_agent_id"]
            isOneToOne: true
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "widget_security_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_errors: {
        Row: {
          company_id: string | null
          conversation_id: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          error_payload: Json | null
          id: string
          lead_id: string | null
          source: string
        }
        Insert: {
          company_id?: string | null
          conversation_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          error_payload?: Json | null
          id?: string
          lead_id?: string | null
          source: string
        }
        Update: {
          company_id?: string | null
          conversation_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          error_payload?: Json | null
          id?: string
          lead_id?: string | null
          source?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_company_invite: { Args: { p_token: string }; Returns: Json }
      add_to_waitlist_backend: {
        Args: {
          p_address?: string
          p_conversation_id: string
          p_customer_name?: string
          p_date_from: string
          p_date_to?: string
          p_email?: string
          p_lead_id: string
          p_notes?: string
          p_phone?: string
          p_postal_code?: string
          p_service_name: string
          p_time_from?: string
          p_time_to?: string
          p_widget_key: string
        }
        Returns: Json
      }
      cancel_appointment_atomic: {
        Args: { p_appointment_id: string; p_widget_key: string }
        Returns: Json
      }
      check_booking_slot: {
        Args: {
          p_date: string
          p_exclude_appointment_id?: string
          p_service_name: string
          p_start_time: string
          p_widget_key: string
        }
        Returns: Json
      }
      complete_company_onboarding: {
        Args: {
          company_address: string
          company_description: string
          company_email: string
          company_industry: string
          company_name: string
          company_phone: string
          opening_hours_data: Json
          service_areas_data: Json
          services_data: Json
        }
        Returns: string
      }
      complete_job: {
        Args: {
          p_final_value_cents?: number
          p_job_id: string
          p_note?: string
        }
        Returns: Json
      }
      complete_service_contract_cycle: {
        Args: { p_contract_id: string; p_next_due_date?: string }
        Returns: string
      }
      consume_widget_request: {
        Args: {
          p_client_hash: string
          p_message_length?: number
          p_origin?: string
          p_widget_key: string
        }
        Returns: Json
      }
      create_ai_agent_for_current_company: {
        Args: {
          agent_description?: string
          agent_fallback_message?: string
          agent_human_handoff_enabled?: boolean
          agent_language?: string
          agent_name: string
          agent_response_style?: string
          agent_welcome_message?: string
        }
        Returns: string
      }
      create_appointment_if_available: {
        Args: {
          p_address?: string
          p_conversation_id: string
          p_customer_name?: string
          p_date: string
          p_email?: string
          p_lead_id: string
          p_notes?: string
          p_phone?: string
          p_postal_code?: string
          p_service_name: string
          p_start_time: string
          p_widget_key: string
        }
        Returns: Json
      }
      create_company_and_profile: {
        Args: {
          company_address: string
          company_email: string
          company_industry: string
          company_name: string
          company_phone: string
        }
        Returns: string
      }
      create_company_invite: {
        Args: { p_email: string; p_expires_days?: number; p_role?: string }
        Returns: Json
      }
      create_feedback_link: {
        Args: {
          p_appointment_id?: string
          p_expires_days?: number
          p_job_id?: string
        }
        Returns: string
      }
      create_invoice_from_job: { Args: { p_job_id: string }; Returns: string }
      create_job_from_service_contract: {
        Args: {
          p_contract_id: string
          p_scheduled_date?: string
          p_start_time?: string
        }
        Returns: string
      }
      create_job_report: {
        Args: {
          p_customer_note?: string
          p_job_id: string
          p_work_summary?: string
        }
        Returns: string
      }
      finalize_assistant_delivery: {
        Args: {
          p_customer_content: string
          p_customer_language?: string
          p_message_id: string
          p_staff_translation?: string
        }
        Returns: boolean
      }
      get_acquisition_metrics: { Args: { p_days?: number }; Returns: Json }
      get_ai_performance_metrics: { Args: { p_days?: number }; Returns: Json }
      get_asset_metrics: { Args: never; Returns: Json }
      get_attention_queue: {
        Args: { p_limit?: number }
        Returns: {
          created_at: string
          due_at: string
          entity_id: string
          item_type: string
          priority: string
          route: string
          subtitle: string
          title: string
        }[]
      }
      get_available_slots: {
        Args: {
          p_date: string
          p_service_name: string
          p_step_minutes?: number
          p_widget_key: string
        }
        Returns: Json
      }
      get_business_overview: { Args: { p_days?: number }; Returns: Json }
      get_calendar_feed_status: { Args: never; Returns: Json }
      get_chat_quality_metrics: { Args: { p_days?: number }; Returns: Json }
      get_chatbot_context: { Args: { p_widget_key: string }; Returns: Json }
      get_communication_metrics: { Args: { p_days?: number }; Returns: Json }
      get_contract_metrics: { Args: never; Returns: Json }
      get_customer_360: { Args: { p_customer_key: string }; Returns: Json }
      get_customer_context_by_phone_backend: {
        Args: { p_company_id: string; p_phone: string }
        Returns: Json
      }
      get_customer_detail: { Args: { p_customer_key: string }; Returns: Json }
      get_customer_directory: {
        Args: { p_limit?: number; p_query?: string }
        Returns: {
          address: string
          appointment_count: number
          confirmed_appointment_count: number
          contract_count: number
          customer_key: string
          display_name: string
          email: string
          estimated_value_cents: number
          invoice_count: number
          job_count: number
          last_activity_at: string
          lead_count: number
          open_invoice_value_cents: number
          open_job_count: number
          open_lead_count: number
          phone: string
          postal_code: string
        }[]
      }
      get_customer_master: {
        Args: { p_limit?: number; p_query?: string }
        Returns: {
          address: string
          city: string
          created_at: string
          customer_number: string
          display_name: string
          email: string
          id: string
          last_activity_at: string
          phone: string
          postal_code: string
          preferred_language: string
          tags: string[]
        }[]
      }
      get_customer_master_metrics: { Args: never; Returns: Json }
      get_customer_voice_history: {
        Args: { p_customer_key: string; p_limit?: number }
        Returns: Json
      }
      get_dashboard_metrics: { Args: never; Returns: Json }
      get_dashboard_series: {
        Args: { p_days?: number }
        Returns: {
          appointments: number
          conversations: number
          day: string
          handoffs: number
          leads: number
          won_leads: number
        }[]
      }
      get_data_retention_preview: { Args: never; Returns: Json }
      get_feedback_metrics: { Args: { p_days?: number }; Returns: Json }
      get_field_service_metrics: { Args: { p_days?: number }; Returns: Json }
      get_integration_catalog: { Args: never; Returns: Json }
      get_integration_health: { Args: never; Returns: Json }
      get_integration_runtime_config_backend: {
        Args: { p_company_id: string; p_provider: string }
        Returns: Json
      }
      get_integrations_metrics: { Args: never; Returns: Json }
      get_integrations_overview: { Args: never; Returns: Json }
      get_invoice_metrics: { Args: never; Returns: Json }
      get_invoice_share_status: {
        Args: { p_invoice_id: string }
        Returns: Json
      }
      get_job_metrics: { Args: never; Returns: Json }
      get_job_profitability: { Args: { p_job_id: string }; Returns: Json }
      get_job_report_metrics: { Args: never; Returns: Json }
      get_job_time_summary: { Args: { p_job_id: string }; Returns: Json }
      get_knowledge_metrics: { Args: never; Returns: Json }
      get_language_metrics: { Args: { p_days?: number }; Returns: Json }
      get_my_work_queue: { Args: { p_days?: number }; Returns: Json }
      get_operations_metrics: { Args: never; Returns: Json }
      get_or_create_conversation: {
        Args: { p_conversation_id?: string; p_widget_key: string }
        Returns: string
      }
      get_pipeline_metrics: { Args: never; Returns: Json }
      get_profitability_metrics: { Args: { p_days?: number }; Returns: Json }
      get_quote_metrics: { Args: never; Returns: Json }
      get_quote_share_status: { Args: { p_quote_id: string }; Returns: Json }
      get_running_job_timer: { Args: never; Returns: Json }
      get_setup_health: { Args: never; Returns: Json }
      get_task_metrics: { Args: never; Returns: Json }
      get_team_members: {
        Args: never
        Returns: {
          email: string
          full_name: string
          is_current_user: boolean
          role: string
          user_id: string
        }[]
      }
      get_terminology_metrics: { Args: never; Returns: Json }
      get_top_leads: {
        Args: { p_limit?: number }
        Returns: {
          estimated_value_cents: number
          follow_up_at: string
          id: string
          issue_type: string
          last_activity_at: string
          lead_score: number
          name: string
          priority: string
          status: string
          temperature: string
        }[]
      }
      get_usage_metrics: { Args: never; Returns: Json }
      get_voice_booking_backend: {
        Args: { p_external_agent_id: string }
        Returns: Json
      }
      get_voice_company_by_agent_backend: {
        Args: { p_external_agent_id: string }
        Returns: Json
      }
      get_voice_metrics: { Args: { p_days?: number }; Returns: Json }
      get_waitlist_metrics: { Args: never; Returns: Json }
      get_widget_distribution_status: { Args: never; Returns: Json }
      get_widget_embed_info: { Args: { p_ai_agent_id?: string }; Returns: Json }
      get_widget_installation_metrics: { Args: never; Returns: Json }
      get_widget_public_config: {
        Args: { p_widget_key: string }
        Returns: Json
      }
      ingest_voice_call_result: {
        Args: {
          p_called_number?: string
          p_caller_number?: string
          p_duration_seconds?: number
          p_ended_at?: string
          p_external_agent_id: string
          p_extracted_data?: Json
          p_handoff_reason?: string
          p_human_handoff_required?: boolean
          p_language?: string
          p_outcome?: string
          p_provider_call_id: string
          p_provider_metadata?: Json
          p_sentiment?: string
          p_staff_summary?: string
          p_started_at?: string
          p_status?: string
          p_summary?: string
          p_transcript?: Json
          p_transcript_text?: string
        }
        Returns: Json
      }
      is_company_admin: { Args: { p_company_id: string }; Returns: boolean }
      queue_customer_message: {
        Args: {
          p_body: string
          p_channel: string
          p_customer_id: string
          p_entity_id?: string
          p_entity_type?: string
          p_locale?: string
          p_purpose?: string
          p_scheduled_at?: string
          p_subject: string
        }
        Returns: string
      }
      queue_integration_sync: {
        Args: {
          p_direction?: string
          p_entity_type?: string
          p_integration_id: string
        }
        Returns: string
      }
      record_invoice_payment: {
        Args: {
          p_amount_cents: number
          p_invoice_id: string
          p_method?: string
          p_note?: string
          p_paid_at?: string
          p_reference?: string
        }
        Returns: string
      }
      record_knowledge_gap: {
        Args: {
          p_conversation_id?: string
          p_question: string
          p_widget_key: string
        }
        Returns: Json
      }
      record_widget_installation: {
        Args: {
          p_origin: string
          p_platform?: string
          p_user_agent?: string
          p_widget_key: string
        }
        Returns: boolean
      }
      remove_company_member: { Args: { p_user_id: string }; Returns: undefined }
      reschedule_appointment_if_available: {
        Args: {
          p_appointment_id: string
          p_new_date: string
          p_new_start_time: string
          p_service_name?: string
          p_widget_key: string
        }
        Returns: Json
      }
      resolve_feedback_link: { Args: { p_token_hash: string }; Returns: Json }
      resolve_invoice_share: { Args: { p_token_hash: string }; Returns: Json }
      resolve_job_report_share: {
        Args: { p_token_hash: string }
        Returns: Json
      }
      resolve_quote_share: { Args: { p_token_hash: string }; Returns: Json }
      respond_job_report_share: {
        Args: {
          p_action: string
          p_customer_name?: string
          p_note?: string
          p_token_hash: string
        }
        Returns: Json
      }
      respond_quote_share: {
        Args: { p_action: string; p_token_hash: string }
        Returns: Json
      }
      revoke_invoice_share_token: {
        Args: { p_invoice_id: string }
        Returns: undefined
      }
      revoke_job_report_share_token: {
        Args: { p_report_id: string }
        Returns: boolean
      }
      revoke_quote_share_token: {
        Args: { p_quote_id: string }
        Returns: boolean
      }
      rotate_calendar_feed_token: { Args: never; Returns: string }
      rotate_invoice_share_token: {
        Args: { p_expires_days?: number; p_invoice_id: string }
        Returns: string
      }
      rotate_job_report_share_token: {
        Args: { p_expires_days?: number; p_report_id: string }
        Returns: string
      }
      rotate_quote_share_token: {
        Args: { p_expires_days?: number; p_quote_id: string }
        Returns: string
      }
      search_chatbot_knowledge: {
        Args: { p_limit?: number; p_query: string; p_widget_key: string }
        Returns: Json
      }
      search_chatbot_terminology: {
        Args: { p_limit?: number; p_query: string; p_widget_key: string }
        Returns: Json
      }
      search_workspace: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          created_at: string
          entity_id: string
          entity_type: string
          route: string
          subtitle: string
          title: string
        }[]
      }
      set_conversation_context: {
        Args: {
          p_conversation_id: string
          p_page_title?: string
          p_page_url?: string
          p_referrer?: string
          p_utm_campaign?: string
          p_utm_content?: string
          p_utm_medium?: string
          p_utm_source?: string
          p_utm_term?: string
          p_widget_key: string
        }
        Returns: boolean
      }
      set_integration_credentials: {
        Args: { p_credentials: Json; p_integration_id: string }
        Returns: boolean
      }
      set_team_member_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: undefined
      }
      start_job_timer: {
        Args: { p_job_id: string; p_note?: string }
        Returns: string
      }
      stop_job_timer: {
        Args: { p_job_id?: string; p_note?: string }
        Returns: Json
      }
      submit_chat_feedback: {
        Args: {
          p_comment?: string
          p_conversation_id: string
          p_message_id: string
          p_rating: number
          p_widget_key: string
        }
        Returns: Json
      }
      submit_feedback_link: {
        Args: {
          p_comment?: string
          p_consent_to_publish?: boolean
          p_customer_name?: string
          p_rating: number
          p_token_hash: string
        }
        Returns: Json
      }
      sync_job_checklist_from_services: {
        Args: { p_job_id: string }
        Returns: number
      }
      upsert_voice_lead_backend: {
        Args: {
          p_address?: string
          p_caller_number?: string
          p_email?: string
          p_external_agent_id: string
          p_issue_description?: string
          p_issue_type?: string
          p_name?: string
          p_phone?: string
          p_postal_code?: string
          p_preferred_contact_method?: string
          p_provider_call_id: string
          p_urgency?: string
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
