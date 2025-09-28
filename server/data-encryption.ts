import crypto from 'crypto';

// Health data encryption service for PHI protection
export class HealthDataEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly TAG_LENGTH = 16; // 128 bits
  
  // Master encryption key - MUST be provided via environment variable
  private static readonly MASTER_KEY = HealthDataEncryption.getEncryptionKey();
  
  /**
   * Get encryption key from environment or throw error
   */
  private static getEncryptionKey(): Buffer {
    const envKey = process.env.HEALTH_DATA_ENCRYPTION_KEY;
    if (!envKey) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('HEALTH_DATA_ENCRYPTION_KEY environment variable is required for PHI encryption in production');
      } else {
        console.warn('⚠️  DEVELOPMENT: HEALTH_DATA_ENCRYPTION_KEY not set - using fallback for development only');
        // Use a development-only key (not for production)
        return crypto.scryptSync('development-encryption-key-not-for-production', 'health-data-salt', HealthDataEncryption.KEY_LENGTH);
      }
    }
    
    // Convert hex string to buffer, or derive key from passphrase
    if (envKey.length === 64) {
      // Assume hex-encoded 256-bit key
      return Buffer.from(envKey, 'hex');
    } else {
      // Derive key from passphrase using scrypt
      return crypto.scryptSync(envKey, 'health-data-salt', HealthDataEncryption.KEY_LENGTH);
    }
  }
  
  /**
   * Encrypt sensitive health data using AES-256-GCM
   */
  static encrypt(plaintext: string): string {
    try {
      if (!plaintext || plaintext.trim() === '') {
        return '';
      }
      
      // Generate random IV for each encryption operation
      const iv = crypto.randomBytes(HealthDataEncryption.IV_LENGTH);
      
      // Create cipher with explicit IV (secure method)
      const cipher = crypto.createCipheriv(HealthDataEncryption.ALGORITHM, HealthDataEncryption.MASTER_KEY, iv);
      
      // Set Additional Authenticated Data for integrity
      cipher.setAAD(Buffer.from('health-data-v1', 'utf8'));
      
      // Encrypt the data
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag for integrity verification
      const tag = cipher.getAuthTag();
      
      // Combine IV + tag + encrypted data for storage
      const result = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
      return result;
    } catch (error) {
      console.error('Health data encryption failed:', error);
      throw new Error('Failed to encrypt health data');
    }
  }
  
  /**
   * Decrypt sensitive health data using AES-256-GCM
   */
  static decrypt(encryptedData: string): string {
    try {
      if (!encryptedData || encryptedData.trim() === '') {
        return '';
      }
      
      // Parse the encrypted data format: iv:tag:ciphertext
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format - expected iv:tag:ciphertext');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      // Validate IV and tag lengths
      if (iv.length !== HealthDataEncryption.IV_LENGTH) {
        throw new Error('Invalid IV length');
      }
      if (tag.length !== HealthDataEncryption.TAG_LENGTH) {
        throw new Error('Invalid authentication tag length');
      }
      
      // Create decipher with explicit IV (secure method)
      const decipher = crypto.createDecipheriv(HealthDataEncryption.ALGORITHM, HealthDataEncryption.MASTER_KEY, iv);
      
      // Set Additional Authenticated Data for integrity verification
      decipher.setAAD(Buffer.from('health-data-v1', 'utf8'));
      
      // Set authentication tag for integrity verification
      decipher.setAuthTag(tag);
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Health data decryption failed:', error);
      // Provide more specific error information for debugging
      if (error.message.includes('bad decrypt')) {
        throw new Error('Failed to decrypt health data - invalid key or corrupted data');
      }
      throw new Error('Failed to decrypt health data');
    }
  }
  
  /**
   * Encrypt medical history object
   */
  static encryptMedicalHistory(medicalHistory: any): any {
    if (!medicalHistory) return medicalHistory;
    
    const encrypted = { ...medicalHistory };
    
    // Encrypt sensitive PHI fields
    const phiFields = [
      'allergies',
      'medications',
      'medicalConditions',
      'emergencyContact',
      'physicianNotes',
      'injuryHistory',
      'treatmentNotes',
      'diagnosticResults',
      'insuranceInfo'
    ];
    
    phiFields.forEach(field => {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = this.encrypt(encrypted[field]);
      }
    });
    
    return encrypted;
  }
  
  /**
   * Decrypt medical history object
   */
  static decryptMedicalHistory(encryptedMedicalHistory: any): any {
    if (!encryptedMedicalHistory) return encryptedMedicalHistory;
    
    const decrypted = { ...encryptedMedicalHistory };
    
    // Decrypt sensitive PHI fields
    const phiFields = [
      'allergies',
      'medications',
      'medicalConditions',
      'emergencyContact',
      'physicianNotes',
      'injuryHistory',
      'treatmentNotes',
      'diagnosticResults',
      'insuranceInfo'
    ];
    
    phiFields.forEach(field => {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          decrypted[field] = this.decrypt(decrypted[field]);
        } catch (error) {
          console.error(`Failed to decrypt ${field}:`, error);
          decrypted[field] = '[ENCRYPTED - UNABLE TO DECRYPT]';
        }
      }
    });
    
    return decrypted;
  }
  
  /**
   * Hash sensitive data for indexing (allows searching without decryption)
   */
  static hash(data: string): string {
    if (!data || data.trim() === '') {
      return '';
    }
    
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  /**
   * Generate a secure token for health data access
   */
  static generateAccessToken(userId: string, dataType: string, expiresIn: number = 3600): string {
    const payload = {
      userId,
      dataType,
      iat: Date.now(),
      exp: Date.now() + (expiresIn * 1000)
    };
    
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto.createHmac('sha256', HealthDataEncryption.MASTER_KEY)
      .update(token)
      .digest('hex');
    
    return `${token}.${signature}`;
  }
  
  /**
   * Verify health data access token
   */
  static verifyAccessToken(token: string): { userId: string; dataType: string } | null {
    try {
      const [tokenPart, signature] = token.split('.');
      
      // Verify signature
      const expectedSignature = crypto.createHmac('sha256', HealthDataEncryption.MASTER_KEY)
        .update(tokenPart)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        throw new Error('Invalid token signature');
      }
      
      // Decode payload
      const payload = JSON.parse(Buffer.from(tokenPart, 'base64').toString());
      
      // Check expiration
      if (Date.now() > payload.exp) {
        throw new Error('Token expired');
      }
      
      return {
        userId: payload.userId,
        dataType: payload.dataType
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
}

// Field-level encryption utility for specific data types
export class FieldEncryption {
  /**
   * Encrypt specific fields in an object
   */
  static encryptFields(obj: any, fieldsToEncrypt: string[]): any {
    if (!obj) return obj;
    
    const encrypted = { ...obj };
    
    fieldsToEncrypt.forEach(field => {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = HealthDataEncryption.encrypt(encrypted[field]);
        // Add a marker to indicate this field is encrypted
        encrypted[`${field}_encrypted`] = true;
      }
    });
    
    return encrypted;
  }
  
  /**
   * Decrypt specific fields in an object
   */
  static decryptFields(obj: any, fieldsToDecrypt: string[]): any {
    if (!obj) return obj;
    
    const decrypted = { ...obj };
    
    fieldsToDecrypt.forEach(field => {
      if (decrypted[field] && decrypted[`${field}_encrypted`]) {
        try {
          decrypted[field] = HealthDataEncryption.decrypt(decrypted[field]);
          delete decrypted[`${field}_encrypted`];
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
          decrypted[field] = '[ENCRYPTED - UNABLE TO DECRYPT]';
        }
      }
    });
    
    return decrypted;
  }
}

// Audit trail for health data access
export class HealthDataAudit {
  /**
   * Log health data access for HIPAA compliance
   */
  static async logAccess(
    userId: string,
    patientId: string,
    dataType: string,
    action: 'read' | 'write' | 'delete',
    ipAddress?: string,
    userAgent?: string
  ) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      userId,
      patientId,
      dataType,
      action,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      id: crypto.randomUUID()
    };
    
    // In production, this should be stored in a separate, immutable audit log
    console.log('HIPAA Audit Log:', auditEntry);
    
    // Store in database audit log
    try {
      const { getStorage } = await import('./storage');
      const storage = await getStorage();
      
      await storage.createComplianceAuditLog({
        userId,
        actionType: action === 'read' ? 'data_access' : 'data_modification',
        resourceType: 'health_data',
        resourceId: patientId,
        ipAddress,
        userAgent,
        complianceNotes: `Health data ${action} - ${dataType}`
      });
    } catch (error) {
      console.error('Failed to log health data audit:', error);
    }
  }
}

// Constants for health data classification
export const HEALTH_DATA_CLASSIFICATIONS = {
  PUBLIC: 'public',           // Public health information
  INTERNAL: 'internal',       // Internal medical notes
  CONFIDENTIAL: 'confidential', // Confidential health data
  PHI: 'phi'                 // Protected Health Information (highest security)
} as const;

export const PHI_FIELDS = [
  'allergies',
  'medications', 
  'medicalConditions',
  'emergencyContact',
  'physicianNotes',
  'injuryHistory',
  'treatmentNotes',
  'diagnosticResults',
  'insuranceInfo',
  'socialSecurityNumber',
  'medicalRecordNumber',
  'labResults',
  'imagingResults',
  'geneticInformation'
] as const;