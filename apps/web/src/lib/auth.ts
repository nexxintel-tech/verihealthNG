// Authentication utilities for Supabase Auth integration

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  email: string;
  role: 'patient' | 'clinician' | 'admin' | 'institution_admin';
}

interface AuthSession {
  user: AuthUser;
  accessToken: string;
}

const TOKEN_KEY = 'verihealth_auth_token';
const USER_KEY = 'verihealth_user';

// Store auth token in localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// Get auth token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Store user info in localStorage
export function setUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Get user info from localStorage
export function getUser(): AuthUser | null {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

// Clear auth data
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Login user
export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  
  // Store token
  setAuthToken(data.session.access_token);
  
  // Fetch user details
  const userResponse = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${data.session.access_token}`,
    },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to fetch user details');
  }

  const userData = await userResponse.json();
  setUser(userData.user);

  return {
    user: userData.user,
    accessToken: data.session.access_token,
  };
}

// Logout user
export async function logout(): Promise<void> {
  const token = getAuthToken();
  
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  clearAuth();
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getAuthToken() !== null && getUser() !== null;
}

// Add auth header to fetch requests
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
  };
}
