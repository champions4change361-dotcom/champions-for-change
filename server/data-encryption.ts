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
    
    // Allow development fallback while maintaining strict production security
    if (process.env.NODE_ENV === 'development') {
      const key = envKey || 'dev-fallback-key-32chars-long123';
      
      // Convert hex string to buffer, or derive key from passphrase
      if (key.length === 64) {
        // Assume hex-encoded 256-bit key
        return Buffer.from(key, 'hex');
      } else {
        // Derive key from passphrase using scrypt
        return crypto.scryptSync(key, 'health-data-salt', HealthDataEncryption.KEY_LENGTH);
      }
    } else {
      // Strict enforcement for production
      if (!envKey) {
        throw new Error('HEALTH_DATA_ENCRYPTION_KEY environment variable is required for HIPAA compliance and PHI encryption in production environments.');
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
    
    // Encrypt sensitive PHI fields in medical history
    const medicalHistoryPhiFields = [
      'address', 'phone', 'personalPhysician', 'physicianPhone',
      'emergencyContactName', 'emergencyContactPhoneHome', 'emergencyContactPhoneWork',
      'q1_explanation', 'q2_explanation', 'q3_explanation', 'q4_explanation', 'q5_explanation',
      'q6_explanation', 'q7_explanation', 'q8_explanation', 'q9_explanation', 'q10_explanation',
      'q11_explanation', 'q12_explanation', 'q13_explanation', 'q14_explanation', 'q15_explanation',
      'q16_explanation', 'q17_explanation', 'q18_explanation', 'q19_explanation', 'q20_explanation',
      'q21_explanation', 'athleteSignature', 'parentSignature', 'physicianNotes'
    ];
    
    medicalHistoryPhiFields.forEach(field => {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = this.encrypt(encrypted[field]);
      }
    });
    
    return encrypted;
  }

  /**
   * Encrypt injury incident object
   */
  static encryptInjuryIncident(injuryIncident: any): any {
    if (!injuryIncident) return injuryIncident;
    
    const encrypted = { ...injuryIncident };
    
    // Encrypt sensitive PHI fields in injury incidents
    const injuryPhiFields = [
      'specificDiagnosis',
      'initialAssessment', 
      'immediateCarePlan',
      'referralTo',
      'witnessStatements'
    ];
    
    injuryPhiFields.forEach(field => {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = this.encrypt(encrypted[field]);
      }
    });
    
    // Encrypt JSONB PHI fields
    if (encrypted.vitals && typeof encrypted.vitals === 'object') {
      encrypted.vitals = this.encrypt(JSON.stringify(encrypted.vitals));
    }
    if (encrypted.returnToPLayClearance && typeof encrypted.returnToPLayClearance === 'object') {
      encrypted.returnToPLayClearance = this.encrypt(JSON.stringify(encrypted.returnToPLayClearance));
    }
    
    return encrypted;
  }

  /**
   * Encrypt health risk assessment object  
   */
  static encryptHealthRiskAssessment(assessment: any): any {
    if (!assessment) return assessment;
    
    const encrypted = { ...assessment };
    
    // Encrypt JSONB PHI fields in health risk assessments
    if (encrypted.injuryHistory && typeof encrypted.injuryHistory === 'object') {
      encrypted.injuryHistory = this.encrypt(JSON.stringify(encrypted.injuryHistory));
    }
    if (encrypted.movementScreen && typeof encrypted.movementScreen === 'object') {
      encrypted.movementScreen = this.encrypt(JSON.stringify(encrypted.movementScreen));
    }
    if (encrypted.strengthAssessment && typeof encrypted.strengthAssessment === 'object') {
      encrypted.strengthAssessment = this.encrypt(JSON.stringify(encrypted.strengthAssessment));
    }
    if (encrypted.riskFactors && typeof encrypted.riskFactors === 'object') {
      encrypted.riskFactors = this.encrypt(JSON.stringify(encrypted.riskFactors));
    }
    if (encrypted.recommendedInterventions && typeof encrypted.recommendedInterventions === 'object') {
      encrypted.recommendedInterventions = this.encrypt(JSON.stringify(encrypted.recommendedInterventions));
    }
    
    return encrypted;
  }
  
  /**
   * Decrypt medical history object
   */
  static decryptMedicalHistory(encryptedMedicalHistory: any): any {
    if (!encryptedMedicalHistory) return encryptedMedicalHistory;
    
    const decrypted = { ...encryptedMedicalHistory };
    
    // Decrypt sensitive PHI fields in medical history
    const medicalHistoryPhiFields = [
      'address', 'phone', 'personalPhysician', 'physicianPhone',
      'emergencyContactName', 'emergencyContactPhoneHome', 'emergencyContactPhoneWork',
      'q1_explanation', 'q2_explanation', 'q3_explanation', 'q4_explanation', 'q5_explanation',
      'q6_explanation', 'q7_explanation', 'q8_explanation', 'q9_explanation', 'q10_explanation',
      'q11_explanation', 'q12_explanation', 'q13_explanation', 'q14_explanation', 'q15_explanation',
      'q16_explanation', 'q17_explanation', 'q18_explanation', 'q19_explanation', 'q20_explanation',
      'q21_explanation', 'athleteSignature', 'parentSignature', 'physicianNotes'
    ];
    
    medicalHistoryPhiFields.forEach(field => {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          decrypted[field] = this.decrypt(decrypted[field]);
        } catch (error) {
          console.error(`Failed to decrypt medical history field ${field}:`, error);
          decrypted[field] = '[ENCRYPTED - UNABLE TO DECRYPT]';
        }
      }
    });
    
    return decrypted;
  }

  /**
   * Decrypt injury incident object
   */
  static decryptInjuryIncident(encryptedIncident: any): any {
    if (!encryptedIncident) return encryptedIncident;
    
    const decrypted = { ...encryptedIncident };
    
    // Decrypt sensitive PHI fields in injury incidents
    const injuryPhiFields = [
      'specificDiagnosis',
      'initialAssessment', 
      'immediateCarePlan',
      'referralTo',
      'witnessStatements'
    ];
    
    injuryPhiFields.forEach(field => {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          decrypted[field] = this.decrypt(decrypted[field]);
        } catch (error) {
          console.error(`Failed to decrypt injury field ${field}:`, error);
          decrypted[field] = '[ENCRYPTED - UNABLE TO DECRYPT]';
        }
      }
    });
    
    // Decrypt JSONB PHI fields
    if (decrypted.vitals && typeof decrypted.vitals === 'string') {
      try {
        decrypted.vitals = JSON.parse(this.decrypt(decrypted.vitals));
      } catch (error) {
        console.error('Failed to decrypt vitals:', error);
        decrypted.vitals = { error: 'Unable to decrypt vitals data' };
      }
    }
    if (decrypted.returnToPLayClearance && typeof decrypted.returnToPLayClearance === 'string') {
      try {
        decrypted.returnToPLayClearance = JSON.parse(this.decrypt(decrypted.returnToPLayClearance));
      } catch (error) {
        console.error('Failed to decrypt return to play clearance:', error);
        decrypted.returnToPLayClearance = { error: 'Unable to decrypt clearance data' };
      }
    }
    
    return decrypted;
  }

  /**
   * Decrypt health risk assessment object
   */
  static decryptHealthRiskAssessment(encryptedAssessment: any): any {
    if (!encryptedAssessment) return encryptedAssessment;
    
    const decrypted = { ...encryptedAssessment };
    
    // Decrypt JSONB PHI fields in health risk assessments
    if (decrypted.injuryHistory && typeof decrypted.injuryHistory === 'string') {
      try {
        decrypted.injuryHistory = JSON.parse(this.decrypt(decrypted.injuryHistory));
      } catch (error) {
        console.error('Failed to decrypt injury history:', error);
        decrypted.injuryHistory = { error: 'Unable to decrypt injury history' };
      }
    }
    if (decrypted.movementScreen && typeof decrypted.movementScreen === 'string') {
      try {
        decrypted.movementScreen = JSON.parse(this.decrypt(decrypted.movementScreen));
      } catch (error) {
        console.error('Failed to decrypt movement screen:', error);
        decrypted.movementScreen = { error: 'Unable to decrypt movement screen' };
      }
    }
    if (decrypted.strengthAssessment && typeof decrypted.strengthAssessment === 'string') {
      try {
        decrypted.strengthAssessment = JSON.parse(this.decrypt(decrypted.strengthAssessment));
      } catch (error) {
        console.error('Failed to decrypt strength assessment:', error);
        decrypted.strengthAssessment = { error: 'Unable to decrypt strength assessment' };
      }
    }
    if (decrypted.riskFactors && typeof decrypted.riskFactors === 'string') {
      try {
        decrypted.riskFactors = JSON.parse(this.decrypt(decrypted.riskFactors));
      } catch (error) {
        console.error('Failed to decrypt risk factors:', error);
        decrypted.riskFactors = { error: 'Unable to decrypt risk factors' };
      }
    }
    if (decrypted.recommendedInterventions && typeof decrypted.recommendedInterventions === 'string') {
      try {
        decrypted.recommendedInterventions = JSON.parse(this.decrypt(decrypted.recommendedInterventions));
      } catch (error) {
        console.error('Failed to decrypt recommended interventions:', error);
        decrypted.recommendedInterventions = { error: 'Unable to decrypt interventions' };
      }
    }
    
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