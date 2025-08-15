import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { z } from "zod";

// Mock data for demonstration - in production this would come from database
const mockAthletes = [
  {
    id: "1",
    name: "Sarah Johnson",
    sport: "Basketball",
    grade: "11th",
    status: "active",
    lastVisit: "2024-08-12",
    medicalAlerts: ["Asthma", "Previous ACL injury"],
    upcomingAppointments: 2,
    parentContacts: [
      {
        name: "Jennifer Johnson",
        relationship: "Mother",
        phone: "(555) 123-4567",
        email: "jennifer.johnson@email.com",
        isPrimary: true
      }
    ]
  },
  {
    id: "2", 
    name: "Marcus Williams",
    sport: "Football",
    grade: "12th",
    status: "injured",
    lastVisit: "2024-08-14",
    medicalAlerts: ["Concussion protocol"],
    upcomingAppointments: 1,
    parentContacts: [
      {
        name: "Robert Williams",
        relationship: "Father",
        phone: "(555) 234-5678",
        email: "robert.williams@email.com",
        isPrimary: true
      }
    ]
  },
  {
    id: "3",
    name: "Emma Davis",
    sport: "Track & Field",
    grade: "10th", 
    status: "cleared",
    lastVisit: "2024-08-10",
    medicalAlerts: [],
    upcomingAppointments: 0,
    parentContacts: [
      {
        name: "Lisa Davis",
        relationship: "Mother",
        phone: "(555) 345-6789",
        email: "lisa.davis@email.com",
        isPrimary: true
      }
    ]
  }
];

const mockMessages = [
  {
    id: "1",
    from: "Dr. Smith",
    fromEmail: "dr.smith@sportsmedicine.com",
    to: "Athletic Trainer",
    subject: "Marcus Williams - MRI Results",
    message: "MRI shows significant improvement in the ACL repair. Marcus can begin light jogging next week. Please update his care plan accordingly. Full clearance expected in 3-4 weeks.",
    priority: "high",
    time: "2 hours ago",
    unread: true,
    athleteId: "2",
    messageType: "doctor_communication"
  },
  {
    id: "2",
    from: "Coach Thompson",
    fromEmail: "coach.thompson@school.edu",
    to: "Athletic Trainer",
    subject: "Sarah Johnson - Return to Play Status",
    message: "Sarah has been asking about returning to full practice. Her ankle seems to be doing better. Can you provide an update on her status?",
    priority: "normal",
    time: "4 hours ago",
    unread: true,
    athleteId: "1",
    messageType: "coach_update"
  },
  {
    id: "3",
    from: "Jennifer Johnson",
    fromEmail: "jennifer.johnson@email.com",
    to: "Athletic Trainer", 
    subject: "Sarah's Inhaler Prescription",
    message: "Hi, Sarah's inhaler prescription was renewed yesterday. The new prescription allows for 2 puffs before exercise. Please update her records.",
    priority: "normal",
    time: "1 day ago",
    unread: false,
    athleteId: "1",
    messageType: "parent_notification"
  }
];

const mockCarePlans = [
  {
    id: "1",
    athleteId: "2",
    athleteName: "Marcus Williams",
    planType: "injury_recovery",
    title: "ACL Recovery Protocol",
    description: "Comprehensive rehabilitation following ACL reconstruction surgery",
    status: "active",
    startDate: "2024-07-01",
    targetEndDate: "2024-10-01",
    currentPhase: "Strength Building",
    progressPercentage: 50,
    goals: [
      {
        goal: "Full range of motion",
        target: "0-130 degrees knee flexion",
        timeline: "Week 8",
        status: "completed"
      },
      {
        goal: "Quad strength recovery",
        target: "90% of uninjured leg",
        timeline: "Week 10",
        status: "in_progress"
      },
      {
        goal: "Return to sport activities",
        target: "Full clearance for football",
        timeline: "Week 12",
        status: "not_started"
      }
    ],
    protocols: [
      {
        step: 1,
        instruction: "Range of motion exercises",
        frequency: "3x daily",
        duration: "15 minutes",
        notes: "Focus on gentle flexion/extension"
      },
      {
        step: 2,
        instruction: "Quad strengthening exercises",
        frequency: "2x daily",
        duration: "20 minutes",
        notes: "Progressive resistance as tolerated"
      }
    ]
  },
  {
    id: "2",
    athleteId: "1",
    athleteName: "Sarah Johnson",
    planType: "chronic_condition",
    title: "Asthma Management Plan",
    description: "Exercise-induced asthma management and emergency protocols",
    status: "active",
    startDate: "2024-08-01",
    currentPhase: "Ongoing Management",
    progressPercentage: 100,
    goals: [
      {
        goal: "Prevent exercise-induced episodes",
        target: "Zero episodes during practice/games",
        timeline: "Ongoing",
        status: "in_progress"
      }
    ],
    protocols: [
      {
        step: 1,
        instruction: "Pre-exercise medication",
        frequency: "Before intense activity",
        duration: "As needed",
        notes: "Albuterol inhaler 15 minutes before exercise"
      },
      {
        step: 2,
        instruction: "Monitor during activity",
        frequency: "Continuous during practice",
        duration: "Throughout activity",
        notes: "Watch for signs of respiratory distress"
      }
    ]
  }
];

const mockSupplies = [
  { id: "1", item: "Elastic Bandages", current: 5, minimum: 10, status: "critical", category: "first_aid" },
  { id: "2", item: "Ice Packs", current: 8, minimum: 15, status: "low", category: "first_aid" },
  { id: "3", item: "Antiseptic Wipes", current: 12, minimum: 20, status: "low", category: "cleaning_supplies" },
  { id: "4", item: "Ace Bandages", current: 25, minimum: 15, status: "good", category: "first_aid" },
  { id: "5", item: "Medical Tape", current: 18, minimum: 10, status: "good", category: "first_aid" }
];

const mockEquipmentChecks = [
  { 
    id: "1",
    equipment: "AED Unit #1", 
    type: "Monthly Check", 
    due: "Tomorrow", 
    status: "pending",
    location: "Main Gym"
  },
  { 
    id: "2",
    equipment: "Emergency Bag", 
    type: "Weekly Inventory", 
    due: "Aug 18", 
    status: "pending",
    location: "Training Room"
  },
  { 
    id: "3",
    equipment: "Ice Machine", 
    type: "Maintenance", 
    due: "Aug 20", 
    status: "scheduled",
    location: "Training Room"
  }
];

const mockMedicalDocuments = [
  {
    id: "1",
    athleteId: "2",
    athleteName: "Marcus Williams",
    documentType: "mri",
    fileName: "Marcus_Williams_Knee_MRI_08102024.pdf",
    description: "Post-surgical MRI showing ACL repair progress",
    doctorName: "Dr. Sarah Chen",
    facilityName: "Sports Medicine Clinic",
    dateOfService: "2024-08-10",
    uploadedAt: "2024-08-12",
    fileSize: 2500000,
    tags: ["knee", "acl", "post-surgical"]
  },
  {
    id: "2",
    athleteId: "1", 
    athleteName: "Sarah Johnson",
    documentType: "physical_therapy_report",
    fileName: "Sarah_Johnson_PT_Report_08122024.pdf",
    description: "Physical therapy progress report for ankle rehabilitation",
    doctorName: "Mark Thompson, PT",
    facilityName: "Elite Physical Therapy",
    dateOfService: "2024-08-12",
    uploadedAt: "2024-08-12",
    fileSize: 1800000,
    tags: ["ankle", "physical-therapy", "rehabilitation"]
  }
];

export function registerAthleticTrainerRoutes(app: Express) {
  
  // Get athletes under trainer's care
  app.get("/api/athletic-trainer/athletes", isAuthenticated, async (req, res) => {
    try {
      // In production, filter by trainer's organization and assigned athletes
      const { sport, status, search } = req.query;
      
      let filteredAthletes = mockAthletes;
      
      if (sport && sport !== 'all') {
        filteredAthletes = filteredAthletes.filter(athlete => 
          athlete.sport.toLowerCase().includes((sport as string).toLowerCase())
        );
      }
      
      if (status && status !== 'all') {
        filteredAthletes = filteredAthletes.filter(athlete => athlete.status === status);
      }
      
      if (search) {
        filteredAthletes = filteredAthletes.filter(athlete =>
          athlete.name.toLowerCase().includes((search as string).toLowerCase())
        );
      }
      
      res.json(filteredAthletes);
    } catch (error) {
      console.error("Error fetching athletes:", error);
      res.status(500).json({ message: "Failed to fetch athletes" });
    }
  });

  // Get specific athlete details
  app.get("/api/athletic-trainer/athletes/:athleteId", isAuthenticated, async (req, res) => {
    try {
      const { athleteId } = req.params;
      const athlete = mockAthletes.find(a => a.id === athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      res.json(athlete);
    } catch (error) {
      console.error("Error fetching athlete:", error);
      res.status(500).json({ message: "Failed to fetch athlete" });
    }
  });

  // Add athlete to trainer's roster
  app.post("/api/athletic-trainer/athletes", isAuthenticated, async (req, res) => {
    try {
      const athleteData = req.body;
      
      // Validate required fields
      const schema = z.object({
        name: z.string().min(1),
        sport: z.string().min(1),
        grade: z.string().min(1),
        parentContacts: z.array(z.object({
          name: z.string(),
          relationship: z.string(),
          phone: z.string(),
          email: z.string().email(),
          isPrimary: z.boolean()
        }))
      });
      
      const validatedData = schema.parse(athleteData);
      
      const newAthlete = {
        id: String(mockAthletes.length + 1),
        ...validatedData,
        status: "active",
        lastVisit: new Date().toISOString().split('T')[0],
        medicalAlerts: [],
        upcomingAppointments: 0
      };
      
      mockAthletes.push(newAthlete);
      res.status(201).json(newAthlete);
    } catch (error) {
      console.error("Error adding athlete:", error);
      res.status(500).json({ message: "Failed to add athlete" });
    }
  });

  // Get messages/communications
  app.get("/api/athletic-trainer/messages", isAuthenticated, async (req, res) => {
    try {
      const { unreadOnly, messageType, athleteId } = req.query;
      
      let filteredMessages = mockMessages;
      
      if (unreadOnly === 'true') {
        filteredMessages = filteredMessages.filter(msg => msg.unread);
      }
      
      if (messageType && messageType !== 'all') {
        filteredMessages = filteredMessages.filter(msg => msg.messageType === messageType);
      }
      
      if (athleteId) {
        filteredMessages = filteredMessages.filter(msg => msg.athleteId === athleteId);
      }
      
      res.json(filteredMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message/communication
  app.post("/api/athletic-trainer/messages", isAuthenticated, async (req, res) => {
    try {
      const messageData = req.body;
      
      const schema = z.object({
        to: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(1),
        priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
        messageType: z.enum([
          "injury_report",
          "clearance_update", 
          "parent_notification",
          "coach_update",
          "doctor_communication",
          "general_message",
          "emergency_alert"
        ]),
        athleteId: z.string().optional()
      });
      
      const validatedData = schema.parse(messageData);
      
      const newMessage = {
        id: String(mockMessages.length + 1),
        from: "Athletic Trainer",
        fromEmail: "trainer@school.edu",
        ...validatedData,
        time: "Just now",
        unread: false,
        sentAt: new Date().toISOString()
      };
      
      // In production, this would integrate with email service or internal messaging
      console.log("Sending message:", newMessage);
      
      res.status(201).json({ message: "Message sent successfully", messageId: newMessage.id });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get care plans
  app.get("/api/athletic-trainer/care-plans", isAuthenticated, async (req, res) => {
    try {
      const { athleteId, status, planType } = req.query;
      
      let filteredPlans = mockCarePlans;
      
      if (athleteId) {
        filteredPlans = filteredPlans.filter(plan => plan.athleteId === athleteId);
      }
      
      if (status && status !== 'all') {
        filteredPlans = filteredPlans.filter(plan => plan.status === status);
      }
      
      if (planType && planType !== 'all') {
        filteredPlans = filteredPlans.filter(plan => plan.planType === planType);
      }
      
      res.json(filteredPlans);
    } catch (error) {
      console.error("Error fetching care plans:", error);
      res.status(500).json({ message: "Failed to fetch care plans" });
    }
  });

  // Create new care plan
  app.post("/api/athletic-trainer/care-plans", isAuthenticated, async (req, res) => {
    try {
      const carePlanData = req.body;
      
      const schema = z.object({
        athleteId: z.string().min(1),
        planType: z.enum([
          "injury_recovery",
          "prevention", 
          "conditioning",
          "return_to_play",
          "chronic_condition",
          "emergency_action"
        ]),
        title: z.string().min(1),
        description: z.string().min(1),
        goals: z.array(z.object({
          goal: z.string(),
          target: z.string(),
          timeline: z.string(),
          status: z.enum(["not_started", "in_progress", "completed"]).default("not_started")
        })),
        protocols: z.array(z.object({
          step: z.number(),
          instruction: z.string(),
          frequency: z.string(),
          duration: z.string(),
          notes: z.string().optional()
        }))
      });
      
      const validatedData = schema.parse(carePlanData);
      
      const athlete = mockAthletes.find(a => a.id === validatedData.athleteId);
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      const newCarePlan = {
        id: String(mockCarePlans.length + 1),
        ...validatedData,
        athleteName: athlete.name,
        status: "active" as const,
        startDate: new Date().toISOString().split('T')[0],
        currentPhase: "Phase 1",
        progressPercentage: 0
      };
      
      mockCarePlans.push(newCarePlan);
      res.status(201).json(newCarePlan);
    } catch (error) {
      console.error("Error creating care plan:", error);
      res.status(500).json({ message: "Failed to create care plan" });
    }
  });

  // Get medical documents
  app.get("/api/athletic-trainer/documents", isAuthenticated, async (req, res) => {
    try {
      const { athleteId, documentType } = req.query;
      
      let filteredDocuments = mockMedicalDocuments;
      
      if (athleteId && athleteId !== 'all') {
        filteredDocuments = filteredDocuments.filter(doc => doc.athleteId === athleteId);
      }
      
      if (documentType && documentType !== 'all') {
        filteredDocuments = filteredDocuments.filter(doc => doc.documentType === documentType);
      }
      
      res.json(filteredDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Upload medical document
  app.post("/api/athletic-trainer/documents", isAuthenticated, async (req, res) => {
    try {
      const documentData = req.body;
      
      const schema = z.object({
        athleteId: z.string().min(1),
        documentType: z.enum([
          "physical_exam",
          "xray",
          "mri", 
          "ct_scan",
          "lab_results",
          "doctor_note",
          "physical_therapy_report",
          "injury_report",
          "clearance_form",
          "medication_list",
          "allergy_info",
          "emergency_contact",
          "insurance_card",
          "other"
        ]),
        fileName: z.string().min(1),
        description: z.string().optional(),
        doctorName: z.string().optional(),
        facilityName: z.string().optional(),
        dateOfService: z.string().optional()
      });
      
      const validatedData = schema.parse(documentData);
      
      const athlete = mockAthletes.find(a => a.id === validatedData.athleteId);
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      const newDocument = {
        id: String(mockMedicalDocuments.length + 1),
        ...validatedData,
        athleteName: athlete.name,
        fileSize: 2000000, // Mock file size
        uploadedAt: new Date().toISOString().split('T')[0],
        tags: []
      };
      
      mockMedicalDocuments.push(newDocument);
      res.status(201).json(newDocument);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Get supplies inventory
  app.get("/api/athletic-trainer/supplies", isAuthenticated, async (req, res) => {
    try {
      const { category, status } = req.query;
      
      let filteredSupplies = mockSupplies;
      
      if (category && category !== 'all') {
        filteredSupplies = filteredSupplies.filter(supply => supply.category === category);
      }
      
      if (status && status !== 'all') {
        filteredSupplies = filteredSupplies.filter(supply => supply.status === status);
      }
      
      res.json(filteredSupplies);
    } catch (error) {
      console.error("Error fetching supplies:", error);
      res.status(500).json({ message: "Failed to fetch supplies" });
    }
  });

  // Update supply inventory
  app.put("/api/athletic-trainer/supplies/:supplyId", isAuthenticated, async (req, res) => {
    try {
      const { supplyId } = req.params;
      const updateData = req.body;
      
      const supplyIndex = mockSupplies.findIndex(s => s.id === supplyId);
      if (supplyIndex === -1) {
        return res.status(404).json({ message: "Supply not found" });
      }
      
      const schema = z.object({
        current: z.number().min(0).optional(),
        minimum: z.number().min(0).optional()
      });
      
      const validatedData = schema.parse(updateData);
      
      if (validatedData.current !== undefined) {
        mockSupplies[supplyIndex].current = validatedData.current;
        // Update status based on stock level
        if (validatedData.current <= mockSupplies[supplyIndex].minimum * 0.5) {
          mockSupplies[supplyIndex].status = "critical";
        } else if (validatedData.current <= mockSupplies[supplyIndex].minimum) {
          mockSupplies[supplyIndex].status = "low";
        } else {
          mockSupplies[supplyIndex].status = "good";
        }
      }
      
      if (validatedData.minimum !== undefined) {
        mockSupplies[supplyIndex].minimum = validatedData.minimum;
      }
      
      res.json(mockSupplies[supplyIndex]);
    } catch (error) {
      console.error("Error updating supply:", error);
      res.status(500).json({ message: "Failed to update supply" });
    }
  });

  // Get equipment checks
  app.get("/api/athletic-trainer/equipment-checks", isAuthenticated, async (req, res) => {
    try {
      const { status, overdue } = req.query;
      
      let filteredChecks = mockEquipmentChecks;
      
      if (status && status !== 'all') {
        filteredChecks = filteredChecks.filter(check => check.status === status);
      }
      
      if (overdue === 'true') {
        // In production, this would check actual dates
        filteredChecks = filteredChecks.filter(check => 
          check.due === "Tomorrow" || check.due.includes("Aug")
        );
      }
      
      res.json(filteredChecks);
    } catch (error) {
      console.error("Error fetching equipment checks:", error);
      res.status(500).json({ message: "Failed to fetch equipment checks" });
    }
  });

  // Log equipment check
  app.post("/api/athletic-trainer/equipment-checks", isAuthenticated, async (req, res) => {
    try {
      const checkData = req.body;
      
      const schema = z.object({
        equipmentType: z.enum([
          "aed",
          "emergency_bags",
          "ice_machines", 
          "treatment_tables",
          "rehabilitation_equipment",
          "protective_gear",
          "emergency_phones",
          "first_aid_kits"
        ]),
        checkType: z.enum(["daily", "weekly", "monthly", "annual", "post_incident", "maintenance"]),
        status: z.enum(["passed", "failed", "needs_maintenance", "needs_replacement"]),
        notes: z.string().optional(),
        issues: z.array(z.object({
          issue: z.string(),
          severity: z.enum(["low", "medium", "high", "critical"]),
          actionTaken: z.string().optional(),
          followUpRequired: z.boolean()
        })).optional()
      });
      
      const validatedData = schema.parse(checkData);
      
      const newCheck = {
        id: String(mockEquipmentChecks.length + 1),
        equipment: validatedData.equipmentType,
        type: validatedData.checkType,
        due: "Completed",
        status: "completed",
        location: "Training Room",
        checkDate: new Date().toISOString().split('T')[0],
        ...validatedData
      };
      
      res.status(201).json(newCheck);
    } catch (error) {
      console.error("Error logging equipment check:", error);
      res.status(500).json({ message: "Failed to log equipment check" });
    }
  });

  // Dashboard statistics
  app.get("/api/athletic-trainer/dashboard-stats", isAuthenticated, async (req, res) => {
    try {
      const stats = {
        activeAthletes: mockAthletes.filter(a => a.status === 'active').length,
        currentInjuries: mockAthletes.filter(a => a.status === 'injured').length,
        unreadMessages: mockMessages.filter(m => m.unread).length,
        lowStockItems: mockSupplies.filter(s => s.status === 'low' || s.status === 'critical').length,
        pendingChecks: mockEquipmentChecks.filter(c => c.status === 'pending').length,
        activePlans: mockCarePlans.filter(p => p.status === 'active').length
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
}