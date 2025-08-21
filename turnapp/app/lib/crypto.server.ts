import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync, createHmac } from "node:crypto";

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // 128 bit
const KEY_LENGTH = 32; // 256 bit
const HMAC_LENGTH = 32; // 256 bit

/**
 * Get or derive encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  
  if (envKey) {
    // Production: Use provided key directly or derive from it
    if (envKey.length === 64) {
      // Assume it's already a hex-encoded 256-bit key
      return Buffer.from(envKey, 'hex');
    } else {
      // Derive key from passphrase using PBKDF2
      const salt = Buffer.from('turnapp-static-salt-v1', 'utf8'); // Static salt for deterministic key
      return pbkdf2Sync(envKey, salt, 100000, KEY_LENGTH, 'sha256');
    }
  }
  
  // Development: Generate deterministic key from NODE_ENV and app name
  const fallbackSeed = `${process.env.NODE_ENV || 'development'}-turnapp-dev-key-v1`;
  const salt = Buffer.from('dev-salt-turnapp', 'utf8');
  return pbkdf2Sync(fallbackSeed, salt, 10000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt sensitive data (like access tokens) for storage
 */
export function encryptToken(plaintext: string): string {
  if (!plaintext || plaintext.length === 0) {
    throw new Error('Cannot encrypt empty token');
  }
  
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Create HMAC for integrity
    const hmac = createHmac('sha256', key);
    hmac.update(iv);
    hmac.update(Buffer.from(encrypted, 'hex'));
    const authTag = hmac.digest();
    
    // Format: iv(32hex) + encrypted(variable) + hmac(64hex)
    return iv.toString('hex') + encrypted + authTag.toString('hex');
    
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt token');
  }
}

/**
 * Decrypt sensitive data from storage
 */
export function decryptToken(ciphertext: string): string {
  try {
    // Parse components: iv(32hex) + encrypted + hmac(64hex)
    if (ciphertext.length < IV_LENGTH * 2 + HMAC_LENGTH * 2) {
      throw new Error('Invalid ciphertext format');
    }
    
    const ivHex = ciphertext.substring(0, IV_LENGTH * 2);
    const hmacHex = ciphertext.substring(ciphertext.length - HMAC_LENGTH * 2);
    const encryptedHex = ciphertext.substring(IV_LENGTH * 2, ciphertext.length - HMAC_LENGTH * 2);
    
    const iv = Buffer.from(ivHex, 'hex');
    const providedHmac = Buffer.from(hmacHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    
    const key = getEncryptionKey();
    
    // Verify HMAC
    const hmac = createHmac('sha256', key);
    hmac.update(iv);
    hmac.update(encrypted);
    const calculatedHmac = hmac.digest();
    
    if (!calculatedHmac.equals(providedHmac)) {
      throw new Error('Token integrity check failed');
    }
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt token');
  }
}

/**
 * Test encryption/decryption roundtrip
 */
export function testCrypto(): boolean {
  try {
    const testData = 'test-access-token-12345';
    const encrypted = encryptToken(testData);
    const decrypted = decryptToken(encrypted);
    
    return testData === decrypted;
  } catch (error) {
    console.error('Crypto test failed:', error);
    return false;
  }
}

/**
 * Generate a new encryption key (for production setup)
 */
export function generateEncryptionKey(): string {
  return randomBytes(KEY_LENGTH).toString('hex');
}