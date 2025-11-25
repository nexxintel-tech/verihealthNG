import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export type Database = {
  public: {
    Tables: {
      institutions: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: 'patient' | 'clinician' | 'admin' | 'institution_admin';
          institution_id: string | null;
          approval_status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: 'patient' | 'clinician' | 'admin' | 'institution_admin';
          institution_id?: string | null;
          approval_status?: string | null;
          created_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          age: number;
          gender: string;
          status: 'Active' | 'Inactive';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          age: number;
          gender: string;
          status?: 'Active' | 'Inactive';
          created_at?: string;
        };
      };
      conditions: {
        Row: {
          id: string;
          patient_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          name: string;
          created_at?: string;
        };
      };
      vital_readings: {
        Row: {
          id: string;
          patient_id: string;
          type: string;
          value: number;
          unit: string;
          timestamp: string;
          status: 'normal' | 'warning' | 'critical';
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          type: string;
          value: number;
          unit: string;
          timestamp?: string;
          status?: 'normal' | 'warning' | 'critical';
          created_at?: string;
        };
      };
      risk_scores: {
        Row: {
          id: string;
          patient_id: string;
          score: number;
          risk_level: 'low' | 'medium' | 'high';
          last_sync: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          score: number;
          risk_level: 'low' | 'medium' | 'high';
          last_sync?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          patient_id: string;
          type: string;
          message: string;
          severity: 'low' | 'medium' | 'high';
          is_read: boolean;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          type: string;
          message: string;
          severity: 'low' | 'medium' | 'high';
          is_read?: boolean;
          timestamp?: string;
          created_at?: string;
        };
      };
      clinician_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          license_number: string | null;
          specialty: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          license_number?: string | null;
          specialty?: string | null;
          phone?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
