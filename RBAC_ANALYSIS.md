# Role-Based Access Control (RBAC) Analysis

## User Roles

The system defines three user roles:
- **`patient`** - Default role for new registrations, limited access to own data
- **`clinician`** - Healthcare provider with access to all patient data  
- **`admin`** - Administrative role with full system access

**Role Assignment:**
- New users are assigned `patient` role by default (enforced in `/api/auth/register`)
- Clinician/admin roles must be manually assigned by administrators via direct database update

## Backend API Endpoints & Role Requirements

### Public Endpoints (No Authentication)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | New user registration (defaults to patient role) |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/resend-confirmation` | POST | Resend email confirmation |
| `/api/auth/forgot-password` | POST | Password reset request |
| `/api/auth/reset-password` | POST | Password reset completion |

### Protected Endpoints (Authentication Required)

#### All Authenticated Users
| Endpoint | Method | Roles | Description | Current Implementation |
|----------|--------|-------|-------------|----------------------|
| `/api/auth/me` | GET | All | Get current user info | ✅ Working |
| `/api/patients` | GET | All | Get patients list | ⚠️ No role filtering (missing user_id column) |
| `/api/patients/:id` | GET | All | Get single patient details | ⚠️ No role filtering (missing user_id column) |
| `/api/patients/:id/vitals` | GET | All | Get patient vital readings | ⚠️ No role filtering (missing user_id column) |

#### Clinician/Admin Only
| Endpoint | Method | Roles | Description | Status |
|----------|--------|-------|-------------|--------|
| `/api/alerts` | GET | clinician, admin | Get all alerts | ✅ Properly protected |
| `/api/alerts/:id` | PATCH | clinician, admin | Mark alert as read/unread | ✅ Properly protected |
| `/api/dashboard/stats` | GET | clinician, admin | Get dashboard statistics | ✅ Properly protected |

## Issues & Inconsistencies

### ❌ Critical: Missing Row-Level Security (RLS)

**Problem:** The `patients` table does not have a `user_id` column to link patients to user accounts.

**Impact:**
- Patient role users can see ALL patients (should only see their own data)
- Clinician role users correctly see all patients
- Security vulnerability: patients can access other patients' data

**Current Workaround:** TODOs added in code, but filtering is disabled:
```typescript
// Note: user_id column doesn't exist in current schema
// For now, all users can see all patients
// TODO: Add user_id column to patients table for proper RLS
```

**Fix Required:**
1. Add `user_id` column to `patients` table
2. Update patient creation to link to user accounts
3. Re-enable role-based filtering in `/api/patients` endpoints

### ⚠️ Frontend-Backend Consistency

**Frontend Expectations:**
- Dashboard, Patients, and Alerts pages are accessible to all authenticated users
- No role-based UI rendering or route protection

**Backend Reality:**
- Dashboard stats: Requires clinician/admin role (403 error for patients)
- Alerts: Requires clinician/admin role (403 error for patients)
- Patients: Accessible to all but should filter by role

**Result:**
- Patient users see 403 errors on Dashboard and Alerts pages
- Frontend doesn't check user role before rendering UI
- No graceful degradation or role-based UI hiding

## Recommendations

### High Priority

1. **Add user_id to patients table**
   ```sql
   ALTER TABLE patients ADD COLUMN user_id VARCHAR REFERENCES users(id);
   ```

2. **Implement proper RLS filtering**
   - Update `/api/patients` to filter by user_id for patient role
   - Update `/api/patients/:id` to verify ownership for patient role
   - Update `/api/patients/:id/vitals` to verify ownership for patient role

3. **Add frontend role checks**
   - Check user role before rendering Dashboard stats (hide for patients)
   - Check user role before rendering Alerts page (hide for patients or show message)
   - Add role-based menu filtering in Layout component

### Medium Priority

4. **Create patient-specific dashboard**
   - Separate view for patient role showing only their own data
   - Remove clinician-specific features (all patients list, alerts, etc.)

5. **Add role badges in UI**
   - Display user role in header/profile
   - Show appropriate permissions information

### Low Priority

6. **Implement Supabase RLS policies**
   - Create database-level RLS policies for additional security layer
   - Enforce role-based access at the database level

## Current State Summary

✅ **Working:**
- Authentication system (login, register, logout)
- Role assignment (patient default, manual clinician/admin)
- Role-based middleware (`authenticateUser`, `requireRole`)
- Clinician/admin protected endpoints (alerts, dashboard stats)

⚠️ **Partially Working:**
- Patient data access (works but no role filtering)
- Frontend renders all pages regardless of role

❌ **Not Working:**
- Patient role users get 403 errors on Dashboard/Alerts
- No RLS on patient data (security issue)
- Frontend doesn't adapt UI based on user role

## Test Scenarios

### As Patient Role User
- ✅ Can login successfully
- ❌ Dashboard shows 403 errors (stats, alerts)
- ❌ Can see all patients (should only see own data)
- ❌ Alerts page returns 403

### As Clinician Role User
- ✅ Can login successfully
- ✅ Dashboard shows all stats and alerts
- ✅ Can see all patients
- ✅ Can view and manage alerts

### As Admin Role User
- ✅ Same as clinician (currently no admin-specific features)
