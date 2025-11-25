import { getAuthHeaders } from './auth';

// API client for VeriHealth backend

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  conditions: string[];
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  lastSync: string;
  status: "Active" | "Inactive";
}

export interface VitalReading {
  id: string;
  patient_id: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
  status: "normal" | "warning" | "critical";
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  message: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
  isRead: boolean;
}

export interface DashboardStats {
  totalPatients: number;
  highRiskCount: number;
  activeAlerts: number;
  avgRiskScore: number;
}

// Fetch all patients (with authentication)
export async function fetchPatients(): Promise<Patient[]> {
  const response = await fetch("/api/patients", {
    headers: getAuthHeaders(),
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized - please log in again");
  }
  
  if (!response.ok) {
    throw new Error("Failed to fetch patients");
  }
  
  return response.json();
}

// Fetch single patient
export async function fetchPatient(id: string): Promise<Patient> {
  const response = await fetch(`/api/patients/${id}`, {
    headers: getAuthHeaders(),
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized - please log in again");
  }
  
  if (response.status === 403) {
    throw new Error("Access denied");
  }
  
  if (!response.ok) {
    throw new Error("Failed to fetch patient");
  }
  
  return response.json();
}

// Fetch patient vitals
export async function fetchPatientVitals(
  patientId: string,
  type?: string,
  days: number = 7
): Promise<VitalReading[]> {
  const params = new URLSearchParams({ days: days.toString() });
  if (type) params.append("type", type);
  
  const response = await fetch(`/api/patients/${patientId}/vitals?${params}`, {
    headers: getAuthHeaders(),
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized - please log in again");
  }
  
  if (response.status === 403) {
    throw new Error("Access denied");
  }
  
  if (!response.ok) {
    throw new Error("Failed to fetch vitals");
  }
  
  return response.json();
}

// Fetch all alerts
export async function fetchAlerts(): Promise<Alert[]> {
  const response = await fetch("/api/alerts", {
    headers: getAuthHeaders(),
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized - please log in again");
  }
  
  if (response.status === 403) {
    throw new Error("Access denied - clinicians only");
  }
  
  if (!response.ok) {
    throw new Error("Failed to fetch alerts");
  }
  
  return response.json();
}

// Mark alert as read
export async function markAlertAsRead(id: string, isRead: boolean): Promise<Alert> {
  const response = await fetch(`/api/alerts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ isRead }),
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized - please log in again");
  }
  
  if (response.status === 403) {
    throw new Error("Access denied");
  }
  
  if (!response.ok) {
    throw new Error("Failed to update alert");
  }
  
  return response.json();
}

// Fetch dashboard stats
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/dashboard/stats", {
    headers: getAuthHeaders(),
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized - please log in again");
  }
  
  if (response.status === 403) {
    throw new Error("Access denied - clinicians only");
  }
  
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }
  
  return response.json();
}
