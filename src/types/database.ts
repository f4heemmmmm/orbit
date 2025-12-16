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
