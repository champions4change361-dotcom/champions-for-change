import type { Express } from "express";
import { openproviderService } from "./openproviderApi";
import { isAuthenticated } from "./replitAuth";
import { z } from "zod";

export function registerDomainRoutes(app: Express) {
  
  // Search for available domains
  app.post("/api/domains/search", isAuthenticated, async (req, res) => {
    try {
      const { searchTerm, tlds } = req.body;
      
      if (!searchTerm) {
        return res.status(400).json({ error: "Search term is required" });
      }

      // Check if API credentials are configured
      if (!process.env.OPENPROVIDER_USERNAME || !process.env.OPENPROVIDER_PASSWORD) {
        return res.status(503).json({ 
          error: "Domain search service is not configured. Please add Openprovider API credentials.",
          requiresSetup: true
        });
      }

      const results = await openproviderService.searchDomains(
        searchTerm, 
        tlds || ['.com', '.org', '.net', '.info', '.biz']
      );

      // Add Champions for Change nonprofit pricing (cost + $3 processing fee)
      const pricedResults = results.map(result => ({
        ...result,
        championsCost: result.price + 3.00, // Nonprofit markup
        savings: `Save $${(15.99 - (result.price + 3.00)).toFixed(2)} vs retail`,
      }));

      res.json({ results: pricedResults });
    } catch (error: any) {
      console.error("Domain search error:", error);
      res.status(500).json({ error: error.message || "Search failed" });
    }
  });

  // Get domain pricing for specific TLD
  app.get("/api/domains/pricing/:tld", isAuthenticated, async (req, res) => {
    try {
      const { tld } = req.params;
      const pricing = await openproviderService.getDomainPricing(tld);
      
      // Add Champions for Change nonprofit pricing
      const nonprofitPricing = {
        ...pricing,
        championsCost: {
          register: pricing.register + 3.00,
          renew: pricing.renew + 2.00,
          transfer: pricing.transfer + 2.00,
        },
        retailComparison: {
          register: `Save $${(15.99 - (pricing.register + 3.00)).toFixed(2)}`,
          renew: `Save $${(15.99 - (pricing.renew + 2.00)).toFixed(2)}`,
        }
      };

      res.json(nonprofitPricing);
    } catch (error: any) {
      console.error("Pricing lookup error:", error);
      res.status(500).json({ error: error.message || "Pricing lookup failed" });
    }
  });

  // Register a domain for client
  app.post("/api/domains/register", isAuthenticated, async (req, res) => {
    try {
      const registrationSchema = z.object({
        domainName: z.string().min(1),
        period: z.number().min(1).max(10),
        contactInfo: z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(1),
          companyName: z.string().optional(),
          address: z.object({
            street: z.string().min(1),
            city: z.string().min(1),
            state: z.string().min(1),
            zipcode: z.string().min(1),
            country: z.string().min(2).max(2),
          }),
        }),
        nameServers: z.array(z.string()).optional(),
        autoRenew: z.boolean().default(true),
      });

      const validatedData = registrationSchema.parse(req.body);
      const userId = (req.user as any)?.claims?.sub;

      // Use default Champions for Change nameservers if none provided
      const nameServers = validatedData.nameServers || [
        'ns1.championsforchange.net',
        'ns2.championsforchange.net'
      ];

      const registrationData = {
        domainName: validatedData.domainName,
        period: validatedData.period,
        ownerContact: validatedData.contactInfo,
        adminContact: validatedData.contactInfo,
        techContact: validatedData.contactInfo,
        billingContact: validatedData.contactInfo,
        nameServers,
        autoRenew: validatedData.autoRenew,
      };

      const result = await openproviderService.registerDomain(registrationData);

      if (result.success) {
        // TODO: Store domain in database with client pricing
        res.json({
          success: true,
          message: "Domain registered successfully",
          domainId: result.domainId,
          domain: validatedData.domainName,
          nameServers,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      console.error("Domain registration error:", error);
      res.status(500).json({ 
        error: error.message || "Registration failed",
        details: error.issues ? error.issues : undefined
      });
    }
  });

  // Get client's domains
  app.get("/api/domains/my-domains", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      
      // TODO: Fetch from database
      // For now, return placeholder structure
      res.json({
        domains: [],
        message: "Domain portfolio feature coming soon"
      });
    } catch (error: any) {
      console.error("Domain portfolio error:", error);
      res.status(500).json({ error: error.message || "Failed to load domains" });
    }
  });

  // Update domain nameservers
  app.put("/api/domains/:domainId/nameservers", isAuthenticated, async (req, res) => {
    try {
      const { domainId } = req.params;
      const { nameservers } = req.body;

      if (!nameservers || !Array.isArray(nameservers)) {
        return res.status(400).json({ error: "Valid nameservers array is required" });
      }

      const success = await openproviderService.updateNameservers(domainId, nameservers);
      
      if (success) {
        res.json({ success: true, message: "Nameservers updated successfully" });
      } else {
        res.status(400).json({ success: false, error: "Failed to update nameservers" });
      }
    } catch (error: any) {
      console.error("Nameserver update error:", error);
      res.status(500).json({ error: error.message || "Update failed" });
    }
  });

  // Start domain transfer
  app.post("/api/domains/transfer", isAuthenticated, async (req, res) => {
    try {
      const transferSchema = z.object({
        domainName: z.string().min(1),
        authCode: z.string().min(1),
        period: z.number().min(1).max(10).default(1),
      });

      const validatedData = transferSchema.parse(req.body);
      
      const result = await openproviderService.transferDomain(
        validatedData.domainName,
        validatedData.authCode,
        validatedData.period
      );

      if (result.success) {
        res.json({
          success: true,
          message: "Domain transfer initiated",
          transferId: result.transferId,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      console.error("Domain transfer error:", error);
      res.status(500).json({ error: error.message || "Transfer failed" });
    }
  });
}