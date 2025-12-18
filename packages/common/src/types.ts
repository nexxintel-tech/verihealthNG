export type Role = 'patient' | 'clinician' | 'admin' | 'institution_admin';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  conditions: string[];
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastSync: string;
  status: 'Active' | 'Inactive';
}

export interface VitalReading {
  id: string;
  patient_id: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
}
