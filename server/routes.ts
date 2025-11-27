import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from 'jsonwebtoken';
import { supabase } from "./supabase";
import { authenticateUser, requireRole, requireApproved } from "./middleware/auth";
import { sendEmail, generateConfirmationEmail, generatePasswordResetEmail } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth endpoints (no authentication required)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if email is confirmed
      if (!data.user.email_confirmed_at) {
        // Sign out the user immediately
        if (data.session) {
          await supabase.auth.admin.signOut(data.session.access_token);
        }
        
        return res.status(403).json({ 
          error: "Please confirm your email before logging in. Check your inbox for the confirmation link.",
          requiresConfirmation: true,
          email: data.user.email,
        });
      }

      // Check clinician approval status
      const { data: userData } = await supabase
        .from('users')
        .select('role, approval_status')
        .eq('id', data.user.id)
        .single();

      if (userData?.role === 'clinician' && userData?.approval_status !== 'approved') {
        // Sign out the user
        if (data.session) {
          await supabase.auth.admin.signOut(data.session.access_token);
        }

        const statusMessage = userData?.approval_status === 'rejected' 
          ? "Your clinician registration was rejected. Please contact your institution administrator."
          : "Your clinician account is pending approval by your institution administrator.";

        return res.status(403).json({ 
          error: statusMessage,
          approvalStatus: userData?.approval_status,
        });
      }

      res.json({
        user: data.user,
        session: data.session,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(401).json({ error: error.message || "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate inputs
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // SECURITY: Always default to 'patient' role
      // Clinician/admin roles must be assigned by administrators
      const role = 'patient';

      // Check if email confirmation is enabled in environment
      const emailConfirmationEnabled = process.env.ENABLE_EMAIL_CONFIRMATION === 'true';

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        return res.status(500).json({ error: "Failed to create user" });
      }

      // Create user record in users table with patient role
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          role: role,
        });

      if (userError) {
        // If user table insert fails, try to delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw userError;
      }

      // If email confirmation is enabled and user needs to confirm
      if (emailConfirmationEnabled && !authData.session) {
        // Generate confirmation link using Supabase
        const redirectTo = `${process.env.VITE_DASHBOARD_URL || 'http://localhost:5000'}/confirm-email`;
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'signup',
          email,
          password,
          options: {
            redirectTo,
          },
        });

        if (linkError) {
          console.error("Error generating confirmation link:", linkError);
        } else {
          // Send confirmation email via Resend
          try {
            const confirmationEmail = generateConfirmationEmail(email, linkData.properties.action_link);
            await sendEmail(confirmationEmail);
          } catch (emailError: any) {
            console.error("Error sending confirmation email:", emailError);
            // Don't fail registration if email fails, user can request resend
          }
        }

        return res.json({
          message: "Registration successful. Please check your email to confirm your account.",
          requiresConfirmation: true,
        });
      }

      // Email confirmation disabled - return session
      res.json({
        user: authData.user,
        session: authData.session,
        message: "Registration successful"
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  // Clinician registration endpoint
  app.post("/api/auth/register-clinician", async (req, res) => {
    try {
      const { email, password, fullName, licenseNumber, specialty, phone, institutionId } = req.body;

      // Validate inputs
      if (!email || !password || !fullName) {
        return res.status(400).json({ error: "Email, password, and full name are required" });
      }

      // Get default institution if no institution selected
      let selectedInstitutionId = institutionId;
      if (!selectedInstitutionId) {
        const { data: defaultInstitution } = await supabase
          .from('institutions')
          .select('id')
          .eq('is_default', true)
          .single();

        if (!defaultInstitution) {
          return res.status(400).json({ error: "No institution available. Please contact support." });
        }
        selectedInstitutionId = defaultInstitution.id;
      }

      // Check if email confirmation is enabled in environment
      const emailConfirmationEnabled = process.env.ENABLE_EMAIL_CONFIRMATION === 'true';

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        return res.status(500).json({ error: "Failed to create user" });
      }

      // Create user record in users table with clinician role and pending approval
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          role: 'clinician',
          institution_id: selectedInstitutionId,
          approval_status: 'pending',
        });

      if (userError) {
        // If user table insert fails, try to delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw userError;
      }

      // Create clinician profile
      const { error: profileError } = await supabase
        .from('clinician_profiles')
        .insert({
          user_id: authData.user.id,
          full_name: fullName,
          license_number: licenseNumber || null,
          specialty: specialty || null,
          phone: phone || null,
        });

      if (profileError) {
        // Cleanup if profile creation fails
        await supabase.from('users').delete().eq('id', authData.user.id);
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // If email confirmation is enabled
      if (emailConfirmationEnabled && !authData.session) {
        const redirectTo = `${process.env.VITE_DASHBOARD_URL || 'http://localhost:5000'}/confirm-email`;
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'signup',
          email,
          password,
          options: {
            redirectTo,
          },
        });

        if (!linkError && linkData) {
          try {
            const confirmationEmail = generateConfirmationEmail(email, linkData.properties.action_link);
            await sendEmail(confirmationEmail);
          } catch (emailError: any) {
            console.error("Error sending confirmation email:", emailError);
          }
        }

        return res.json({
          message: "Registration successful. Your account is pending approval. Please check your email to confirm your account.",
          requiresConfirmation: true,
          requiresApproval: true,
        });
      }

      res.json({
        message: "Registration successful. Your account is pending approval by your institution administrator.",
        requiresApproval: true,
      });
    } catch (error: any) {
      console.error("Clinician registration error:", error);
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7);

      if (token) {
        await supabase.auth.admin.signOut(token);
      }

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.post("/api/auth/resend-confirmation", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Get user to verify they exist
      const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        // Don't reveal if user exists for security
        return res.json({ message: "If an account exists with this email, a confirmation link has been sent." });
      }

      if (user.email_confirmed_at) {
        return res.status(400).json({ error: "Email is already confirmed. You can log in." });
      }

      // Generate new confirmation link (use magiclink instead of signup for resend)
      const redirectTo = `${process.env.VITE_DASHBOARD_URL || 'http://localhost:5000'}/confirm-email`;
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo,
        },
      });

      if (linkError) throw linkError;

      // Send confirmation email via Resend
      const confirmationEmail = generateConfirmationEmail(email, linkData.properties.action_link);
      await sendEmail(confirmationEmail);

      res.json({ message: "Confirmation email sent. Please check your inbox." });
    } catch (error: any) {
      console.error("Resend confirmation error:", error);
      res.status(500).json({ error: "Failed to send confirmation email" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Generate password reset link using Supabase admin
      const redirectTo = `${process.env.VITE_DASHBOARD_URL || 'http://localhost:5000'}/reset-password`;
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo,
        },
      });

      if (linkError) {
        // Don't reveal if user exists for security
        console.error("Error generating reset link:", linkError);
        return res.json({ message: "If an account exists with this email, a password reset link has been sent." });
      }

      // Send password reset email via Resend
      try {
        const resetEmail = generatePasswordResetEmail(email, linkData.properties.action_link);
        await sendEmail(resetEmail);
      } catch (emailError: any) {
        console.error("Error sending password reset email:", emailError);
        throw emailError;
      }

      res.json({ message: "If an account exists with this email, a password reset link has been sent." });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to send password reset email" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { password, access_token } = req.body;

      // Validate required fields
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      if (!access_token) {
        return res.status(400).json({ error: "Reset token is required" });
      }

      // Verify the token by getting the user from Supabase
      // This validates that the token is authentic and not forged
      const { data: { user }, error: verifyError } = await supabase.auth.getUser(access_token);

      if (verifyError || !user) {
        console.error("Token verification failed:", verifyError?.message);
        return res.status(401).json({ 
          error: "Invalid or expired reset token. Please request a new password reset link." 
        });
      }

      // Update the user's password using admin API
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: password }
      );

      if (updateError) {
        console.error("Update password error:", updateError);
        throw updateError;
      }

      res.json({ 
        message: "Password reset successfully. Please log in with your new password."
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: error.message || "Failed to reset password" });
    }
  });

  app.get("/api/auth/me", authenticateUser, async (req, res) => {
    res.json({ user: req.user });
  });

  // Protected routes - require authentication
  
  // Get all patients (role-based access)
  // - Patients: see only their own data
  // - Clinicians: see only patients assigned to them
  // - Institution admins: see all patients in their institution
  // - Admins: see all patients
  app.get("/api/patients", authenticateUser, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const userInstitutionId = req.user!.institutionId;

      // Fetch patients based on role with proper query chaining
      let patientsQuery = supabase
        .from("patients")
        .select("*");

      // Role-based filtering
      if (userRole === 'patient') {
        // Patients only see their own data
        patientsQuery = patientsQuery.eq('user_id', userId);
      } else if (userRole === 'clinician') {
        // Clinicians only see patients assigned to them
        patientsQuery = patientsQuery.eq('assigned_clinician_id', userId);
      } else if (userRole === 'institution_admin') {
        // Institution admins see all patients in their institution
        patientsQuery = patientsQuery.eq('institution_id', userInstitutionId);
      }
      // Admins see all patients (no filter)

      // Apply ordering and execute query
      const { data: patients, error: patientsError } = await patientsQuery.order("created_at", { ascending: false });

      if (patientsError) throw patientsError;

      if (!patients || patients.length === 0) {
        return res.json([]);
      }

      // Fetch risk scores for all patients
      const patientIds = patients.map(p => p.id);
      const { data: riskScores } = await supabase
        .from('risk_scores')
        .select('patient_id, score, risk_level, last_sync')
        .in('patient_id', patientIds)
        .order('updated_at', { ascending: false });

      // Get latest risk score for each patient
      const latestRiskByPatient = riskScores?.reduce((acc, rs) => {
        if (!acc[rs.patient_id]) {
          acc[rs.patient_id] = rs;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      // Fetch conditions for each patient
      const { data: conditions } = await supabase
        .from('conditions')
        .select('patient_id, name')
        .in('patient_id', patientIds);

      // Group conditions by patient
      const conditionsByPatient = conditions?.reduce((acc, c) => {
        if (!acc[c.patient_id]) acc[c.patient_id] = [];
        acc[c.patient_id].push(c.name);
        return acc;
      }, {} as Record<string, string[]>) || {};

      // Transform data to match frontend format
      const transformedPatients = patients.map(patient => ({
        id: patient.id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        conditions: conditionsByPatient[patient.id] || [],
        riskScore: latestRiskByPatient[patient.id]?.score || 0,
        riskLevel: latestRiskByPatient[patient.id]?.risk_level || "low",
        lastSync: latestRiskByPatient[patient.id]?.last_sync || patient.created_at,
        status: patient.status,
      }));

      res.json(transformedPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ error: "Failed to fetch patients" });
    }
  });

  // Get single patient with full details
  app.get("/api/patients/:id", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const userInstitutionId = req.user!.institutionId;

      // Check if user has permission to view this patient
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();

      if (patientError) throw patientError;

      // Role-based access control
      if (userRole === 'patient' && patient.user_id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (userRole === 'clinician' && patient.assigned_clinician_id !== userId) {
        return res.status(403).json({ error: "Access denied - patient not assigned to you" });
      }
      if (userRole === 'institution_admin' && patient.institution_id !== userInstitutionId) {
        return res.status(403).json({ error: "Access denied - patient not in your institution" });
      }

      // Fetch latest risk score
      const { data: riskScores } = await supabase
        .from("risk_scores")
        .select("score, risk_level, last_sync")
        .eq("patient_id", id)
        .order("updated_at", { ascending: false })
        .limit(1);

      const riskScore = riskScores?.[0];

      // Fetch conditions
      const { data: conditions } = await supabase
        .from("conditions")
        .select("name")
        .eq("patient_id", id);

      const transformedPatient = {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        conditions: conditions?.map((c: any) => c.name) || [],
        riskScore: riskScore?.score || 0,
        riskLevel: riskScore?.risk_level || "low",
        lastSync: riskScore?.last_sync || patient.created_at,
        status: patient.status,
      };

      res.json(transformedPatient);
    } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({ error: "Failed to fetch patient" });
    }
  });

  // Get vital readings for a patient
  app.get("/api/patients/:id/vitals", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      const { type, days = 7 } = req.query;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const userInstitutionId = req.user!.institutionId;

      // Verify patient ownership based on role
      const { data: patient } = await supabase
        .from("patients")
        .select("user_id, assigned_clinician_id, institution_id")
        .eq("id", id)
        .single();

      if (userRole === 'patient' && patient?.user_id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (userRole === 'clinician' && patient?.assigned_clinician_id !== userId) {
        return res.status(403).json({ error: "Access denied - patient not assigned to you" });
      }
      if (userRole === 'institution_admin' && patient?.institution_id !== userInstitutionId) {
        return res.status(403).json({ error: "Access denied - patient not in your institution" });
      }

      let query = supabase
        .from("vital_readings")
        .select("*")
        .eq("patient_id", id)
        .gte("timestamp", new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000).toISOString())
        .order("timestamp", { ascending: false });

      if (type) {
        query = query.eq("type", type);
      }

      const { data: vitals, error } = await query;

      if (error) throw error;

      res.json(vitals || []);
    } catch (error) {
      console.error("Error fetching vitals:", error);
      res.status(500).json({ error: "Failed to fetch vitals" });
    }
  });

  // Get all alerts (role-based access)
  // - Clinicians: see only alerts for patients assigned to them
  // - Institution admins: see all alerts for patients in their institution
  // - Admins: see all alerts
  app.get("/api/alerts", authenticateUser, requireRole('clinician', 'admin', 'institution_admin'), async (req, res) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const userInstitutionId = req.user!.institutionId;

      // First get the patient IDs this user can access
      let patientIds: string[] = [];
      
      if (userRole === 'clinician') {
        // Clinicians only see alerts for their assigned patients
        const { data: patients } = await supabase
          .from("patients")
          .select("id")
          .eq("assigned_clinician_id", userId);
        patientIds = patients?.map(p => p.id) || [];
      } else if (userRole === 'institution_admin') {
        // Institution admins see alerts for all patients in their institution
        const { data: patients } = await supabase
          .from("patients")
          .select("id")
          .eq("institution_id", userInstitutionId);
        patientIds = patients?.map(p => p.id) || [];
      }

      // Build the query
      let alertsQuery = supabase
        .from("alerts")
        .select(`
          *,
          patients (name)
        `)
        .order("timestamp", { ascending: false })
        .limit(50);

      // Filter by patient IDs for non-admin roles
      if (userRole !== 'admin' && patientIds.length > 0) {
        alertsQuery = alertsQuery.in("patient_id", patientIds);
      } else if (userRole !== 'admin' && patientIds.length === 0) {
        // No patients assigned, return empty
        return res.json([]);
      }

      const { data: alerts, error } = await alertsQuery;

      if (error) throw error;

      const transformedAlerts = alerts?.map(a => ({
        id: a.id,
        patientId: a.patient_id,
        patientName: a.patients?.name || "Unknown",
        type: a.type,
        message: a.message,
        severity: a.severity,
        timestamp: a.timestamp,
        isRead: a.is_read,
      }));

      res.json(transformedAlerts || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Mark alert as read (with ownership verification)
  app.patch("/api/alerts/:id", authenticateUser, requireRole('clinician', 'admin', 'institution_admin'), async (req, res) => {
    try {
      const { id } = req.params;
      const { isRead } = req.body;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const userInstitutionId = req.user!.institutionId;

      // First get the alert and verify access
      const { data: alert, error: alertError } = await supabase
        .from("alerts")
        .select("*, patients(assigned_clinician_id, institution_id)")
        .eq("id", id)
        .single();

      if (alertError || !alert) {
        return res.status(404).json({ error: "Alert not found" });
      }

      // Verify access based on role
      if (userRole === 'clinician' && alert.patients?.assigned_clinician_id !== userId) {
        return res.status(403).json({ error: "Access denied - patient not assigned to you" });
      }
      if (userRole === 'institution_admin' && alert.patients?.institution_id !== userInstitutionId) {
        return res.status(403).json({ error: "Access denied - patient not in your institution" });
      }

      const { data, error } = await supabase
        .from("alerts")
        .update({ is_read: isRead })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error("Error updating alert:", error);
      res.status(500).json({ error: "Failed to update alert" });
    }
  });

  // Get dashboard stats (role-based filtering)
  app.get("/api/dashboard/stats", authenticateUser, requireRole('clinician', 'admin', 'institution_admin'), async (req, res) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const userInstitutionId = req.user!.institutionId;

      // Get patient IDs this user can access
      let patientsQuery = supabase.from("patients").select("id");
      
      if (userRole === 'clinician') {
        patientsQuery = patientsQuery.eq('assigned_clinician_id', userId);
      } else if (userRole === 'institution_admin') {
        patientsQuery = patientsQuery.eq('institution_id', userInstitutionId);
      }
      // Admin sees all patients

      const { data: patients } = await patientsQuery;
      const patientIds = patients?.map(p => p.id) || [];

      // Get total patients count
      const totalPatients = patientIds.length;

      if (totalPatients === 0) {
        return res.json({
          totalPatients: 0,
          highRiskCount: 0,
          activeAlerts: 0,
          avgRiskScore: 0,
        });
      }

      // Get risk scores for accessible patients only
      const { data: allRiskScores } = await supabase
        .from("risk_scores")
        .select("patient_id, score, risk_level, updated_at")
        .in("patient_id", patientIds)
        .order("updated_at", { ascending: false });

      // Get latest risk score for each patient
      const latestRiskByPatient = allRiskScores?.reduce((acc, rs) => {
        if (!acc[rs.patient_id]) {
          acc[rs.patient_id] = rs;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      const latestRiskScores = Object.values(latestRiskByPatient);

      // Count high risk patients
      const highRiskCount = latestRiskScores.filter(
        (rs: any) => rs.risk_level === "high"
      ).length;

      // Get unread alerts for accessible patients only
      const { count: activeAlerts } = await supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .in("patient_id", patientIds)
        .eq("is_read", false);

      // Calculate average risk score
      const avgRiskScore = latestRiskScores.length
        ? Math.round(latestRiskScores.reduce((sum: number, r: any) => sum + r.score, 0) / latestRiskScores.length)
        : 0;

      res.json({
        totalPatients,
        highRiskCount,
        activeAlerts: activeAlerts || 0,
        avgRiskScore,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Institution endpoints
  app.get("/api/institutions", async (req, res) => {
    try {
      const { data: institutions, error } = await supabase
        .from('institutions')
        .select('id, name, address')
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;

      res.json(institutions || []);
    } catch (error) {
      console.error("Error fetching institutions:", error);
      res.status(500).json({ error: "Failed to fetch institutions" });
    }
  });

  // Institution admin endpoints
  app.get("/api/admin/pending-clinicians", authenticateUser, requireRole('institution_admin'), async (req, res) => {
    try {
      const institutionId = req.user!.institutionId;

      if (!institutionId) {
        return res.status(403).json({ error: "Institution admin must be assigned to an institution" });
      }

      // SECURITY: Scope query to admin's institution only
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, approval_status, created_at')
        .eq('role', 'clinician')
        .eq('institution_id', institutionId)
        .in('approval_status', ['pending', 'rejected'])
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        return res.json([]);
      }

      // Fetch clinician profiles
      const userIds = users.map(u => u.id);
      const { data: profiles } = await supabase
        .from('clinician_profiles')
        .select('user_id, full_name, license_number, specialty, phone')
        .in('user_id', userIds);

      const profilesByUserId = profiles?.reduce((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {} as Record<string, any>) || {};

      const pendingClinicians = users.map(user => ({
        id: user.id,
        email: user.email,
        approvalStatus: user.approval_status,
        createdAt: user.created_at,
        profile: profilesByUserId[user.id] || null,
      }));

      res.json(pendingClinicians);
    } catch (error) {
      console.error("Error fetching pending clinicians:", error);
      res.status(500).json({ error: "Failed to fetch pending clinicians" });
    }
  });

  app.post("/api/admin/approve-clinician", authenticateUser, requireRole('institution_admin'), async (req, res) => {
    try {
      const { clinicianId } = req.body;
      const institutionId = req.user!.institutionId;

      // Validate input
      if (!clinicianId || typeof clinicianId !== 'string') {
        return res.status(400).json({ error: "Valid clinician ID is required" });
      }

      if (!institutionId) {
        return res.status(403).json({ error: "Institution admin must be assigned to an institution" });
      }

      // SECURITY: Atomic update with institution_id filter to prevent TOCTOU
      // This single operation ensures we only update clinicians that:
      // 1. Match the clinicianId
      // 2. Have role 'clinician'
      // 3. Belong to the admin's institution
      const { data, error: updateError, count } = await supabase
        .from('users')
        .update({ approval_status: 'approved' })
        .eq('id', clinicianId)
        .eq('role', 'clinician')
        .eq('institution_id', institutionId)
        .select();

      if (updateError) {
        console.error("Error approving clinician:", updateError);
        throw updateError;
      }

      // Check if any rows were actually updated
      if (!data || data.length === 0) {
        console.warn(`Admin ${req.user!.id} attempted to approve non-existent or cross-institution clinician ${clinicianId}`);
        return res.status(404).json({ error: "Clinician not found or not in your institution" });
      }

      res.json({ message: "Clinician approved successfully" });
    } catch (error) {
      console.error("Error approving clinician:", error);
      res.status(500).json({ error: "Failed to approve clinician" });
    }
  });

  app.post("/api/admin/reject-clinician", authenticateUser, requireRole('institution_admin'), async (req, res) => {
    try {
      const { clinicianId } = req.body;
      const institutionId = req.user!.institutionId;

      // Validate input
      if (!clinicianId || typeof clinicianId !== 'string') {
        return res.status(400).json({ error: "Valid clinician ID is required" });
      }

      if (!institutionId) {
        return res.status(403).json({ error: "Institution admin must be assigned to an institution" });
      }

      // SECURITY: Atomic update with institution_id filter to prevent TOCTOU
      // This single operation ensures we only update clinicians that:
      // 1. Match the clinicianId
      // 2. Have role 'clinician'
      // 3. Belong to the admin's institution
      const { data, error: updateError } = await supabase
        .from('users')
        .update({ approval_status: 'rejected' })
        .eq('id', clinicianId)
        .eq('role', 'clinician')
        .eq('institution_id', institutionId)
        .select();

      if (updateError) {
        console.error("Error rejecting clinician:", updateError);
        throw updateError;
      }

      // Check if any rows were actually updated
      if (!data || data.length === 0) {
        console.warn(`Admin ${req.user!.id} attempted to reject non-existent or cross-institution clinician ${clinicianId}`);
        return res.status(404).json({ error: "Clinician not found or not in your institution" });
      }

      res.json({ message: "Clinician rejected" });
    } catch (error) {
      console.error("Error rejecting clinician:", error);
      res.status(500).json({ error: "Failed to reject clinician" });
    }
  });

  // Get top performing clinicians (for dashboard widget)
  app.get("/api/clinicians/top-performers", authenticateUser, async (req, res) => {
    try {
      // Get all approved clinicians with their profiles
      const { data: clinicians, error: cliniciansError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          institution_id,
          created_at
        `)
        .eq('role', 'clinician')
        .eq('approval_status', 'approved');

      if (cliniciansError) throw cliniciansError;

      if (!clinicians || clinicians.length === 0) {
        return res.json([]);
      }

      const clinicianIds = clinicians.map(c => c.id);

      // Get clinician profiles
      const { data: profiles } = await supabase
        .from('clinician_profiles')
        .select('user_id, full_name, specialty')
        .in('user_id', clinicianIds);

      const profilesByUserId = profiles?.reduce((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {} as Record<string, any>) || {};

      // Get alerts with response times (where clinician responded)
      const { data: respondedAlerts } = await supabase
        .from('alerts')
        .select('id, responded_by_id, timestamp, responded_at')
        .not('responded_by_id', 'is', null)
        .not('responded_at', 'is', null);

      // Calculate average response time per clinician
      const responseTimesByClinicianId: Record<string, number[]> = {};
      respondedAlerts?.forEach(alert => {
        if (alert.responded_by_id && alert.responded_at && alert.timestamp) {
          const responseTimeMs = new Date(alert.responded_at).getTime() - new Date(alert.timestamp).getTime();
          if (responseTimeMs > 0) {
            if (!responseTimesByClinicianId[alert.responded_by_id]) {
              responseTimesByClinicianId[alert.responded_by_id] = [];
            }
            responseTimesByClinicianId[alert.responded_by_id].push(responseTimeMs);
          }
        }
      });

      // Calculate average response time per clinician
      const avgResponseTimeByClinicianId: Record<string, number> = {};
      Object.entries(responseTimesByClinicianId).forEach(([clinicianId, times]) => {
        avgResponseTimeByClinicianId[clinicianId] = times.reduce((a, b) => a + b, 0) / times.length;
      });

      // Get risk score improvements (patient outcomes)
      // For this, we track when risk scores decreased over time
      const { data: riskScores } = await supabase
        .from('risk_scores')
        .select('patient_id, score, created_at')
        .order('created_at', { ascending: true });

      // Group risk scores by patient and calculate improvement
      const riskScoresByPatient: Record<string, { score: number; createdAt: string }[]> = {};
      riskScores?.forEach(rs => {
        if (!riskScoresByPatient[rs.patient_id]) {
          riskScoresByPatient[rs.patient_id] = [];
        }
        riskScoresByPatient[rs.patient_id].push({ score: rs.score, createdAt: rs.created_at });
      });

      // Sort each patient's risk scores by timestamp to ensure correct order
      Object.values(riskScoresByPatient).forEach(scores => {
        scores.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });

      // Calculate patient improvements (where risk score decreased)
      let totalPatients = 0;
      let patientsImproved = 0;
      Object.values(riskScoresByPatient).forEach(scores => {
        if (scores.length >= 2) {
          totalPatients++;
          const firstScore = scores[0].score;
          const lastScore = scores[scores.length - 1].score;
          if (lastScore < firstScore) {
            patientsImproved++;
          }
        }
      });

      // Calculate institution improvement rate (shared metric for all clinicians in same institution)
      const improvementRate = totalPatients > 0 ? Math.round((patientsImproved / totalPatients) * 100) : 0;

      // Build the top performers list
      const topPerformers = clinicians.map(clinician => {
        const profile = profilesByUserId[clinician.id];
        const avgResponseMs = avgResponseTimeByClinicianId[clinician.id];
        const alertsRespondedTo = responseTimesByClinicianId[clinician.id]?.length || 0;

        // Convert response time to human-readable format
        let avgResponseTime = 'N/A';
        if (avgResponseMs) {
          const minutes = Math.floor(avgResponseMs / 60000);
          const hours = Math.floor(minutes / 60);
          if (hours > 0) {
            avgResponseTime = `${hours}h ${minutes % 60}m`;
          } else {
            avgResponseTime = `${minutes}m`;
          }
        }

        // Calculate a performance score (lower response time + higher improvement = better)
        let performanceScore = 0;
        if (avgResponseMs) {
          // Response time score: faster = higher (max 50 points for <5 min response)
          const responseScore = Math.max(0, 50 - (avgResponseMs / 60000 / 5) * 10);
          performanceScore += responseScore;
        }
        // Improvement rate contributes to score (max 50 points)
        performanceScore += (improvementRate / 100) * 50;

        return {
          id: clinician.id,
          name: profile?.full_name || clinician.email.split('@')[0],
          specialty: profile?.specialty || 'General',
          avgResponseTime,
          avgResponseTimeMs: avgResponseMs || null,
          alertsRespondedTo,
          patientOutcomeRate: improvementRate,
          performanceScore: Math.round(performanceScore),
        };
      });

      // Sort by performance score (highest first)
      topPerformers.sort((a, b) => b.performanceScore - a.performanceScore);

      // Return top 5
      res.json(topPerformers.slice(0, 5));
    } catch (error) {
      console.error("Error fetching top performers:", error);
      res.status(500).json({ error: "Failed to fetch top performers" });
    }
  });

  // Update alert with response (when clinician marks alert as read)
  // Clinicians can only respond to alerts for their assigned patients
  app.patch("/api/alerts/:id/respond", authenticateUser, requireRole('clinician', 'admin'), async (req, res) => {
    try {
      const { id } = req.params;
      const clinicianId = req.user!.id;
      const userRole = req.user!.role;

      // First verify the alert exists and check ownership
      const { data: existingAlert, error: fetchError } = await supabase
        .from("alerts")
        .select("id, responded_by_id, patients(assigned_clinician_id)")
        .eq("id", id)
        .single();

      if (fetchError || !existingAlert) {
        return res.status(404).json({ error: "Alert not found" });
      }

      // Verify clinician owns this patient (admins can respond to any)
      if (userRole === 'clinician' && existingAlert.patients?.assigned_clinician_id !== clinicianId) {
        return res.status(403).json({ error: "Access denied - patient not assigned to you" });
      }

      // If already responded to, don't overwrite the original responder
      if (existingAlert.responded_by_id) {
        return res.status(400).json({ error: "Alert already responded to" });
      }

      const { data, error } = await supabase
        .from("alerts")
        .update({ 
          is_read: true,
          responded_by_id: clinicianId,
          responded_at: new Date().toISOString()
        })
        .eq("id", id)
        .is("responded_by_id", null) // Only update if not already responded
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error("Error responding to alert:", error);
      res.status(500).json({ error: "Failed to respond to alert" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
