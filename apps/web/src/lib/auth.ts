// Re-export auth client from shared package
export { AuthClient, BrowserStorage } from '@verihealth/common';

export type { AuthUser, AuthSession } from '@verihealth/common';

// Compatibility helpers for the web app (synchronous storage via localStorage)
const TOKEN_KEY = 'verihealth_auth_token';
const USER_KEY = 'verihealth_user';

export function setAuthToken(token: string): void {
	BrowserStorage.setItem(TOKEN_KEY, token as any);
}

export function getAuthToken(): string | null {
	return BrowserStorage.getItem(TOKEN_KEY) as string | null;
}

export function setUser(user: AuthUser): void {
	BrowserStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): AuthUser | null {
	const userJson = BrowserStorage.getItem(USER_KEY);
	if (!userJson) return null;
	try {
		return JSON.parse(userJson) as AuthUser;
	} catch {
		return null;
	}
}

export function clearAuth(): void {
	BrowserStorage.removeItem(TOKEN_KEY);
	BrowserStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
	return getAuthToken() !== null && getUser() !== null;
}

export function getAuthHeaders(): HeadersInit {
	const token = getAuthToken();
	if (!token) {
		throw new Error('No authentication token found');
	}
	return { Authorization: `Bearer ${token}` };
}

