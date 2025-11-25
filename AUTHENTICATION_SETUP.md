# VeriHealth Authentication & Secure Risk Scores Setup

## Overview

This document explains how to set up the complete authentication system with the `latest_risk_scores_secure` view integration.

## What Was Built

### 1. Database Layer (Supabase)

**Materialized View** (`latest_risk_scores`)
- Stores the most recent risk score for each patient
- Refreshes automatically on any risk_scores table changes
- Optimized for fast queries with unique index

**Secure View** (`latest_risk_scores_secure`)
- Enforces role-based access control (RLS logic)
- **Clinicians/Admins**: See ALL patients
- **Patients**: See ONLY their own data
- Filters data based on `auth.uid()` (logged-in user)

### 2. Backend (Express + Supabase Auth)

**Authentication Middleware** (`server/middleware/auth.ts`)
- Extracts JWT token from `Authorization` header
- Verifies token with Supabase Auth
- Fetches user role from database
- Attaches `req.user` to all authenticated routes

**Protected API Routes**
- `/api/auth/login` - Sign in with email/password
- `/api/auth/logout` - Sign out
- `/api/auth/me` - Get current user info
- `/api/patients` - Uses secure view, respects user role
- `/api/patients/:id` - Checks permission before serving data
- `/api/dashboard/stats` - Clinicians only

### 3. Frontend (React)

**Authentication State**
- `client/src/lib/auth.ts` - Login, logout, token management
- Stores JWT token in localStorage
- Stores user info (id, email, role) in localStorage

**Route Protection**
- `ProtectedRoute` component guards all authenticated pages
- Redirects to `/login` if not authenticated
- Automatically includes auth headers in API calls

**Updated Login Page**
- Real Supabase authentication
- Form validation and error handling
- Loading states

## Setup Instructions

### Step 1: Run Database Migrations

1. Go to your Supabase Dashboard → SQL Editor
2. Run the **initial schema** migration:
   ```sql
   -- Copy entire contents of:
   supabase/migrations/20250223000000_initial_schema.sql
   ```

3. Run the **secure view** migration:
   ```sql
   -- Copy entire contents of:
   supabase/migrations/20250223000001_secure_risk_scores.sql
   ```

### Step 2: Create User Accounts in Supabase

You need to create user accounts with Supabase Auth:

**Option A: Via Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Create accounts:
   - **Clinician**: `clinician@verihealth.com` (set password)
   - **Patient**: `patient1@example.com` (set password)

**Option B: Via SQL**
```sql
-- This will create auth users and link them to your users table
-- Note: You'll need to manually create Supabase Auth users first via dashboard
-- Then link them with:

UPDATE users 
SET id = '<supabase-auth-user-id>' 
WHERE email = 'clinician@verihealth.com';
```

### Step 3: Test the Authentication Flow

1. **Log in as Clinician**:
   - Email: `clinician@verihealth.com`
   - Password: (your set password)
   - Should see ALL patients in dashboard

2. **Log in as Patient**:
   - Email: `patient1@example.com`
   - Password: (your set password)
   - Should see ONLY their own data

## How the Secure View Works

### Security Flow Diagram

```
┌─────────────┐
│  Frontend   │
│  Dashboard  │
└──────┬──────┘
       │ 1. GET /api/patients
       │    Authorization: Bearer <token>
       v
┌──────────────────────┐
│  Express Middleware  │
│  authenticateUser()  │
└──────┬───────────────┘
       │ 2. Verify JWT
       │ 3. Fetch user role from DB
       │ 4. Attach req.user
       v
┌──────────────────────────────┐
│  API Route Handler           │
│  /api/patients               │
└──────┬───────────────────────┘
       │ 5. Query secure view
       │    with user context
       v
┌──────────────────────────────────────┐
│  Supabase                            │
│  latest_risk_scores_secure VIEW      │
│                                      │
│  WHERE:                              │
│    auth.uid() = clinician            │
│    → Returns ALL patients            │
│                                      │
│    auth.uid() = patient_user_id      │
│    → Returns ONLY patient's own data │
└──────────────────────────────────────┘
```

### Why This Is Secure

1. **No RLS Bypass**: The secure view applies RLS logic even though the materialized view doesn't have it
2. **User Context Required**: `auth.uid()` function requires a valid authenticated session
3. **Role-Based Filtering**: Automatically filters based on clinician vs patient role
4. **Token Verification**: Every request verifies JWT with Supabase before querying

## API Usage Examples

### Login
```typescript
POST /api/auth/login
{
  "email": "clinician@verihealth.com",
  "password": "yourpassword"
}

Response:
{
  "user": { "id": "...", "email": "..." },
  "session": { "access_token": "..." }
}
```

### Fetch Patients (Clinician)
```typescript
GET /api/patients
Authorization: Bearer <access_token>

Response:
[
  { "id": "...", "name": "Eleanor Rigby", "riskScore": 85, ... },
  { "id": "...", "name": "John Doe", "riskScore": 62, ... },
  // ... all patients
]
```

### Fetch Patients (Patient)
```typescript
GET /api/patients
Authorization: Bearer <patient_access_token>

Response:
[
  { "id": "...", "name": "Eleanor Rigby", "riskScore": 85, ... }
  // Only the logged-in patient's data
]
```

## Frontend Usage

The authentication is transparent to most components:

```tsx
// Auto-protected route
<Route path="/patients">
  <ProtectedRoute>
    <PatientList />
  </ProtectedRoute>
</Route>

// API calls automatically include auth headers
const { data: patients } = useQuery({
  queryKey: ["patients"],
  queryFn: fetchPatients, // Includes Authorization header
});
```

## Troubleshooting

### "Unauthorized" Errors
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly
- Verify user exists in both Supabase Auth AND `users` table
- Check that JWT token is being sent in headers

### "Access Denied" Errors
- Verify user role is correctly set in `users` table
- Check RLS policies are enabled
- Ensure secure view query is using correct `auth.uid()`

### No Data Returned
- Run `REFRESH MATERIALIZED VIEW latest_risk_scores;` manually
- Check that `risk_scores` table has data
- Verify foreign keys between `patients` and `users` tables

## Security Best Practices

✅ **Do**:
- Always query `latest_risk_scores_secure` (not the raw materialized view)
- Validate all inputs with Zod schemas
- Use prepared statements for SQL queries
- Rotate Supabase API keys regularly
- Enable audit logging in production

❌ **Don't**:
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend
- Don't bypass the secure view in API routes
- Don't trust client-side role checks alone
- Avoid storing sensitive data in localStorage (tokens are OK)

## Next Steps

1. ✅ Set up users in Supabase Auth
2. ✅ Test login flow with both roles
3. 🚧 Implement password reset flow
4. 🚧 Add email verification
5. 🚧 Set up Two-Factor Authentication (2FA)
6. 🚧 Enable audit logging for HIPAA compliance
