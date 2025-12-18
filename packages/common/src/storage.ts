export interface StorageAdapter {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

export const BrowserStorage: StorageAdapter = {
  getItem(k: string) {
    return typeof window !== 'undefined' ? localStorage.getItem(k) : null;
  },
  setItem(k: string, v: string) {
    if (typeof window !== 'undefined') localStorage.setItem(k, v);
  },
  removeItem(k: string) {
    if (typeof window !== 'undefined') localStorage.removeItem(k);
  },
};
