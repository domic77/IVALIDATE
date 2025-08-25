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

// Save validation data using atomic writes to prevent corruption
export async function saveValidation(validation: ValidationRequest): Promise<void> {
  await ensureDirectories();
  const filePath = path.join(VALIDATIONS_DIR, `${validation.id}.json`);
  const tempFilePath = `${filePath}.tmp`;
  
  try {
    // Write to temporary file first
    const jsonData = JSON.stringify(validation, null, 2);
    await fs.writeFile(tempFilePath, jsonData);
    
    // Atomically rename temporary file to final file
    await fs.rename(tempFilePath, filePath);
  } catch (error) {
    // Clean up temporary file if it exists
    try {
      await fs.unlink(tempFilePath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    console.error('Error saving validation:', error);
    throw new Error('Failed to save validation data');
  }
}

// Load validation data with retry logic and better error handling
export async function loadValidation(validationId: string): Promise<ValidationRequest | null> {
  const filePath = path.join(VALIDATIONS_DIR, `${validationId}.json`);
  
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      
      // Check if data is empty or incomplete
      if (!data || data.trim().length === 0) {
        console.warn(`Validation file ${validationId} is empty, attempt ${attempt + 1}/3`);
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before retry
          continue;
        }
        return null;
      }
      
      // Try to parse JSON with error recovery
      try {
        return JSON.parse(data) as ValidationRequest;
      } catch (parseError) {
        console.warn(`JSON parse error for ${validationId}, attempt ${attempt + 1}/3:`, parseError);
        
        // If it's the last attempt and still failing, try to repair common JSON issues
        if (attempt === 2) {
          try {
            // Try to fix incomplete JSON by adding closing braces if needed
            const trimmed = data.trim();
            if (trimmed.endsWith(',')) {
              const repaired = trimmed.slice(0, -1) + '}';
              return JSON.parse(repaired) as ValidationRequest;
            }
            // If data ends abruptly, it might be incomplete - return null to trigger retry from client
            if (!trimmed.endsWith('}')) {
              console.warn(`Validation file ${validationId} appears to be incomplete`);
              return null;
            }
          } catch (repairError) {
            console.error(`Failed to repair JSON for ${validationId}:`, repairError);
          }
        }
        
        lastError = parseError;
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before retry
          continue;
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null; // File doesn't exist
      }
      lastError = error;
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before retry
        continue;
      }
    }
  }
  
  console.error('Error loading validation after 3 attempts:', lastError);
  throw new Error('Failed to load validation data after multiple attempts');
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