import { addDays, subDays, format } from "date-fns";

export type RiskLevel = "low" | "medium" | "high";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  conditions: string[];
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  lastSync: string;
  status: "Active" | "Inactive";
  avatarUrl?: string;
}

export interface VitalReading {
  id: string;
  patientId: string;
  type: "Heart Rate" | "HRV" | "SpO2" | "Blood Pressure" | "Temperature" | "Respiratory Rate";
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

export const MOCK_PATIENTS: Patient[] = [
  {
    id: "p1",
    name: "Eleanor Rigby",
    age: 72,
    gender: "Female",
    conditions: ["Hypertension", "Arrhythmia Risk"],
    riskScore: 85,
    riskLevel: "high",
    lastSync: new Date().toISOString(),
    status: "Active",
  },
  {
    id: "p2",
    name: "John Doe",
    age: 45,
    gender: "Male",
    conditions: ["Diabetes Early Detection", "Obesity"],
    riskScore: 62,
    riskLevel: "medium",
    lastSync: subDays(new Date(), 1).toISOString(),
    status: "Active",
  },
  {
    id: "p3",
    name: "Jane Smith",
    age: 29,
    gender: "Female",
    conditions: ["Pregnancy Wellness"],
    riskScore: 12,
    riskLevel: "low",
    lastSync: new Date().toISOString(),
    status: "Active",
  },
  {
    id: "p4",
    name: "Robert Johnson",
    age: 65,
    gender: "Male",
    conditions: ["Heart Failure Early Signs", "CKD Early Detection"],
    riskScore: 78,
    riskLevel: "high",
    lastSync: subDays(new Date(), 0).toISOString(),
    status: "Active",
  },
  {
    id: "p5",
    name: "Sarah Connor",
    age: 34,
    gender: "Female",
    conditions: ["Stress & Burnout"],
    riskScore: 45,
    riskLevel: "medium",
    lastSync: subDays(new Date(), 2).toISOString(),
    status: "Inactive",
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: "a1",
    patientId: "p1",
    patientName: "Eleanor Rigby",
    type: "Arrhythmia Warning",
    message: "Irregular heart rhythm detected for 15 mins.",
    severity: "high",
    timestamp: subDays(new Date(), 0).toISOString(),
    isRead: false,
  },
  {
    id: "a2",
    patientId: "p4",
    patientName: "Robert Johnson",
    type: "SpO2 Drop",
    message: "Oxygen saturation dropped below 92% during sleep.",
    severity: "high",
    timestamp: subDays(new Date(), 1).toISOString(),
    isRead: false,
  },
  {
    id: "a3",
    patientId: "p2",
    patientName: "John Doe",
    type: "Glucose Spike Risk",
    message: "Predicted glucose spike based on recent activity.",
    severity: "medium",
    timestamp: subDays(new Date(), 0).toISOString(),
    isRead: true,
  },
];

export const generateVitals = (patientId: string, days = 7): VitalReading[] => {
  const readings: VitalReading[] = [];
  const types = [
    { name: "Heart Rate", unit: "bpm", base: 70, var: 20 },
    { name: "HRV", unit: "ms", base: 40, var: 15 },
    { name: "SpO2", unit: "%", base: 98, var: 3 },
    { name: "Respiratory Rate", unit: "rpm", base: 16, var: 4 },
  ];

  for (let i = 0; i < days * 24; i += 4) { // Every 4 hours
    const date = subDays(new Date(), days - i / 24);
    
    types.forEach(t => {
      const val = t.base + (Math.random() * t.var - t.var / 2);
      readings.push({
        id: `v-${patientId}-${i}-${t.name}`,
        patientId,
        type: t.name as any,
        value: Math.round(val * 10) / 10,
        unit: t.unit,
        timestamp: date.toISOString(),
        status: "normal", // Simplified logic
      });
    });
  }
  return readings;
};
