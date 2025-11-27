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
  // Patient-focused stats (for clinicians/admins)
  totalPatients?: number;
  highRiskCount?: number;
  activeAlerts?: number;
  avgRiskScore?: number;
  // Clinician-focused stats (for institution admins)
  totalClinicians?: number;
  approvedClinicians?: number;
  pendingApprovals?: number;
  avgPerformanceScore?: number;
  // Flag to indicate which view type
  isClinicianView?: boolean;
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

// Patient dashboard vital type (camelCase from transformed API)
export interface PatientVital {
  id: string;
  patientId: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
  status: "normal" | "warning" | "critical";
}

// Patient dashboard data types
export interface PatientDashboardData {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    status: string;
    conditions: string[];
    riskScore: number;
    riskLevel: "low" | "medium" | "high";
    lastSync: string;
  };
  latestVitals: Record<string, PatientVital>;
  recentVitals: PatientVital[];
  clinician: {
    id: string;
    email: string;
    name: string;
    specialty: string;
    phone: string | null;
  } | null;
  institution: {
    id: string;
    name: string;
    address: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  } | null;
  recentAlerts: {
    id: string;
    type: string;
    message: string;
    severity: string;
    isRead: boolean;
    timestamp: string;
  }[];
}

// Fetch patient's own dashboard data (for patient role)
export async function fetchPatientDashboard(): Promise<PatientDashboardData> {
  const response = await fetch("/api/patient/my-dashboard", {
    headers: getAuthHeaders(),
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized - please log in again");
  }
  
  if (response.status === 403) {
    throw new Error("Access denied - patients only");
  }
  
  if (response.status === 404) {
    throw new Error("Patient profile not found");
  }
  
  if (!response.ok) {
    throw new Error("Failed to fetch patient dashboard");
  }
  
  return response.json();
}

// Institution types and functions
export interface Institution {
  id: string;
  name: string;
  address: string | null;
}

export async function fetchInstitutions(): Promise<Institution[]> {
  const response = await fetch("/api/institutions");
  
  if (!response.ok) {
    throw new Error("Failed to fetch institutions");
  }
  
  return response.json();
}

// Clinician registration
export interface ClinicianRegistration {
  email: string;
  password: string;
  fullName: string;
  licenseNumber?: string;
  specialty?: string;
  phone?: string;
  institutionId?: string;
}

export async function registerClinician(data: ClinicianRegistration): Promise<{
  message: string;
  requiresConfirmation?: boolean;
  requiresApproval?: boolean;
}> {
  const response = await fetch("/api/auth/register-clinician", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to register clinician");
  }
  
  return response.json();
}

// Institution admin functions
export interface PendingClinician {
  id: string;
  email: string;
  approvalStatus: string;
  createdAt: string;
  profile: {
    full_name: string;
    license_number: string | null;
    specialty: string | null;
    phone: string | null;
  } | null;
}

export async function fetchPendingClinicians(): Promise<PendingClinician[]> {
  const response = await fetch("/api/admin/pending-clinicians", {
    headers: getAuthHeaders(),
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized - please log in again");
  }
  
  if (response.status === 403) {
    throw new Error("Access denied - institution admin role required");
  }
  
  if (!response.ok) {
    throw new Error("Failed to fetch pending clinicians");
  }
  
  return response.json();
}

export async function approveClinician(clinicianId: string): Promise<void> {
  const response = await fetch("/api/admin/approve-clinician", {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ clinicianId }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to approve clinician");
  }
}

export async function rejectClinician(clinicianId: string): Promise<void> {
  const response = await fetch("/api/admin/reject-clinician", {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ clinicianId }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to reject clinician");
  }
}

// Top performing clinicians
export interface TopPerformer {
  id: string;
  name: string;
  specialty: string;
  avgResponseTime: string;
  avgResponseTimeMs: number | null;
  alertsRespondedTo: number;
  patientOutcomeRate: number;
  performanceScore: number;
}

export async function fetchTopPerformers(): Promise<TopPerformer[]> {
  const response = await fetch("/api/clinicians/top-performers", {
    headers: getAuthHeaders(),
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized - please log in again");
  }
  
  if (!response.ok) {
    throw new Error("Failed to fetch top performers");
  }
  
  return response.json();
}

// Respond to an alert (marks as read and tracks response time)
export async function respondToAlert(alertId: string): Promise<Alert> {
  const response = await fetch(`/api/alerts/${alertId}/respond`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized - please log in again");
  }
  
  if (response.status === 403) {
    throw new Error("Access denied");
  }
  
  if (!response.ok) {
    throw new Error("Failed to respond to alert");
  }
  
  return response.json();
}

// ============================================================
// SUPER ADMIN API
// ============================================================

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'clinician' | 'admin' | 'institution_admin';
  institutionId: string | null;
  institutionName: string | null;
  approvalStatus: string | null;
  createdAt: string;
}

export interface AdminInstitution {
  id: string;
  name: string;
  address: string;
  contact_email: string;
  is_default: boolean;
}

// Fetch all users (admin only)
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await fetch("/api/admin/users", {
    headers: getAuthHeaders(),
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized - please log in again");
  }
  
  if (response.status === 403) {
    throw new Error("Access denied - admin only");
  }
  
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  
  return response.json();
}

// Fetch all institutions (admin only)
export async function fetchAdminInstitutions(): Promise<AdminInstitution[]> {
  const response = await fetch("/api/admin/institutions", {
    headers: getAuthHeaders(),
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized - please log in again");
  }
  
  if (response.status === 403) {
    throw new Error("Access denied - admin only");
  }
  
  if (!response.ok) {
    throw new Error("Failed to fetch institutions");
  }
  
  return response.json();
}

// Update user role (admin only)
export async function updateUserRole(
  userId: string,
  role: string,
  institutionId?: string
): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role, institutionId }),
  });
  
  if (response.status === 401) {
    throw new Error("Unauthorized - please log in again");
  }
  
  if (response.status === 403) {
    throw new Error("Access denied - admin only");
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user role");
  }
}

// Create institution (admin only)
export async function createInstitution(data: {
  name: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
}): Promise<AdminInstitution> {
  const response = await fetch("/api/admin/institutions", {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create institution");
  }
  
  return response.json();
}

// Update institution (admin only)
export async function updateInstitution(
  id: string,
  data: {
    name?: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    isDefault?: boolean;
  }
): Promise<AdminInstitution> {
  const response = await fetch(`/api/admin/institutions/${id}`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update institution");
  }
  
  return response.json();
}

// Delete institution (admin only)
export async function deleteInstitution(id: string): Promise<void> {
  const response = await fetch(`/api/admin/institutions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete institution");
  }
}

// Toggle user status (enable/disable)
export async function toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isActive }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user status");
  }
}

// Bulk update users
export async function bulkUpdateUsers(
  userIds: string[],
  action: 'disable' | 'enable' | 'change_role',
  role?: string,
  institutionId?: string
): Promise<{ count: number }> {
  const response = await fetch("/api/admin/users/bulk-update", {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userIds, action, role, institutionId }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to perform bulk update");
  }
  
  return response.json();
}

// Activity log types
export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
  users?: { email: string } | null;
}

// Fetch activity logs
export async function fetchActivityLogs(
  page: number = 1,
  limit: number = 50
): Promise<{ logs: ActivityLog[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const response = await fetch(`/api/admin/activity-logs?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch activity logs");
  }
  
  return response.json();
}

// User details types
export interface UserDetails extends AdminUser {
  profile?: {
    full_name: string;
    license_number?: string;
    specialty?: string;
    phone?: string;
  };
  institution?: AdminInstitution;
  patientCount: number;
  lastSignIn: string | null;
  isBanned: boolean;
}

// Fetch user details
export async function fetchUserDetails(userId: string): Promise<UserDetails> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user details");
  }
  
  return response.json();
}

// Send email to user
export async function sendEmailToUser(userId: string, subject: string, message: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}/email`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subject, message }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send email");
  }
}

// User invite types
export interface UserInvite {
  id: string;
  email: string;
  role: string;
  institution_id: string | null;
  status: string;
  expires_at: string;
  created_at: string;
  inviter?: { email: string };
  institution?: { name: string };
}

// Create user invite
export async function createUserInvite(data: {
  email: string;
  role?: string;
  institutionId?: string;
}): Promise<UserInvite> {
  const response = await fetch("/api/admin/invites", {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create invite");
  }
  
  return response.json();
}

// Fetch user invites
export async function fetchUserInvites(): Promise<UserInvite[]> {
  const response = await fetch("/api/admin/invites", {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch invites");
  }
  
  return response.json();
}

// Delete user invite
export async function deleteUserInvite(id: string): Promise<void> {
  const response = await fetch(`/api/admin/invites/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to cancel invite");
  }
}

// Analytics types
export interface AdminAnalytics {
  totalUsers: number;
  roleCounts: Record<string, number>;
  usersByMonth: { month: string; count: number }[];
  institutionCount: number;
  activityByDay: { date: string; count: number }[];
}

// Fetch admin analytics
export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  const response = await fetch("/api/admin/analytics", {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }
  
  return response.json();
}

// Export users to CSV
export async function exportUsersCSV(): Promise<Blob> {
  const response = await fetch("/api/admin/users/export", {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to export users");
  }
  
  return response.blob();
}
