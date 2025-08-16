import { promises as fs } from 'fs';
import path from 'path';
import { ValidationRequest } from '@/types/validation';

const DATA_DIR = path.join(process.cwd(), 'data');
const VALIDATIONS_DIR = path.join(DATA_DIR, 'validations');
const CACHE_DIR = path.join(DATA_DIR, 'cache');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(VALIDATIONS_DIR, { recursive: true });
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Save validation data
export async function saveValidation(validation: ValidationRequest): Promise<void> {
  await ensureDirectories();
  const filePath = path.join(VALIDATIONS_DIR, `${validation.id}.json`);
  
  try {
    await fs.writeFile(filePath, JSON.stringify(validation, null, 2));
  } catch (error) {
    console.error('Error saving validation:', error);
    throw new Error('Failed to save validation data');
  }
}

// Load validation data
export async function loadValidation(validationId: string): Promise<ValidationRequest | null> {
  const filePath = path.join(VALIDATIONS_DIR, `${validationId}.json`);
  
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as ValidationRequest;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null; // File doesn't exist
    }
    console.error('Error loading validation:', error);
    throw new Error('Failed to load validation data');
  }
}

// Update validation data
export async function updateValidation(
  validationId: string, 
  updates: Partial<ValidationRequest>
): Promise<ValidationRequest | null> {
  const existing = await loadValidation(validationId);
  if (!existing) {
    return null;
  }

  const updated = { ...existing, ...updates };
  await saveValidation(updated);
  return updated;
}

// List all validations (for future admin/history features)
export async function listValidations(): Promise<string[]> {
  await ensureDirectories();
  
  try {
    const files = await fs.readdir(VALIDATIONS_DIR);
    return files.filter(file => file.endsWith('.json'))
                .map(file => file.replace('.json', ''));
  } catch (error) {
    console.error('Error listing validations:', error);
    return [];
  }
}

// Delete validation
export async function deleteValidation(validationId: string): Promise<boolean> {
  const filePath = path.join(VALIDATIONS_DIR, `${validationId}.json`);
  
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false; // File doesn't exist
    }
    console.error('Error deleting validation:', error);
    throw new Error('Failed to delete validation data');
  }
}

// Cache management for API responses
export async function saveCache(key: string, data: any, ttl: number = 3600): Promise<void> {
  await ensureDirectories();
  const filePath = path.join(CACHE_DIR, `${key}.json`);
  
  const cacheEntry = {
    data,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
    ttl
  };
  
  try {
    await fs.writeFile(filePath, JSON.stringify(cacheEntry, null, 2));
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

export async function loadCache(key: string): Promise<any | null> {
  const filePath = path.join(CACHE_DIR, `${key}.json`);
  
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const cacheEntry = JSON.parse(data);
    
    // Check if cache is still valid
    if (new Date() > new Date(cacheEntry.expiresAt)) {
      await fs.unlink(filePath); // Delete expired cache
      return null;
    }
    
    return cacheEntry.data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null; // File doesn't exist
    }
    console.error('Error loading cache:', error);
    return null;
  }
}

// Clear expired cache files
export async function cleanupCache(): Promise<void> {
  await ensureDirectories();
  
  try {
    const files = await fs.readdir(CACHE_DIR);
    const now = new Date();
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(CACHE_DIR, file);
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        const cacheEntry = JSON.parse(data);
        
        if (now > new Date(cacheEntry.expiresAt)) {
          await fs.unlink(filePath);
        }
      } catch (error) {
        // If we can't parse the file, delete it
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
}