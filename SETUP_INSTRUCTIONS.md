# VeriHealth Setup Instructions

## Prerequisites
- Supabase account with a project created
- SUPABASE_URL and SUPABASE_ANON_KEY environment variables configured in Replit

## Database Setup

### Step 1: Run the SQL Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20250223000000_initial_schema.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the migration

This will:
- Create all required tables (users, patients, conditions, vital_readings, risk_scores, alerts, sync_logs)
- Set up indexes for performance
- Enable Row Level Security (RLS) policies
- Insert sample data for testing

### Step 2: Verify Tables Created

After running the migration, verify the tables were created:

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - users
   - patients
   - conditions
   - vital_readings
   - risk_scores
   - alerts
   - sync_logs

### Step 3: Enable Realtime (Optional)

For live dashboard updates:

1. Go to **Database** → **Replication** in Supabase
2. Enable replication for these tables:
   - alerts
   - vital_readings
   - risk_scores

## Current Status

### ✅ Completed Features

**Clinician Dashboard:**
- Authentication page (mock login)
- Dashboard overview with real-time statistics
- Patient list with search and filtering
- Individual patient detail views
- Vital signs charts (Heart Rate, HRV)
- AI Risk Analysis panel
- Alerts panel
- Real-time data syncing (30-second polling)

**Backend API:**
- `/api/patients` - Get all patients with conditions and risk scores
- `/api/patients/:id` - Get single patient details
- `/api/patients/:id/vitals` - Get patient vital readings
- `/api/alerts` - Get all alerts
- `/api/alerts/:id` - Mark alert as read
- `/api/dashboard/stats` - Get dashboard statistics

**Database Schema:**
- Complete Supabase PostgreSQL schema
- Sample data for 4 patients
- Vital readings (Heart Rate, HRV, SpO2)
- Risk scores and alerts

### 🚧 Pending Implementation

**Mobile Apps:**
- iOS app (Swift + HealthKit) - Scaffolded structure in `/ios`
- Android app (Kotlin + Health Connect) - Scaffolded structure in `/android`

**Backend:**
- Supabase Edge Functions for AI risk calculation
- MessageBird integration for SMS/WhatsApp alerts
- Real-time WebSocket subscriptions (currently using polling)

**Additional Features:**
- Activity & Sleep tracking
- Medication management
- Full authentication system (currently mock)
- Patient onboarding flow

## Sample Data

The migration includes sample data for:
- 4 patients with varying risk levels
- Multiple conditions per patient
- 7 days of vital readings (Heart Rate, HRV, SpO2)
- Recent alerts

## Testing the Application

1. After running the SQL migration, refresh the dashboard
2. You should see:
   - 4 patients in the patient list
   - Risk scores and alerts
   - Charts with vital data on patient detail pages

## Mobile App Development

### iOS (Swift + HealthKit)

Files scaffolded in `/ios/VeriHealth/`:
- `VeriHealthApp.swift` - App entry point
- `HealthKitManager.swift` - HealthKit data collection
- `SupabaseClient.swift` - Backend sync

### Android (Kotlin + Health Connect)

Files scaffolded in `/android/app/src/main/java/com/verihealth/`:
- `MainActivity.kt` - App entry point
- `HealthConnectManager.kt` - Health Connect integration
- `SupabaseClient.kt` - Backend sync

## Supabase Edge Functions

Edge Functions should be deployed for:
1. **calculate_risk_score** - AI logic to analyze vitals and generate risk scores
2. **generate_alerts** - Create alerts based on threshold violations
3. **process_sync_event** - Handle mobile app data sync events

## Environment Variables

Required variables (already configured):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/public key

## Next Steps

1. ✅ Run the SQL migration in Supabase
2. ✅ Verify the dashboard loads with sample data
3. 🚧 Develop iOS app with HealthKit integration
4. 🚧 Develop Android app with Health Connect integration
5. 🚧 Implement Supabase Edge Functions for AI risk calculation
6. 🚧 Integrate MessageBird for clinical alerts
7. 🚧 Deploy mobile apps to TestFlight/Play Store beta
