import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Institutions table
export const institutions = pgTable("institutions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("patient"),
  institutionId: varchar("institution_id").references(() => institutions.id),
  approvalStatus: text("approval_status"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Patients table
export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conditions table
export const conditions = pgTable("conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vital readings table
export const vitalReadings = pgTable("vital_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  type: text("type").notNull(),
  value: decimal("value").notNull(),
  unit: text("unit").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  status: text("status").notNull().default("normal"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Risk scores table
export const riskScores = pgTable("risk_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  score: integer("score").notNull(),
  riskLevel: text("risk_level").notNull(),
  lastSync: timestamp("last_sync").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Alerts table
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Clinician profiles table
export const clinicianProfiles = pgTable("clinician_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  fullName: text("full_name").notNull(),
  licenseNumber: text("license_number"),
  specialty: text("specialty"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

export const insertVitalReadingSchema = createInsertSchema(vitalReadings).omit({
  id: true,
  createdAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertInstitutionSchema = createInsertSchema(institutions).omit({
  id: true,
  createdAt: true,
});

export const insertClinicianProfileSchema = createInsertSchema(clinicianProfiles).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Condition = typeof conditions.$inferSelect;
export type VitalReading = typeof vitalReadings.$inferSelect;
export type RiskScore = typeof riskScores.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type Institution = typeof institutions.$inferSelect;
export type ClinicianProfile = typeof clinicianProfiles.$inferSelect;

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertVitalReading = z.infer<typeof insertVitalReadingSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type InsertClinicianProfile = z.infer<typeof insertClinicianProfileSchema>;
