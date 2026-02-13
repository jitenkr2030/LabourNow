import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'labournow-default-encryption-key-32'
const ALGORITHM = 'aes-256-gcm'

// Derive a proper 32-byte key from the encryption key
const key = scryptSync(ENCRYPTION_KEY, 'salt', 32)

// Sensitive fields that should be encrypted
const SENSITIVE_FIELDS = [
  'mobile',
  'email',
  'gstNumber',
  'contactPerson',
  'contactPhone',
  'contactEmail',
  'address',
  'idDocuments',
  'workPhotos'
]

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param text - Plain text to encrypt
 * @returns Encrypted string with IV and auth tag
 */
export function encrypt(text: string): string {
  try {
    if (!text || typeof text !== 'string') {
      return text
    }

    const iv = randomBytes(16)
    const cipher = createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    // Combine IV, auth tag, and encrypted data
    const combined = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
    
    return combined
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypts data using AES-256-GCM
 * @param combined - Combined encrypted string (IV:authTag:encryptedData)
 * @returns Decrypted plain text
 */
export function decrypt(combined: string): string {
  try {
    if (!combined || typeof combined !== 'string') {
      return combined
    }

    const parts = combined.split(':')
    if (parts.length !== 3) {
      return combined // Not encrypted, return as-is
    }

    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    // Return original value if decryption fails
    return combined
  }
}

/**
 * Encrypts sensitive fields in an object
 * @param data - Object containing potentially sensitive data
 * @returns Object with sensitive fields encrypted
 */
export function encryptSensitiveFields(data: any): any {
  if (!data || typeof data !== 'object') {
    return data
  }

  const encrypted = { ...data }

  for (const field of SENSITIVE_FIELDS) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encrypt(encrypted[field])
    }
  }

  // Handle nested objects
  if (encrypted.labourProfile) {
    encrypted.labourProfile = encryptSensitiveFields(encrypted.labourProfile)
  }

  if (encrypted.employerProfile) {
    encrypted.employerProfile = encryptSensitiveFields(encrypted.employerProfile)
  }

  return encrypted
}

/**
 * Decrypts sensitive fields in an object
 * @param data - Object with potentially encrypted sensitive fields
 * @returns Object with sensitive fields decrypted
 */
export function decryptSensitiveFields(data: any): any {
  if (!data || typeof data !== 'object') {
    return data
  }

  const decrypted = { ...data }

  for (const field of SENSITIVE_FIELDS) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      decrypted[field] = decrypt(decrypted[field])
    }
  }

  // Handle nested objects
  if (decrypted.labourProfile) {
    decrypted.labourProfile = decryptSensitiveFields(decrypted.labourProfile)
  }

  if (decrypted.employerProfile) {
    decrypted.employerProfile = decryptSensitiveFields(decrypted.employerProfile)
  }

  return decrypted
}

/**
 * Hashes sensitive data for indexing/searching while maintaining privacy
 * @param data - Data to hash
 * @param salt - Salt for hashing
 * @returns SHA-256 hash
 */
export function hashSensitiveData(data: string, salt: string = 'labournow-salt'): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(data + salt).digest('hex')
}

/**
 * Generates a secure random token
 * @param length - Length of the token (default: 32)
 * @returns Secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

/**
 * Encrypts file data for secure storage
 * @param buffer - File buffer to encrypt
 * @returns Encrypted buffer with IV and auth tag prepended
 */
export function encryptFile(buffer: Buffer): Buffer {
  try {
    const iv = randomBytes(16)
    const cipher = createCipheriv(ALGORITHM, key, iv)
    
    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ])
    
    const authTag = cipher.getAuthTag()
    
    // Prepend IV and auth tag to encrypted data
    return Buffer.concat([iv, authTag, encrypted])
  } catch (error) {
    console.error('File encryption error:', error)
    throw new Error('Failed to encrypt file')
  }
}

/**
 * Decrypts file data
 * @param encryptedBuffer - Encrypted file buffer with IV and auth tag
 * @returns Decrypted file buffer
 */
export function decryptFile(encryptedBuffer: Buffer): Buffer {
  try {
    const iv = encryptedBuffer.slice(0, 16)
    const authTag = encryptedBuffer.slice(16, 32)
    const encrypted = encryptedBuffer.slice(32)
    
    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ])
  } catch (error) {
    console.error('File decryption error:', error)
    throw new Error('Failed to decrypt file')
  }
}

/**
 * Masks sensitive data for logging/display purposes
 * @param data - Sensitive data to mask
 * @param visibleChars - Number of characters to keep visible at start and end
 * @returns Masked string
 */
export function maskSensitiveData(data: string, visibleChars: number = 2): string {
  if (!data || typeof data !== 'string') {
    return data
  }

  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length)
  }

  const start = data.substring(0, visibleChars)
  const end = data.substring(data.length - visibleChars)
  const middle = '*'.repeat(data.length - visibleChars * 2)

  return start + middle + end
}

/**
 * Validates if data is encrypted (checks for our encryption format)
 * @param data - Data to check
 * @returns True if data appears to be encrypted
 */
export function isEncrypted(data: string): boolean {
  if (!data || typeof data !== 'string') {
    return false
  }

  const parts = data.split(':')
  return parts.length === 3 && 
         parts[0].length === 32 && // IV in hex (16 bytes)
         parts[1].length === 32    // Auth tag in hex (16 bytes)
}

/**
 * Securely compares two strings to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

// Database field encryption middleware
export const dbEncryptionMiddleware = {
  // Encrypt data before saving to database
  beforeCreate: (data: any) => encryptSensitiveFields(data),
  
  // Decrypt data after reading from database
  afterFind: (data: any) => decryptSensitiveFields(data),
  
  // Encrypt data before updating
  beforeUpdate: (data: any) => encryptSensitiveFields(data)
}

export default {
  encrypt,
  decrypt,
  encryptSensitiveFields,
  decryptSensitiveFields,
  hashSensitiveData,
  generateSecureToken,
  encryptFile,
  decryptFile,
  maskSensitiveData,
  isEncrypted,
  secureCompare,
  dbEncryptionMiddleware
}