# Trantor District Website - Self Registration Code Package

## Overview
Complete code package for implementing school district and organization self-registration functionality on the Trantor Tournament platform (trantortournaments.org). This system supports the five-tier hierarchy: Tournament Manager/District Athletic Director → School Athletic Director → Coach → Scorekeeper/Judge → Athlete/Fan.

## Core Database Schema

### User Management Schema (shared/schema.ts)

```typescript
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, numeric, decimal, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User authentication and role management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status", { 
    enum: ["active", "inactive", "trialing", "past_due", "canceled", "unpaid"] 
  }).default("inactive"),
  subscriptionPlan: text("subscription_plan", { 
    enum: ["free", "foundation", "champion", "enterprise", "district_enterprise"] 
  }).default("free"),
  userRole: text("user_role", {
    enum: ["tournament_manager", "district_athletic_director", "school_athletic_director", "coach", "scorekeeper", "athlete", "fan"]
  }).default("fan"),
  organizationId: varchar("organization_id"), // School district, club, etc.
  organizationName: varchar("organization_name"), // Name of school/club they represent
  isWhitelabelClient: boolean("is_whitelabel_client").default(false),
  whitelabelDomain: varchar("whitelabel_domain"),
  whitelabelBranding: jsonb("whitelabel_branding"), // Custom colors, logos, etc
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organization registration and management
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: text("type", {
    enum: ["school_district", "school", "club", "nonprofit", "business"]
  }).notNull(),
  contactEmail: varchar("contact_email").notNull(),
  contactPhone: varchar("contact_phone"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  website: varchar("website"),
  parentOrganizationId: varchar("parent_organization_id"), // For schools under districts
  isVerified: boolean("is_verified").default(false),
  verificationNotes: text("verification_notes"),
  registrationStatus: text("registration_status", {
    enum: ["pending", "approved", "rejected", "inactive"]
  }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Self-registration requests for review
export const registrationRequests = pgTable("registration_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestType: text("request_type", {
    enum: ["district_admin", "school_admin", "coach", "scorekeeper"]
  }).notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  position: varchar("position"), // Job title
  organizationName: varchar("organization_name").notNull(),
  organizationType: text("organization_type", {
    enum: ["school_district", "school", "club", "nonprofit"]
  }).notNull(),
  parentOrganization: varchar("parent_organization"), // District name for schools
  yearsExperience: integer("years_experience"),
  sportsInvolved: jsonb("sports_involved"), // Array of sports
  certifications: text("certifications"),
  references: jsonb("references"), // Contact info for references
  requestReason: text("request_reason"),
  status: text("status", {
    enum: ["pending", "approved", "rejected", "needs_info"]
  }).default("pending"),
  reviewNotes: text("review_notes"),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Registration form schemas
export const insertRegistrationRequestSchema = createInsertSchema(registrationRequests).omit({
  id: true,
  status: true,
  reviewNotes: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  isVerified: true,
  verificationNotes: true,
  registrationStatus: true,
  createdAt: true,
  updatedAt: true,
});

export type RegistrationRequest = typeof registrationRequests.$inferSelect;
export type InsertRegistrationRequest = z.infer<typeof insertRegistrationRequestSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
```

## Domain-Aware Authentication (client/src/hooks/useAuth.ts)

```typescript
import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";

export function useAuth() {
  // Check if we're on a school domain by looking at hostname
  const isSchoolDomain = typeof window !== 'undefined' && 
    (window.location.hostname.includes('tournaments') || window.location.hostname.includes('localhost'));
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !isSchoolDomain, // Skip auth calls for school domains
  });

  return {
    user,
    isLoading: isSchoolDomain ? false : isLoading, // Never loading for school domains
    isAuthenticated: !!user && !error,
    error
  };
}
```

## Domain Detection Hook (client/src/hooks/useDomain.ts)

```typescript
import { useState, useEffect } from 'react';
import { domainManager, componentRenderer, databaseFilter } from '@shared/domainConfig';

export function useDomain() {
  const [domain, setDomain] = useState(domainManager);
  const [config, setConfig] = useState(domainManager.config);

  useEffect(() => {
    // Re-detect domain on client side if needed
    const currentDomain = window.location.hostname;
    if (currentDomain !== domain.detectDomain()) {
      const newDomain = new (domainManager.constructor as any)();
      setDomain(newDomain);
      setConfig(newDomain.config);
    }
  }, []);

  return {
    domain,
    config,
    isFeatureEnabled: (feature: string) => domain.isFeatureEnabled(feature as any),
    getBrandConfig: () => componentRenderer.renderNavigation(),
    isSchoolSafe: () => domain.isSchoolSafe(),
    isFantasyDomain: () => domain.isFantasyDomain(),
    isProDomain: () => domain.isProDomain(),
    filterTournaments: (tournaments: any[]) => databaseFilter.filterTournaments(tournaments),
    filterSports: (sports: any[]) => databaseFilter.filterSports(sports)
  };
}
```

## Guest Banner Component (client/src/components/GuestBanner.tsx)

```typescript
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, User } from "lucide-react";
import { useDomain } from "@/hooks/useDomain";

export default function GuestBanner() {
  const { isSchoolSafe } = useDomain();
  
  if (!isSchoolSafe()) return null;
  
  return (
    <Alert className="border-blue-200 bg-blue-50 mb-4">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>District Guest Access:</strong> You're viewing tournaments without signing in. 
        All tournament information, brackets, and live updates are available. 
        To create tournaments, contact Champions for Change at{" "}
        <a 
          href="mailto:champions4change361@gmail.com" 
          className="underline hover:text-blue-900"
        >
          champions4change361@gmail.com
        </a>
      </AlertDescription>
    </Alert>
  );
}
```

## Self-Registration Form Component

```typescript
// client/src/components/RegistrationForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const registrationSchema = z.object({
  requestType: z.enum(['district_admin', 'school_admin', 'coach', 'scorekeeper']),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  position: z.string().min(2, 'Position/title is required'),
  organizationName: z.string().min(2, 'Organization name is required'),
  organizationType: z.enum(['school_district', 'school', 'club', 'nonprofit']),
  parentOrganization: z.string().optional(),
  yearsExperience: z.number().min(0).max(50).optional(),
  sportsInvolved: z.array(z.string()).min(1, 'Please select at least one sport'),
  certifications: z.string().optional(),
  references: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    relationship: z.string()
  })).optional(),
  requestReason: z.string().min(10, 'Please explain why you need access (minimum 10 characters)')
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function RegistrationForm() {
  const [step, setStep] = useState(1);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [references, setReferences] = useState([{ name: '', email: '', phone: '', relationship: '' }]);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      sportsInvolved: [],
      references: []
    }
  });

  const submitMutation = useMutation({
    mutationFn: (data: RegistrationForm) => 
      apiRequest('POST', '/api/registration/request', data),
    onSuccess: () => {
      setStep(4); // Success step
    },
    onError: (error) => {
      console.error('Registration submission failed:', error);
    }
  });

  const onSubmit = (data: RegistrationForm) => {
    submitMutation.mutate({
      ...data,
      sportsInvolved: selectedSports,
      references: references.filter(ref => ref.name && ref.email)
    });
  };

  const roleDescriptions = {
    district_admin: {
      title: 'District Athletic Director',
      description: 'Oversee all athletic programs across multiple schools in your district. Create district-wide tournaments and assign schools to events.',
      requirements: ['District administrative role', 'Athletic program oversight', 'Multi-school coordination experience']
    },
    school_admin: {
      title: 'School Athletic Director',
      description: 'Manage athletic programs for your specific school. Assign coaches to tournaments and oversee school participation.',
      requirements: ['School administrative role', 'Athletic program management', 'Coach coordination experience']
    },
    coach: {
      title: 'Coach',
      description: 'Register teams, manage rosters, and participate in tournaments. Work under your school athletic director.',
      requirements: ['Coaching certification or experience', 'Team management experience', 'School affiliation']
    },
    scorekeeper: {
      title: 'Scorekeeper/Judge',
      description: 'Update scores and results for assigned events. Help ensure accurate tournament management.',
      requirements: ['Event scoring experience', 'Attention to detail', 'Reliability and punctuality']
    }
  };

  const sports = [
    'Basketball', 'Soccer', 'Tennis', 'Track & Field', 'Swimming', 'Golf', 
    'Baseball', 'Softball', 'Volleyball', 'Football', 'Cross Country', 
    'Wrestling', 'Cheerleading', 'Other'
  ];

  if (step === 4) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-700">Registration Submitted!</CardTitle>
          <CardDescription>
            Your registration request has been submitted successfully and is being reviewed by Champions for Change.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>What happens next:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>We'll review your request within 2-3 business days</li>
                <li>We may contact your references for verification</li>
                <li>You'll receive an email with your approval status</li>
                <li>Once approved, you'll get login instructions and training materials</li>
              </ol>
            </AlertDescription>
          </Alert>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Contact Information</h4>
            <p className="text-blue-800">
              Questions? Contact Champions for Change:<br />
              📧 <a href="mailto:champions4change361@gmail.com" className="underline">champions4change361@gmail.com</a><br />
              📞 <a href="tel:3613001552" className="underline">361-300-1552</a>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Join Champions for Change</h1>
        <p className="text-center text-gray-600">Register to help fund $2,600+ educational trips for students in Corpus Christi, Texas</p>
      </div>

      {/* Step Progress */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && <div className={`w-12 h-1 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Choose Your Role</CardTitle>
              <CardDescription>Select the role that best describes your position and responsibilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(roleDescriptions).map(([role, info]) => (
                  <div 
                    key={role}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      form.watch('requestType') === role 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => form.setValue('requestType', role as any)}
                  >
                    <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{info.description}</p>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-700">Requirements:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {info.requirements.map((req, idx) => (
                          <li key={idx}>• {req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              
              {form.formState.errors.requestType && (
                <p className="text-red-500 text-sm">{form.formState.errors.requestType.message}</p>
              )}
              
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => setStep(2)}
                  disabled={!form.watch('requestType')}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Personal & Organization Information</CardTitle>
              <CardDescription>Tell us about yourself and your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input {...form.register('firstName')} />
                  {form.formState.errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input {...form.register('lastName')} />
                  {form.formState.errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input type="email" {...form.register('email')} />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input {...form.register('phone')} />
                </div>
              </div>

              <div>
                <Label htmlFor="position">Position/Title *</Label>
                <Input {...form.register('position')} placeholder="e.g., Athletic Director, Head Coach, etc." />
                {form.formState.errors.position && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.position.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input {...form.register('organizationName')} placeholder="e.g., Robert Driscoll Middle School" />
                  {form.formState.errors.organizationName && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.organizationName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="organizationType">Organization Type *</Label>
                  <Select onValueChange={(value) => form.setValue('organizationType', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school_district">School District</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="club">Club/Organization</SelectItem>
                      <SelectItem value="nonprofit">Nonprofit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.watch('organizationType') === 'school' && (
                <div>
                  <Label htmlFor="parentOrganization">School District</Label>
                  <Input {...form.register('parentOrganization')} placeholder="e.g., Corpus Christi ISD" />
                </div>
              )}

              <div>
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input 
                  type="number" 
                  {...form.register('yearsExperience', { valueAsNumber: true })} 
                  placeholder="Years in current role or similar"
                />
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(3)}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Experience & References</CardTitle>
              <CardDescription>Help us understand your background and provide references</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Sports Involved *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {sports.map((sport) => (
                    <label key={sport} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedSports.includes(sport)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSports([...selectedSports, sport]);
                          } else {
                            setSelectedSports(selectedSports.filter(s => s !== sport));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{sport}</span>
                    </label>
                  ))}
                </div>
                {selectedSports.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">Please select at least one sport</p>
                )}
              </div>

              <div>
                <Label htmlFor="certifications">Certifications & Qualifications</Label>
                <Textarea 
                  {...form.register('certifications')} 
                  placeholder="List any relevant certifications, training, or qualifications..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Professional References</Label>
                <p className="text-sm text-gray-600 mb-3">Please provide 1-2 professional references who can speak to your qualifications</p>
                {references.map((ref, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg mb-4">
                    <div>
                      <Label>Reference Name</Label>
                      <Input 
                        value={ref.name}
                        onChange={(e) => {
                          const newRefs = [...references];
                          newRefs[index].name = e.target.value;
                          setReferences(newRefs);
                        }}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        value={ref.email}
                        onChange={(e) => {
                          const newRefs = [...references];
                          newRefs[index].email = e.target.value;
                          setReferences(newRefs);
                        }}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label>Phone (Optional)</Label>
                      <Input 
                        value={ref.phone}
                        onChange={(e) => {
                          const newRefs = [...references];
                          newRefs[index].phone = e.target.value;
                          setReferences(newRefs);
                        }}
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Input 
                        value={ref.relationship}
                        onChange={(e) => {
                          const newRefs = [...references];
                          newRefs[index].relationship = e.target.value;
                          setReferences(newRefs);
                        }}
                        placeholder="e.g., Principal, Supervisor"
                      />
                    </div>
                  </div>
                ))}
                {references.length < 2 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setReferences([...references, { name: '', email: '', phone: '', relationship: '' }])}
                  >
                    Add Reference
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor="requestReason">Why do you need access? *</Label>
                <Textarea 
                  {...form.register('requestReason')} 
                  placeholder="Explain how you plan to use the tournament platform and how it will benefit your students/organization..."
                  rows={4}
                />
                {form.formState.errors.requestReason && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.requestReason.message}</p>
                )}
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
```

## Server-Side Registration API (server/routes.ts)

```typescript
// Add these registration endpoints to your existing routes

// Registration request submission
app.post("/api/registration/request", async (req, res) => {
  try {
    const requestData = insertRegistrationRequestSchema.parse(req.body);
    const storage = await getStorage();
    
    // Create registration request
    const request = await storage.createRegistrationRequest(requestData);
    
    // Send notification email to administrators
    // await sendNotificationEmail('champions4change361@gmail.com', request);
    
    res.status(201).json({
      success: true,
      message: "Registration request submitted successfully",
      requestId: request.id
    });
  } catch (error) {
    console.error("Registration request error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to submit registration request" 
    });
  }
});

// Get all registration requests (admin only)
app.get("/api/registration/requests", isAuthenticated, async (req, res) => {
  try {
    const storage = await getStorage();
    const requests = await storage.getRegistrationRequests();
    res.json(requests);
  } catch (error) {
    console.error("Failed to fetch registration requests:", error);
    res.status(500).json({ message: "Failed to fetch registration requests" });
  }
});

// Approve/reject registration request (admin only)
app.patch("/api/registration/requests/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;
    const reviewerId = req.user?.claims?.sub;
    
    const storage = await getStorage();
    const updatedRequest = await storage.updateRegistrationRequest(id, {
      status,
      reviewNotes,
      reviewedBy: reviewerId,
      reviewedAt: new Date()
    });
    
    // If approved, create user account and organization
    if (status === 'approved') {
      // Create organization if it doesn't exist
      const organization = await storage.createOrganization({
        name: updatedRequest.organizationName,
        type: updatedRequest.organizationType,
        contactEmail: updatedRequest.email,
        contactPhone: updatedRequest.phone,
        parentOrganizationId: updatedRequest.parentOrganization
      });
      
      // Send approval email with login instructions
      // await sendApprovalEmail(updatedRequest.email, updatedRequest);
    }
    
    res.json({
      success: true,
      message: `Registration request ${status}`,
      request: updatedRequest
    });
  } catch (error) {
    console.error("Failed to update registration request:", error);
    res.status(500).json({ message: "Failed to update registration request" });
  }
});

// Organization management endpoints
app.get("/api/organizations", isAuthenticated, async (req, res) => {
  try {
    const storage = await getStorage();
    const organizations = await storage.getOrganizations();
    res.json(organizations);
  } catch (error) {
    console.error("Failed to fetch organizations:", error);
    res.status(500).json({ message: "Failed to fetch organizations" });
  }
});

app.post("/api/organizations", isAuthenticated, async (req, res) => {
  try {
    const orgData = insertOrganizationSchema.parse(req.body);
    const storage = await getStorage();
    const organization = await storage.createOrganization(orgData);
    res.status(201).json(organization);
  } catch (error) {
    console.error("Failed to create organization:", error);
    res.status(500).json({ message: "Failed to create organization" });
  }
});
```

## Domain Configuration (server/domainRoutes.ts)

```typescript
import { Express, Request, Response } from "express";

// Simple domain configuration for school-safe access
const getDomainConfig = (hostname: string) => {
  if (hostname.includes('fantasy')) {
    return {
      brand: 'FANTASY_LEAGUE_CENTRAL',
      theme: 'entertainment',
      features: { fantasyLeagues: true, ageVerification: true, donationButtons: true }
    };
  }
  
  if (hostname.includes('pro')) {
    return {
      brand: 'TOURNAMENT_PRO',
      theme: 'professional',
      features: { fantasyLeagues: true, ageVerification: true, advancedAnalytics: true }
    };
  }
  
  // Default to school-safe for trantortournaments.org
  return {
    brand: 'SCHOLASTIC_TOURNAMENTS',
    theme: 'educational',
    features: { 
      fantasyLeagues: false, 
      ageVerification: false, 
      donationButtons: false,
      guestAccess: true,
      registration: true 
    }
  };
};

export function setupDomainRoutes(app: Express) {
  // Domain configuration endpoint
  app.get('/api/domain/config', (req: Request, res: Response) => {
    try {
      const hostname = req.hostname || 'localhost';
      const config = getDomainConfig(hostname);
      res.json(config);
    } catch (error) {
      console.error('Error fetching domain config:', error);
      res.status(500).json({ error: 'Failed to fetch domain configuration' });
    }
  });

  // Domain status with registration features
  app.get('/api/domain/status', (req: Request, res: Response) => {
    try {
      const hostname = req.hostname || 'localhost';
      const config = getDomainConfig(hostname);
      
      res.json({
        hostname,
        brand: config.brand,
        theme: config.theme,
        features: config.features,
        isSchoolSafe: config.brand === 'SCHOLASTIC_TOURNAMENTS',
        isFantasyDomain: config.brand === 'FANTASY_LEAGUE_CENTRAL',
        isProDomain: config.brand === 'TOURNAMENT_PRO',
        allowsRegistration: config.features.registration || false,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching domain status:', error);
      res.status(500).json({ error: 'Failed to fetch domain status' });
    }
  });
}
```

## Registration Page Route

```typescript
// client/src/pages/Register.tsx
import RegistrationForm from '@/components/RegistrationForm';
import { useDomain } from '@/hooks/useDomain';

export default function Register() {
  const { isSchoolSafe } = useDomain();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {isSchoolSafe() && (
          <div className="mb-8 text-center">
            <div className="bg-blue-600 text-white py-4 px-6 rounded-lg mb-4">
              <h1 className="text-2xl font-bold">Champions for Change</h1>
              <p>Funding Educational Opportunities for Corpus Christi Students</p>
            </div>
          </div>
        )}
        <RegistrationForm />
      </div>
    </div>
  );
}
```

## Storage Methods for Registration

```typescript
// Add these methods to your storage implementation

async createRegistrationRequest(data: InsertRegistrationRequest): Promise<RegistrationRequest> {
  // Implementation depends on your storage system (database or memory)
  // For database:
  const result = await this.db.insert(registrationRequests).values(data).returning();
  return result[0];
}

async getRegistrationRequests(): Promise<RegistrationRequest[]> {
  // Get all pending and recent requests
  const result = await this.db
    .select()
    .from(registrationRequests)
    .orderBy(desc(registrationRequests.createdAt));
  return result;
}

async updateRegistrationRequest(id: string, updates: Partial<RegistrationRequest>): Promise<RegistrationRequest> {
  const result = await this.db
    .update(registrationRequests)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(registrationRequests.id, id))
    .returning();
  return result[0];
}

async createOrganization(data: InsertOrganization): Promise<Organization> {
  const result = await this.db.insert(organizations).values(data).returning();
  return result[0];
}

async getOrganizations(): Promise<Organization[]> {
  const result = await this.db.select().from(organizations);
  return result;
}
```

## Key Features

1. **Multi-Step Registration Form**: Professional form with role selection, personal info, and references
2. **Role-Based Access**: Different registration paths for district admins, school admins, coaches, and scorekeepers
3. **Domain-Aware**: School-safe registration on trantortournaments.org
4. **Reference System**: Professional references for verification
5. **Admin Review Process**: Champions for Change can review and approve requests
6. **Organization Management**: Tracks schools, districts, and other organizations
7. **Guest Access**: School domains allow viewing without authentication
8. **Educational Focus**: Emphasizes Champions for Change mission throughout

## Implementation Notes

- All registration happens on the school-safe domain (trantortournaments.org)
- Fantasy content is completely hidden from registration flows
- Email notifications can be added for request submissions and approvals
- Database schema supports the five-tier user hierarchy
- Form includes proper validation and error handling
- Mobile-responsive design for accessibility

This system enables schools and districts to self-register while maintaining the educational mission and ensuring proper verification processes.