import { 
  type District, type InsertDistrict, 
  type School, type InsertSchool,
  type SchoolAsset, type InsertSchoolAsset,
  type AthleticVenue, type InsertAthleticVenue,
  type SchoolInvite, type InsertSchoolInvite,
  districts, schools, schoolAssets, athleticVenues, schoolInvites
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IDistrictStorage {
  // District methods
  createDistrict(district: InsertDistrict): Promise<District>;
  getDistrict(id: string): Promise<District | undefined>;
  getDistrictByCode(code: string): Promise<District | undefined>;
  getAllDistricts(): Promise<District[]>;
  updateDistrict(id: string, updates: Partial<District>): Promise<District | undefined>;

  // School methods
  createSchool(school: InsertSchool): Promise<School>;
  getSchool(id: string): Promise<School | undefined>;
  getSchoolByVLC(vlcCode: string): Promise<School | undefined>;
  getSchoolsByDistrict(districtId: string): Promise<School[]>;
  getFeederSchools(schoolId: string): Promise<School[]>;
  updateSchool(id: string, updates: Partial<School>): Promise<School | undefined>;

  // School asset methods
  createSchoolAsset(asset: InsertSchoolAsset): Promise<SchoolAsset>;
  getSchoolAsset(id: string): Promise<SchoolAsset | undefined>;
  getSchoolAssets(schoolId: string): Promise<SchoolAsset[]>;
  getSchoolAssetsByType(schoolId: string, assetType: string): Promise<SchoolAsset[]>;
  updateSchoolAsset(id: string, updates: Partial<SchoolAsset>): Promise<SchoolAsset | undefined>;
  deleteSchoolAsset(id: string): Promise<boolean>;

  // Athletic venue methods
  createAthleticVenue(venue: InsertAthleticVenue): Promise<AthleticVenue>;
  getAthleticVenue(id: string): Promise<AthleticVenue | undefined>;
  getVenuesBySchool(schoolId: string): Promise<AthleticVenue[]>;

  // School invite methods
  createSchoolInvite(invite: InsertSchoolInvite): Promise<SchoolInvite>;
  getSchoolInvite(id: string): Promise<SchoolInvite | undefined>;
  getSchoolInviteByToken(token: string): Promise<SchoolInvite | undefined>;
  getSchoolInvitesByDistrict(districtId: string): Promise<SchoolInvite[]>;
  updateSchoolInvite(id: string, updates: Partial<SchoolInvite>): Promise<SchoolInvite | undefined>;
}

export class DistrictDbStorage implements IDistrictStorage {
  constructor() {
    // Using the shared db connection from ./db.ts
  }

  // District methods
  async createDistrict(district: InsertDistrict): Promise<District> {
    const id = randomUUID();
    const [newDistrict] = await db.insert(districts).values({
      id,
      ...district,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return newDistrict;
  }

  async getDistrict(id: string): Promise<District | undefined> {
    const [district] = await db.select().from(districts).where(eq(districts.id, id));
    return district || undefined;
  }

  async getDistrictByCode(code: string): Promise<District | undefined> {
    const [district] = await db.select().from(districts).where(eq(districts.districtCode, code));
    return district || undefined;
  }

  async getAllDistricts(): Promise<District[]> {
    return await db.select().from(districts);
  }

  async updateDistrict(id: string, updates: Partial<District>): Promise<District | undefined> {
    const [updated] = await db.update(districts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(districts.id, id))
      .returning();
    return updated || undefined;
  }

  // School methods
  async createSchool(school: InsertSchool): Promise<School> {
    const id = randomUUID();
    const [newSchool] = await db.insert(schools).values({
      id,
      ...school,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return newSchool;
  }

  async getSchool(id: string): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.id, id));
    return school || undefined;
  }

  async getSchoolByVLC(vlcCode: string): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.vlcCode, vlcCode));
    return school || undefined;
  }

  async getSchoolsByDistrict(districtId: string): Promise<School[]> {
    return await db.select().from(schools).where(eq(schools.districtId, districtId));
  }

  async getFeederSchools(schoolId: string): Promise<School[]> {
    return await db.select().from(schools).where(eq(schools.feedsIntoSchoolId, schoolId));
  }

  async updateSchool(id: string, updates: Partial<School>): Promise<School | undefined> {
    const [updated] = await db.update(schools)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schools.id, id))
      .returning();
    return updated || undefined;
  }

  // School asset methods
  async createSchoolAsset(asset: InsertSchoolAsset): Promise<SchoolAsset> {
    const id = randomUUID();
    const [newAsset] = await db.insert(schoolAssets).values({
      id,
      ...asset,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return newAsset;
  }

  async getSchoolAsset(id: string): Promise<SchoolAsset | undefined> {
    const [asset] = await db.select().from(schoolAssets).where(eq(schoolAssets.id, id));
    return asset || undefined;
  }

  async getSchoolAssets(schoolId: string): Promise<SchoolAsset[]> {
    return await db.select().from(schoolAssets)
      .where(eq(schoolAssets.schoolId, schoolId))
      .orderBy(desc(schoolAssets.displayOrder), desc(schoolAssets.createdAt));
  }

  async getSchoolAssetsByType(schoolId: string, assetType: string): Promise<SchoolAsset[]> {
    return await db.select().from(schoolAssets)
      .where(eq(schoolAssets.schoolId, schoolId))
      .where(eq(schoolAssets.assetType, assetType))
      .orderBy(desc(schoolAssets.displayOrder), desc(schoolAssets.createdAt));
  }

  async updateSchoolAsset(id: string, updates: Partial<SchoolAsset>): Promise<SchoolAsset | undefined> {
    const [updated] = await db.update(schoolAssets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schoolAssets.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSchoolAsset(id: string): Promise<boolean> {
    const result = await db.delete(schoolAssets).where(eq(schoolAssets.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Athletic venue methods
  async createAthleticVenue(venue: InsertAthleticVenue): Promise<AthleticVenue> {
    const id = randomUUID();
    const [newVenue] = await db.insert(athleticVenues).values({
      id,
      ...venue,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return newVenue;
  }

  async getAthleticVenue(id: string): Promise<AthleticVenue | undefined> {
    const [venue] = await db.select().from(athleticVenues).where(eq(athleticVenues.id, id));
    return venue || undefined;
  }

  async getVenuesBySchool(schoolId: string): Promise<AthleticVenue[]> {
    return await db.select().from(athleticVenues).where(eq(athleticVenues.schoolId, schoolId));
  }

  // School invite methods
  async createSchoolInvite(invite: InsertSchoolInvite): Promise<SchoolInvite> {
    const id = randomUUID();
    const [newInvite] = await db.insert(schoolInvites).values({
      id,
      ...invite,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return newInvite;
  }

  async getSchoolInvite(id: string): Promise<SchoolInvite | undefined> {
    const [invite] = await db.select().from(schoolInvites).where(eq(schoolInvites.id, id));
    return invite || undefined;
  }

  async getSchoolInviteByToken(token: string): Promise<SchoolInvite | undefined> {
    const [invite] = await db.select().from(schoolInvites).where(eq(schoolInvites.inviteToken, token));
    return invite || undefined;
  }

  async getSchoolInvitesByDistrict(districtId: string): Promise<SchoolInvite[]> {
    return await db.select().from(schoolInvites).where(eq(schoolInvites.districtId, districtId));
  }

  async updateSchoolInvite(id: string, updates: Partial<SchoolInvite>): Promise<SchoolInvite | undefined> {
    const [updated] = await db.update(schoolInvites)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schoolInvites.id, id))
      .returning();
    return updated || undefined;
  }
}

// In-memory fallback for development
export class DistrictMemStorage implements IDistrictStorage {
  private districts: Map<string, District> = new Map();
  private schools: Map<string, School> = new Map();
  private assets: Map<string, SchoolAsset> = new Map();
  private venues: Map<string, AthleticVenue> = new Map();
  private invites: Map<string, SchoolInvite> = new Map();

  async createDistrict(district: InsertDistrict): Promise<District> {
    const id = randomUUID();
    const newDistrict: District = {
      id,
      ...district,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.districts.set(id, newDistrict);
    return newDistrict;
  }

  async getDistrict(id: string): Promise<District | undefined> {
    return this.districts.get(id);
  }

  async getDistrictByCode(code: string): Promise<District | undefined> {
    for (const district of this.districts.values()) {
      if (district.districtCode === code) {
        return district;
      }
    }
    return undefined;
  }

  async getAllDistricts(): Promise<District[]> {
    return Array.from(this.districts.values());
  }

  async updateDistrict(id: string, updates: Partial<District>): Promise<District | undefined> {
    const district = this.districts.get(id);
    if (!district) return undefined;
    const updated = { ...district, ...updates, updatedAt: new Date() };
    this.districts.set(id, updated);
    return updated;
  }

  async createSchool(school: InsertSchool): Promise<School> {
    const id = randomUUID();
    const newSchool: School = {
      id,
      ...school,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.schools.set(id, newSchool);
    return newSchool;
  }

  async getSchool(id: string): Promise<School | undefined> {
    return this.schools.get(id);
  }

  async getSchoolByVLC(vlcCode: string): Promise<School | undefined> {
    for (const school of this.schools.values()) {
      if (school.vlcCode === vlcCode) {
        return school;
      }
    }
    return undefined;
  }

  async getSchoolsByDistrict(districtId: string): Promise<School[]> {
    return Array.from(this.schools.values()).filter(s => s.districtId === districtId);
  }

  async getFeederSchools(schoolId: string): Promise<School[]> {
    return Array.from(this.schools.values()).filter(s => s.feedsIntoSchoolId === schoolId);
  }

  async updateSchool(id: string, updates: Partial<School>): Promise<School | undefined> {
    const school = this.schools.get(id);
    if (!school) return undefined;
    const updated = { ...school, ...updates, updatedAt: new Date() };
    this.schools.set(id, updated);
    return updated;
  }

  async createSchoolAsset(asset: InsertSchoolAsset): Promise<SchoolAsset> {
    const id = randomUUID();
    const newAsset: SchoolAsset = {
      id,
      ...asset,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.assets.set(id, newAsset);
    return newAsset;
  }

  async getSchoolAsset(id: string): Promise<SchoolAsset | undefined> {
    return this.assets.get(id);
  }

  async getSchoolAssets(schoolId: string): Promise<SchoolAsset[]> {
    return Array.from(this.assets.values())
      .filter(a => a.schoolId === schoolId)
      .sort((a, b) => b.displayOrder - a.displayOrder);
  }

  async getSchoolAssetsByType(schoolId: string, assetType: string): Promise<SchoolAsset[]> {
    return Array.from(this.assets.values())
      .filter(a => a.schoolId === schoolId && a.assetType === assetType)
      .sort((a, b) => b.displayOrder - a.displayOrder);
  }

  async updateSchoolAsset(id: string, updates: Partial<SchoolAsset>): Promise<SchoolAsset | undefined> {
    const asset = this.assets.get(id);
    if (!asset) return undefined;
    const updated = { ...asset, ...updates, updatedAt: new Date() };
    this.assets.set(id, updated);
    return updated;
  }

  async deleteSchoolAsset(id: string): Promise<boolean> {
    return this.assets.delete(id);
  }

  async createAthleticVenue(venue: InsertAthleticVenue): Promise<AthleticVenue> {
    const id = randomUUID();
    const newVenue: AthleticVenue = {
      id,
      ...venue,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.venues.set(id, newVenue);
    return newVenue;
  }

  async getAthleticVenue(id: string): Promise<AthleticVenue | undefined> {
    return this.venues.get(id);
  }

  async getVenuesBySchool(schoolId: string): Promise<AthleticVenue[]> {
    return Array.from(this.venues.values()).filter(v => v.schoolId === schoolId);
  }

  // School invite methods
  async createSchoolInvite(invite: InsertSchoolInvite): Promise<SchoolInvite> {
    const id = randomUUID();
    const newInvite: SchoolInvite = {
      id,
      ...invite,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.invites.set(id, newInvite);
    return newInvite;
  }

  async getSchoolInvite(id: string): Promise<SchoolInvite | undefined> {
    return this.invites.get(id);
  }

  async getSchoolInviteByToken(token: string): Promise<SchoolInvite | undefined> {
    return Array.from(this.invites.values()).find(i => i.inviteToken === token);
  }

  async getSchoolInvitesByDistrict(districtId: string): Promise<SchoolInvite[]> {
    return Array.from(this.invites.values()).filter(i => i.districtId === districtId);
  }

  async updateSchoolInvite(id: string, updates: Partial<SchoolInvite>): Promise<SchoolInvite | undefined> {
    const invite = this.invites.get(id);
    if (!invite) return undefined;
    const updated = { ...invite, ...updates, updatedAt: new Date() };
    this.invites.set(id, updated);
    return updated;
  }
}

// Export the storage instance with proper error handling
export const districtStorage = (() => {
  try {
    // Try to use database storage if available
    if (process.env.DATABASE_URL) {
      return new DistrictDbStorage();
    }
    return new DistrictMemStorage();
  } catch (error) {
    console.warn("Database connection failed, using in-memory storage for districts:", error);
    return new DistrictMemStorage();
  }
})();