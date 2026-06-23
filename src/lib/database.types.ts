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
  api: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      crm_account_list: {
        Row: {
          account_owner_profile_id: string | null
          chain_type: string | null
          company_type: string | null
          customer_status: string | null
          domain: string | null
          id: string | null
          name: string | null
          primary_salesperson_profile_id: string | null
          routing_aliases: string | null
          so_patterns: string | null
          status: Database["app"]["Enums"]["entity_status"] | null
          updated_at: string | null
        }
        Insert: {
          account_owner_profile_id?: string | null
          chain_type?: string | null
          company_type?: string | null
          customer_status?: string | null
          domain?: string | null
          id?: string | null
          name?: string | null
          primary_salesperson_profile_id?: string | null
          routing_aliases?: string | null
          so_patterns?: string | null
          status?: Database["app"]["Enums"]["entity_status"] | null
          updated_at?: string | null
        }
        Update: {
          account_owner_profile_id?: string | null
          chain_type?: string | null
          company_type?: string | null
          customer_status?: string | null
          domain?: string | null
          id?: string | null
          name?: string | null
          primary_salesperson_profile_id?: string | null
          routing_aliases?: string | null
          so_patterns?: string | null
          status?: Database["app"]["Enums"]["entity_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      crm_account_overview: {
        Row: {
          company_id: string | null
          company_name: string | null
          company_status: Database["app"]["Enums"]["entity_status"] | null
          contact_count: number | null
          department_count: number | null
          latest_opportunity_at: string | null
          opportunity_count: number | null
          production_order_count: number | null
          project_count: number | null
        }
        Relationships: []
      }
      crm_ai_model_config_list: {
        Row: {
          email_routing_model: string | null
          fireflies_routing_model: string | null
          id: string | null
          name: string | null
          opportunity_summary_model: string | null
          transcript_split_model: string | null
          updated_at: string | null
        }
        Insert: {
          email_routing_model?: string | null
          fireflies_routing_model?: string | null
          id?: string | null
          name?: string | null
          opportunity_summary_model?: string | null
          transcript_split_model?: string | null
          updated_at?: string | null
        }
        Update: {
          email_routing_model?: string | null
          fireflies_routing_model?: string | null
          id?: string | null
          name?: string | null
          opportunity_summary_model?: string | null
          transcript_split_model?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      crm_approval_queue: {
        Row: {
          due_date: string | null
          id: string | null
          licensor_comments: string | null
          name: string | null
          opportunity_id: string | null
          opportunity_name: string | null
          opportunity_stage: string | null
          property_name: string | null
          response_date: string | null
          stage: string | null
          submitted_date: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licensor_approval_thread_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_opportunity_list"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contact_list: {
        Row: {
          company_customer_status: string | null
          company_id: string | null
          company_name: string | null
          contact_type: string | null
          department_id: string | null
          department_name: string | null
          email: string | null
          first_name: string | null
          id: string | null
          job_title: string | null
          last_name: string | null
          name: string | null
          phone: string | null
          scope: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "contact_company_crm_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "crm_department_list"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_department_list: {
        Row: {
          active: boolean | null
          category: string | null
          company_id: string | null
          company_name: string | null
          division: string | null
          id: string | null
          name: string | null
          primary_contact_email: string | null
          primary_contact_id: string | null
          primary_contact_name: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "department_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "department_primary_contact_id_fkey"
            columns: ["primary_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_list"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_email_routing_queue: {
        Row: {
          body_preview: string | null
          company_id: string | null
          company_name: string | null
          department_id: string | null
          department_name: string | null
          detected_po_numbers: string | null
          detected_so_numbers: string | null
          id: string | null
          opportunity_id: string | null
          opportunity_name: string | null
          opportunity_stage: string | null
          received_at: string | null
          recipients: string | null
          routing_method: string | null
          routing_status: string | null
          sender: string | null
          subject: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_message_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_message_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "email_message_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "crm_department_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_message_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_opportunity_list"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_ignore_rule_list: {
        Row: {
          created_at: string | null
          emails_skipped: number | null
          id: string | null
          match_type: string | null
          name: string | null
          pattern: string | null
        }
        Insert: {
          created_at?: string | null
          emails_skipped?: number | null
          id?: string | null
          match_type?: string | null
          name?: string | null
          pattern?: string | null
        }
        Update: {
          created_at?: string | null
          emails_skipped?: number | null
          id?: string | null
          match_type?: string | null
          name?: string | null
          pattern?: string | null
        }
        Relationships: []
      }
      crm_meeting_list: {
        Row: {
          action_items: string | null
          company_customer_status: string | null
          company_id: string | null
          company_name: string | null
          contact_email: string | null
          contact_id: string | null
          contact_name: string | null
          date: string | null
          department_id: string | null
          department_name: string | null
          fireflies_transcript_id: string | null
          id: string | null
          name: string | null
          participants: string | null
          source: string | null
          summary: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_note_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_note_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "meeting_note_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_note_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "crm_department_list"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_note_list: {
        Row: {
          action_items: string | null
          body: string | null
          company_id: string | null
          company_name: string | null
          contact_email: string | null
          contact_id: string | null
          contact_name: string | null
          created_at: string | null
          department_id: string | null
          department_name: string | null
          fireflies_transcript_id: string | null
          id: string | null
          opportunity_id: string | null
          opportunity_name: string | null
          opportunity_stage: string | null
          source: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "note_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "note_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "crm_department_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_opportunity_list"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_opportunity_list: {
        Row: {
          ai_state: string | null
          ai_summary: string | null
          amount: number | null
          close_date: string | null
          company_customer_status: string | null
          company_id: string | null
          company_name: string | null
          contact_email: string | null
          contact_id: string | null
          contact_name: string | null
          department_id: string | null
          department_name: string | null
          division: string | null
          factory_id: string | null
          factory_name: string | null
          hard_delivery_date: string | null
          id: string | null
          name: string | null
          owner_profile_id: string | null
          production_po_number: string | null
          program_type: string | null
          project_id: string | null
          project_title: string | null
          sales_order_number: string | null
          season_year: string | null
          stage: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "opportunity_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "crm_department_list"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_task_list: {
        Row: {
          assignee_email: string | null
          assignee_name: string | null
          assignee_profile_id: string | null
          body: string | null
          company_id: string | null
          company_name: string | null
          contact_email: string | null
          contact_id: string | null
          contact_name: string | null
          created_at: string | null
          department_id: string | null
          department_name: string | null
          due_at: string | null
          id: string | null
          opportunity_id: string | null
          opportunity_name: string | null
          opportunity_stage: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "task_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "crm_department_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_opportunity_list"
            referencedColumns: ["id"]
          },
        ]
      }
      dam_asset_library: {
        Row: {
          asset_type: string | null
          company_name: string | null
          file_type: string | null
          filename: string | null
          id: string | null
          licensor_name: string | null
          product_subtype_name: string | null
          property_name: string | null
          relative_path: string | null
          sku: string | null
          style_group_id: string | null
          style_group_sku: string | null
          style_group_title: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          workflow_status: string | null
        }
        Relationships: []
      }
      global_search: {
        Row: {
          entity_type: string | null
          id: string | null
          source_table: string | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      plm_item_status: {
        Row: {
          company_name: string | null
          item_id: string | null
          item_number: string | null
          item_status: string | null
          licensing_milestone: string | null
          licensing_status: string | null
          licensor_name: string | null
          name: string | null
          production_order_line_id: string | null
          production_order_number: string | null
          production_status: string | null
          property_name: string | null
          quantity_ordered: number | null
          quantity_shipped: number | null
          style_number: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      pm_product_assets: {
        Row: {
          asset_id: string | null
          asset_title: string | null
          design_id: string | null
          design_title: string | null
          filename: string | null
          link_confidence: Database["app"]["Enums"]["source_confidence"] | null
          product_code: string | null
          product_id: string | null
          product_name: string | null
          relative_path: string | null
          style_group_id: string | null
          style_group_sku: string | null
          style_group_title: string | null
          thumbnail_url: string | null
        }
        Relationships: []
      }
      pm_product_board: {
        Row: {
          buyer_contact_id: string | null
          buyer_name: string | null
          clickup_task_id: string | null
          code: string | null
          company_id: string | null
          company_name: string | null
          cover_url: string | null
          factory_id: string | null
          factory_name: string | null
          id: string | null
          licensor_id: string | null
          licensor_name: string | null
          lifecycle_status: string | null
          name: string | null
          plm_item_id: string | null
          plm_item_number: string | null
          product_type_id: string | null
          product_type_name: string | null
          project_id: string | null
          project_title: string | null
          property_id: string | null
          property_name: string | null
          stage: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      crm_set_opportunity_stage: {
        Args: { p_opportunity_id: string; p_stage: string }
        Returns: Database["crm"]["Tables"]["opportunity"]["Row"]
        SetofOptions: {
          from: "*"
          to: "opportunity"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      crm_update_account: {
        Args: {
          p_chain_type?: string
          p_company_id: string
          p_customer_status?: string
          p_domain?: string
          p_name?: string
          p_routing_aliases?: string
          p_so_patterns?: string
        }
        Returns: Database["core"]["Tables"]["company"]["Row"]
        SetofOptions: {
          from: "*"
          to: "company"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      crm_update_contact: {
        Args: {
          p_company_id?: string
          p_contact_id: string
          p_contact_type?: string
          p_crm_department_id?: string
          p_email?: string
          p_first_name?: string
          p_full_name?: string
          p_job_title?: string
          p_last_name?: string
          p_phone?: string
          p_scope?: string
        }
        Returns: Database["core"]["Tables"]["contact"]["Row"]
        SetofOptions: {
          from: "*"
          to: "contact"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_user_profile: { Args: never; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  app: {
    Tables: {
      activity: {
        Row: {
          action: string
          actor_profile_id: string | null
          created_at: string
          id: string
          payload: Json
          source_id: string | null
          source_system: string | null
          summary: string | null
          target_id: string
          target_schema: string
          target_table: string
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          source_id?: string | null
          source_system?: string | null
          summary?: string | null
          target_id: string
          target_schema: string
          target_table: string
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          source_id?: string | null
          source_system?: string | null
          summary?: string | null
          target_id?: string
          target_schema?: string
          target_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      app_access: {
        Row: {
          app: Database["app"]["Enums"]["app_name"]
          granted_at: string
          granted_by_profile_id: string | null
          id: string
          profile_id: string
          revoked_at: string | null
        }
        Insert: {
          app: Database["app"]["Enums"]["app_name"]
          granted_at?: string
          granted_by_profile_id?: string | null
          id?: string
          profile_id: string
          revoked_at?: string | null
        }
        Update: {
          app?: Database["app"]["Enums"]["app_name"]
          granted_at?: string
          granted_by_profile_id?: string | null
          id?: string
          profile_id?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_access_granted_by_profile_id_fkey"
            columns: ["granted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_access_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      comment: {
        Row: {
          body: string
          created_at: string
          created_by_profile_id: string | null
          id: string
          metadata: Json
          source_id: string | null
          source_system: string | null
          target_id: string
          target_schema: string
          target_table: string
          updated_at: string
          visibility: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by_profile_id?: string | null
          id?: string
          metadata?: Json
          source_id?: string | null
          source_system?: string | null
          target_id: string
          target_schema: string
          target_table: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by_profile_id?: string | null
          id?: string
          metadata?: Json
          source_id?: string | null
          source_system?: string | null
          target_id?: string
          target_schema?: string
          target_table?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      file_object: {
        Row: {
          bucket: string | null
          byte_size: number | null
          checksum: string | null
          created_at: string
          created_by_profile_id: string | null
          filename: string | null
          id: string
          metadata: Json
          mime_type: string | null
          object_key: string | null
          source_id: string | null
          source_system: string | null
          source_table: string | null
          storage_provider: Database["app"]["Enums"]["file_storage_provider"]
          thumbnail_url: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          bucket?: string | null
          byte_size?: number | null
          checksum?: string | null
          created_at?: string
          created_by_profile_id?: string | null
          filename?: string | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          object_key?: string | null
          source_id?: string | null
          source_system?: string | null
          source_table?: string | null
          storage_provider?: Database["app"]["Enums"]["file_storage_provider"]
          thumbnail_url?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          bucket?: string | null
          byte_size?: number | null
          checksum?: string | null
          created_at?: string
          created_by_profile_id?: string | null
          filename?: string | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          object_key?: string | null
          source_id?: string | null
          source_system?: string | null
          source_table?: string | null
          storage_provider?: Database["app"]["Enums"]["file_storage_provider"]
          thumbnail_url?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_object_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      notification: {
        Row: {
          app: Database["app"]["Enums"]["app_name"]
          body: string | null
          created_at: string
          id: string
          payload: Json
          profile_id: string
          read_at: string | null
          target_id: string | null
          target_schema: string | null
          target_table: string | null
          title: string
        }
        Insert: {
          app: Database["app"]["Enums"]["app_name"]
          body?: string | null
          created_at?: string
          id?: string
          payload?: Json
          profile_id: string
          read_at?: string | null
          target_id?: string | null
          target_schema?: string | null
          target_table?: string | null
          title: string
        }
        Update: {
          app?: Database["app"]["Enums"]["app_name"]
          body?: string | null
          created_at?: string
          id?: string
          payload?: Json
          profile_id?: string
          read_at?: string | null
          target_id?: string | null
          target_schema?: string | null
          target_table?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          external_identifier: string | null
          id: string
          provider: string | null
          source_refs: Json
          status: Database["app"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          external_identifier?: string | null
          id?: string
          provider?: string | null
          source_refs?: Json
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          external_identifier?: string | null
          id?: string
          provider?: string | null
          source_refs?: Json
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      role: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: Database["app"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: Database["app"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: Database["app"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      user_role: {
        Row: {
          granted_at: string
          granted_by_profile_id: string | null
          id: string
          profile_id: string
          revoked_at: string | null
          role_id: string
        }
        Insert: {
          granted_at?: string
          granted_by_profile_id?: string | null
          id?: string
          profile_id: string
          revoked_at?: string | null
          role_id: string
        }
        Update: {
          granted_at?: string
          granted_by_profile_id?: string | null
          id?: string
          profile_id?: string
          revoked_at?: string | null
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_granted_by_profile_id_fkey"
            columns: ["granted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "role"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_profile_id: { Args: never; Returns: string }
      has_any_role: {
        Args: { required_roles: Database["app"]["Enums"]["app_role"][] }
        Returns: boolean
      }
      has_app_access: {
        Args: { required_app: Database["app"]["Enums"]["app_name"] }
        Returns: boolean
      }
      has_role: {
        Args: { required_role: Database["app"]["Enums"]["app_role"] }
        Returns: boolean
      }
      jwt_role_names: { Args: never; Returns: string[] }
    }
    Enums: {
      app_name: "dam" | "crm" | "pm" | "plm" | "admin"
      app_role:
        | "administrator"
        | "sales"
        | "licensing"
        | "designer"
        | "viewer"
        | "vendor"
      entity_status: "active" | "inactive" | "archived" | "deleted"
      file_storage_provider:
        | "supabase"
        | "spaces"
        | "legacy_external"
        | "external"
        | "local"
      source_confidence:
        | "verified"
        | "probable"
        | "possible"
        | "unmatched"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  core: {
    Tables: {
      character: {
        Row: {
          code: string | null
          created_at: string
          id: string
          metadata: Json
          name: string
          property_id: string | null
          status: Database["app"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          property_id?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          property_id?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
        ]
      }
      company: {
        Row: {
          account_owner_profile_id: string | null
          address: Json
          chain_type: string | null
          company_type: string
          created_at: string
          customer_status: string | null
          domain: string | null
          id: string
          legal_name: string | null
          metadata: Json
          name: string
          normalized_name: string | null
          phone: string | null
          primary_salesperson_profile_id: string | null
          routing_aliases: string | null
          so_patterns: string | null
          status: Database["app"]["Enums"]["entity_status"]
          updated_at: string
          website: string | null
        }
        Insert: {
          account_owner_profile_id?: string | null
          address?: Json
          chain_type?: string | null
          company_type?: string
          created_at?: string
          customer_status?: string | null
          domain?: string | null
          id?: string
          legal_name?: string | null
          metadata?: Json
          name: string
          normalized_name?: string | null
          phone?: string | null
          primary_salesperson_profile_id?: string | null
          routing_aliases?: string | null
          so_patterns?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          account_owner_profile_id?: string | null
          address?: Json
          chain_type?: string | null
          company_type?: string
          created_at?: string
          customer_status?: string | null
          domain?: string | null
          id?: string
          legal_name?: string | null
          metadata?: Json
          name?: string
          normalized_name?: string | null
          phone?: string | null
          primary_salesperson_profile_id?: string | null
          routing_aliases?: string | null
          so_patterns?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_source_ref: {
        Row: {
          company_id: string
          confidence: Database["app"]["Enums"]["source_confidence"]
          created_at: string
          id: string
          raw: Json
          source_code: string | null
          source_id: string
          source_name: string | null
          source_system: string
          source_table: string
        }
        Insert: {
          company_id: string
          confidence?: Database["app"]["Enums"]["source_confidence"]
          created_at?: string
          id?: string
          raw?: Json
          source_code?: string | null
          source_id: string
          source_name?: string | null
          source_system: string
          source_table: string
        }
        Update: {
          company_id?: string
          confidence?: Database["app"]["Enums"]["source_confidence"]
          created_at?: string
          id?: string
          raw?: Json
          source_code?: string | null
          source_id?: string
          source_name?: string | null
          source_system?: string
          source_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_source_ref_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      contact: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          metadata: Json
          phone: string | null
          status: Database["app"]["Enums"]["entity_status"]
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json
          phone?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json
          phone?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_company: {
        Row: {
          company_id: string
          contact_id: string
          contact_type: string | null
          crm_department_id: string | null
          ended_at: string | null
          id: string
          is_primary: boolean
          metadata: Json
          relationship_type: string
          scope: string | null
          started_at: string | null
          title: string | null
        }
        Insert: {
          company_id: string
          contact_id: string
          contact_type?: string | null
          crm_department_id?: string | null
          ended_at?: string | null
          id?: string
          is_primary?: boolean
          metadata?: Json
          relationship_type?: string
          scope?: string | null
          started_at?: string | null
          title?: string | null
        }
        Update: {
          company_id?: string
          contact_id?: string
          contact_type?: string | null
          crm_department_id?: string | null
          ended_at?: string | null
          id?: string
          is_primary?: boolean
          metadata?: Json
          relationship_type?: string
          scope?: string | null
          started_at?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_company_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_source_ref: {
        Row: {
          confidence: Database["app"]["Enums"]["source_confidence"]
          contact_id: string
          created_at: string
          id: string
          raw: Json
          source_email: string | null
          source_id: string
          source_system: string
          source_table: string
        }
        Insert: {
          confidence?: Database["app"]["Enums"]["source_confidence"]
          contact_id: string
          created_at?: string
          id?: string
          raw?: Json
          source_email?: string | null
          source_id: string
          source_system: string
          source_table: string
        }
        Update: {
          confidence?: Database["app"]["Enums"]["source_confidence"]
          contact_id?: string
          created_at?: string
          id?: string
          raw?: Json
          source_email?: string | null
          source_id?: string
          source_system?: string
          source_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_source_ref_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
        ]
      }
      factory: {
        Row: {
          code: string | null
          company_id: string | null
          country: string | null
          created_at: string
          id: string
          metadata: Json
          name: string
          status: Database["app"]["Enums"]["entity_status"]
          updated_at: string
          vendor_group: string | null
        }
        Insert: {
          code?: string | null
          company_id?: string | null
          country?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
          vendor_group?: string | null
        }
        Update: {
          code?: string | null
          company_id?: string | null
          country?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
          vendor_group?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "factory_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      factory_source_ref: {
        Row: {
          confidence: Database["app"]["Enums"]["source_confidence"]
          created_at: string
          factory_id: string
          id: string
          raw: Json
          source_code: string | null
          source_id: string
          source_system: string
          source_table: string
        }
        Insert: {
          confidence?: Database["app"]["Enums"]["source_confidence"]
          created_at?: string
          factory_id: string
          id?: string
          raw?: Json
          source_code?: string | null
          source_id: string
          source_system: string
          source_table: string
        }
        Update: {
          confidence?: Database["app"]["Enums"]["source_confidence"]
          created_at?: string
          factory_id?: string
          id?: string
          raw?: Json
          source_code?: string | null
          source_id?: string
          source_system?: string
          source_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "factory_source_ref_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factory"
            referencedColumns: ["id"]
          },
        ]
      }
      licensor: {
        Row: {
          code: string | null
          created_at: string
          id: string
          metadata: Json
          name: string
          status: Database["app"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      merch_group: {
        Row: {
          code: string | null
          created_at: string
          id: string
          level: number
          metadata: Json
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          level?: number
          metadata?: Json
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          level?: number
          metadata?: Json
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merch_group_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "merch_group"
            referencedColumns: ["id"]
          },
        ]
      }
      product_category: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_category_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_category"
            referencedColumns: ["id"]
          },
        ]
      }
      product_subtype: {
        Row: {
          code: string | null
          created_at: string
          id: string
          metadata: Json
          name: string
          product_type_id: string | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          product_type_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          product_type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_subtype_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_type"
            referencedColumns: ["id"]
          },
        ]
      }
      product_type: {
        Row: {
          category_id: string | null
          code: string | null
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_type_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_category"
            referencedColumns: ["id"]
          },
        ]
      }
      property: {
        Row: {
          code: string | null
          created_at: string
          id: string
          licensor_id: string | null
          metadata: Json
          name: string
          status: Database["app"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          licensor_id?: string | null
          metadata?: Json
          name: string
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          licensor_id?: string | null
          metadata?: Json
          name?: string
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_licensor_id_fkey"
            columns: ["licensor_id"]
            isOneToOne: false
            referencedRelation: "licensor"
            referencedColumns: ["id"]
          },
        ]
      }
      sku_ref: {
        Row: {
          confidence: Database["app"]["Enums"]["source_confidence"]
          created_at: string
          entity_id: string
          entity_schema: string
          entity_table: string
          id: string
          normalized_sku: string | null
          raw: Json
          sku: string
          source_id: string | null
          source_system: string | null
          source_table: string | null
        }
        Insert: {
          confidence?: Database["app"]["Enums"]["source_confidence"]
          created_at?: string
          entity_id: string
          entity_schema: string
          entity_table: string
          id?: string
          normalized_sku?: string | null
          raw?: Json
          sku: string
          source_id?: string | null
          source_system?: string | null
          source_table?: string | null
        }
        Update: {
          confidence?: Database["app"]["Enums"]["source_confidence"]
          created_at?: string
          entity_id?: string
          entity_schema?: string
          entity_table?: string
          id?: string
          normalized_sku?: string | null
          raw?: Json
          sku?: string
          source_id?: string | null
          source_system?: string | null
          source_table?: string | null
        }
        Relationships: []
      }
      taxonomy_source_ref: {
        Row: {
          confidence: Database["app"]["Enums"]["source_confidence"]
          created_at: string
          entity_id: string
          entity_schema: string
          entity_table: string
          id: string
          raw: Json
          source_code: string | null
          source_id: string
          source_name: string | null
          source_system: string
          source_table: string
        }
        Insert: {
          confidence?: Database["app"]["Enums"]["source_confidence"]
          created_at?: string
          entity_id: string
          entity_schema?: string
          entity_table: string
          id?: string
          raw?: Json
          source_code?: string | null
          source_id: string
          source_name?: string | null
          source_system: string
          source_table: string
        }
        Update: {
          confidence?: Database["app"]["Enums"]["source_confidence"]
          created_at?: string
          entity_id?: string
          entity_schema?: string
          entity_table?: string
          id?: string
          raw?: Json
          source_code?: string | null
          source_id?: string
          source_name?: string | null
          source_system?: string
          source_table?: string
        }
        Relationships: []
      }
      vendor_contact: {
        Row: {
          contact_id: string | null
          factory_id: string | null
          id: string
          is_primary: boolean
          metadata: Json
          role: string | null
        }
        Insert: {
          contact_id?: string | null
          factory_id?: string | null
          id?: string
          is_primary?: boolean
          metadata?: Json
          role?: string | null
        }
        Update: {
          contact_id?: string | null
          factory_id?: string | null
          id?: string
          is_primary?: boolean
          metadata?: Json
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contact_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contact_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factory"
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
  crm: {
    Tables: {
      ai_model_config: {
        Row: {
          config: Json
          email_routing_model: string | null
          feature: string | null
          fireflies_routing_model: string | null
          id: string
          model: string | null
          name: string | null
          opportunity_summary_model: string | null
          provider: string | null
          transcript_split_model: string | null
          updated_at: string
          updated_by_profile_id: string | null
        }
        Insert: {
          config?: Json
          email_routing_model?: string | null
          feature?: string | null
          fireflies_routing_model?: string | null
          id?: string
          model?: string | null
          name?: string | null
          opportunity_summary_model?: string | null
          provider?: string | null
          transcript_split_model?: string | null
          updated_at?: string
          updated_by_profile_id?: string | null
        }
        Update: {
          config?: Json
          email_routing_model?: string | null
          feature?: string | null
          fireflies_routing_model?: string | null
          id?: string
          model?: string | null
          name?: string | null
          opportunity_summary_model?: string | null
          provider?: string | null
          transcript_split_model?: string | null
          updated_at?: string
          updated_by_profile_id?: string | null
        }
        Relationships: []
      }
      department: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          division: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
          primary_contact_id: string | null
          sort_order: number | null
          status: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          division?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          primary_contact_id?: string | null
          sort_order?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          division?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          primary_contact_id?: string | null
          sort_order?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_message: {
        Row: {
          body_preview: string | null
          body_storage_ref: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          department_id: string | null
          detected_po_numbers: string | null
          detected_so_numbers: string | null
          direction: string | null
          external_id: string | null
          external_source: string | null
          id: string
          mailbox_owner_profile_id: string | null
          metadata: Json
          opportunity_id: string | null
          outlook_message_id: string | null
          received_at: string | null
          recipients: string | null
          routing_method: string | null
          routing_status: string | null
          sender: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          body_preview?: string | null
          body_storage_ref?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          department_id?: string | null
          detected_po_numbers?: string | null
          detected_so_numbers?: string | null
          direction?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          mailbox_owner_profile_id?: string | null
          metadata?: Json
          opportunity_id?: string | null
          outlook_message_id?: string | null
          received_at?: string | null
          recipients?: string | null
          routing_method?: string | null
          routing_status?: string | null
          sender?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          body_preview?: string | null
          body_storage_ref?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          department_id?: string | null
          detected_po_numbers?: string | null
          detected_so_numbers?: string | null
          direction?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          mailbox_owner_profile_id?: string | null
          metadata?: Json
          opportunity_id?: string | null
          outlook_message_id?: string | null
          received_at?: string | null
          recipients?: string | null
          routing_method?: string | null
          routing_status?: string | null
          sender?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_message_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_message_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunity"
            referencedColumns: ["id"]
          },
        ]
      }
      ignore_rule: {
        Row: {
          created_at: string
          created_by_profile_id: string | null
          emails_skipped: number
          id: string
          match_type: string | null
          name: string | null
          pattern: string
          reason: string | null
          rule_type: string
        }
        Insert: {
          created_at?: string
          created_by_profile_id?: string | null
          emails_skipped?: number
          id?: string
          match_type?: string | null
          name?: string | null
          pattern: string
          reason?: string | null
          rule_type?: string
        }
        Update: {
          created_at?: string
          created_by_profile_id?: string | null
          emails_skipped?: number
          id?: string
          match_type?: string | null
          name?: string | null
          pattern?: string
          reason?: string | null
          rule_type?: string
        }
        Relationships: []
      }
      licensor_approval_thread: {
        Row: {
          company_id: string | null
          created_at: string
          due_date: string | null
          external_id: string | null
          external_source: string | null
          id: string
          licensor_comments: string | null
          licensor_id: string | null
          metadata: Json
          name: string | null
          opportunity_id: string | null
          product_submission_id: string | null
          property_id: string | null
          property_name: string | null
          response_date: string | null
          revision_request_id: string | null
          stage: string | null
          status: string | null
          subject: string | null
          submitted_date: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          due_date?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          licensor_comments?: string | null
          licensor_id?: string | null
          metadata?: Json
          name?: string | null
          opportunity_id?: string | null
          product_submission_id?: string | null
          property_id?: string | null
          property_name?: string | null
          response_date?: string | null
          revision_request_id?: string | null
          stage?: string | null
          status?: string | null
          subject?: string | null
          submitted_date?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          due_date?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          licensor_comments?: string | null
          licensor_id?: string | null
          metadata?: Json
          name?: string | null
          opportunity_id?: string | null
          product_submission_id?: string | null
          property_id?: string | null
          property_name?: string | null
          response_date?: string | null
          revision_request_id?: string | null
          stage?: string | null
          status?: string | null
          subject?: string | null
          submitted_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "licensor_approval_thread_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunity"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_note: {
        Row: {
          action_items: string | null
          body: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by_profile_id: string | null
          department_id: string | null
          external_id: string | null
          external_source: string | null
          fireflies_transcript_id: string | null
          id: string
          meeting_at: string | null
          metadata: Json
          opportunity_id: string | null
          participants: string | null
          source: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          action_items?: string | null
          body?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by_profile_id?: string | null
          department_id?: string | null
          external_id?: string | null
          external_source?: string | null
          fireflies_transcript_id?: string | null
          id?: string
          meeting_at?: string | null
          metadata?: Json
          opportunity_id?: string | null
          participants?: string | null
          source?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          action_items?: string | null
          body?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by_profile_id?: string | null
          department_id?: string | null
          external_id?: string | null
          external_source?: string | null
          fireflies_transcript_id?: string | null
          id?: string
          meeting_at?: string | null
          metadata?: Json
          opportunity_id?: string | null
          participants?: string | null
          source?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_note_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_note_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunity"
            referencedColumns: ["id"]
          },
        ]
      }
      note: {
        Row: {
          action_items: string | null
          body: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by_profile_id: string | null
          department_id: string | null
          fireflies_transcript_id: string | null
          id: string
          opportunity_id: string | null
          source: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          action_items?: string | null
          body?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by_profile_id?: string | null
          department_id?: string | null
          fireflies_transcript_id?: string | null
          id?: string
          opportunity_id?: string | null
          source?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          action_items?: string | null
          body?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by_profile_id?: string | null
          department_id?: string | null
          fireflies_transcript_id?: string | null
          id?: string
          opportunity_id?: string | null
          source?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunity"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity: {
        Row: {
          ai_state: string | null
          ai_summary: string | null
          close_date: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          customer_incoterms: string | null
          department_id: string | null
          directive_source: string | null
          division: string | null
          estimated_value: number | null
          external_id: string | null
          external_source: string | null
          factory_id: string | null
          factory_incoterms: string | null
          hard_delivery_date: string | null
          id: string
          import_po_number: string | null
          licensed: boolean | null
          metadata: Json
          name: string
          origin_country: string | null
          owner_profile_id: string | null
          probability: number | null
          production_order_id: string | null
          production_po_number: string | null
          program_type: string | null
          project_id: string | null
          requires_new_pricing: boolean | null
          sales_order_number: string | null
          sample_approval_method: string | null
          sample_required: boolean | null
          season_year: string | null
          stage: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          ai_state?: string | null
          ai_summary?: string | null
          close_date?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          customer_incoterms?: string | null
          department_id?: string | null
          directive_source?: string | null
          division?: string | null
          estimated_value?: number | null
          external_id?: string | null
          external_source?: string | null
          factory_id?: string | null
          factory_incoterms?: string | null
          hard_delivery_date?: string | null
          id?: string
          import_po_number?: string | null
          licensed?: boolean | null
          metadata?: Json
          name: string
          origin_country?: string | null
          owner_profile_id?: string | null
          probability?: number | null
          production_order_id?: string | null
          production_po_number?: string | null
          program_type?: string | null
          project_id?: string | null
          requires_new_pricing?: boolean | null
          sales_order_number?: string | null
          sample_approval_method?: string | null
          sample_required?: boolean | null
          season_year?: string | null
          stage?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          ai_state?: string | null
          ai_summary?: string | null
          close_date?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          customer_incoterms?: string | null
          department_id?: string | null
          directive_source?: string | null
          division?: string | null
          estimated_value?: number | null
          external_id?: string | null
          external_source?: string | null
          factory_id?: string | null
          factory_incoterms?: string | null
          hard_delivery_date?: string | null
          id?: string
          import_po_number?: string | null
          licensed?: boolean | null
          metadata?: Json
          name?: string
          origin_country?: string | null
          owner_profile_id?: string | null
          probability?: number | null
          production_order_id?: string | null
          production_po_number?: string | null
          program_type?: string | null
          project_id?: string | null
          requires_new_pricing?: boolean | null
          sales_order_number?: string | null
          sample_approval_method?: string | null
          sample_required?: boolean | null
          season_year?: string | null
          stage?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_product: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          product_id: string
          relationship_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          product_id: string
          relationship_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          product_id?: string
          relationship_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_product_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunity"
            referencedColumns: ["id"]
          },
        ]
      }
      task: {
        Row: {
          assignee_profile_id: string | null
          body: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          department_id: string | null
          due_at: string | null
          id: string
          opportunity_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_profile_id?: string | null
          body?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          department_id?: string | null
          due_at?: string | null
          id?: string
          opportunity_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_profile_id?: string | null
          body?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          department_id?: string | null
          due_at?: string | null
          id?: string
          opportunity_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunity"
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
  public: {
    Tables: {
      admin_config: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      agent_pairings: {
        Row: {
          agent_name: string
          agent_registration_id: string | null
          agent_type: string
          consumed_at: string | null
          consumed_by_agent_id: string | null
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          pairing_code: string
          status: string
        }
        Insert: {
          agent_name?: string
          agent_registration_id?: string | null
          agent_type: string
          consumed_at?: string | null
          consumed_by_agent_id?: string | null
          created_at?: string
          created_by?: string | null
          expires_at: string
          id?: string
          pairing_code: string
          status?: string
        }
        Update: {
          agent_name?: string
          agent_registration_id?: string | null
          agent_type?: string
          consumed_at?: string | null
          consumed_by_agent_id?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          pairing_code?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_pairings_agent_registration_id_fkey"
            columns: ["agent_registration_id"]
            isOneToOne: false
            referencedRelation: "agent_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_registrations: {
        Row: {
          agent_key_hash: string
          agent_name: string
          agent_type: string
          created_at: string
          id: string
          last_heartbeat: string | null
          metadata: Json
        }
        Insert: {
          agent_key_hash: string
          agent_name: string
          agent_type?: string
          created_at?: string
          id?: string
          last_heartbeat?: string | null
          metadata?: Json
        }
        Update: {
          agent_key_hash?: string
          agent_name?: string
          agent_type?: string
          created_at?: string
          id?: string
          last_heartbeat?: string | null
          metadata?: Json
        }
        Relationships: []
      }
      ai_sentinel_cleanup_log: {
        Row: {
          ai_asset_id: string
          ai_filename: string
          ai_relative_path: string
          created_at: string | null
          id: string
          replacement_asset_id: string | null
          replacement_filename: string | null
          replacement_had_thumbnail: boolean | null
          replacement_queued_for_thumbnail: boolean | null
          replacement_relative_path: string | null
        }
        Insert: {
          ai_asset_id: string
          ai_filename: string
          ai_relative_path: string
          created_at?: string | null
          id?: string
          replacement_asset_id?: string | null
          replacement_filename?: string | null
          replacement_had_thumbnail?: boolean | null
          replacement_queued_for_thumbnail?: boolean | null
          replacement_relative_path?: string | null
        }
        Update: {
          ai_asset_id?: string
          ai_filename?: string
          ai_relative_path?: string
          created_at?: string | null
          id?: string
          replacement_asset_id?: string | null
          replacement_filename?: string | null
          replacement_had_thumbnail?: boolean | null
          replacement_queued_for_thumbnail?: boolean | null
          replacement_relative_path?: string | null
        }
        Relationships: []
      }
      app_access: {
        Row: {
          app: Database["public"]["Enums"]["app_name"]
          granted_at: string
          granted_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          app: Database["public"]["Enums"]["app_name"]
          granted_at?: string
          granted_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          app?: Database["public"]["Enums"]["app_name"]
          granted_at?: string
          granted_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      asset_characters: {
        Row: {
          asset_id: string
          character_id: string
        }
        Insert: {
          asset_id: string
          character_id: string
        }
        Update: {
          asset_id?: string
          character_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_characters_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_characters_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_checkouts: {
        Row: {
          asset_id: string
          checked_in_at: string | null
          checked_out_at: string
          checkin_hash: string | null
          checkin_size: number | null
          created_at: string
          device_id: string | null
          error_message: string | null
          expected_quick_hash: string | null
          final_hash: string | null
          final_size: number | null
          id: string
          last_helper_heartbeat_at: string | null
          redrive_count: number
          redrive_requested: boolean
          resolution: string | null
          seafile_library_id: string | null
          seafile_path: string | null
          source_hash: string
          source_local_path: string | null
          source_provider: string | null
          source_size: number
          source_version: string | null
          status: Database["public"]["Enums"]["checkout_status"]
          synology_upload_user: string | null
          updated_at: string
          upload_method: string | null
          user_id: string
          verified_at: string | null
          verify_attempts: number
          verify_deadline_at: string | null
          verify_error: string | null
          verify_failed_at: string | null
          verify_last_attempt_at: string | null
          verify_resolve_at: string | null
        }
        Insert: {
          asset_id: string
          checked_in_at?: string | null
          checked_out_at?: string
          checkin_hash?: string | null
          checkin_size?: number | null
          created_at?: string
          device_id?: string | null
          error_message?: string | null
          expected_quick_hash?: string | null
          final_hash?: string | null
          final_size?: number | null
          id?: string
          last_helper_heartbeat_at?: string | null
          redrive_count?: number
          redrive_requested?: boolean
          resolution?: string | null
          seafile_library_id?: string | null
          seafile_path?: string | null
          source_hash: string
          source_local_path?: string | null
          source_provider?: string | null
          source_size: number
          source_version?: string | null
          status?: Database["public"]["Enums"]["checkout_status"]
          synology_upload_user?: string | null
          updated_at?: string
          upload_method?: string | null
          user_id: string
          verified_at?: string | null
          verify_attempts?: number
          verify_deadline_at?: string | null
          verify_error?: string | null
          verify_failed_at?: string | null
          verify_last_attempt_at?: string | null
          verify_resolve_at?: string | null
        }
        Update: {
          asset_id?: string
          checked_in_at?: string | null
          checked_out_at?: string
          checkin_hash?: string | null
          checkin_size?: number | null
          created_at?: string
          device_id?: string | null
          error_message?: string | null
          expected_quick_hash?: string | null
          final_hash?: string | null
          final_size?: number | null
          id?: string
          last_helper_heartbeat_at?: string | null
          redrive_count?: number
          redrive_requested?: boolean
          resolution?: string | null
          seafile_library_id?: string | null
          seafile_path?: string | null
          source_hash?: string
          source_local_path?: string | null
          source_provider?: string | null
          source_size?: number
          source_version?: string | null
          status?: Database["public"]["Enums"]["checkout_status"]
          synology_upload_user?: string | null
          updated_at?: string
          upload_method?: string | null
          user_id?: string
          verified_at?: string | null
          verify_attempts?: number
          verify_deadline_at?: string | null
          verify_error?: string | null
          verify_failed_at?: string | null
          verify_last_attempt_at?: string | null
          verify_resolve_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_checkouts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_checkouts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "helper_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_path_history: {
        Row: {
          asset_id: string
          detected_at: string
          id: string
          new_relative_path: string
          old_relative_path: string
        }
        Insert: {
          asset_id: string
          detected_at?: string
          id?: string
          new_relative_path: string
          old_relative_path: string
        }
        Update: {
          asset_id?: string
          detected_at?: string
          id?: string
          new_relative_path?: string
          old_relative_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_path_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_tags: {
        Row: {
          asset_id: string
          created_at: string
          created_by: string | null
          id: string
          source: string
          tag: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          source?: string
          tag: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          source?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_tags_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          ai_description: string | null
          ai_model: string | null
          ai_tagged_at: string | null
          art_source: Database["public"]["Enums"]["art_source"] | null
          artboards: number | null
          asset_type: Database["public"]["Enums"]["asset_type"] | null
          big_theme: string | null
          cover_description: string | null
          created_at: string
          customer: string | null
          design_ref: string | null
          design_style: string | null
          designer_name: string | null
          division_code: string | null
          division_name: string | null
          file_created_at: string | null
          file_size: number | null
          file_type: Database["public"]["Enums"]["file_type"]
          filename: string
          freelancer_name: string | null
          height: number | null
          id: string
          ingested_at: string | null
          is_deleted: boolean | null
          is_licensed: boolean | null
          last_scanned_at: string | null
          last_seen_at: string
          licensor_code: string | null
          licensor_id: string | null
          licensor_name: string | null
          little_theme: string | null
          mg01_code: string | null
          mg01_name: string | null
          mg02_code: string | null
          mg02_name: string | null
          mg03_code: string | null
          mg03_name: string | null
          modified_at: string
          pdf_page2_url: string | null
          primary_sort_tier: number
          product_category: string | null
          product_subtype_id: string | null
          program: string | null
          property_code: string | null
          property_id: string | null
          property_name: string | null
          quick_hash: string
          quick_hash_version: number
          relative_path: string
          scene_description: string | null
          size_code: string | null
          size_name: string | null
          sku: string | null
          sku_sequence: string | null
          stage: string | null
          status: Database["public"]["Enums"]["asset_status"] | null
          style_group_id: string | null
          tags: string[]
          technical_designer_name: string | null
          thumbnail_error: string | null
          thumbnail_url: string | null
          updated_at: string | null
          width: number | null
          workflow_status: Database["public"]["Enums"]["workflow_status"] | null
        }
        Insert: {
          ai_description?: string | null
          ai_model?: string | null
          ai_tagged_at?: string | null
          art_source?: Database["public"]["Enums"]["art_source"] | null
          artboards?: number | null
          asset_type?: Database["public"]["Enums"]["asset_type"] | null
          big_theme?: string | null
          cover_description?: string | null
          created_at?: string
          customer?: string | null
          design_ref?: string | null
          design_style?: string | null
          designer_name?: string | null
          division_code?: string | null
          division_name?: string | null
          file_created_at?: string | null
          file_size?: number | null
          file_type: Database["public"]["Enums"]["file_type"]
          filename: string
          freelancer_name?: string | null
          height?: number | null
          id?: string
          ingested_at?: string | null
          is_deleted?: boolean | null
          is_licensed?: boolean | null
          last_scanned_at?: string | null
          last_seen_at?: string
          licensor_code?: string | null
          licensor_id?: string | null
          licensor_name?: string | null
          little_theme?: string | null
          mg01_code?: string | null
          mg01_name?: string | null
          mg02_code?: string | null
          mg02_name?: string | null
          mg03_code?: string | null
          mg03_name?: string | null
          modified_at: string
          pdf_page2_url?: string | null
          primary_sort_tier?: number
          product_category?: string | null
          product_subtype_id?: string | null
          program?: string | null
          property_code?: string | null
          property_id?: string | null
          property_name?: string | null
          quick_hash: string
          quick_hash_version?: number
          relative_path: string
          scene_description?: string | null
          size_code?: string | null
          size_name?: string | null
          sku?: string | null
          sku_sequence?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["asset_status"] | null
          style_group_id?: string | null
          tags?: string[]
          technical_designer_name?: string | null
          thumbnail_error?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          width?: number | null
          workflow_status?:
            | Database["public"]["Enums"]["workflow_status"]
            | null
        }
        Update: {
          ai_description?: string | null
          ai_model?: string | null
          ai_tagged_at?: string | null
          art_source?: Database["public"]["Enums"]["art_source"] | null
          artboards?: number | null
          asset_type?: Database["public"]["Enums"]["asset_type"] | null
          big_theme?: string | null
          cover_description?: string | null
          created_at?: string
          customer?: string | null
          design_ref?: string | null
          design_style?: string | null
          designer_name?: string | null
          division_code?: string | null
          division_name?: string | null
          file_created_at?: string | null
          file_size?: number | null
          file_type?: Database["public"]["Enums"]["file_type"]
          filename?: string
          freelancer_name?: string | null
          height?: number | null
          id?: string
          ingested_at?: string | null
          is_deleted?: boolean | null
          is_licensed?: boolean | null
          last_scanned_at?: string | null
          last_seen_at?: string
          licensor_code?: string | null
          licensor_id?: string | null
          licensor_name?: string | null
          little_theme?: string | null
          mg01_code?: string | null
          mg01_name?: string | null
          mg02_code?: string | null
          mg02_name?: string | null
          mg03_code?: string | null
          mg03_name?: string | null
          modified_at?: string
          pdf_page2_url?: string | null
          primary_sort_tier?: number
          product_category?: string | null
          product_subtype_id?: string | null
          program?: string | null
          property_code?: string | null
          property_id?: string | null
          property_name?: string | null
          quick_hash?: string
          quick_hash_version?: number
          relative_path?: string
          scene_description?: string | null
          size_code?: string | null
          size_name?: string | null
          sku?: string | null
          sku_sequence?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["asset_status"] | null
          style_group_id?: string | null
          tags?: string[]
          technical_designer_name?: string | null
          thumbnail_error?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          width?: number | null
          workflow_status?:
            | Database["public"]["Enums"]["workflow_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_licensor_id_fkey"
            columns: ["licensor_id"]
            isOneToOne: false
            referencedRelation: "licensors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_product_subtype_id_fkey"
            columns: ["product_subtype_id"]
            isOneToOne: false
            referencedRelation: "product_subtypes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_style_group_id_fkey"
            columns: ["style_group_id"]
            isOneToOne: false
            referencedRelation: "style_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          is_priority: boolean
          name: string
          property_id: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          is_priority?: boolean
          name: string
          property_id: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          is_priority?: boolean
          name?: string
          property_id?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "characters_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_enrichment_log: {
        Row: {
          applied_at: string
          confidence: number | null
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          run_id: string | null
          source: string
          target_id: string
          target_type: string
        }
        Insert: {
          applied_at?: string
          confidence?: number | null
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          run_id?: string | null
          source: string
          target_id: string
          target_type: string
        }
        Update: {
          applied_at?: string
          confidence?: number | null
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          run_id?: string | null
          source?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      erp_items_current: {
        Row: {
          created_at: string
          dismissed: boolean
          division_code: string | null
          erp_updated_at: string | null
          external_id: string
          id: string
          item_description: string | null
          licensor_code: string | null
          mg_category: string | null
          mg01_code: string | null
          mg02_code: string | null
          mg03_code: string | null
          mg04_code: string | null
          mg05_code: string | null
          mg06_code: string | null
          prepack_code: string | null
          prepack_codes: Json | null
          property_code: string | null
          raw_mg_fields: Json | null
          size_code: string | null
          source_system: string
          style_number: string | null
          sync_run_id: string | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dismissed?: boolean
          division_code?: string | null
          erp_updated_at?: string | null
          external_id: string
          id?: string
          item_description?: string | null
          licensor_code?: string | null
          mg_category?: string | null
          mg01_code?: string | null
          mg02_code?: string | null
          mg03_code?: string | null
          mg04_code?: string | null
          mg05_code?: string | null
          mg06_code?: string | null
          prepack_code?: string | null
          prepack_codes?: Json | null
          property_code?: string | null
          raw_mg_fields?: Json | null
          size_code?: string | null
          source_system?: string
          style_number?: string | null
          sync_run_id?: string | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dismissed?: boolean
          division_code?: string | null
          erp_updated_at?: string | null
          external_id?: string
          id?: string
          item_description?: string | null
          licensor_code?: string | null
          mg_category?: string | null
          mg01_code?: string | null
          mg02_code?: string | null
          mg03_code?: string | null
          mg04_code?: string | null
          mg05_code?: string | null
          mg06_code?: string | null
          prepack_code?: string | null
          prepack_codes?: Json | null
          property_code?: string | null
          raw_mg_fields?: Json | null
          size_code?: string | null
          source_system?: string
          style_number?: string | null
          sync_run_id?: string | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "erp_items_current_sync_run_id_fkey"
            columns: ["sync_run_id"]
            isOneToOne: false
            referencedRelation: "erp_sync_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_items_raw: {
        Row: {
          external_id: string
          fetched_at: string
          id: string
          raw_payload: Json
          sync_run_id: string | null
        }
        Insert: {
          external_id: string
          fetched_at?: string
          id?: string
          raw_payload: Json
          sync_run_id?: string | null
        }
        Update: {
          external_id?: string
          fetched_at?: string
          id?: string
          raw_payload?: Json
          sync_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erp_items_raw_sync_run_id_fkey"
            columns: ["sync_run_id"]
            isOneToOne: false
            referencedRelation: "erp_sync_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_sync_runs: {
        Row: {
          created_by: string | null
          ended_at: string | null
          error_samples: Json | null
          id: string
          run_metadata: Json | null
          started_at: string
          status: string
          total_errors: number | null
          total_fetched: number | null
          total_upserted: number | null
        }
        Insert: {
          created_by?: string | null
          ended_at?: string | null
          error_samples?: Json | null
          id?: string
          run_metadata?: Json | null
          started_at?: string
          status?: string
          total_errors?: number | null
          total_fetched?: number | null
          total_upserted?: number | null
        }
        Update: {
          created_by?: string | null
          ended_at?: string | null
          error_samples?: Json | null
          id?: string
          run_metadata?: Json | null
          started_at?: string
          status?: string
          total_errors?: number | null
          total_fetched?: number | null
          total_upserted?: number | null
        }
        Relationships: []
      }
      helper_devices: {
        Row: {
          device_name: string
          device_os: string
          helper_version: string
          id: string
          last_seen_at: string
          registered_at: string
          user_id: string
        }
        Insert: {
          device_name: string
          device_os: string
          helper_version: string
          id?: string
          last_seen_at?: string
          registered_at?: string
          user_id: string
        }
        Update: {
          device_name?: string
          device_os?: string
          helper_version?: string
          id?: string
          last_seen_at?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: []
      }
      helper_tokens: {
        Row: {
          action: string
          asset_id: string | null
          checkout_id: string | null
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          asset_id?: string | null
          checkout_id?: string | null
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id: string
          user_id: string
        }
        Update: {
          action?: string
          asset_id?: string | null
          checkout_id?: string | null
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "helper_tokens_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helper_tokens_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "asset_checkouts"
            referencedColumns: ["id"]
          },
        ]
      }
      hygiene_findings: {
        Row: {
          asset_id: string | null
          check_type: string
          created_at: string
          details: Json
          filename: string
          found_at: string
          found_by_agent: string | null
          id: string
          relative_path: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          scan_session_id: string | null
          severity: string
          status: string
        }
        Insert: {
          asset_id?: string | null
          check_type: string
          created_at?: string
          details?: Json
          filename: string
          found_at?: string
          found_by_agent?: string | null
          id?: string
          relative_path: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scan_session_id?: string | null
          severity?: string
          status?: string
        }
        Update: {
          asset_id?: string | null
          check_type?: string
          created_at?: string
          details?: Json
          filename?: string
          found_at?: string
          found_by_agent?: string | null
          id?: string
          relative_path?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scan_session_id?: string | null
          severity?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "hygiene_findings_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          apps: Database["public"]["Enums"]["app_name"][]
          created_at: string
          email: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          accepted_at?: string | null
          apps?: Database["public"]["Enums"]["app_name"][]
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          accepted_at?: string | null
          apps?: Database["public"]["Enums"]["app_name"][]
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      licensors: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      pdf_text_samples: {
        Row: {
          asset_id: string | null
          char_count: number
          extracted_text: string | null
          extraction_error: string | null
          extraction_method: string
          filename: string
          id: string
          page_count: number | null
          relative_path: string
          sampled_at: string
          thumbnail_url: string | null
        }
        Insert: {
          asset_id?: string | null
          char_count?: number
          extracted_text?: string | null
          extraction_error?: string | null
          extraction_method: string
          filename: string
          id?: string
          page_count?: number | null
          relative_path: string
          sampled_at?: string
          thumbnail_url?: string | null
        }
        Update: {
          asset_id?: string | null
          char_count?: number
          extracted_text?: string | null
          extraction_error?: string | null
          extraction_method?: string
          filename?: string
          id?: string
          page_count?: number | null
          relative_path?: string
          sampled_at?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pdf_text_samples_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: true
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_queue: {
        Row: {
          agent_id: string | null
          asset_id: string
          claimed_at: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_type: string
          status: Database["public"]["Enums"]["queue_status"] | null
        }
        Insert: {
          agent_id?: string | null
          asset_id: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type: string
          status?: Database["public"]["Enums"]["queue_status"] | null
        }
        Update: {
          agent_id?: string | null
          asset_id?: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type?: string
          status?: Database["public"]["Enums"]["queue_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_queue_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      prod_order_headers_current: {
        Row: {
          created_at: string
          customer_code: string | null
          customer_name: string | null
          due_date: string | null
          erp_updated_at: string | null
          external_id: string
          id: string
          order_date: string | null
          order_status: string | null
          prod_order_number: string
          quantity: number | null
          raw_payload: Json
          style_number: string
          sync_run_id: string | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_code?: string | null
          customer_name?: string | null
          due_date?: string | null
          erp_updated_at?: string | null
          external_id: string
          id?: string
          order_date?: string | null
          order_status?: string | null
          prod_order_number: string
          quantity?: number | null
          raw_payload?: Json
          style_number: string
          sync_run_id?: string | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_code?: string | null
          customer_name?: string | null
          due_date?: string | null
          erp_updated_at?: string | null
          external_id?: string
          id?: string
          order_date?: string | null
          order_status?: string | null
          prod_order_number?: string
          quantity?: number | null
          raw_payload?: Json
          style_number?: string
          sync_run_id?: string | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prod_order_headers_current_sync_run_id_fkey"
            columns: ["sync_run_id"]
            isOneToOne: false
            referencedRelation: "prod_order_sync_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      prod_order_headers_raw: {
        Row: {
          external_id: string
          fetched_at: string
          id: string
          raw_payload: Json
          sync_run_id: string | null
        }
        Insert: {
          external_id: string
          fetched_at?: string
          id?: string
          raw_payload: Json
          sync_run_id?: string | null
        }
        Update: {
          external_id?: string
          fetched_at?: string
          id?: string
          raw_payload?: Json
          sync_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prod_order_headers_raw_sync_run_id_fkey"
            columns: ["sync_run_id"]
            isOneToOne: false
            referencedRelation: "prod_order_sync_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      prod_order_sync_runs: {
        Row: {
          created_by: string
          ended_at: string | null
          error_samples: Json
          id: string
          run_metadata: Json
          started_at: string
          status: string
          total_errors: number
          total_fetched: number
          total_upserted: number
        }
        Insert: {
          created_by?: string
          ended_at?: string | null
          error_samples?: Json
          id?: string
          run_metadata?: Json
          started_at?: string
          status?: string
          total_errors?: number
          total_fetched?: number
          total_upserted?: number
        }
        Update: {
          created_by?: string
          ended_at?: string | null
          error_samples?: Json
          id?: string
          run_metadata?: Json
          started_at?: string
          status?: string
          total_errors?: number
          total_fetched?: number
          total_upserted?: number
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      product_category_predictions: {
        Row: {
          ai_model: string | null
          ai_prompt_version: string | null
          classification_source: string
          confidence: number
          created_at: string
          erp_item_id: string | null
          external_id: string
          id: string
          input_context: Json | null
          predicted_category: string
          rationale: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          ai_model?: string | null
          ai_prompt_version?: string | null
          classification_source?: string
          confidence: number
          created_at?: string
          erp_item_id?: string | null
          external_id: string
          id?: string
          input_context?: Json | null
          predicted_category: string
          rationale?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          ai_model?: string | null
          ai_prompt_version?: string | null
          classification_source?: string
          confidence?: number
          created_at?: string
          erp_item_id?: string | null
          external_id?: string
          id?: string
          input_context?: Json | null
          predicted_category?: string
          rationale?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_category_predictions_erp_item_id_fkey"
            columns: ["erp_item_id"]
            isOneToOne: false
            referencedRelation: "erp_items_current"
            referencedColumns: ["id"]
          },
        ]
      }
      product_subtypes: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          name: string
          type_id: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          name: string
          type_id: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          name?: string
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_subtypes_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
        ]
      }
      product_types: {
        Row: {
          category_id: string
          created_at: string
          external_id: string | null
          id: string
          name: string
        }
        Insert: {
          category_id: string
          created_at?: string
          external_id?: string | null
          id?: string
          name: string
        }
        Update: {
          category_id?: string
          created_at?: string
          external_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          licensor_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          licensor_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          licensor_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_licensor_id_fkey"
            columns: ["licensor_id"]
            isOneToOne: false
            referencedRelation: "licensors"
            referencedColumns: ["id"]
          },
        ]
      }
      render_queue: {
        Row: {
          asset_id: string
          attempts: number
          claimed_at: string | null
          claimed_by: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          lease_expires_at: string | null
          status: Database["public"]["Enums"]["queue_status"] | null
        }
        Insert: {
          asset_id: string
          attempts?: number
          claimed_at?: string | null
          claimed_by?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          lease_expires_at?: string | null
          status?: Database["public"]["Enums"]["queue_status"] | null
        }
        Update: {
          asset_id?: string
          attempts?: number
          claimed_at?: string | null
          claimed_by?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          lease_expires_at?: string | null
          status?: Database["public"]["Enums"]["queue_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "render_queue_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      scanner_ai_ignores: {
        Row: {
          created_at: string | null
          id: string
          reason: string
          relative_path: string
          snoozed_until: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason: string
          relative_path: string
          snoozed_until?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string
          relative_path?: string
          snoozed_until?: string | null
        }
        Relationships: []
      }
      sku_files_used: {
        Row: {
          created_at: string
          file_name: string
          id: string
          last_match_attempt_at: string | null
          match_attempts: number
          match_best_score: number | null
          sku: string
          source: string | null
          style_guide_file_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          last_match_attempt_at?: string | null
          match_attempts?: number
          match_best_score?: number | null
          sku: string
          source?: string | null
          style_guide_file_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          last_match_attempt_at?: string | null
          match_attempts?: number
          match_best_score?: number | null
          sku?: string
          source?: string | null
          style_guide_file_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sku_files_used_style_guide_file_id_fkey"
            columns: ["style_guide_file_id"]
            isOneToOne: false
            referencedRelation: "style_guide_files"
            referencedColumns: ["id"]
          },
        ]
      }
      style_groups: {
        Row: {
          asset_count: number | null
          cover_description: string | null
          created_at: string | null
          customer: string | null
          designer_conflict: boolean
          designer_name: string | null
          division_code: string | null
          division_name: string | null
          folder_path: string
          freelancer_name: string | null
          id: string
          is_licensed: boolean | null
          latest_file_date: string | null
          licensor_code: string | null
          licensor_id: string | null
          licensor_name: string | null
          mg01_code: string | null
          mg01_name: string | null
          mg02_code: string | null
          mg02_name: string | null
          mg03_code: string | null
          mg03_name: string | null
          primary_asset_id: string | null
          primary_asset_type: string | null
          primary_thumbnail_error: string | null
          primary_thumbnail_url: string | null
          product_category: string | null
          program: string | null
          property_code: string | null
          property_id: string | null
          property_name: string | null
          size_code: string | null
          size_name: string | null
          sku: string
          stage: string | null
          technical_designer_name: string | null
          updated_at: string | null
          workflow_status: Database["public"]["Enums"]["workflow_status"] | null
        }
        Insert: {
          asset_count?: number | null
          cover_description?: string | null
          created_at?: string | null
          customer?: string | null
          designer_conflict?: boolean
          designer_name?: string | null
          division_code?: string | null
          division_name?: string | null
          folder_path: string
          freelancer_name?: string | null
          id?: string
          is_licensed?: boolean | null
          latest_file_date?: string | null
          licensor_code?: string | null
          licensor_id?: string | null
          licensor_name?: string | null
          mg01_code?: string | null
          mg01_name?: string | null
          mg02_code?: string | null
          mg02_name?: string | null
          mg03_code?: string | null
          mg03_name?: string | null
          primary_asset_id?: string | null
          primary_asset_type?: string | null
          primary_thumbnail_error?: string | null
          primary_thumbnail_url?: string | null
          product_category?: string | null
          program?: string | null
          property_code?: string | null
          property_id?: string | null
          property_name?: string | null
          size_code?: string | null
          size_name?: string | null
          sku: string
          stage?: string | null
          technical_designer_name?: string | null
          updated_at?: string | null
          workflow_status?:
            | Database["public"]["Enums"]["workflow_status"]
            | null
        }
        Update: {
          asset_count?: number | null
          cover_description?: string | null
          created_at?: string | null
          customer?: string | null
          designer_conflict?: boolean
          designer_name?: string | null
          division_code?: string | null
          division_name?: string | null
          folder_path?: string
          freelancer_name?: string | null
          id?: string
          is_licensed?: boolean | null
          latest_file_date?: string | null
          licensor_code?: string | null
          licensor_id?: string | null
          licensor_name?: string | null
          mg01_code?: string | null
          mg01_name?: string | null
          mg02_code?: string | null
          mg02_name?: string | null
          mg03_code?: string | null
          mg03_name?: string | null
          primary_asset_id?: string | null
          primary_asset_type?: string | null
          primary_thumbnail_error?: string | null
          primary_thumbnail_url?: string | null
          product_category?: string | null
          program?: string | null
          property_code?: string | null
          property_id?: string | null
          property_name?: string | null
          size_code?: string | null
          size_name?: string | null
          sku?: string
          stage?: string | null
          technical_designer_name?: string | null
          updated_at?: string | null
          workflow_status?:
            | Database["public"]["Enums"]["workflow_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "style_groups_licensor_id_fkey"
            columns: ["licensor_id"]
            isOneToOne: false
            referencedRelation: "licensors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "style_groups_primary_asset_id_fkey"
            columns: ["primary_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "style_groups_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      style_guide_crawl_runs: {
        Row: {
          agent_id: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          files_found: number | null
          id: string
          inaccessible_roots: string[] | null
          roots_scanned: string[] | null
          started_at: string | null
          status: string
        }
        Insert: {
          agent_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          files_found?: number | null
          id?: string
          inaccessible_roots?: string[] | null
          roots_scanned?: string[] | null
          started_at?: string | null
          status?: string
        }
        Update: {
          agent_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          files_found?: number | null
          id?: string
          inaccessible_roots?: string[] | null
          roots_scanned?: string[] | null
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      style_guide_files: {
        Row: {
          basename_no_ext: string
          crawl_run_id: string | null
          created_at: string
          directory_path: string
          file_extension: string | null
          filename: string
          id: string
          is_active: boolean
          last_seen_at: string
          licensor_name: string | null
          modified_at: string | null
          normalized_name: string
          normalized_style_guide_folder: string | null
          property_folder: string | null
          relative_path: string
          root_label: string
          size_bytes: number | null
          style_guide_folder: string | null
          thumbnail_error: string | null
          thumbnail_url: string | null
        }
        Insert: {
          basename_no_ext: string
          crawl_run_id?: string | null
          created_at?: string
          directory_path: string
          file_extension?: string | null
          filename: string
          id?: string
          is_active?: boolean
          last_seen_at?: string
          licensor_name?: string | null
          modified_at?: string | null
          normalized_name: string
          normalized_style_guide_folder?: string | null
          property_folder?: string | null
          relative_path: string
          root_label: string
          size_bytes?: number | null
          style_guide_folder?: string | null
          thumbnail_error?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          basename_no_ext?: string
          crawl_run_id?: string | null
          created_at?: string
          directory_path?: string
          file_extension?: string | null
          filename?: string
          id?: string
          is_active?: boolean
          last_seen_at?: string
          licensor_name?: string | null
          modified_at?: string | null
          normalized_name?: string
          normalized_style_guide_folder?: string | null
          property_folder?: string | null
          relative_path?: string
          root_label?: string
          size_bytes?: number | null
          style_guide_folder?: string | null
          thumbnail_error?: string | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "style_guide_files_crawl_run_id_fkey"
            columns: ["crawl_run_id"]
            isOneToOne: false
            referencedRelation: "style_guide_crawl_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      style_guide_render_queue: {
        Row: {
          attempts: number
          claimed_at: string | null
          claimed_by: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          lease_expires_at: string | null
          status: Database["public"]["Enums"]["queue_status"]
          style_guide_file_id: string
        }
        Insert: {
          attempts?: number
          claimed_at?: string | null
          claimed_by?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          lease_expires_at?: string | null
          status?: Database["public"]["Enums"]["queue_status"]
          style_guide_file_id: string
        }
        Update: {
          attempts?: number
          claimed_at?: string | null
          claimed_by?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          lease_expires_at?: string | null
          status?: Database["public"]["Enums"]["queue_status"]
          style_guide_file_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "style_guide_render_queue_style_guide_file_id_fkey"
            columns: ["style_guide_file_id"]
            isOneToOne: false
            referencedRelation: "style_guide_files"
            referencedColumns: ["id"]
          },
        ]
      }
      tiff_optimization_queue: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          compression_type: string | null
          created_at: string
          error_message: string | null
          file_created_at: string | null
          file_modified_at: string
          file_size: number
          filename: string
          id: string
          mode: string | null
          new_file_created_at: string | null
          new_file_modified_at: string | null
          new_file_size: number | null
          new_filename: string | null
          original_backed_up: boolean | null
          original_deleted: boolean | null
          processed_at: string | null
          relative_path: string
          scan_session_id: string | null
          status: string
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          compression_type?: string | null
          created_at?: string
          error_message?: string | null
          file_created_at?: string | null
          file_modified_at: string
          file_size: number
          filename: string
          id?: string
          mode?: string | null
          new_file_created_at?: string | null
          new_file_modified_at?: string | null
          new_file_size?: number | null
          new_filename?: string | null
          original_backed_up?: boolean | null
          original_deleted?: boolean | null
          processed_at?: string | null
          relative_path: string
          scan_session_id?: string | null
          status?: string
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          compression_type?: string | null
          created_at?: string
          error_message?: string | null
          file_created_at?: string | null
          file_modified_at?: string
          file_size?: number
          filename?: string
          id?: string
          mode?: string | null
          new_file_created_at?: string | null
          new_file_modified_at?: string | null
          new_file_size?: number | null
          new_filename?: string | null
          original_backed_up?: boolean | null
          original_deleted?: boolean | null
          processed_at?: string | null
          relative_path?: string
          scan_session_id?: string | null
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      sg_archive_usage: {
        Row: {
          active_files: number | null
          archive_candidate: boolean | null
          design_ref_count: number | null
          designs_using: number | null
          licensor_name: string | null
          most_recent_design_date: string | null
          newest_sg_file_date: string | null
          property_folder: string | null
          total_files: number | null
        }
        Relationships: []
      }
      style_guide_file_groups: {
        Row: {
          directory_path: string | null
          file_count: number | null
          group_key: string | null
          latest_modified_at: string | null
          licensor_name: string | null
          property_folder: string | null
          root_label: string | null
          sample_thumbnail_url: string | null
          style_guide_folder: string | null
          style_guide_name: string | null
          total_size_bytes: number | null
        }
        Relationships: []
      }
      style_guide_folders: {
        Row: {
          licensor_name: string | null
          property_folder: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      backfill_pdf_files_used: { Args: never; Returns: number }
      bulk_assign_style_groups: {
        Args: { p_assignments: Json }
        Returns: number
      }
      bulk_insert_pdf_text_samples: { Args: { p_rows: Json }; Returns: number }
      claim_jobs: {
        Args: { p_agent_id: string; p_batch_size?: number }
        Returns: {
          agent_id: string | null
          asset_id: string
          claimed_at: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_type: string
          status: Database["public"]["Enums"]["queue_status"] | null
        }[]
        SetofOptions: {
          from: "*"
          to: "processing_queue"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      claim_pdf_backfill_batch: {
        Args: { p_limit?: number }
        Returns: {
          filename: string
          id: string
          needs_thumbnail: boolean
          relative_path: string
        }[]
      }
      claim_render_jobs: {
        Args: {
          p_agent_id: string
          p_batch_size?: number
          p_lease_minutes?: number
          p_max_attempts?: number
        }
        Returns: {
          asset_id: string
          attempts: number
          id: string
          lease_expires_at: string
        }[]
      }
      claim_sg_render_jobs: {
        Args: {
          p_agent_id: string
          p_batch_size?: number
          p_lease_minutes?: number
          p_max_attempts?: number
        }
        Returns: {
          attempts: number
          id: string
          lease_expires_at: string
          style_guide_file_id: string
        }[]
      }
      claim_tiff_jobs: {
        Args: {
          p_agent_id: string
          p_batch_size?: number
          p_lease_minutes?: number
        }
        Returns: {
          file_created_at: string
          file_modified_at: string
          file_size: number
          filename: string
          id: string
          mode: string
          relative_path: string
        }[]
      }
      cleanup_mega_group_tags_batch:
        | { Args: never; Returns: number }
        | {
            Args: {
              p_batch_size?: number
              p_cursor?: string
              p_min_group_size?: number
            }
            Returns: {
              characters_deleted: number
              done: boolean
              groups_processed: number
              metadata_cleared: number
              next_cursor: string
              tags_deleted: number
            }[]
          }
      clear_style_group_batch: {
        Args: { p_batch_size?: number; p_last_id?: string }
        Returns: {
          cleared_count: number
          has_more: boolean
          last_id: string
        }[]
      }
      count_pdf_backfill_remaining: { Args: never; Returns: number }
      deactivate_stale_sg_files: {
        Args: { p_root_label: string; p_run_id: string }
        Returns: number
      }
      execute_readonly_query: { Args: { query_text: string }; Returns: Json }
      find_ai_pdf_duplicates: {
        Args: never
        Returns: {
          filename: string
          id: string
          relative_path: string
          style_group_id: string
          thumbnail_url: string
        }[]
      }
      get_ai_sentinel_stats: { Args: never; Returns: Json }
      get_filter_counts: { Args: { p_filters?: Json }; Returns: Json }
      get_path_facets: { Args: { p_customer?: string }; Returns: Json }
      get_sg_preview_stats: { Args: never; Returns: Json }
      get_sg_render_queue_stats: { Args: never; Returns: Json }
      has_app_access: {
        Args: {
          _app: Database["public"]["Enums"]["app_name"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      infer_path_attrs: { Args: { p_path: string }; Returns: Json }
      is_style_guide_source_pdf: {
        Args: { p_file_type: string; p_filename: string }
        Returns: boolean
      }
      normalize_for_sg_match: { Args: { p: string }; Returns: string }
      parse_pdf_files_used: { Args: { p_asset_id: string }; Returns: number }
      propagate_group_tags_batch: {
        Args: { p_batch_size?: number; p_cursor?: string }
        Returns: {
          done: boolean
          next_cursor: string
          propagated: number
          skipped: number
        }[]
      }
      queue_nightly_rebuild_style_groups: { Args: never; Returns: undefined }
      queue_sg_render_jobs_by_ids: {
        Args: { p_file_ids: string[] }
        Returns: number
      }
      rebuild_style_groups_batch: {
        Args: { p_batch_size?: number; p_last_asset_id?: string }
        Returns: {
          assets_assigned: number
          assets_ungrouped: number
          done: boolean
          groups_created: number
          next_cursor: string
        }[]
      }
      reconcile_style_group_stats_batch: {
        Args: { p_batch_size?: number; p_cursor?: string; p_sub?: string }
        Returns: {
          done: boolean
          next_cursor: string
          processed: number
          sub: string
        }[]
      }
      refresh_style_group_counts: { Args: never; Returns: undefined }
      refresh_style_group_counts_batch: {
        Args: { p_group_ids: string[] }
        Returns: number
      }
      refresh_style_group_primaries: {
        Args: { p_group_ids: string[] }
        Returns: number
      }
      refresh_style_guide_matviews: { Args: never; Returns: undefined }
      requeue_all_failed_sg_jobs: {
        Args: { p_limit?: number }
        Returns: number
      }
      reset_stale_jobs: {
        Args: { p_timeout_minutes?: number }
        Returns: number
      }
      resolve_sku_files_used: { Args: never; Returns: number }
      resolve_sku_files_used_fuzzy: {
        Args: { p_threshold?: number }
        Returns: number
      }
      retry_sg_render_errors:
        | { Args: { p_file_ids?: string[] }; Returns: number }
        | { Args: { p_file_ids?: string[]; p_limit?: number }; Returns: number }
      run_full_reconcile_style_group_stats: {
        Args: never
        Returns: {
          counts_updated: number
          primaries_updated: number
        }[]
      }
      set_style_group_cover: {
        Args: { p_asset_id: string; p_group_id: string }
        Returns: undefined
      }
      update_bulk_operation: {
        Args: { p_only_if_status?: string; p_op_key: string; p_op_state: Json }
        Returns: Json
      }
      update_bulk_operations_batch: { Args: { p_updates: Json }; Returns: Json }
    }
    Enums: {
      app_name: "popdam" | "styleguides"
      app_role: "admin" | "user"
      art_source:
        | "freelancer"
        | "straight_style_guide"
        | "style_guide_composition"
      asset_status: "pending" | "processing" | "tagged" | "error"
      asset_type:
        | "art_piece"
        | "product"
        | "packaging"
        | "tech_pack"
        | "photography"
      checkout_status:
        | "active"
        | "checkin_queued"
        | "uploading"
        | "verifying"
        | "complete"
        | "discarded"
        | "error"
        | "conflict"
      file_type: "psd" | "ai" | "jpg" | "png" | "pdf"
      queue_status:
        | "pending"
        | "claimed"
        | "processing"
        | "completed"
        | "failed"
      workflow_status:
        | "product_ideas"
        | "concept_approved"
        | "in_development"
        | "freelancer_art"
        | "discontinued"
        | "in_process"
        | "customer_adopted"
        | "licensor_approved"
        | "other"
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
  api: {
    Enums: {},
  },
  app: {
    Enums: {
      app_name: ["dam", "crm", "pm", "plm", "admin"],
      app_role: [
        "administrator",
        "sales",
        "licensing",
        "designer",
        "viewer",
        "vendor",
      ],
      entity_status: ["active", "inactive", "archived", "deleted"],
      file_storage_provider: [
        "supabase",
        "spaces",
        "legacy_external",
        "external",
        "local",
      ],
      source_confidence: [
        "verified",
        "probable",
        "possible",
        "unmatched",
        "rejected",
      ],
    },
  },
  core: {
    Enums: {},
  },
  crm: {
    Enums: {},
  },
  public: {
    Enums: {
      app_name: ["popdam", "styleguides"],
      app_role: ["admin", "user"],
      art_source: [
        "freelancer",
        "straight_style_guide",
        "style_guide_composition",
      ],
      asset_status: ["pending", "processing", "tagged", "error"],
      asset_type: [
        "art_piece",
        "product",
        "packaging",
        "tech_pack",
        "photography",
      ],
      checkout_status: [
        "active",
        "checkin_queued",
        "uploading",
        "verifying",
        "complete",
        "discarded",
        "error",
        "conflict",
      ],
      file_type: ["psd", "ai", "jpg", "png", "pdf"],
      queue_status: ["pending", "claimed", "processing", "completed", "failed"],
      workflow_status: [
        "product_ideas",
        "concept_approved",
        "in_development",
        "freelancer_art",
        "discontinued",
        "in_process",
        "customer_adopted",
        "licensor_approved",
        "other",
      ],
    },
  },
} as const
