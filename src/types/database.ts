/**
 * Supabase Database Types
 *
 * This file contains TypeScript types for the Supabase database schema.
 * These types are used to provide type safety for database operations.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          amount: number;
          type: 'income' | 'expense';
          category:
            | 'Food'
            | 'Transport'
            | 'Bills'
            | 'Salary'
            | 'Shopping'
            | 'Entertainment'
            | 'Health'
            | 'Other';
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          amount: number;
          type: 'income' | 'expense';
          category:
            | 'Food'
            | 'Transport'
            | 'Bills'
            | 'Salary'
            | 'Shopping'
            | 'Entertainment'
            | 'Health'
            | 'Other';
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          amount?: number;
          type?: 'income' | 'expense';
          category?:
            | 'Food'
            | 'Transport'
            | 'Bills'
            | 'Salary'
            | 'Shopping'
            | 'Entertainment'
            | 'Health'
            | 'Other';
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          priority: 'low' | 'medium' | 'high';
          completed: boolean;
          sort_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          priority: 'low' | 'medium' | 'high';
          completed?: boolean;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high';
          completed?: boolean;
          sort_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      schedule_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          type: 'activity' | 'exam' | 'class' | 'other';
          date: string;
          time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          type: 'activity' | 'exam' | 'class' | 'other';
          date: string;
          time: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          type?: 'activity' | 'exam' | 'class' | 'other';
          date?: string;
          time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'schedule_events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      grocery_items: {
        Row: {
          id: string;
          user_id: string;
          text: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          text: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          text?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'grocery_items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      prayer_timetables: {
        Row: {
          id: string;
          user_id: string;
          year: number;
          mosque_name: string | null;
          source_url: string | null;
          pdf_hash: string | null;
          timezone: string;
          is_active: boolean;
          synced_at: string;
          created_at: string;
          updated_at: string;
          city: string | null;
          country: string | null;
          calculation_method: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          year: number;
          mosque_name?: string | null;
          source_url?: string | null;
          pdf_hash?: string | null;
          timezone?: string;
          is_active?: boolean;
          synced_at?: string;
          created_at?: string;
          updated_at?: string;
          city?: string | null;
          country?: string | null;
          calculation_method?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          year?: number;
          mosque_name?: string | null;
          source_url?: string | null;
          pdf_hash?: string | null;
          timezone?: string;
          is_active?: boolean;
          synced_at?: string;
          created_at?: string;
          updated_at?: string;
          city?: string | null;
          country?: string | null;
          calculation_method?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'prayer_timetables_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      prayer_times: {
        Row: {
          id: string;
          user_id: string;
          timetable_id: string;
          date: string;
          fajr: string;
          dhuhr: string;
          asr: string;
          maghrib: string;
          isha: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          timetable_id: string;
          date: string;
          fajr: string;
          dhuhr: string;
          asr: string;
          maghrib: string;
          isha: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          timetable_id?: string;
          date?: string;
          fajr?: string;
          dhuhr?: string;
          asr?: string;
          maghrib?: string;
          isha?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'prayer_times_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prayer_times_timetable_id_fkey';
            columns: ['timetable_id'];
            isOneToOne: false;
            referencedRelation: 'prayer_timetables';
            referencedColumns: ['id'];
          },
        ];
      };
      split_bills: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          subtotal: number;
          tax_amount: number;
          service_charge: number;
          tip_amount: number;
          total_amount: number;
          receipt_image_url: string | null;
          date: string;
          status: 'active' | 'settled' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          subtotal: number;
          tax_amount?: number;
          service_charge?: number;
          tip_amount?: number;
          total_amount: number;
          receipt_image_url?: string | null;
          date?: string;
          status?: 'active' | 'settled' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          subtotal?: number;
          tax_amount?: number;
          service_charge?: number;
          tip_amount?: number;
          total_amount?: number;
          receipt_image_url?: string | null;
          date?: string;
          status?: 'active' | 'settled' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'split_bills_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      bill_items: {
        Row: {
          id: string;
          bill_id: string;
          name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bill_id: string;
          name: string;
          quantity?: number;
          unit_price: number;
          total_price: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bill_id?: string;
          name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bill_items_bill_id_fkey';
            columns: ['bill_id'];
            isOneToOne: false;
            referencedRelation: 'split_bills';
            referencedColumns: ['id'];
          },
        ];
      };
      bill_participants: {
        Row: {
          id: string;
          bill_id: string;
          name: string;
          subtotal: number;
          tax_share: number;
          service_share: number;
          tip_share: number;
          total_amount: number;
          is_settled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bill_id: string;
          name: string;
          subtotal?: number;
          tax_share?: number;
          service_share?: number;
          tip_share?: number;
          total_amount?: number;
          is_settled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bill_id?: string;
          name?: string;
          subtotal?: number;
          tax_share?: number;
          service_share?: number;
          tip_share?: number;
          total_amount?: number;
          is_settled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bill_participants_bill_id_fkey';
            columns: ['bill_id'];
            isOneToOne: false;
            referencedRelation: 'split_bills';
            referencedColumns: ['id'];
          },
        ];
      };
      bill_item_assignments: {
        Row: {
          id: string;
          item_id: string;
          participant_id: string;
          share_percentage: number;
          share_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          participant_id: string;
          share_percentage?: number;
          share_amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          participant_id?: string;
          share_percentage?: number;
          share_amount?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bill_item_assignments_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'bill_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bill_item_assignments_participant_id_fkey';
            columns: ['participant_id'];
            isOneToOne: false;
            referencedRelation: 'bill_participants';
            referencedColumns: ['id'];
          },
        ];
      };
      recent_participants: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          usage_count: number;
          last_used_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          usage_count?: number;
          last_used_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          usage_count?: number;
          last_used_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recent_participants_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
