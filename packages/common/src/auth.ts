import { StorageAdapter, BrowserStorage } from './storage';
import type { AuthUser, AuthSession } from './types';

const TOKEN_KEY = 'verihealth_auth_token';
const USER_KEY = 'verihealth_user';

export class AuthClient {
  storage: StorageAdapter;

  constructor(storage?: StorageAdapter) {
    this.storage = storage ?? BrowserStorage;
  }

  async setAuthToken(token: string): Promise<void> {
    await this.storage.setItem(TOKEN_KEY, token as any);
  }

  async getAuthToken(): Promise<string | null> {
    return await this.storage.getItem(TOKEN_KEY) as string | null;
  }

  async setUser(user: AuthUser): Promise<void> {
    await this.storage.setItem(USER_KEY, JSON.stringify(user));
  }

  async getUser(): Promise<AuthUser | null> {
    const userJson = await this.storage.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as AuthUser;
    } catch {
      return null;
    }
  }

  async clearAuth(): Promise<void> {
    await this.storage.removeItem(TOKEN_KEY);
    await this.storage.removeItem(USER_KEY);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    const user = await this.getUser();
    return token !== null && user !== null;
  }

  async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    if (!token) throw new Error('No authentication token found');
    return { Authorization: `Bearer ${token}` };
  }
}

export default AuthClient;
