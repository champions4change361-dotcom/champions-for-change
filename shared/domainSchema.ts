import { pgTable, varchar, timestamp, decimal, boolean, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Domain management for Champions for Change white-label clients
export const domains = pgTable("domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domainName: varchar("domain_name").notNull().unique(),
  clientId: varchar("client_id").notNull(), // Links to user/organization
  registrarId: varchar("registrar_id"), // Openprovider domain ID
  status: varchar("status").notNull().default("pending"), // pending, active, expired, suspended
  registrationDate: timestamp("registration_date"),
  expirationDate: timestamp("expiration_date"),
  autoRenew: boolean("auto_renew").default(true),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  clientPrice: decimal("client_price", { precision: 10, scale: 2 }),
  
  // DNS Configuration
  dnsProvider: varchar("dns_provider").default("openprovider"),
  nameservers: text("nameservers").array(), // JSON array of nameservers
  
  // White-label configuration
  subdomainConfig: text("subdomain_config"), // JSON config for client's platform subdomain
  sslCertificate: varchar("ssl_certificate_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Domain search results from Openprovider API
export const domainSearches = pgTable("domain_searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  searchTerm: varchar("search_term").notNull(),
  clientId: varchar("client_id").notNull(),
  results: text("results"), // JSON array of search results
  searchedAt: timestamp("searched_at").defaultNow(),
});

// DNS records management
export const dnsRecords = pgTable("dns_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domainId: varchar("domain_id").notNull(),
  recordType: varchar("record_type").notNull(), // A, AAAA, CNAME, MX, TXT, etc.
  name: varchar("name").notNull(),
  value: varchar("value").notNull(),
  ttl: varchar("ttl").default("3600"),
  priority: varchar("priority"), // For MX records
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Domain transfer requests
export const domainTransfers = pgTable("domain_transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domainName: varchar("domain_name").notNull(),
  clientId: varchar("client_id").notNull(),
  currentRegistrar: varchar("current_registrar"),
  authCode: varchar("auth_code"),
  status: varchar("status").default("pending"), // pending, in_progress, completed, failed
  transferFee: decimal("transfer_fee", { precision: 10, scale: 2 }),
  initiatedAt: timestamp("initiated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Zod schemas for validation
export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDnsRecordSchema = createInsertSchema(dnsRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDomainTransferSchema = createInsertSchema(domainTransfers).omit({
  id: true,
  initiatedAt: true,
  completedAt: true,
});

// Types
export type Domain = typeof domains.$inferSelect;
export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type DnsRecord = typeof dnsRecords.$inferSelect;
export type InsertDnsRecord = z.infer<typeof insertDnsRecordSchema>;
export type DomainTransfer = typeof domainTransfers.$inferSelect;
export type InsertDomainTransfer = z.infer<typeof insertDomainTransferSchema>;