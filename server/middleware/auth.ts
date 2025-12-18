import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'patient' | 'clinician' | 'admin' | 'institution_admin';
        institutionId?: string | null;
        approvalStatus?: string | null;
      };
    }
  }
}

/**
 * Authentication middleware
 * Extracts JWT token from Authorization header and verifies it with Supabase
 * Attaches user info to req.user
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch user role from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, institution_id, approval_status')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return res.status(403).json({ error: 'User not found in database' });
    }

    // Attach user info to request
    req.user = {
      id: userData.id,
      email: userData.email,
      role: userData.role as 'patient' | 'clinician' | 'admin' | 'institution_admin',
      institutionId: userData.institution_id,
      approvalStatus: userData.approval_status,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional middleware: Only allow specific roles
 */
export function requireRole(...allowedRoles: Array<'patient' | 'clinician' | 'admin' | 'institution_admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
}

/**
 * Middleware: Require approved status for clinicians
 */
export function requireApproved(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only check approval for clinicians
  if (req.user.role === 'clinician' && req.user.approvalStatus !== 'approved') {
    return res.status(403).json({ 
      error: 'Account pending approval',
      approvalStatus: req.user.approvalStatus
    });
  }

  next();
}
