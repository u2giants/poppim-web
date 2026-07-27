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
      art_piece_library: {
        Row: {
          art_type: string | null
          artist_id: string | null
          artist_name: string | null
          created_at: string | null
          id: string | null
          legacy_artist_text: string | null
          linked_items: Json | null
          name: string | null
          raw: Json | null
          source_id: string | null
          source_system: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      coldlion_licensor_reconciliation: {
        Row: {
          canonical_not_active: boolean | null
          coldlion_source_ref_count: number | null
          company_code: string | null
          designflow_source_ref_count: number | null
          division_code: string | null
          first_seen_at: string | null
          item_cooccurrence_count: number | null
          last_seen_at: string | null
          last_sync_run_id: string | null
          matched_code: string | null
          matched_licensor_id: string | null
          matched_name: string | null
          matched_status: Database["app"]["Enums"]["entity_status"] | null
          mg_code: string | null
          mg_type_code: string | null
          mg_type_desc: string | null
          name_differs_from_canonical: boolean | null
          open_review_confidence: string | null
          open_review_id: string | null
          open_review_proposed_licensor_id: string | null
          open_review_reason: string | null
          open_review_resolved_licensor_id: string | null
          open_review_status: string | null
          resolution_reason: string | null
          resolution_status: string | null
          source_name: string | null
        }
        Relationships: []
      }
      coldlion_property_reconciliation: {
        Row: {
          canonical_not_active: boolean | null
          canonical_parent_code: string | null
          canonical_parent_licensor_id: string | null
          canonical_parent_name: string | null
          canonical_parent_status:
            | Database["app"]["Enums"]["entity_status"]
            | null
          coldlion_lacks_parent_edge: boolean | null
          coldlion_source_ref_count: number | null
          company_code: string | null
          designflow_source_ref_count: number | null
          division_code: string | null
          first_seen_at: string | null
          item_cooccurrence_count: number | null
          last_seen_at: string | null
          last_sync_run_id: string | null
          matched_code: string | null
          matched_name: string | null
          matched_property_id: string | null
          matched_status: Database["app"]["Enums"]["entity_status"] | null
          mg_code: string | null
          mg_type_code: string | null
          mg_type_desc: string | null
          name_differs_from_canonical: boolean | null
          open_review_confidence: string | null
          open_review_id: string | null
          open_review_proposed_property_id: string | null
          open_review_reason: string | null
          open_review_resolved_property_id: string | null
          open_review_status: string | null
          resolution_reason: string | null
          resolution_status: string | null
          source_name: string | null
        }
        Relationships: []
      }
      coldlion_taxonomy_cutover_summary: {
        Row: {
          division_count: number | null
          earliest_first_seen_at: string | null
          entity_type: string | null
          latest_last_seen_at: string | null
          linked_rows: number | null
          mirror_rows: number | null
          resolution_status: string | null
          unlinked_rows: number | null
        }
        Relationships: []
      }
      crm_account_list: {
        Row: {
          account_owner_profile_id: string | null
          chain_type: string | null
          company_type: string | null
          customer_status: string | null
          display_name: string | null
          domain: string | null
          id: string | null
          is_potential: boolean | null
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
          display_name?: string | null
          domain?: string | null
          id?: string | null
          is_potential?: boolean | null
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
          display_name?: string | null
          domain?: string | null
          id?: string | null
          is_potential?: boolean | null
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
            foreignKeyName: "contact_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "contact_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_picker_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "dam_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "pm_customer_list"
            referencedColumns: ["id"]
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
      crm_contact_segment_counts: {
        Row: {
          contact_count: number | null
          crm_segment: string | null
        }
        Relationships: []
      }
      crm_contact_segment_list: {
        Row: {
          company_customer_status: string | null
          company_id: string | null
          company_name: string | null
          contact_type: string | null
          crm_segment: string | null
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
            foreignKeyName: "contact_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "contact_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_picker_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "dam_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "pm_customer_list"
            referencedColumns: ["id"]
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
      crm_customer_list: {
        Row: {
          account_owner_profile_id: string | null
          chain_type: string | null
          company_type: string | null
          customer_status: string | null
          display_name: string | null
          domain: string | null
          id: string | null
          is_potential: boolean | null
          logo_url: string | null
          name: string | null
          primary_salesperson_profile_id: string | null
          routing_aliases: string | null
          so_patterns: string | null
          status: Database["app"]["Enums"]["entity_status"] | null
          updated_at: string | null
        }
        Relationships: []
      }
      crm_customer_overview: {
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
      crm_customer_picker_list: {
        Row: {
          core_status: Database["app"]["Enums"]["entity_status"] | null
          crm_status: Database["app"]["Enums"]["entity_status"] | null
          crm_status_changed_at: string | null
          crm_status_reason: string | null
          display_name: string | null
          id: string | null
          name: string | null
          updated_at: string | null
        }
        Relationships: []
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
            foreignKeyName: "department_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "department_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_picker_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "dam_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "pm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_primary_contact_id_fkey"
            columns: ["primary_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_primary_contact_id_fkey"
            columns: ["primary_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_segment_list"
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
            foreignKeyName: "email_message_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_message_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "email_message_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_picker_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_message_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "dam_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_message_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "pm_customer_list"
            referencedColumns: ["id"]
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
      crm_factory_picker_list: {
        Row: {
          code: string | null
          core_status: Database["app"]["Enums"]["entity_status"] | null
          crm_status: Database["app"]["Enums"]["entity_status"] | null
          crm_status_changed_at: string | null
          crm_status_reason: string | null
          display_name: string | null
          id: string | null
          name: string | null
          updated_at: string | null
        }
        Relationships: []
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
      crm_ingested_domain_list: {
        Row: {
          display_name: string | null
          domain: string | null
          email_count: number | null
          first_seen_at: string | null
          id: string | null
          last_seen_at: string | null
          last_sender: string | null
          sample_subject: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          display_name?: string | null
          domain?: never
          email_count?: number | null
          first_seen_at?: string | null
          id?: string | null
          last_seen_at?: string | null
          last_sender?: never
          sample_subject?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          display_name?: string | null
          domain?: never
          email_count?: number | null
          first_seen_at?: string | null
          id?: string | null
          last_seen_at?: string | null
          last_sender?: never
          sample_subject?: string | null
          status?: string | null
          updated_at?: string | null
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
            foreignKeyName: "meeting_note_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_note_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "meeting_note_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_picker_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_note_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "dam_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_note_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "pm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_note_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_note_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_segment_list"
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
            foreignKeyName: "note_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "note_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_picker_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "dam_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "pm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_segment_list"
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
            foreignKeyName: "opportunity_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "opportunity_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_picker_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "dam_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "pm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_segment_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "crm_department_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "crm_factory_picker_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "dam_factory_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "pm_factory_list"
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
            foreignKeyName: "task_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "task_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_picker_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "dam_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "pm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_segment_list"
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
      dam_customer_list: {
        Row: {
          core_status: Database["app"]["Enums"]["entity_status"] | null
          dam_settings_updated_at: string | null
          dam_status: Database["app"]["Enums"]["entity_status"] | null
          dam_status_changed_at: string | null
          dam_status_reason: string | null
          display_name: string | null
          id: string | null
          name: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      dam_factory_list: {
        Row: {
          code: string | null
          core_status: Database["app"]["Enums"]["entity_status"] | null
          dam_status: Database["app"]["Enums"]["entity_status"] | null
          dam_status_changed_at: string | null
          dam_status_reason: string | null
          display_name: string | null
          id: string | null
          name: string | null
          updated_at: string | null
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
      plm_item_list: {
        Row: {
          dismissed: boolean | null
          division_code: string | null
          erp_updated_at: string | null
          id: string | null
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
          size_code: string | null
          source_id: string | null
          source_system: string | null
          style_number: string | null
          synced_at: string | null
        }
        Insert: {
          dismissed?: boolean | null
          division_code?: string | null
          erp_updated_at?: string | null
          id?: string | null
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
          size_code?: string | null
          source_id?: string | null
          source_system?: string | null
          style_number?: string | null
          synced_at?: string | null
        }
        Update: {
          dismissed?: boolean | null
          division_code?: string | null
          erp_updated_at?: string | null
          id?: string | null
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
          size_code?: string | null
          source_id?: string | null
          source_system?: string | null
          style_number?: string | null
          synced_at?: string | null
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
      pm_customer_list: {
        Row: {
          core_status: Database["app"]["Enums"]["entity_status"] | null
          display_name: string | null
          id: string | null
          name: string | null
          pm_status: Database["app"]["Enums"]["entity_status"] | null
          pm_status_changed_at: string | null
          pm_status_reason: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      pm_factory_list: {
        Row: {
          code: string | null
          core_status: Database["app"]["Enums"]["entity_status"] | null
          display_name: string | null
          id: string | null
          name: string | null
          pm_status: Database["app"]["Enums"]["entity_status"] | null
          pm_status_changed_at: string | null
          pm_status_reason: string | null
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
          blocker_reason: string | null
          brand_assurance_number: string | null
          business_unit: string | null
          buyer_contact_id: string | null
          buyer_name: string | null
          clickup_creator_id: string | null
          clickup_creator_name: string | null
          clickup_folder_id: string | null
          clickup_folder_name: string | null
          clickup_list_id: string | null
          clickup_list_name: string | null
          clickup_orderindex: string | null
          clickup_parent_id: string | null
          clickup_space_id: string | null
          clickup_space_name: string | null
          clickup_status: string | null
          clickup_status_color: string | null
          clickup_status_order: number | null
          clickup_status_type: string | null
          clickup_task_id: string | null
          clickup_time_estimate_ms: number | null
          closure_reason: string | null
          code: string | null
          company_id: string | null
          company_name: string | null
          cover_url: string | null
          created_at: string | null
          department: string | null
          description: string | null
          factory_id: string | null
          factory_name: string | null
          id: string | null
          licensor_id: string | null
          licensor_name: string | null
          lifecycle_status: string | null
          name: string | null
          next_action: string | null
          next_owner_name: string | null
          next_owner_role_name: string | null
          on_shelf_date: string | null
          pi_status: string | null
          plm_item_id: string | null
          plm_item_number: string | null
          pps_requested_date: string | null
          product_type_id: string | null
          product_type_name: string | null
          project_id: string | null
          project_title: string | null
          property_id: string | null
          property_name: string | null
          risk_level: string | null
          stage: string | null
          status: string | null
          updated_at: string | null
          waiting_on: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_buyer_contact_id_fkey"
            columns: ["buyer_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_buyer_contact_id_fkey"
            columns: ["buyer_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_segment_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_account_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "product_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_overview"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "product_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_customer_picker_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "dam_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "pm_customer_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "crm_factory_picker_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "dam_factory_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "pm_factory_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_plm_item_id_fkey"
            columns: ["plm_item_id"]
            isOneToOne: false
            referencedRelation: "plm_item_status"
            referencedColumns: ["item_id"]
          },
        ]
      }
    }
    Functions: {
      crm_admin_user_list: { Args: never; Returns: Json }
      crm_customer_logo_url: {
        Args: { p_import_logo_url: string; p_metadata: Json }
        Returns: string
      }
      crm_customer_segment_counts: {
        Args: never
        Returns: {
          active: number
          all: number
          dismissed: number
          triage: number
        }[]
      }
      crm_customer_segment_list: {
        Args: { p_limit?: number; p_segment?: string }
        Returns: {
          account_owner_profile_id: string
          chain_type: string
          company_type: string
          customer_status: string
          display_name: string
          domain: string
          id: string
          is_potential: boolean
          logo_url: string
          name: string
          primary_salesperson_profile_id: string
          routing_aliases: string
          so_patterns: string
          status: string
          updated_at: string
        }[]
      }
      crm_email_routing_recent: {
        Args: { p_limit?: number }
        Returns: {
          body_preview: string
          company_id: string
          company_name: string
          department_id: string
          department_name: string
          detected_po_numbers: string
          detected_so_numbers: string
          id: string
          opportunity_id: string
          opportunity_name: string
          opportunity_stage: string
          received_at: string
          recipients: string
          routing_method: string
          routing_status: string
          sender: string
          subject: string
          updated_at: string
        }[]
      }
      crm_email_routing_segment_counts: {
        Args: never
        Returns: {
          all: number
          company: number
          department: number
          program: number
          triage: number
        }[]
      }
      crm_set_customer_logo: {
        Args: { p_customer_id: string; p_logo_url?: string }
        Returns: Database["core"]["Tables"]["customer"]["Row"]
        SetofOptions: {
          from: "*"
          to: "customer"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
        Returns: Database["core"]["Tables"]["customer"]["Row"]
        SetofOptions: {
          from: "*"
          to: "customer"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      crm_update_contact: {
        Args: {
          p_clear_company?: boolean
          p_clear_contact_type?: boolean
          p_clear_crm_department?: boolean
          p_clear_scope?: boolean
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
      crm_update_customer: {
        Args: {
          p_chain_type?: string
          p_customer_id: string
          p_customer_status?: string
          p_domain?: string
          p_name?: string
          p_routing_aliases?: string
          p_so_patterns?: string
        }
        Returns: Database["core"]["Tables"]["customer"]["Row"]
        SetofOptions: {
          from: "*"
          to: "customer"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_user_profile: { Args: never; Returns: Json }
      db_data_admin_audit_list: {
        Args: {
          p_action?: string
          p_actor_profile_id?: string
          p_cursor?: string
          p_entity_id?: string
          p_entity_type?: string
          p_page_size?: number
          p_since?: string
          p_until?: string
        }
        Returns: Json
      }
      db_data_admin_channel_list: { Args: never; Returns: Json }
      db_data_admin_customer_detail: { Args: { p_id: string }; Returns: Json }
      db_data_admin_customer_list: {
        Args: {
          p_app?: string
          p_app_status?: string
          p_channel_id?: string
          p_cursor?: string
          p_include_inactive?: boolean
          p_page_size?: number
          p_search?: string
          p_sort?: string
          p_sort_dir?: string
          p_status?: string
        }
        Returns: Json
      }
      db_data_admin_grid_state_get: {
        Args: { p_entity_type: string; p_view_key: string }
        Returns: Json
      }
      db_data_admin_grid_state_upsert: {
        Args: {
          p_entity_type: string
          p_expected_version?: number
          p_state: Json
          p_view_key: string
        }
        Returns: Json
      }
      db_data_admin_licensor_property_list: {
        Args: {
          p_cursor?: string
          p_include_inactive?: boolean
          p_page_size?: number
          p_search?: string
        }
        Returns: Json
      }
      db_data_admin_licensor_property_tree: {
        Args: {
          p_cursor?: string
          p_include_inactive?: boolean
          p_page_size?: number
          p_search?: string
        }
        Returns: Json
      }
      db_data_admin_merge_customer: {
        Args: {
          p_loser_id: string
          p_operation_id: string
          p_preview_token: string
          p_reason: string
          p_resolutions?: Json
          p_survivor_id: string
        }
        Returns: Json
      }
      db_data_admin_merge_vendor: {
        Args: {
          p_loser_id: string
          p_operation_id: string
          p_preview_token: string
          p_reason: string
          p_resolutions?: Json
          p_survivor_id: string
        }
        Returns: Json
      }
      db_data_admin_preview_customer_merge: {
        Args: { p_loser_id: string; p_survivor_id: string }
        Returns: Json
      }
      db_data_admin_preview_vendor_merge: {
        Args: { p_loser_id: string; p_survivor_id: string }
        Returns: Json
      }
      db_data_admin_update_customer: {
        Args: {
          p_app?: string
          p_app_status?: string
          p_channel_ids?: string[]
          p_customer_id: string
          p_display_name?: string
          p_expected_updated_at: string
          p_operation_id: string
          p_reason: string
          p_status?: string
        }
        Returns: Json
      }
      db_data_admin_update_vendor: {
        Args: {
          p_app?: string
          p_app_status?: string
          p_display_name?: string
          p_expected_updated_at: string
          p_operation_id: string
          p_reason: string
          p_status?: string
          p_vendor_id: string
        }
        Returns: Json
      }
      db_data_admin_vendor_detail: { Args: { p_id: string }; Returns: Json }
      db_data_admin_vendor_list: {
        Args: {
          p_app?: string
          p_app_status?: string
          p_cursor?: string
          p_include_inactive?: boolean
          p_page_size?: number
          p_search?: string
          p_sort?: string
          p_sort_dir?: string
          p_status?: string
        }
        Returns: Json
      }
      pm_account_page: {
        Args: {
          p_after_id?: string
          p_after_name?: string
          p_business_unit: string
          p_limit?: number
          p_search?: string
        }
        Returns: {
          buyers: Json
          core_status: string
          id: string
          name: string
          order_count: number
          project_count: number
        }[]
      }
      pm_department_handoffs: {
        Args: { p_business_unit: string; p_limit?: number; p_since?: string }
        Returns: {
          changed_at: string
          from_stage_id: string
          from_stage_name: string
          id: string
          product_id: string
          product_name: string
          to_stage_id: string
          to_stage_name: string
        }[]
      }
      pm_department_report: { Args: { p_business_unit: string }; Returns: Json }
      pm_design_collection_page: {
        Args: {
          p_after_id?: string
          p_after_updated_at?: string
          p_business_unit: string
          p_limit?: number
          p_search?: string
        }
        Returns: {
          company_id: string
          id: string
          metadata: Json
          name: string
          project_count: number
          season: string
          status: string
          updated_at: string
        }[]
      }
      pm_design_page: {
        Args: {
          p_after_id?: string
          p_after_updated_at?: string
          p_business_unit: string
          p_limit?: number
          p_search?: string
        }
        Returns: {
          id: string
          metadata: Json
          nas_path: string
          product_count: number
          status: string
          thumbnail_url: string
          title: string
          updated_at: string
        }[]
      }
      pm_my_reminder_page: {
        Args: { p_business_unit: string; p_limit?: number }
        Returns: {
          body: string
          created_at: string
          id: string
          payload: Json
          profile_id: string
          read_at: string
          target_id: string
          target_table: string
          title: string
        }[]
      }
      pm_my_revision_page: {
        Args: { p_business_unit: string; p_limit?: number }
        Returns: {
          body: string
          id: string
          metadata: Json
          product_id: string
          requested_at: string
          requested_by_profile_id: string
          resolved_at: string
          status: string
          submission_id: string
        }[]
      }
      pm_my_work_page: {
        Args: {
          p_after_id?: string
          p_after_updated_at?: string
          p_business_unit: string
          p_limit?: number
          p_role_id?: string
        }
        Returns: {
          buyer_contact_id: string
          company_id: string
          cover_url: string
          design_id: string
          factory_id: string
          id: string
          licensor_id: string
          lifecycle_status: string
          metadata: Json
          name: string
          product_type_id: string
          project_id: string
          property_id: string
          stage: string
          status: string
          updated_at: string
        }[]
      }
      pm_notes_page: {
        Args: {
          p_before_created_at?: string
          p_before_id?: string
          p_before_kind?: string
          p_business_unit: string
          p_limit?: number
          p_search?: string
          p_since?: string
        }
        Returns: {
          author: string
          body: string
          created_at: string
          id: string
          kind: string
          target: string
        }[]
      }
      pm_order_page: {
        Args: {
          p_after_id?: string
          p_after_updated_at?: string
          p_business_unit: string
          p_limit?: number
          p_search?: string
        }
        Returns: {
          company_id: string
          id: string
          metadata: Json
          notes: string
          order_date: string
          order_number: string
          product_id: string
          status: string
          updated_at: string
        }[]
      }
      pm_patch_product_metadata: {
        Args: {
          p_expected_updated_at?: string
          p_patch: Json
          p_product_id: string
        }
        Returns: {
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      pm_people_workload_page: {
        Args: {
          p_after_id?: string
          p_after_name?: string
          p_business_unit: string
          p_limit?: number
          p_search?: string
        }
        Returns: {
          assignments: number
          avatar_url: string
          display_name: string
          email: string
          id: string
          reminders: number
          revisions: number
          status: string
        }[]
      }
      pm_pipeline_count: {
        Args: {
          p_business_unit: string
          p_licensor_ids?: string[]
          p_lifecycle_states?: string[]
          p_list_names?: string[]
          p_search?: string
        }
        Returns: number
      }
      pm_pipeline_list_facets: {
        Args: { p_business_unit: string }
        Returns: {
          folder_name: string
          list_name: string
          product_count: number
        }[]
      }
      pm_pipeline_page: {
        Args: {
          p_after_id?: string
          p_after_updated_at?: string
          p_business_unit: string
          p_licensor_ids?: string[]
          p_lifecycle_states?: string[]
          p_limit?: number
          p_list_names?: string[]
          p_search?: string
        }
        Returns: {
          blocker_reason: string
          brand_assurance_number: string
          business_unit: string
          buyer_contact_id: string
          buyer_name: string
          clickup_folder_name: string
          clickup_list_name: string
          clickup_orderindex: string
          clickup_parent_id: string
          clickup_status: string
          clickup_status_color: string
          clickup_status_order: number
          clickup_status_type: string
          clickup_task_id: string
          clickup_time_estimate_ms: number
          closure_reason: string
          code: string
          company_id: string
          company_name: string
          cover_url: string
          created_at: string
          description: string
          factory_id: string
          factory_name: string
          id: string
          licensor_id: string
          licensor_name: string
          lifecycle_status: string
          name: string
          next_action: string
          next_owner_name: string
          next_owner_role_name: string
          on_shelf_date: string
          pi_status: string
          plm_item_id: string
          plm_item_number: string
          pps_requested_date: string
          product_type_id: string
          product_type_name: string
          project_id: string
          project_title: string
          property_id: string
          property_name: string
          risk_level: string
          stage: string
          status: string
          updated_at: string
          waiting_on: string
        }[]
      }
      pm_project_page: {
        Args: {
          p_after_id?: string
          p_after_updated_at?: string
          p_business_unit: string
          p_limit?: number
          p_search?: string
        }
        Returns: {
          brief: string
          business_unit: string
          collection_name: string
          company_id: string
          company_name: string
          contact_id: string
          contact_name: string
          design_collection_id: string
          id: string
          on_shelf_date: string
          pps_requested_date: string
          product_count: number
          restrictions: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      pm_schedule_page: {
        Args: {
          p_after_date?: string
          p_after_id?: string
          p_business_unit: string
          p_end: string
          p_limit?: number
          p_search?: string
          p_start: string
        }
        Returns: {
          context: string
          event_date: string
          id: string
          kind: string
          status: string
          title: string
        }[]
      }
      pm_set_product_stage: {
        Args: { p_product_id: string; p_target_stage_id: string }
        Returns: {
          id: string
          lifecycle_status: string
          name: string
          stage: string
          updated_at: string
        }[]
      }
      pm_upsert_view_pref: {
        Args: { p_patch: Json; p_scope: string }
        Returns: {
          config: Json
          id: string
          profile_id: string
          scope: string
          updated_at: string
        }[]
      }
      vendor_exclusion_list: {
        Args: never
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "vendor_exclusion"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      vendor_quarantine_list: {
        Args: never
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "vendor_quarantine"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      vendor_sync_run_list: {
        Args: { p_limit?: number }
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "sync_run"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
      AdditionalUserEmail: {
        Row: {
          email: string | null
          id: number
          user_id_fk: number | null
          userType: string | null
        }
        Insert: {
          email?: string | null
          id?: never
          user_id_fk?: number | null
          userType?: string | null
        }
        Update: {
          email?: string | null
          id?: never
          user_id_fk?: number | null
          userType?: string | null
        }
        Relationships: []
      }
      ai_cache_events: {
        Row: {
          api_backend: string
          cache_creation_tokens: number
          cache_hit_rate_pct: number
          cache_hit_tokens: number
          cache_miss_tokens: number
          cache_strategy: string
          completion_tokens: number
          created_at: string
          feature: string
          id: string
          model: string
          prompt_tokens: number
          provider: string
          reasoning_tokens: number
          session_id: string | null
          telemetry_available: boolean
          total_tokens: number
        }
        Insert: {
          api_backend: string
          cache_creation_tokens?: number
          cache_hit_rate_pct?: number
          cache_hit_tokens?: number
          cache_miss_tokens?: number
          cache_strategy: string
          completion_tokens?: number
          created_at?: string
          feature?: string
          id: string
          model: string
          prompt_tokens?: number
          provider: string
          reasoning_tokens?: number
          session_id?: string | null
          telemetry_available?: boolean
          total_tokens?: number
        }
        Update: {
          api_backend?: string
          cache_creation_tokens?: number
          cache_hit_rate_pct?: number
          cache_hit_tokens?: number
          cache_miss_tokens?: number
          cache_strategy?: string
          completion_tokens?: number
          created_at?: string
          feature?: string
          id?: string
          model?: string
          prompt_tokens?: number
          provider?: string
          reasoning_tokens?: number
          session_id?: string | null
          telemetry_available?: boolean
          total_tokens?: number
        }
        Relationships: []
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
      app_settings: {
        Row: {
          created_at: string | null
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      AuditLog: {
        Row: {
          actionDate: string | null
          actionType: string | null
          element_id: string | null
          id: number
          moduleName: string | null
          newValue: string | null
          oldValue: string | null
          ref_id_fk: number | null
          user_id_fk: number | null
          username: string | null
        }
        Insert: {
          actionDate?: string | null
          actionType?: string | null
          element_id?: string | null
          id?: number
          moduleName?: string | null
          newValue?: string | null
          oldValue?: string | null
          ref_id_fk?: number | null
          user_id_fk?: number | null
          username?: string | null
        }
        Update: {
          actionDate?: string | null
          actionType?: string | null
          element_id?: string | null
          id?: number
          moduleName?: string | null
          newValue?: string | null
          oldValue?: string | null
          ref_id_fk?: number | null
          user_id_fk?: number | null
          username?: string | null
        }
        Relationships: []
      }
      auth_token: {
        Row: {
          email: string | null
          id: number
          status: boolean | null
          token: string | null
        }
        Insert: {
          email?: string | null
          id?: never
          status?: boolean | null
          token?: string | null
        }
        Update: {
          email?: string | null
          id?: never
          status?: boolean | null
          token?: string | null
        }
        Relationships: []
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
      db_data_admin_audit_event: {
        Row: {
          action: string
          actor_profile_id: string | null
          actor_user_id: string | null
          entity_id: string
          entity_type: string
          error_code: string | null
          error_detail: Json | null
          id: string
          merge_loser_id: string | null
          merge_survivor_id: string | null
          new_snapshot: Json | null
          occurred_at: string
          old_snapshot: Json | null
          operation_id: string
          operation_item_key: string
          reason: string
          succeeded: boolean
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          actor_user_id?: string | null
          entity_id: string
          entity_type: string
          error_code?: string | null
          error_detail?: Json | null
          id?: string
          merge_loser_id?: string | null
          merge_survivor_id?: string | null
          new_snapshot?: Json | null
          occurred_at?: string
          old_snapshot?: Json | null
          operation_id: string
          operation_item_key?: string
          reason: string
          succeeded: boolean
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          actor_user_id?: string | null
          entity_id?: string
          entity_type?: string
          error_code?: string | null
          error_detail?: Json | null
          id?: string
          merge_loser_id?: string | null
          merge_survivor_id?: string | null
          new_snapshot?: Json | null
          occurred_at?: string
          old_snapshot?: Json | null
          operation_id?: string
          operation_item_key?: string
          reason?: string
          succeeded?: boolean
        }
        Relationships: []
      }
      db_data_admin_feature_gate: {
        Row: {
          enabled: boolean
          feature: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          enabled: boolean
          feature: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          feature?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      db_data_admin_grid_state: {
        Row: {
          created_at: string
          entity_type: string
          profile_id: string
          state: Json
          updated_at: string
          version: number
          view_key: string
        }
        Insert: {
          created_at?: string
          entity_type: string
          profile_id: string
          state?: Json
          updated_at?: string
          version?: number
          view_key: string
        }
        Update: {
          created_at?: string
          entity_type?: string
          profile_id?: string
          state?: Json
          updated_at?: string
          version?: number
          view_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "db_data_admin_grid_state_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          emails: string
          id: number
          message_id: string
          sent_at: string
          subject: string
          template: string
        }
        Insert: {
          emails: string
          id?: number
          message_id: string
          sent_at?: string
          subject: string
          template: string
        }
        Update: {
          emails?: string
          id?: number
          message_id?: string
          sent_at?: string
          subject?: string
          template?: string
        }
        Relationships: []
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
      quote_auth_token: {
        Row: {
          expired_date: string | null
          id: number
          initiated_token: string | null
          replaced_token: string | null
          start_date: string | null
          user_email: string | null
        }
        Insert: {
          expired_date?: string | null
          id?: never
          initiated_token?: string | null
          replaced_token?: string | null
          start_date?: string | null
          user_email?: string | null
        }
        Update: {
          expired_date?: string | null
          id?: never
          initiated_token?: string | null
          replaced_token?: string | null
          start_date?: string | null
          user_email?: string | null
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
      RolePermissions: {
        Row: {
          Access: boolean
          ElementId: number
          Id: number
          RoleId: number
          UserId: number | null
        }
        Insert: {
          Access: boolean
          ElementId: number
          Id?: never
          RoleId: number
          UserId?: number | null
        }
        Update: {
          Access?: boolean
          ElementId?: number
          Id?: never
          RoleId?: number
          UserId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "RolePermissions_ElementId_fkey"
            columns: ["ElementId"]
            isOneToOne: false
            referencedRelation: "UIElements"
            referencedColumns: ["Id"]
          },
          {
            foreignKeyName: "RolePermissions_UserId_fkey"
            columns: ["UserId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      UIElements: {
        Row: {
          Id: number
          Name: string
          ParentId: number | null
          Type: string
        }
        Insert: {
          Id?: never
          Name: string
          ParentId?: number | null
          Type: string
        }
        Update: {
          Id?: never
          Name?: string
          ParentId?: number | null
          Type?: string
        }
        Relationships: [
          {
            foreignKeyName: "UIElements_ParentId_fkey"
            columns: ["ParentId"]
            isOneToOne: false
            referencedRelation: "UIElements"
            referencedColumns: ["Id"]
          },
        ]
      }
      user_notification: {
        Row: {
          created_date: string | null
          event: string | null
          id: number
          message: string | null
          title: string | null
          type: string | null
          unread: boolean | null
          user_id_fk: number | null
        }
        Insert: {
          created_date?: string | null
          event?: string | null
          id?: never
          message?: string | null
          title?: string | null
          type?: string | null
          unread?: boolean | null
          user_id_fk?: number | null
        }
        Update: {
          created_date?: string | null
          event?: string | null
          id?: never
          message?: string | null
          title?: string | null
          type?: string | null
          unread?: boolean | null
          user_id_fk?: number | null
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
      users: {
        Row: {
          _airbyte_emitted_at: string | null
          _airbyte_users_hashid: string | null
          adddate: string | null
          auditlog: string | null
          email: string | null
          expire: string | null
          graph_photo: string | null
          graph_photo_synced_at: string | null
          id: number
          lastname: string | null
          level: string | null
          name: string | null
          notes: string | null
          notificationemail: string | null
          notificationsms: string | null
          passw: string | null
          phonenum: string | null
          profile_photo: string | null
          status: string | null
          subleveladmin: string | null
          subscription: string | null
        }
        Insert: {
          _airbyte_emitted_at?: string | null
          _airbyte_users_hashid?: string | null
          adddate?: string | null
          auditlog?: string | null
          email?: string | null
          expire?: string | null
          graph_photo?: string | null
          graph_photo_synced_at?: string | null
          id?: never
          lastname?: string | null
          level?: string | null
          name?: string | null
          notes?: string | null
          notificationemail?: string | null
          notificationsms?: string | null
          passw?: string | null
          phonenum?: string | null
          profile_photo?: string | null
          status?: string | null
          subleveladmin?: string | null
          subscription?: string | null
        }
        Update: {
          _airbyte_emitted_at?: string | null
          _airbyte_users_hashid?: string | null
          adddate?: string | null
          auditlog?: string | null
          email?: string | null
          expire?: string | null
          graph_photo?: string | null
          graph_photo_synced_at?: string | null
          id?: never
          lastname?: string | null
          level?: string | null
          name?: string | null
          notes?: string | null
          notificationemail?: string | null
          notificationsms?: string | null
          passw?: string | null
          phonenum?: string | null
          profile_photo?: string | null
          status?: string | null
          subleveladmin?: string | null
          subscription?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_profile_id: { Args: never; Returns: string }
      db_data_admin_customer_row: { Args: { p_id: string }; Returns: Json }
      db_data_admin_extension_conflicts: {
        Args: {
          p_key: string
          p_loser: string
          p_prefix: string
          p_survivor: string
          p_table: unknown
        }
        Returns: Json
      }
      db_data_admin_latest_plm_customer_status: {
        Args: { p_company_id: string }
        Returns: string
      }
      db_data_admin_merge_execute: {
        Args: {
          p_kind: string
          p_loser: string
          p_operation_id: string
          p_preview_token: string
          p_reason: string
          p_resolutions: Json
          p_survivor: string
        }
        Returns: Json
      }
      db_data_admin_merge_fk_counts: {
        Args: { p_loser: string; p_target: unknown }
        Returns: Json
      }
      db_data_admin_merge_preview: {
        Args: { p_kind: string; p_loser: string; p_survivor: string }
        Returns: Json
      }
      db_data_admin_reconcile_extension: {
        Args: {
          p_key: string
          p_loser: string
          p_prefix: string
          p_resolutions: Json
          p_survivor: string
          p_table: unknown
        }
        Returns: undefined
      }
      db_data_admin_single_record_writes_enabled: {
        Args: never
        Returns: boolean
      }
      db_data_admin_vendor_row: { Args: { p_id: string }; Returns: Json }
      has_any_role: {
        Args: { required_roles: Database["app"]["Enums"]["app_role"][] }
        Returns: boolean
      }
      has_app_access: {
        Args: { required_app: Database["app"]["Enums"]["app_name"] }
        Returns: boolean
      }
      has_explicit_app_access: {
        Args: { required_app: Database["app"]["Enums"]["app_name"] }
        Returns: boolean
      }
      has_role: {
        Args: { required_role: Database["app"]["Enums"]["app_role"] }
        Returns: boolean
      }
      jwt_role_names: { Args: never; Returns: string[] }
      require_db_data_admin_access: { Args: never; Returns: undefined }
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
      entity_status:
        | "active"
        | "inactive"
        | "archived"
        | "deleted"
        | "potential"
      file_storage_provider:
        | "supabase"
        | "spaces"
        | "directus"
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
      age_group: {
        Row: {
          created_at: string
          created_by: number
          id: number
          is_active: boolean
          name: string
          updated_at: string | null
          updated_by: number | null
        }
        Insert: {
          created_at?: string
          created_by: number
          id?: number
          is_active?: boolean
          name: string
          updated_at?: string | null
          updated_by?: number | null
        }
        Update: {
          created_at?: string
          created_by?: number
          id?: number
          is_active?: boolean
          name?: string
          updated_at?: string | null
          updated_by?: number | null
        }
        Relationships: []
      }
      art_types: {
        Row: {
          code: string
          created_at: string
          created_by: number
          divisioncode_id: number
          id: number
          is_active: boolean
          name: string
          updated_at: string | null
          updated_by: number | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: number
          divisioncode_id: number
          id?: number
          is_active?: boolean
          name: string
          updated_at?: string | null
          updated_by?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: number
          divisioncode_id?: number
          id?: number
          is_active?: boolean
          name?: string
          updated_at?: string | null
          updated_by?: number | null
        }
        Relationships: []
      }
      artist: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          name: string
          normalized_name: string | null
          status: Database["app"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          normalized_name?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          normalized_name?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      artist_types: {
        Row: {
          code: string
          created_at: string
          created_by: number
          id: number
          is_active: boolean
          name: string
          updated_at: string | null
          updated_by: number | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: number
          id?: number
          is_active?: boolean
          name: string
          updated_at?: string | null
          updated_by?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: number
          id?: number
          is_active?: boolean
          name?: string
          updated_at?: string | null
          updated_by?: number | null
        }
        Relationships: []
      }
      channel: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
          status: Database["app"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
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
            referencedRelation: "customer"
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
            referencedRelation: "customer"
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
      creative_designer: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          name: string
          normalized_name: string | null
          status: Database["app"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          normalized_name?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          normalized_name?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      customer: {
        Row: {
          account_owner_profile_id: string | null
          address: Json
          chain_type: string | null
          company_type: string
          created_at: string
          customer_status: string | null
          display_name: string | null
          domain: string | null
          id: string
          is_potential: boolean
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
          display_name?: string | null
          domain?: string | null
          id?: string
          is_potential?: boolean
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
          display_name?: string | null
          domain?: string | null
          id?: string
          is_potential?: boolean
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
      customer_alias: {
        Row: {
          alias: string
          alias_type: string
          created_at: string
          customer_id: string
          id: string
          normalized_alias: string | null
          notes: string | null
          source_system: string | null
          updated_at: string
        }
        Insert: {
          alias: string
          alias_type?: string
          created_at?: string
          customer_id: string
          id?: string
          normalized_alias?: string | null
          notes?: string | null
          source_system?: string | null
          updated_at?: string
        }
        Update: {
          alias?: string
          alias_type?: string
          created_at?: string
          customer_id?: string
          id?: string
          normalized_alias?: string | null
          notes?: string | null
          source_system?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_alias_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_channel: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          channel_id: string
          customer_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          channel_id: string
          customer_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          channel_id?: string
          customer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_channel_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_channel_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer"
            referencedColumns: ["id"]
          },
        ]
      }
      externalCustomer: {
        Row: {
          active: string | null
          address1: string | null
          address2: string | null
          address3: string | null
          aRCustomerCode: string | null
          city: string | null
          commissionPerc1: string | null
          commissionPerc2: string | null
          companyCode: string | null
          countryCode: string | null
          createdTime: string | null
          createdUser: string | null
          currencyCode: string | null
          customerCode: string
          customerDBA: string | null
          customerDesc: string | null
          customerTypeCode: string | null
          dsCat: string | null
          factorCode: string | null
          faxNo: string | null
          glCode: string | null
          id: number
          modTime: string | null
          modUser: string | null
          oldCustomerCode: string | null
          parentCustomerCode: string | null
          phoneNo: string | null
          regionCode: string | null
          salesPersonCode1: string | null
          salesPersonCode2: string | null
          state: string | null
          udf01: string | null
          udf02: string | null
          udf03: string | null
          udf04: string | null
          udfDate01: string | null
          udfDate02: string | null
          useConsolidatedInvoice: string | null
          vendorNumber: string | null
          zipCode: string | null
        }
        Insert: {
          active?: string | null
          address1?: string | null
          address2?: string | null
          address3?: string | null
          aRCustomerCode?: string | null
          city?: string | null
          commissionPerc1?: string | null
          commissionPerc2?: string | null
          companyCode?: string | null
          countryCode?: string | null
          createdTime?: string | null
          createdUser?: string | null
          currencyCode?: string | null
          customerCode: string
          customerDBA?: string | null
          customerDesc?: string | null
          customerTypeCode?: string | null
          dsCat?: string | null
          factorCode?: string | null
          faxNo?: string | null
          glCode?: string | null
          id?: never
          modTime?: string | null
          modUser?: string | null
          oldCustomerCode?: string | null
          parentCustomerCode?: string | null
          phoneNo?: string | null
          regionCode?: string | null
          salesPersonCode1?: string | null
          salesPersonCode2?: string | null
          state?: string | null
          udf01?: string | null
          udf02?: string | null
          udf03?: string | null
          udf04?: string | null
          udfDate01?: string | null
          udfDate02?: string | null
          useConsolidatedInvoice?: string | null
          vendorNumber?: string | null
          zipCode?: string | null
        }
        Update: {
          active?: string | null
          address1?: string | null
          address2?: string | null
          address3?: string | null
          aRCustomerCode?: string | null
          city?: string | null
          commissionPerc1?: string | null
          commissionPerc2?: string | null
          companyCode?: string | null
          countryCode?: string | null
          createdTime?: string | null
          createdUser?: string | null
          currencyCode?: string | null
          customerCode?: string
          customerDBA?: string | null
          customerDesc?: string | null
          customerTypeCode?: string | null
          dsCat?: string | null
          factorCode?: string | null
          faxNo?: string | null
          glCode?: string | null
          id?: never
          modTime?: string | null
          modUser?: string | null
          oldCustomerCode?: string | null
          parentCustomerCode?: string | null
          phoneNo?: string | null
          regionCode?: string | null
          salesPersonCode1?: string | null
          salesPersonCode2?: string | null
          state?: string | null
          udf01?: string | null
          udf02?: string | null
          udf03?: string | null
          udf04?: string | null
          udfDate01?: string | null
          udfDate02?: string | null
          useConsolidatedInvoice?: string | null
          vendorNumber?: string | null
          zipCode?: string | null
        }
        Relationships: []
      }
      externalVendor: {
        Row: {
          active: string | null
          address1: string | null
          address2: string | null
          address3: string | null
          city: string | null
          companyCode: string | null
          countryCode: string | null
          createdTime: string | null
          createdUser: string | null
          email: string | null
          faxNo: string | null
          femaExpDate: string | null
          glCode: string | null
          id: number
          modTime: string | null
          modUser: string | null
          nbcExpDate: string | null
          payTermCode: string | null
          phoneNo: string | null
          separateCheck: string | null
          state: string | null
          udf01: string | null
          udf02: string | null
          udf03: string | null
          udf04: string | null
          udfDate01: string | null
          udfDate02: string | null
          vendorCode: string
          vendorDesc: string | null
          zipCode: string | null
        }
        Insert: {
          active?: string | null
          address1?: string | null
          address2?: string | null
          address3?: string | null
          city?: string | null
          companyCode?: string | null
          countryCode?: string | null
          createdTime?: string | null
          createdUser?: string | null
          email?: string | null
          faxNo?: string | null
          femaExpDate?: string | null
          glCode?: string | null
          id?: never
          modTime?: string | null
          modUser?: string | null
          nbcExpDate?: string | null
          payTermCode?: string | null
          phoneNo?: string | null
          separateCheck?: string | null
          state?: string | null
          udf01?: string | null
          udf02?: string | null
          udf03?: string | null
          udf04?: string | null
          udfDate01?: string | null
          udfDate02?: string | null
          vendorCode: string
          vendorDesc?: string | null
          zipCode?: string | null
        }
        Update: {
          active?: string | null
          address1?: string | null
          address2?: string | null
          address3?: string | null
          city?: string | null
          companyCode?: string | null
          countryCode?: string | null
          createdTime?: string | null
          createdUser?: string | null
          email?: string | null
          faxNo?: string | null
          femaExpDate?: string | null
          glCode?: string | null
          id?: never
          modTime?: string | null
          modUser?: string | null
          nbcExpDate?: string | null
          payTermCode?: string | null
          phoneNo?: string | null
          separateCheck?: string | null
          state?: string | null
          udf01?: string | null
          udf02?: string | null
          udf03?: string | null
          udf04?: string | null
          udfDate01?: string | null
          udfDate02?: string | null
          vendorCode?: string
          vendorDesc?: string | null
          zipCode?: string | null
        }
        Relationships: []
      }
      factory: {
        Row: {
          code: string | null
          company_id: string | null
          country: string | null
          created_at: string
          display_name: string | null
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
          display_name?: string | null
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
          display_name?: string | null
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
            referencedRelation: "customer"
            referencedColumns: ["id"]
          },
        ]
      }
      factory_alias: {
        Row: {
          alias: string
          alias_type: string
          created_at: string
          factory_id: string
          id: string
          normalized_alias: string | null
          notes: string | null
          source_system: string | null
          updated_at: string
        }
        Insert: {
          alias: string
          alias_type?: string
          created_at?: string
          factory_id: string
          id?: string
          normalized_alias?: string | null
          notes?: string | null
          source_system?: string | null
          updated_at?: string
        }
        Update: {
          alias?: string
          alias_type?: string
          created_at?: string
          factory_id?: string
          id?: string
          normalized_alias?: string | null
          notes?: string | null
          source_system?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "factory_alias_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factory"
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
      freelance_designer: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          name: string
          normalized_name: string | null
          status: Database["app"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          normalized_name?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          normalized_name?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      licenseList: {
        Row: {
          licenseList_airbyte_emitted_at: string | null
          licenseList_airbyte_licenses_hashid: string | null
          licenseList_auditlog: string | null
          licenseList_code: string | null
          licenseList_fob_royalty_rate: number | null
          licenseList_id: number
          licenseList_royalty_rate: number | null
          licenseList_status: string | null
          licenseList_title: string | null
        }
        Insert: {
          licenseList_airbyte_emitted_at?: string | null
          licenseList_airbyte_licenses_hashid?: string | null
          licenseList_auditlog?: string | null
          licenseList_code?: string | null
          licenseList_fob_royalty_rate?: number | null
          licenseList_id?: number
          licenseList_royalty_rate?: number | null
          licenseList_status?: string | null
          licenseList_title?: string | null
        }
        Update: {
          licenseList_airbyte_emitted_at?: string | null
          licenseList_airbyte_licenses_hashid?: string | null
          licenseList_auditlog?: string | null
          licenseList_code?: string | null
          licenseList_fob_royalty_rate?: number | null
          licenseList_id?: number
          licenseList_royalty_rate?: number | null
          licenseList_status?: string | null
          licenseList_title?: string | null
        }
        Relationships: []
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
      merchGroup: {
        Row: {
          companyCode_fk: string | null
          companyCode_id_fk: number | null
          createdTime: string | null
          createdUser: string | null
          divisionCode_fk: string | null
          divisionCode_id_fk: number | null
          is_active: boolean | null
          ItemNoCode: string | null
          mg_code: string | null
          mg_desc: string | null
          mg_id: number
          mgCategory: string | null
          mgCode2: string | null
          mgTypeCode: string | null
          modTime: string | null
          modUser: string | null
          parent_id: number | null
        }
        Insert: {
          companyCode_fk?: string | null
          companyCode_id_fk?: number | null
          createdTime?: string | null
          createdUser?: string | null
          divisionCode_fk?: string | null
          divisionCode_id_fk?: number | null
          is_active?: boolean | null
          ItemNoCode?: string | null
          mg_code?: string | null
          mg_desc?: string | null
          mg_id?: never
          mgCategory?: string | null
          mgCode2?: string | null
          mgTypeCode?: string | null
          modTime?: string | null
          modUser?: string | null
          parent_id?: number | null
        }
        Update: {
          companyCode_fk?: string | null
          companyCode_id_fk?: number | null
          createdTime?: string | null
          createdUser?: string | null
          divisionCode_fk?: string | null
          divisionCode_id_fk?: number | null
          is_active?: boolean | null
          ItemNoCode?: string | null
          mg_code?: string | null
          mg_desc?: string | null
          mg_id?: never
          mgCategory?: string | null
          mgCode2?: string | null
          mgTypeCode?: string | null
          modTime?: string | null
          modUser?: string | null
          parent_id?: number | null
        }
        Relationships: []
      }
      merchGroupHeaders: {
        Row: {
          companyCode: string | null
          companyCode_id_fk: number | null
          createdTime: string | null
          createdUser: string | null
          divisionCode: string | null
          divisionCode_id_fk: number | null
          id: number
          mgTypeCode: string | null
          mgTypeDesc: string | null
          modTime: string | null
          modUser: string | null
        }
        Insert: {
          companyCode?: string | null
          companyCode_id_fk?: number | null
          createdTime?: string | null
          createdUser?: string | null
          divisionCode?: string | null
          divisionCode_id_fk?: number | null
          id?: never
          mgTypeCode?: string | null
          mgTypeDesc?: string | null
          modTime?: string | null
          modUser?: string | null
        }
        Update: {
          companyCode?: string | null
          companyCode_id_fk?: number | null
          createdTime?: string | null
          createdUser?: string | null
          divisionCode?: string | null
          divisionCode_id_fk?: number | null
          id?: never
          mgTypeCode?: string | null
          mgTypeDesc?: string | null
          modTime?: string | null
          modUser?: string | null
        }
        Relationships: []
      }
      merchGroupMaster: {
        Row: {
          companyCode_fk: string | null
          companyCode_id_fk: number | null
          createdTime: string | null
          createdUser: string | null
          divisionCode_fk: string | null
          divisionCode_id_fk: number | null
          is_active: boolean | null
          ItemNoCode: string | null
          mg_code: string | null
          mg_desc: string | null
          mg_id: number
          mgCategory: string | null
          mgCode2: string | null
          mgTypeCode: string | null
          modTime: string | null
          modUser: string | null
        }
        Insert: {
          companyCode_fk?: string | null
          companyCode_id_fk?: number | null
          createdTime?: string | null
          createdUser?: string | null
          divisionCode_fk?: string | null
          divisionCode_id_fk?: number | null
          is_active?: boolean | null
          ItemNoCode?: string | null
          mg_code?: string | null
          mg_desc?: string | null
          mg_id?: never
          mgCategory?: string | null
          mgCode2?: string | null
          mgTypeCode?: string | null
          modTime?: string | null
          modUser?: string | null
        }
        Update: {
          companyCode_fk?: string | null
          companyCode_id_fk?: number | null
          createdTime?: string | null
          createdUser?: string | null
          divisionCode_fk?: string | null
          divisionCode_id_fk?: number | null
          is_active?: boolean | null
          ItemNoCode?: string | null
          mg_code?: string | null
          mg_desc?: string | null
          mg_id?: never
          mgCategory?: string | null
          mgCode2?: string | null
          mgTypeCode?: string | null
          modTime?: string | null
          modUser?: string | null
        }
        Relationships: []
      }
      merchGroupRelations: {
        Row: {
          child_mg_id: number
          createdTime: string | null
          createdUser: number
          divisionCode_id_fk: number
          grand_parent_mg_id: number | null
          id: number
          is_active: boolean | null
          modTime: string | null
          modUser: number | null
          parent_mg_id: number
        }
        Insert: {
          child_mg_id: number
          createdTime?: string | null
          createdUser: number
          divisionCode_id_fk: number
          grand_parent_mg_id?: number | null
          id?: never
          is_active?: boolean | null
          modTime?: string | null
          modUser?: number | null
          parent_mg_id: number
        }
        Update: {
          child_mg_id?: number
          createdTime?: string | null
          createdUser?: number
          divisionCode_id_fk?: number
          grand_parent_mg_id?: number | null
          id?: never
          is_active?: boolean | null
          modTime?: string | null
          modUser?: number | null
          parent_mg_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "merchGroupRelations_child_mg_id_fkey"
            columns: ["child_mg_id"]
            isOneToOne: false
            referencedRelation: "merchGroupMaster"
            referencedColumns: ["mg_id"]
          },
          {
            foreignKeyName: "merchGroupRelations_grand_parent_mg_id_fkey"
            columns: ["grand_parent_mg_id"]
            isOneToOne: false
            referencedRelation: "merchGroupMaster"
            referencedColumns: ["mg_id"]
          },
          {
            foreignKeyName: "merchGroupRelations_parent_mg_id_fkey"
            columns: ["parent_mg_id"]
            isOneToOne: false
            referencedRelation: "merchGroupMaster"
            referencedColumns: ["mg_id"]
          },
        ]
      }
      packaging_type: {
        Row: {
          code: string | null
          created_at: string
          id: string
          metadata: Json
          name: string
          normalized_name: string | null
          status: Database["app"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          normalized_name?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          normalized_name?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
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
      product_material: {
        Row: {
          code: string | null
          created_at: string
          id: string
          material: string | null
          metadata: Json
          name: string
          product_subtype_id: string | null
          product_type_id: string | null
          status: Database["app"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          material?: string | null
          metadata?: Json
          name: string
          product_subtype_id?: string | null
          product_type_id?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          material?: string | null
          metadata?: Json
          name?: string
          product_subtype_id?: string | null
          product_type_id?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_material_product_subtype_id_fkey"
            columns: ["product_subtype_id"]
            isOneToOne: false
            referencedRelation: "product_subtype"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_material_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_type"
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
      properties_and_characters: {
        Row: {
          created_at: string
          id: number
          licensor_id: number
          name: string
          source_character_id: string | null
          source_licensed_property_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: number
          licensor_id: number
          name: string
          source_character_id?: string | null
          source_licensed_property_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          licensor_id?: number
          name?: string
          source_character_id?: string | null
          source_licensed_property_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_and_characters_licensor_id_fkey"
            columns: ["licensor_id"]
            isOneToOne: false
            referencedRelation: "licenseList"
            referencedColumns: ["licenseList_id"]
          },
        ]
      }
      property: {
        Row: {
          code: string | null
          created_at: string
          id: string
          licensor_id: string
          metadata: Json
          name: string
          status: Database["app"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          licensor_id: string
          metadata?: Json
          name: string
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          licensor_id?: string
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
      property_character_associations: {
        Row: {
          character_id: number
          created_at: string
          licensor_id: number
          property_id: number
          updated_at: string | null
        }
        Insert: {
          character_id: number
          created_at?: string
          licensor_id: number
          property_id: number
          updated_at?: string | null
        }
        Update: {
          character_id?: number
          created_at?: string
          licensor_id?: number
          property_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_character_associations_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "properties_and_characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_character_associations_licensor_id_fkey"
            columns: ["licensor_id"]
            isOneToOne: false
            referencedRelation: "licenseList"
            referencedColumns: ["licenseList_id"]
          },
          {
            foreignKeyName: "property_character_associations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties_and_characters"
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
      technical_designer: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          name: string
          normalized_name: string | null
          status: Database["app"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          normalized_name?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          normalized_name?: string | null
          status?: Database["app"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      vendor: {
        Row: {
          factory_id_fk: number | null
          vendor_access: string | null
          vendor_address1: string | null
          vendor_address2: string | null
          vendor_company_name: string | null
          vendor_company_nickname: string | null
          vendor_country: string | null
          vendor_email: string | null
          vendor_id: number
          vendor_lastname: string | null
          vendor_name: string | null
          vendor_passw: string | null
          vendor_phone1: string | null
          vendor_phone2: string | null
          vendor_profile_photo: string | null
          vendor_status: string | null
          vendor_wechatId: string | null
        }
        Insert: {
          factory_id_fk?: number | null
          vendor_access?: string | null
          vendor_address1?: string | null
          vendor_address2?: string | null
          vendor_company_name?: string | null
          vendor_company_nickname?: string | null
          vendor_country?: string | null
          vendor_email?: string | null
          vendor_id?: number
          vendor_lastname?: string | null
          vendor_name?: string | null
          vendor_passw?: string | null
          vendor_phone1?: string | null
          vendor_phone2?: string | null
          vendor_profile_photo?: string | null
          vendor_status?: string | null
          vendor_wechatId?: string | null
        }
        Update: {
          factory_id_fk?: number | null
          vendor_access?: string | null
          vendor_address1?: string | null
          vendor_address2?: string | null
          vendor_company_name?: string | null
          vendor_company_nickname?: string | null
          vendor_country?: string | null
          vendor_email?: string | null
          vendor_id?: number
          vendor_lastname?: string | null
          vendor_name?: string | null
          vendor_passw?: string | null
          vendor_phone1?: string | null
          vendor_phone2?: string | null
          vendor_profile_photo?: string | null
          vendor_status?: string | null
          vendor_wechatId?: string | null
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
      vendorGroup: {
        Row: {
          factory_ids: number[] | null
          id: number
          name: string
        }
        Insert: {
          factory_ids?: number[] | null
          id?: number
          name: string
        }
        Update: {
          factory_ids?: number[] | null
          id?: number
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_customer: {
        Args: {
          match_threshold?: number
          p_domain?: string
          p_name: string
          review_threshold?: number
        }
        Returns: {
          match_id: string
          review_id: string
          review_sim: number
        }[]
      }
      merge_customer: {
        Args: {
          p_alias_loser_name?: boolean
          p_loser: string
          p_survivor: string
        }
        Returns: undefined
      }
      merge_factory: {
        Args: {
          p_alias_loser_name?: boolean
          p_loser: string
          p_survivor: string
        }
        Returns: undefined
      }
      reconcile_merge_extension_row: {
        Args: {
          p_key_column: string
          p_loser: string
          p_survivor: string
          p_table: unknown
        }
        Returns: undefined
      }
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
      customer_ext: {
        Row: {
          created_at: string
          customer_id: string
          status: Database["app"]["Enums"]["entity_status"]
          status_changed_at: string | null
          status_changed_by: string | null
          status_reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          status?: Database["app"]["Enums"]["entity_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          status?: Database["app"]["Enums"]["entity_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          updated_at?: string
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
      factory_ext: {
        Row: {
          created_at: string
          factory_id: string
          status: Database["app"]["Enums"]["entity_status"]
          status_changed_at: string | null
          status_changed_by: string | null
          status_reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          factory_id: string
          status?: Database["app"]["Enums"]["entity_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          factory_id?: string
          status?: Database["app"]["Enums"]["entity_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Relationships: []
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
      ingested_domain: {
        Row: {
          created_at: string
          display_name: string | null
          domain: string
          email_count: number
          first_seen_at: string | null
          id: string
          last_seen_at: string | null
          last_sender: string | null
          metadata: Json
          sample_subject: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          domain: string
          email_count?: number
          first_seen_at?: string | null
          id?: string
          last_seen_at?: string | null
          last_sender?: string | null
          metadata?: Json
          sample_subject?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          domain?: string
          email_count?: number
          first_seen_at?: string | null
          id?: string
          last_seen_at?: string | null
          last_sender?: string | null
          metadata?: Json
          sample_subject?: string | null
          status?: string
          updated_at?: string
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
      record_ingested_domain: {
        Args: {
          p_display_name?: string
          p_domain: string
          p_sender?: string
          p_subject?: string
        }
        Returns: {
          created_at: string
          display_name: string | null
          domain: string
          email_count: number
          first_seen_at: string | null
          id: string
          last_seen_at: string | null
          last_sender: string | null
          metadata: Json
          sample_subject: string | null
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "ingested_domain"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  pim: {
    Tables: {
      checklist_item: {
        Row: {
          created_at: string
          external_id: string | null
          external_source: string | null
          id: string
          metadata: Json
          product_id: string | null
          project_id: string | null
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          metadata?: Json
          product_id?: string | null
          project_id?: string | null
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          metadata?: Json
          product_id?: string | null
          project_id?: string | null
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_item_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_ext: {
        Row: {
          created_at: string
          customer_id: string
          status: Database["app"]["Enums"]["entity_status"]
          status_changed_at: string | null
          status_changed_by: string | null
          status_reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          status?: Database["app"]["Enums"]["entity_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          status?: Database["app"]["Enums"]["entity_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_order: {
        Row: {
          company_id: string | null
          created_at: string
          due_date: string | null
          external_id: string | null
          external_source: string | null
          id: string
          metadata: Json
          notes: string | null
          order_date: string | null
          order_number: string | null
          product_id: string | null
          production_order_id: string | null
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          due_date?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          order_date?: string | null
          order_number?: string | null
          product_id?: string | null
          production_order_id?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          due_date?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          order_date?: string | null
          order_number?: string | null
          product_id?: string | null
          production_order_id?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_order_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_order_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      design: {
        Row: {
          created_at: string
          design_collection_id: string | null
          external_id: string | null
          external_source: string | null
          id: string
          metadata: Json
          nas_path: string | null
          primary_asset_id: string | null
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          design_collection_id?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          metadata?: Json
          nas_path?: string | null
          primary_asset_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          design_collection_id?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          metadata?: Json
          nas_path?: string | null
          primary_asset_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_design_collection_id_fkey"
            columns: ["design_collection_id"]
            isOneToOne: false
            referencedRelation: "design_collection"
            referencedColumns: ["id"]
          },
        ]
      }
      design_asset: {
        Row: {
          asset_id: string
          confidence: Database["app"]["Enums"]["source_confidence"]
          created_at: string
          design_id: string
          id: string
          is_primary: boolean
          link_type: string
        }
        Insert: {
          asset_id: string
          confidence?: Database["app"]["Enums"]["source_confidence"]
          created_at?: string
          design_id: string
          id?: string
          is_primary?: boolean
          link_type?: string
        }
        Update: {
          asset_id?: string
          confidence?: Database["app"]["Enums"]["source_confidence"]
          created_at?: string
          design_id?: string
          id?: string
          is_primary?: boolean
          link_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_asset_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "design"
            referencedColumns: ["id"]
          },
        ]
      }
      design_collection: {
        Row: {
          company_id: string | null
          created_at: string
          external_id: string | null
          external_source: string | null
          id: string
          metadata: Json
          name: string
          season: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          metadata?: Json
          name: string
          season?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          metadata?: Json
          name?: string
          season?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      factory_ext: {
        Row: {
          created_at: string
          factory_id: string
          status: Database["app"]["Enums"]["entity_status"]
          status_changed_at: string | null
          status_changed_by: string | null
          status_reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          factory_id: string
          status?: Database["app"]["Enums"]["entity_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          factory_id?: string
          status?: Database["app"]["Enums"]["entity_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product: {
        Row: {
          buyer_contact_id: string | null
          clickup_parent_id: string | null
          clickup_status: string | null
          clickup_task_id: string | null
          code: string | null
          company_id: string | null
          cover_url: string | null
          created_at: string
          design_id: string | null
          external_id: string | null
          external_source: string | null
          factory_id: string | null
          id: string
          licensor_id: string | null
          lifecycle_status: string | null
          metadata: Json
          name: string
          plm_item_id: string | null
          product_type_id: string | null
          project_id: string | null
          property_id: string | null
          stage: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          buyer_contact_id?: string | null
          clickup_parent_id?: string | null
          clickup_status?: string | null
          clickup_task_id?: string | null
          code?: string | null
          company_id?: string | null
          cover_url?: string | null
          created_at?: string
          design_id?: string | null
          external_id?: string | null
          external_source?: string | null
          factory_id?: string | null
          id?: string
          licensor_id?: string | null
          lifecycle_status?: string | null
          metadata?: Json
          name: string
          plm_item_id?: string | null
          product_type_id?: string | null
          project_id?: string | null
          property_id?: string | null
          stage?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          buyer_contact_id?: string | null
          clickup_parent_id?: string | null
          clickup_status?: string | null
          clickup_task_id?: string | null
          code?: string | null
          company_id?: string | null
          cover_url?: string | null
          created_at?: string
          design_id?: string | null
          external_id?: string | null
          external_source?: string | null
          factory_id?: string | null
          id?: string
          licensor_id?: string | null
          lifecycle_status?: string | null
          metadata?: Json
          name?: string
          plm_item_id?: string | null
          product_type_id?: string | null
          project_id?: string | null
          property_id?: string | null
          stage?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "design"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      product_assignee: {
        Row: {
          assignment_type: string
          created_at: string
          id: string
          product_id: string
          profile_id: string
        }
        Insert: {
          assignment_type?: string
          created_at?: string
          id?: string
          product_id: string
          profile_id: string
        }
        Update: {
          assignment_type?: string
          created_at?: string
          id?: string
          product_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_assignee_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_field: {
        Row: {
          created_at: string
          external_id: string | null
          external_source: string | null
          field_name: string
          id: string
          product_id: string
          updated_at: string
          value_json: Json | null
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          field_name: string
          id?: string
          product_id: string
          updated_at?: string
          value_json?: Json | null
        }
        Update: {
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          field_name?: string
          id?: string
          product_id?: string
          updated_at?: string
          value_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "product_field_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_file: {
        Row: {
          created_at: string
          dam_asset_id: string | null
          external_id: string | null
          external_source: string | null
          file_object_id: string | null
          id: string
          metadata: Json
          product_id: string
          source_url: string | null
          stored_url: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dam_asset_id?: string | null
          external_id?: string | null
          external_source?: string | null
          file_object_id?: string | null
          id?: string
          metadata?: Json
          product_id: string
          source_url?: string | null
          stored_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dam_asset_id?: string | null
          external_id?: string | null
          external_source?: string | null
          file_object_id?: string | null
          id?: string
          metadata?: Json
          product_id?: string
          source_url?: string | null
          stored_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_file_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_link: {
        Row: {
          created_at: string
          from_product_id: string
          id: string
          link_type: string
          metadata: Json
          to_product_id: string
        }
        Insert: {
          created_at?: string
          from_product_id: string
          id?: string
          link_type: string
          metadata?: Json
          to_product_id: string
        }
        Update: {
          created_at?: string
          from_product_id?: string
          id?: string
          link_type?: string
          metadata?: Json
          to_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_link_from_product_id_fkey"
            columns: ["from_product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_link_to_product_id_fkey"
            columns: ["to_product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sample: {
        Row: {
          created_at: string
          external_id: string | null
          external_source: string | null
          factory_id: string | null
          id: string
          metadata: Json
          product_id: string
          received_at: string | null
          requested_at: string | null
          sample_type: string | null
          status: string
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          factory_id?: string | null
          id?: string
          metadata?: Json
          product_id: string
          received_at?: string | null
          requested_at?: string | null
          sample_type?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          factory_id?: string | null
          id?: string
          metadata?: Json
          product_id?: string
          received_at?: string | null
          requested_at?: string | null
          sample_type?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sample_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_style_group: {
        Row: {
          confidence: Database["app"]["Enums"]["source_confidence"]
          created_at: string
          id: string
          product_id: string
          style_group_id: string
        }
        Insert: {
          confidence?: Database["app"]["Enums"]["source_confidence"]
          created_at?: string
          id?: string
          product_id: string
          style_group_id: string
        }
        Update: {
          confidence?: Database["app"]["Enums"]["source_confidence"]
          created_at?: string
          id?: string
          product_id?: string
          style_group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_style_group_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_submission: {
        Row: {
          approved_at: string | null
          created_at: string
          external_id: string | null
          external_source: string | null
          id: string
          licensor_id: string | null
          metadata: Json
          product_id: string
          property_id: string | null
          rejected_at: string | null
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          licensor_id?: string | null
          metadata?: Json
          product_id: string
          property_id?: string | null
          rejected_at?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          licensor_id?: string | null
          metadata?: Json
          product_id?: string
          property_id?: string | null
          rejected_at?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_submission_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tag: {
        Row: {
          created_at: string
          id: string
          product_id: string
          source_system: string | null
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          source_system?: string | null
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          source_system?: string | null
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tag_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_time_entry: {
        Row: {
          created_at: string
          external_id: string | null
          external_source: string | null
          id: string
          metadata: Json
          product_id: string
          profile_id: string | null
          seconds_spent: number
          started_at: string | null
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          metadata?: Json
          product_id: string
          profile_id?: string | null
          seconds_spent: number
          started_at?: string | null
        }
        Update: {
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          metadata?: Json
          product_id?: string
          profile_id?: string | null
          seconds_spent?: number
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_time_entry_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      product_update: {
        Row: {
          body: string | null
          created_at: string
          external_id: string | null
          external_source: string | null
          id: string
          metadata: Json
          product_id: string
          profile_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          metadata?: Json
          product_id: string
          profile_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          metadata?: Json
          product_id?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_update_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      project: {
        Row: {
          company_id: string | null
          created_at: string
          design_collection_id: string | null
          external_id: string | null
          external_source: string | null
          id: string
          licensor_id: string | null
          metadata: Json
          primary_contact_id: string | null
          property_id: string | null
          stage: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          design_collection_id?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          licensor_id?: string | null
          metadata?: Json
          primary_contact_id?: string | null
          property_id?: string | null
          stage?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          design_collection_id?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          licensor_id?: string | null
          metadata?: Json
          primary_contact_id?: string | null
          property_id?: string | null
          stage?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_design_collection_id_fkey"
            columns: ["design_collection_id"]
            isOneToOne: false
            referencedRelation: "design_collection"
            referencedColumns: ["id"]
          },
        ]
      }
      revision_request: {
        Row: {
          body: string | null
          external_id: string | null
          external_source: string | null
          id: string
          metadata: Json
          product_id: string
          requested_at: string
          requested_by_profile_id: string | null
          resolved_at: string | null
          status: string
          submission_id: string | null
        }
        Insert: {
          body?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          metadata?: Json
          product_id: string
          requested_at?: string
          requested_by_profile_id?: string | null
          resolved_at?: string | null
          status?: string
          submission_id?: string | null
        }
        Update: {
          body?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          metadata?: Json
          product_id?: string
          requested_at?: string
          requested_by_profile_id?: string | null
          resolved_at?: string | null
          status?: string
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revision_request_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_request_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "product_submission"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_view: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_default: boolean
          name: string
          owner_profile_id: string | null
          role_id: string | null
          scope: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          owner_profile_id?: string | null
          role_id?: string | null
          scope: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          owner_profile_id?: string | null
          role_id?: string | null
          scope?: string
          updated_at?: string
        }
        Relationships: []
      }
      stage: {
        Row: {
          code: string | null
          id: string
          metadata: Json
          name: string
          pipeline: string
          sort_order: number
        }
        Insert: {
          code?: string | null
          id?: string
          metadata?: Json
          name: string
          pipeline?: string
          sort_order?: number
        }
        Update: {
          code?: string | null
          id?: string
          metadata?: Json
          name?: string
          pipeline?: string
          sort_order?: number
        }
        Relationships: []
      }
      stage_history: {
        Row: {
          changed_at: string
          changed_by_profile_id: string | null
          from_stage_id: string | null
          id: string
          metadata: Json
          notes: string | null
          product_id: string | null
          project_id: string | null
          to_stage_id: string | null
        }
        Insert: {
          changed_at?: string
          changed_by_profile_id?: string | null
          from_stage_id?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          product_id?: string | null
          project_id?: string | null
          to_stage_id?: string | null
        }
        Update: {
          changed_at?: string
          changed_by_profile_id?: string | null
          from_stage_id?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          product_id?: string | null
          project_id?: string | null
          to_stage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stage_history_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "stage"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_history_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "stage"
            referencedColumns: ["id"]
          },
        ]
      }
      view_pref: {
        Row: {
          config: Json
          id: string
          profile_id: string
          scope: string
          updated_at: string
        }
        Insert: {
          config?: Json
          id?: string
          profile_id: string
          scope: string
          updated_at?: string
        }
        Update: {
          config?: Json
          id?: string
          profile_id?: string
          scope?: string
          updated_at?: string
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
      ai_tag_bakeoff_results: {
        Row: {
          ai_description: string | null
          asset_id: string
          character_ids: string[]
          character_names: string[]
          completion_tokens: number | null
          cost_usd: number | null
          created_at: string
          error_message: string | null
          id: string
          latency_ms: number | null
          model_id: string
          model_slot: string
          pricing_snapshot: Json | null
          prompt_tokens: number | null
          property_id: string | null
          property_name: string | null
          raw_output: Json | null
          run_id: string
          status: string
          tags: string[]
          total_tokens: number | null
          updated_at: string
        }
        Insert: {
          ai_description?: string | null
          asset_id: string
          character_ids?: string[]
          character_names?: string[]
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          model_id: string
          model_slot: string
          pricing_snapshot?: Json | null
          prompt_tokens?: number | null
          property_id?: string | null
          property_name?: string | null
          raw_output?: Json | null
          run_id: string
          status?: string
          tags?: string[]
          total_tokens?: number | null
          updated_at?: string
        }
        Update: {
          ai_description?: string | null
          asset_id?: string
          character_ids?: string[]
          character_names?: string[]
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          model_id?: string
          model_slot?: string
          pricing_snapshot?: Json | null
          prompt_tokens?: number | null
          property_id?: string | null
          property_name?: string | null
          raw_output?: Json | null
          run_id?: string
          status?: string
          tags?: string[]
          total_tokens?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tag_bakeoff_results_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tag_bakeoff_results_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "dam_character_catalog"
            referencedColumns: ["core_property_id"]
          },
          {
            foreignKeyName: "ai_tag_bakeoff_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ai_tag_bakeoff_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tag_bakeoff_reviews: {
        Row: {
          asset_id: string
          field: string
          id: string
          notes: string | null
          reviewed_at: string
          reviewed_by: string | null
          run_id: string
          scores: Json
          winner_slot: string | null
        }
        Insert: {
          asset_id: string
          field: string
          id?: string
          notes?: string | null
          reviewed_at?: string
          reviewed_by?: string | null
          run_id: string
          scores?: Json
          winner_slot?: string | null
        }
        Update: {
          asset_id?: string
          field?: string
          id?: string
          notes?: string | null
          reviewed_at?: string
          reviewed_by?: string | null
          run_id?: string
          scores?: Json
          winner_slot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_tag_bakeoff_reviews_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tag_bakeoff_reviews_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ai_tag_bakeoff_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tag_bakeoff_runs: {
        Row: {
          asset_ids: string[]
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          model_a: string
          model_b: string
          model_c: string
          model_d: string | null
          model_e: string | null
          name: string
          sample_size: number
          status: string
          updated_at: string
        }
        Insert: {
          asset_ids?: string[]
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          model_a: string
          model_b: string
          model_c: string
          model_d?: string | null
          model_e?: string | null
          name: string
          sample_size?: number
          status?: string
          updated_at?: string
        }
        Update: {
          asset_ids?: string[]
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          model_a?: string
          model_b?: string
          model_c?: string
          model_d?: string | null
          model_e?: string | null
          name?: string
          sample_size?: number
          status?: string
          updated_at?: string
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
          {
            foreignKeyName: "asset_characters_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "dam_character_catalog"
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
          content_type: string | null
          cover_description: string | null
          created_at: string
          customer: string | null
          customer_id: string | null
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
          product_dimensions: string | null
          product_material: string[] | null
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
          content_type?: string | null
          cover_description?: string | null
          created_at?: string
          customer?: string | null
          customer_id?: string | null
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
          product_dimensions?: string | null
          product_material?: string[] | null
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
          content_type?: string | null
          cover_description?: string | null
          created_at?: string
          customer?: string | null
          customer_id?: string | null
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
          product_dimensions?: string | null
          product_material?: string[] | null
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
            referencedRelation: "dam_character_catalog"
            referencedColumns: ["core_property_id"]
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
      dam_search_documents: {
        Row: {
          asset_id: string | null
          content_sha256: string
          customer: string | null
          document_type: string
          embedding: string | null
          embedding_error: string | null
          embedding_model: string | null
          embedding_updated_at: string | null
          entity_id: string
          indexed_at: string
          metadata: Json
          path: string
          program: string | null
          search_text: string
          search_tsv: unknown
          source_updated_at: string | null
          style_group_id: string | null
          title: string
        }
        Insert: {
          asset_id?: string | null
          content_sha256?: string
          customer?: string | null
          document_type: string
          embedding?: string | null
          embedding_error?: string | null
          embedding_model?: string | null
          embedding_updated_at?: string | null
          entity_id: string
          indexed_at?: string
          metadata?: Json
          path?: string
          program?: string | null
          search_text?: string
          search_tsv?: unknown
          source_updated_at?: string | null
          style_group_id?: string | null
          title?: string
        }
        Update: {
          asset_id?: string | null
          content_sha256?: string
          customer?: string | null
          document_type?: string
          embedding?: string | null
          embedding_error?: string | null
          embedding_model?: string | null
          embedding_updated_at?: string | null
          entity_id?: string
          indexed_at?: string
          metadata?: Json
          path?: string
          program?: string | null
          search_text?: string
          search_tsv?: unknown
          source_updated_at?: string | null
          style_group_id?: string | null
          title?: string
        }
        Relationships: []
      }
      dam_search_synonyms: {
        Row: {
          created_at: string
          expansion: string
          is_active: boolean
          note: string | null
          search_term: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expansion: string
          is_active?: boolean
          note?: string | null
          search_term: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expansion?: string
          is_active?: boolean
          note?: string | null
          search_term?: string
          updated_at?: string
        }
        Relationships: []
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
      hts_rag_rulings: {
        Row: {
          collection: string | null
          created_at: string
          fetched_at: string
          full_text: string
          full_text_hash: string
          id: string
          modified_by: Json
          operationally_revoked: boolean
          revoked_by: Json
          ruling_date: string | null
          ruling_number: string
          source_url: string | null
          subject: string | null
          tariffs: Json
          updated_at: string
        }
        Insert: {
          collection?: string | null
          created_at?: string
          fetched_at?: string
          full_text: string
          full_text_hash: string
          id?: string
          modified_by?: Json
          operationally_revoked?: boolean
          revoked_by?: Json
          ruling_date?: string | null
          ruling_number: string
          source_url?: string | null
          subject?: string | null
          tariffs?: Json
          updated_at?: string
        }
        Update: {
          collection?: string | null
          created_at?: string
          fetched_at?: string
          full_text?: string
          full_text_hash?: string
          id?: string
          modified_by?: Json
          operationally_revoked?: boolean
          revoked_by?: Json
          ruling_date?: string | null
          ruling_number?: string
          source_url?: string | null
          subject?: string | null
          tariffs?: Json
          updated_at?: string
        }
        Relationships: []
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
          customer_id: string | null
          designer_conflict: boolean
          designer_name: string | null
          division_code: string | null
          division_name: string | null
          folder_path: string
          freelancer_name: string | null
          id: string
          is_licensed: boolean | null
          item_description: string | null
          item_description_source: string | null
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
          rich_metadata: Json | null
          rich_metadata_source: string | null
          rich_metadata_updated_at: string | null
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
          customer_id?: string | null
          designer_conflict?: boolean
          designer_name?: string | null
          division_code?: string | null
          division_name?: string | null
          folder_path: string
          freelancer_name?: string | null
          id?: string
          is_licensed?: boolean | null
          item_description?: string | null
          item_description_source?: string | null
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
          rich_metadata?: Json | null
          rich_metadata_source?: string | null
          rich_metadata_updated_at?: string | null
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
          customer_id?: string | null
          designer_conflict?: boolean
          designer_name?: string | null
          division_code?: string | null
          division_name?: string | null
          folder_path?: string
          freelancer_name?: string | null
          id?: string
          is_licensed?: boolean | null
          item_description?: string | null
          item_description_source?: string | null
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
          rich_metadata?: Json | null
          rich_metadata_source?: string | null
          rich_metadata_updated_at?: string | null
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
            referencedRelation: "dam_character_catalog"
            referencedColumns: ["core_property_id"]
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
      style_guide_file_tags: {
        Row: {
          confidence: number
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string | null
          evidence: Json
          facet: string
          id: string
          inherited: boolean
          rule_version: string
          source: string
          source_file_id: string | null
          status: string
          style_guide_file_id: string
          tag_id: string
          updated_at: string
        }
        Insert: {
          confidence?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          evidence?: Json
          facet?: string
          id?: string
          inherited?: boolean
          rule_version?: string
          source: string
          source_file_id?: string | null
          status?: string
          style_guide_file_id: string
          tag_id: string
          updated_at?: string
        }
        Update: {
          confidence?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          evidence?: Json
          facet?: string
          id?: string
          inherited?: boolean
          rule_version?: string
          source?: string
          source_file_id?: string | null
          status?: string
          style_guide_file_id?: string
          tag_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "style_guide_file_tags_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "style_guide_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "style_guide_file_tags_style_guide_file_id_fkey"
            columns: ["style_guide_file_id"]
            isOneToOne: false
            referencedRelation: "style_guide_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "style_guide_file_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "style_guide_file_tags_display"
            referencedColumns: ["tag_id"]
          },
          {
            foreignKeyName: "style_guide_file_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "style_guide_tags"
            referencedColumns: ["id"]
          },
        ]
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
          tag_names: string[]
          tag_search_text: string
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
          tag_names?: string[]
          tag_search_text?: string
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
          tag_names?: string[]
          tag_search_text?: string
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
      style_guide_tag_aliases: {
        Row: {
          alias: string
          created_at: string
          created_by: string
          id: string
          normalized_alias: string
          scope: Json | null
          tag_id: string
        }
        Insert: {
          alias: string
          created_at?: string
          created_by?: string
          id?: string
          normalized_alias: string
          scope?: Json | null
          tag_id: string
        }
        Update: {
          alias?: string
          created_at?: string
          created_by?: string
          id?: string
          normalized_alias?: string
          scope?: Json | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "style_guide_tag_aliases_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "style_guide_file_tags_display"
            referencedColumns: ["tag_id"]
          },
          {
            foreignKeyName: "style_guide_tag_aliases_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "style_guide_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      style_guide_tagging_state: {
        Row: {
          accepted_count: number
          attempt_count: number
          candidate_count: number
          completed_at: string | null
          error_code: string | null
          error_detail: string | null
          input_fingerprint: string | null
          pipeline: string
          rule_version: string | null
          started_at: string | null
          status: string
          style_guide_file_id: string
          updated_at: string
        }
        Insert: {
          accepted_count?: number
          attempt_count?: number
          candidate_count?: number
          completed_at?: string | null
          error_code?: string | null
          error_detail?: string | null
          input_fingerprint?: string | null
          pipeline: string
          rule_version?: string | null
          started_at?: string | null
          status?: string
          style_guide_file_id: string
          updated_at?: string
        }
        Update: {
          accepted_count?: number
          attempt_count?: number
          candidate_count?: number
          completed_at?: string | null
          error_code?: string | null
          error_detail?: string | null
          input_fingerprint?: string | null
          pipeline?: string
          rule_version?: string | null
          started_at?: string | null
          status?: string
          style_guide_file_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "style_guide_tagging_state_style_guide_file_id_fkey"
            columns: ["style_guide_file_id"]
            isOneToOne: false
            referencedRelation: "style_guide_files"
            referencedColumns: ["id"]
          },
        ]
      }
      style_guide_tags: {
        Row: {
          created_at: string
          display_name: string
          facet: string
          id: string
          is_active: boolean
          is_system: boolean
          normalized_tag: string
          tag: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          facet?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          normalized_tag: string
          tag: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          facet?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          normalized_tag?: string
          tag?: string
          updated_at?: string
        }
        Relationships: []
      }
      style_tracker_audit_log: {
        Row: {
          changed_at: string
          changed_by: string | null
          column_letter: string | null
          event_type: string
          field_key: string | null
          id: string
          metadata: Json
          new_value: Json | null
          old_value: Json | null
          source_row_number: number | null
          source_sheet: string | null
          style_tracker_row_id: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          column_letter?: string | null
          event_type: string
          field_key?: string | null
          id?: string
          metadata?: Json
          new_value?: Json | null
          old_value?: Json | null
          source_row_number?: number | null
          source_sheet?: string | null
          style_tracker_row_id?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          column_letter?: string | null
          event_type?: string
          field_key?: string | null
          id?: string
          metadata?: Json
          new_value?: Json | null
          old_value?: Json | null
          source_row_number?: number | null
          source_sheet?: string | null
          style_tracker_row_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "style_tracker_audit_log_style_tracker_row_id_fkey"
            columns: ["style_tracker_row_id"]
            isOneToOne: false
            referencedRelation: "style_tracker_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "style_tracker_audit_log_style_tracker_row_id_fkey"
            columns: ["style_tracker_row_id"]
            isOneToOne: false
            referencedRelation: "style_tracker_rows_with_bridge"
            referencedColumns: ["id"]
          },
        ]
      }
      style_tracker_rows: {
        Row: {
          commissioned: string | null
          concept_status: string | null
          created_at: string
          customer: string | null
          customer_id: string | null
          customer_sku: string | null
          default_vendor: string | null
          description: string | null
          designer: string | null
          discontinued: boolean | null
          group_id: string | null
          id: string
          imported_at: string
          license_status: string | null
          licensor: string | null
          notes: string | null
          pre_production_status: string | null
          production_status: string | null
          row_data: Json
          royalty: string | null
          sku: string | null
          source_row_number: number | null
          source_sheet: string
          source_workbook_id: string
          tracker_type: string
          upc: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          commissioned?: string | null
          concept_status?: string | null
          created_at?: string
          customer?: string | null
          customer_id?: string | null
          customer_sku?: string | null
          default_vendor?: string | null
          description?: string | null
          designer?: string | null
          discontinued?: boolean | null
          group_id?: string | null
          id?: string
          imported_at?: string
          license_status?: string | null
          licensor?: string | null
          notes?: string | null
          pre_production_status?: string | null
          production_status?: string | null
          row_data?: Json
          royalty?: string | null
          sku?: string | null
          source_row_number?: number | null
          source_sheet: string
          source_workbook_id?: string
          tracker_type: string
          upc?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          commissioned?: string | null
          concept_status?: string | null
          created_at?: string
          customer?: string | null
          customer_id?: string | null
          customer_sku?: string | null
          default_vendor?: string | null
          description?: string | null
          designer?: string | null
          discontinued?: boolean | null
          group_id?: string | null
          id?: string
          imported_at?: string
          license_status?: string | null
          licensor?: string | null
          notes?: string | null
          pre_production_status?: string | null
          production_status?: string | null
          row_data?: Json
          royalty?: string | null
          sku?: string | null
          source_row_number?: number | null
          source_sheet?: string
          source_workbook_id?: string
          tracker_type?: string
          upc?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      style_tracker_user_views: {
        Row: {
          column_state: Json
          created_at: string
          filter_model: Json
          id: string
          source_sheet: string
          updated_at: string
          user_id: string
          view_name: string
        }
        Insert: {
          column_state?: Json
          created_at?: string
          filter_model?: Json
          id?: string
          source_sheet: string
          updated_at?: string
          user_id: string
          view_name?: string
        }
        Update: {
          column_state?: Json
          created_at?: string
          filter_model?: Json
          id?: string
          source_sheet?: string
          updated_at?: string
          user_id?: string
          view_name?: string
        }
        Relationships: []
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
      dam_character_catalog: {
        Row: {
          core_property_id: string | null
          created_at: string | null
          external_id: string | null
          id: string | null
          is_priority: boolean | null
          name: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Relationships: []
      }
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
      style_guide_file_tags_display: {
        Row: {
          confidence: number | null
          confirmed: boolean | null
          display_name: string | null
          facet: string | null
          manual: boolean | null
          sources: Json | null
          style_guide_file_id: string | null
          tag: string | null
          tag_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "style_guide_file_tags_style_guide_file_id_fkey"
            columns: ["style_guide_file_id"]
            isOneToOne: false
            referencedRelation: "style_guide_files"
            referencedColumns: ["id"]
          },
        ]
      }
      style_guide_folders: {
        Row: {
          licensor_name: string | null
          property_folder: string | null
        }
        Relationships: []
      }
      style_tracker_audit_log_with_user: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          changed_by_email: string | null
          changed_by_label: string | null
          column_letter: string | null
          event_type: string | null
          field_key: string | null
          id: string | null
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          source_row_number: number | null
          source_sheet: string | null
          style_tracker_row_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "style_tracker_audit_log_style_tracker_row_id_fkey"
            columns: ["style_tracker_row_id"]
            isOneToOne: false
            referencedRelation: "style_tracker_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "style_tracker_audit_log_style_tracker_row_id_fkey"
            columns: ["style_tracker_row_id"]
            isOneToOne: false
            referencedRelation: "style_tracker_rows_with_bridge"
            referencedColumns: ["id"]
          },
        ]
      }
      style_tracker_rows_with_bridge: {
        Row: {
          bridge_id: string | null
          canonical_customer_name: string | null
          canonical_description: string | null
          canonical_designer_name: string | null
          canonical_factory_name: string | null
          canonical_licensor_name: string | null
          commissioned: string | null
          company_id: string | null
          concept_status: string | null
          core_licensor_id: string | null
          created_at: string | null
          creative_designer_id: string | null
          customer: string | null
          customer_id: string | null
          customer_sku: string | null
          default_vendor: string | null
          description: string | null
          designer: string | null
          discontinued: boolean | null
          erp_item_id: string | null
          erp_style_number: string | null
          factory_id: string | null
          group_id: string | null
          id: string | null
          imported_at: string | null
          last_matched_at: string | null
          license_status: string | null
          licensor: string | null
          match_confidence: string | null
          match_notes: Json | null
          match_status: string | null
          notes: string | null
          plm_item_id: string | null
          pre_production_status: string | null
          production_status: string | null
          public_licensor_id: string | null
          row_data: Json | null
          royalty: string | null
          sku: string | null
          source_row_number: number | null
          source_sheet: string | null
          source_workbook_id: string | null
          style_group_id: string | null
          style_group_sku: string | null
          tracker_type: string | null
          upc: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_style_guide_manual_tag: {
        Args: { p_facet?: string; p_file_id: string; p_tag: string }
        Returns: {
          display_name: string
          facet: string
          tag: string
          tag_id: string
        }[]
      }
      add_style_tracker_rows: {
        Args: {
          p_count?: number
          p_source_sheet: string
          p_tracker_type: string
        }
        Returns: {
          commissioned: string | null
          concept_status: string | null
          created_at: string
          customer: string | null
          customer_id: string | null
          customer_sku: string | null
          default_vendor: string | null
          description: string | null
          designer: string | null
          discontinued: boolean | null
          group_id: string | null
          id: string
          imported_at: string
          license_status: string | null
          licensor: string | null
          notes: string | null
          pre_production_status: string | null
          production_status: string | null
          row_data: Json
          royalty: string | null
          sku: string | null
          source_row_number: number | null
          source_sheet: string
          source_workbook_id: string
          tracker_type: string
          upc: string | null
          updated_at: string
          updated_by: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "style_tracker_rows"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      advise_dam_search_query_indexes: {
        Args: { p_query: string }
        Returns: {
          errors: string[]
          index_statements: string[]
          startup_cost_after: Json
          startup_cost_before: Json
          total_cost_after: Json
          total_cost_before: Json
        }[]
      }
      backfill_pdf_files_used: { Args: never; Returns: number }
      bulk_assign_style_groups: {
        Args: { p_assignments: Json }
        Returns: number
      }
      bulk_insert_pdf_text_samples: { Args: { p_rows: Json }; Returns: number }
      claim_dam_search_embedding_documents: {
        Args: { p_limit?: number }
        Returns: {
          content_sha256: string
          document_type: string
          entity_id: string
          search_text: string
        }[]
      }
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
      dam_resolve_customer: { Args: { p_text: string }; Returns: string }
      deactivate_stale_sg_files: {
        Args: { p_root_label: string; p_run_id: string }
        Returns: number
      }
      execute_readonly_query: { Args: { query_text: string }; Returns: Json }
      expand_dam_search_queries: {
        Args: { p_query: string }
        Returns: {
          query_text: string
        }[]
      }
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
      get_ai_tag_candidates: {
        Args: {
          p_after_id?: string
          p_after_tier?: number
          p_group_ids?: string[]
          p_limit: number
          p_mode: string
        }
        Returns: {
          filename: string
          id: string
          primary_sort_tier: number
          relative_path: string
          style_group_id: string
          thumbnail_url: string
        }[]
      }
      get_dam_customer_facets: { Args: never; Returns: Json }
      get_dam_material_facets: {
        Args: never
        Returns: {
          asset_count: number
          material: string
        }[]
      }
      get_dam_search_embedding_status: { Args: never; Returns: Json }
      get_dam_search_performance_stats: {
        Args: never
        Returns: {
          calls: number
          max_exec_ms: number
          mean_exec_ms: number
          query: string
          rows: number
          shared_blks_hit: number
          shared_blks_read: number
          total_exec_ms: number
        }[]
      }
      get_filter_counts: { Args: { p_filters?: Json }; Returns: Json }
      get_path_facets: { Args: { p_customer_id?: string }; Returns: Json }
      get_pdf_rich_extraction_hashes: {
        Args: { p_asset_ids: string[] }
        Returns: {
          asset_id: string
          source_text_sha256: string
        }[]
      }
      get_sg_preview_stats: { Args: never; Returns: Json }
      get_sg_render_queue_stats: { Args: never; Returns: Json }
      get_style_guide_deterministic_tag_batch: {
        Args: { p_after_id?: string; p_limit?: number; p_rebuild?: boolean }
        Returns: {
          directory_path: string
          file_extension: string
          filename: string
          id: string
          input_fingerprint: string
          licensor_name: string
          property_folder: string
          relative_path: string
          style_guide_folder: string
        }[]
      }
      get_style_guide_deterministic_tag_batch_v2: {
        Args: { p_after_id?: string; p_limit?: number; p_rebuild?: boolean }
        Returns: {
          directory_path: string
          file_extension: string
          filename: string
          id: string
          input_fingerprint: string
          licensor_name: string
          property_folder: string
          relative_path: string
          root_label: string
          style_guide_folder: string
        }[]
      }
      get_style_guide_tagging_stats: { Args: never; Returns: Json }
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
      mark_dam_search_embedding_error: {
        Args: {
          p_content_sha256: string
          p_document_type: string
          p_entity_id: string
          p_error: string
        }
        Returns: boolean
      }
      normalize_for_sg_match: { Args: { p: string }; Returns: string }
      normalize_style_guide_tag: { Args: { p_value: string }; Returns: string }
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
      rebuild_dam_search_documents: { Args: never; Returns: Json }
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
      record_failed_sync_run: {
        Args: { p_error: string; p_source_name: string; p_stage: string }
        Returns: string
      }
      refresh_dam_search_asset_document: {
        Args: { p_asset_id: string }
        Returns: undefined
      }
      refresh_dam_search_style_group_document: {
        Args: { p_style_group_id: string }
        Returns: undefined
      }
      refresh_sku_human_description: { Args: never; Returns: number }
      refresh_style_group_counts: { Args: never; Returns: undefined }
      refresh_style_group_counts_batch: {
        Args: { p_group_ids: string[] }
        Returns: number
      }
      refresh_style_group_primaries: {
        Args: { p_group_ids: string[] }
        Returns: number
      }
      refresh_style_group_rich_metadata: {
        Args: { p_style_group_id: string }
        Returns: undefined
      }
      refresh_style_guide_file_tag_cache: {
        Args: { p_file_id: string }
        Returns: undefined
      }
      refresh_style_guide_folder_consensus_batch: {
        Args: {
          p_after_key?: string
          p_limit_folders?: number
          p_rule_version?: string
        }
        Returns: {
          done: boolean
          folders_processed: number
          next_cursor: string
          relationships_written: number
        }[]
      }
      refresh_style_guide_matviews: { Args: never; Returns: undefined }
      refresh_style_tracker_item_bridge: {
        Args: never
        Returns: {
          inserted_count: number
          total_count: number
          updated_count: number
        }[]
      }
      reject_style_guide_auto_tag: {
        Args: { p_file_id: string; p_tag_id: string }
        Returns: number
      }
      remove_style_guide_manual_tag: {
        Args: { p_file_id: string; p_tag_id: string }
        Returns: boolean
      }
      replace_style_guide_deterministic_tags: {
        Args: {
          p_file_id: string
          p_input_fingerprint: string
          p_rule_version: string
          p_tags: Json
        }
        Returns: number
      }
      replace_style_guide_folder_consensus_tags: {
        Args: { p_file_id: string; p_rule_version: string; p_tags: Json }
        Returns: number
      }
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
      search_assets_full_text: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          asset_id: string
          rank: number
          style_group_id: string
        }[]
      }
      search_dam_documents: {
        Args: {
          p_document_types?: string[]
          p_limit?: number
          p_query: string
          p_query_embedding?: string
        }
        Returns: {
          asset_id: string
          document_type: string
          entity_id: string
          keyword_rank: number
          rank: number
          semantic_rank: number
          style_group_id: string
        }[]
      }
      search_style_groups_full_text: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          rank: number
          style_group_id: string
        }[]
      }
      search_style_tracker_link_candidates: {
        Args: {
          p_field_key: string
          p_limit?: number
          p_match_mode?: string
          p_query: string
        }
        Returns: {
          score: number
          target_id: string
          target_label: string
          target_schema: string
          target_table: string
        }[]
      }
      set_style_group_cover: {
        Args: { p_asset_id: string; p_group_id: string }
        Returns: undefined
      }
      style_guide_tag_input_fingerprint: {
        Args: {
          p_file_extension: string
          p_filename: string
          p_modified_at: string
          p_relative_path: string
          p_size_bytes: number
        }
        Returns: string
      }
      sync_coldlion_vendors: {
        Args: { vendors_payload: Json }
        Returns: {
          rows_deleted: number
          rows_failed: number
          rows_inserted: number
          rows_seen: number
          rows_skipped: number
          rows_updated: number
          sync_run_id: string
        }[]
      }
      update_bulk_operation: {
        Args: { p_only_if_status?: string; p_op_key: string; p_op_state: Json }
        Returns: Json
      }
      update_bulk_operations_batch: { Args: { p_updates: Json }; Returns: Json }
      upsert_dam_search_embedding: {
        Args: {
          p_content_sha256: string
          p_document_type: string
          p_embedding: string
          p_embedding_model?: string
          p_entity_id: string
        }
        Returns: boolean
      }
      upsert_pdf_rich_extraction: {
        Args: {
          p_asset_id: string
          p_data: Json
          p_doc_kind: string
          p_model: string
          p_parse_error: string
          p_prompt_version: string
          p_schema_version: number
          p_sku: string
          p_source_text_sha256: string
          p_style_group_id: string
        }
        Returns: undefined
      }
      upsert_style_tracker_value_resolution: {
        Args: {
          p_field_key: string
          p_local_value?: string
          p_raw_value: string
          p_resolution_type: string
          p_target_id?: string
          p_target_label?: string
          p_target_schema?: string
          p_target_table?: string
        }
        Returns: unknown
        SetofOptions: {
          from: "*"
          to: "style_tracker_value_resolution"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
      entity_status: ["active", "inactive", "archived", "deleted", "potential"],
      file_storage_provider: [
        "supabase",
        "spaces",
        "directus",
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
  pim: {
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
