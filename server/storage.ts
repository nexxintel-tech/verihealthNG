// Storage interface - not used in current implementation
// We're using Supabase directly via the API routes

export interface IStorage {
  // Placeholder for future local storage needs
}

export class MemStorage implements IStorage {
  constructor() {
    // Empty constructor
  }
}

export const storage = new MemStorage();
