// Universal Registration Code System
// Generates unique codes for all platform types with intelligent domain routing

import { randomBytes } from 'crypto';
import type { IStorage } from "./storage";

export interface RegistrationCodeData {
  type: 'tournament_manager' | 'district_admin' | 'business_user' | 'fantasy_commissioner' | 'gaming_commissioner';
  userId: string;
  organizationId?: string;
  leagueId?: string;
  permissions: string[];
  expiresAt?: Date;
  maxUses?: number;
}

export class UniversalRegistrationSystem {
  
  // Generate unique registration codes for all platform types
  static generateRegistrationCode(data: RegistrationCodeData): string {
    const prefixes = {
      'tournament_manager': 'TM',
      'district_admin': 'DA', 
      'business_user': 'BU',
      'fantasy_commissioner': 'FC',
      'gaming_commissioner': 'GC'
    };
    
    const prefix = prefixes[data.type];
    const year = new Date().getFullYear();
    const randomId = randomBytes(4).toString('hex').toUpperCase();
    
    return `${prefix}${year}-${randomId}`;
  }
  
  // Validate and decode registration codes
  static async validateRegistrationCode(code: string, storage: IStorage) {
    try {
      const codeData = await storage.getRegistrationCode(code);
      
      if (!codeData) {
        return { valid: false, error: 'Invalid registration code' };
      }
      
      if (codeData.expiresAt && new Date() > new Date(codeData.expiresAt)) {
        return { valid: false, error: 'Registration code has expired' };
      }
      
      if (!codeData.isActive) {
        return { valid: false, error: 'Registration code is no longer active' };
      }
      
      if (codeData.maxUses && codeData.currentUses >= codeData.maxUses) {
        return { valid: false, error: 'Registration code has reached maximum uses' };
      }
      
      return {
        valid: true,
        type: codeData.type,
        permissions: codeData.permissions,
        organizationId: codeData.organizationId,
        leagueId: codeData.leagueId,
        createdBy: codeData.createdBy
      };
    } catch (error) {
      console.error('Code validation error:', error);
      return { valid: false, error: 'Code validation failed' };
    }
  }
  
  // Create invitation links with embedded codes and automatic domain routing
  static generateInvitationLink(code: string, baseUrl: string = 'trantortournaments.org'): string {
    const domainMap = {
      'TM': 'tournaments',      // Tournament Manager -> tournaments.trantortournaments.org
      'DA': 'tournaments',      // District Admin -> tournaments.trantortournaments.org
      'BU': 'pro',             // Business User -> pro.trantortournaments.org
      'FC': 'coaches',         // Fantasy Commissioner -> coaches.trantortournaments.org
      'GC': 'coaches'          // Gaming Commissioner -> coaches.trantortournaments.org
    };
    
    const prefix = code.substring(0, 2);
    const subdomain = domainMap[prefix as keyof typeof domainMap] || 'coaches';
    
    return `https://${subdomain}.${baseUrl}/join/${code}`;
  }
  
  // Generate league-specific registration codes for Coaches Lounge
  static generateLeagueCode(leagueType: string, commissionerId: string): string {
    const typeMap = {
      'fantasy-sports': 'FS',
      'gaming': 'GM',
      'office': 'OF',
      'custom': 'CU',
      'general': 'GL'
    };
    
    const prefix = typeMap[leagueType as keyof typeof typeMap] || 'CU';
    const year = new Date().getFullYear();
    const randomId = randomBytes(3).toString('hex').toUpperCase();
    
    return `${prefix}${year}-${randomId}`;
  }
  
  // Use registration code to increment usage counter
  static async useRegistrationCode(code: string, storage: IStorage, userId: string) {
    try {
      const validation = await this.validateRegistrationCode(code, storage);
      
      if (!validation.valid) {
        return validation;
      }
      
      // Increment usage counter
      await storage.incrementCodeUsage(code, userId);
      
      return {
        ...validation,
        used: true
      };
    } catch (error) {
      console.error('Code usage error:', error);
      return { valid: false, error: 'Failed to use registration code' };
    }
  }
  
  // Get all codes created by a user (for commissioners to manage their invitations)
  static async getUserCreatedCodes(userId: string, storage: IStorage) {
    try {
      return await storage.getRegistrationCodesByCreator(userId);
    } catch (error) {
      console.error('Error fetching user codes:', error);
      return [];
    }
  }
  
  // Deactivate a registration code (for security or administrative purposes)
  static async deactivateCode(codeId: string, storage: IStorage) {
    try {
      await storage.updateRegistrationCode(codeId, { isActive: false });
      return { success: true };
    } catch (error) {
      console.error('Code deactivation error:', error);
      return { success: false, error: 'Failed to deactivate code' };
    }
  }
}