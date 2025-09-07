import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "./replitAuth";
import { getStorage } from "./storage";
import { stripe } from "./nonprofitStripeConfig";
import { 
  insertMerchandiseProductSchema, 
  insertMerchandiseOrderSchema, 
  insertEventTicketSchema, 
  insertTicketOrderSchema 
} from "@shared/schema";

const router = Router();

// =============================================================================
// MIDDLEWARE - Role-based access control for webstore management
// =============================================================================

const requireTournamentDirectorOrAdmin = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const allowedRoles = [
    "tournament_manager", 
    "district_athletic_director", 
    "school_athletic_director",
    "head_coach"
  ];

  if (!allowedRoles.includes(req.user.userRole)) {
    return res.status(403).json({ 
      error: "Access denied. Tournament director privileges required." 
    });
  }

  next();
};

// =============================================================================
// MERCHANDISE PRODUCT ROUTES
// =============================================================================

// Create new merchandise product
router.post("/products", isAuthenticated, requireTournamentDirectorOrAdmin, async (req, res) => {
  try {
    const storage = getStorage();
    const productData = insertMerchandiseProductSchema.parse({
      ...req.body,
      organizationId: req.user.organizationId,
    });

    const product = await storage.createMerchandiseProduct(productData);
    res.status(201).json(product);
  } catch (error: any) {
    console.error("Error creating merchandise product:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid product data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Get all products for organization
router.get("/products", isAuthenticated, async (req, res) => {
  try {
    const storage = getStorage();
    const { tournamentId } = req.query;

    let products;
    if (tournamentId) {
      products = await storage.getMerchandiseProductsByTournament(tournamentId as string);
    } else {
      products = await storage.getMerchandiseProductsByOrganization(req.user.organizationId);
    }

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product
router.get("/products/:id", isAuthenticated, async (req, res) => {
  try {
    const storage = getStorage();
    const product = await storage.getMerchandiseProduct(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user has access to this product
    if (product.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Update product
router.put("/products/:id", isAuthenticated, requireTournamentDirectorOrAdmin, async (req, res) => {
  try {
    const storage = getStorage();
    
    // First check if product exists and user has access
    const existingProduct = await storage.getMerchandiseProduct(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (existingProduct.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedProduct = await storage.updateMerchandiseProduct(req.params.id, req.body);
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product
router.delete("/products/:id", isAuthenticated, requireTournamentDirectorOrAdmin, async (req, res) => {
  try {
    const storage = getStorage();
    
    // First check if product exists and user has access
    const existingProduct = await storage.getMerchandiseProduct(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (existingProduct.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const success = await storage.deleteMerchandiseProduct(req.params.id);
    if (success) {
      res.json({ message: "Product deleted successfully" });
    } else {
      res.status(500).json({ error: "Failed to delete product" });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// =============================================================================
// EVENT TICKET ROUTES
// =============================================================================

// Create new event ticket
router.post("/tickets", isAuthenticated, requireTournamentDirectorOrAdmin, async (req, res) => {
  try {
    const storage = getStorage();
    const ticketData = insertEventTicketSchema.parse({
      ...req.body,
      organizationId: req.user.organizationId,
    });

    const ticket = await storage.createEventTicket(ticketData);
    res.status(201).json(ticket);
  } catch (error: any) {
    console.error("Error creating event ticket:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid ticket data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

// Get all tickets for organization or tournament
router.get("/tickets", isAuthenticated, async (req, res) => {
  try {
    const storage = getStorage();
    const { tournamentId } = req.query;

    let tickets;
    if (tournamentId) {
      tickets = await storage.getEventTicketsByTournament(tournamentId as string);
    } else {
      tickets = await storage.getEventTicketsByOrganization(req.user.organizationId);
    }

    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// Get single ticket
router.get("/tickets/:id", isAuthenticated, async (req, res) => {
  try {
    const storage = getStorage();
    const ticket = await storage.getEventTicket(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Check if user has access to this ticket
    if (ticket.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
});

// Update ticket
router.put("/tickets/:id", isAuthenticated, requireTournamentDirectorOrAdmin, async (req, res) => {
  try {
    const storage = getStorage();
    
    // First check if ticket exists and user has access
    const existingTicket = await storage.getEventTicket(req.params.id);
    if (!existingTicket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    if (existingTicket.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedTicket = await storage.updateEventTicket(req.params.id, req.body);
    res.json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ error: "Failed to update ticket" });
  }
});

// Delete ticket
router.delete("/tickets/:id", isAuthenticated, requireTournamentDirectorOrAdmin, async (req, res) => {
  try {
    const storage = getStorage();
    
    // First check if ticket exists and user has access
    const existingTicket = await storage.getEventTicket(req.params.id);
    if (!existingTicket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    if (existingTicket.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const success = await storage.deleteEventTicket(req.params.id);
    if (success) {
      res.json({ message: "Ticket deleted successfully" });
    } else {
      res.status(500).json({ error: "Failed to delete ticket" });
    }
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Failed to delete ticket" });
  }
});

// =============================================================================
// INVENTORY MANAGEMENT ROUTES
// =============================================================================

// Update product inventory
router.post("/products/:id/inventory", isAuthenticated, requireTournamentDirectorOrAdmin, async (req, res) => {
  try {
    const storage = getStorage();
    const { quantity, operation = 'set' } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    const success = await storage.updateProductInventory(req.params.id, quantity, operation);
    if (success) {
      res.json({ message: "Inventory updated successfully" });
    } else {
      res.status(500).json({ error: "Failed to update inventory" });
    }
  } catch (error) {
    console.error("Error updating product inventory:", error);
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

// Update ticket inventory  
router.post("/tickets/:id/inventory", isAuthenticated, requireTournamentDirectorOrAdmin, async (req, res) => {
  try {
    const storage = getStorage();
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    const success = await storage.updateTicketInventory(req.params.id, quantity);
    if (success) {
      res.json({ message: "Ticket inventory updated successfully" });
    } else {
      res.status(500).json({ error: "Failed to update ticket inventory" });
    }
  } catch (error) {
    console.error("Error updating ticket inventory:", error);
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

// Check product availability
router.get("/products/:id/availability", isAuthenticated, async (req, res) => {
  try {
    const storage = getStorage();
    const { variantId, quantity = 1 } = req.query;

    const available = await storage.checkProductAvailability(
      req.params.id, 
      variantId as string, 
      parseInt(quantity as string)
    );

    res.json({ available });
  } catch (error) {
    console.error("Error checking product availability:", error);
    res.status(500).json({ error: "Failed to check availability" });
  }
});

// Check ticket availability
router.get("/tickets/:id/availability", isAuthenticated, async (req, res) => {
  try {
    const storage = getStorage();
    const { quantity = 1 } = req.query;

    const available = await storage.checkTicketAvailability(
      req.params.id, 
      parseInt(quantity as string)
    );

    res.json({ available });
  } catch (error) {
    console.error("Error checking ticket availability:", error);
    res.status(500).json({ error: "Failed to check availability" });
  }
});

// =============================================================================
// ORDER PROCESSING ROUTES WITH STRIPE INTEGRATION
// =============================================================================

// Create merchandise order with payment processing
router.post("/orders/merchandise", isAuthenticated, async (req, res) => {
  try {
    const storage = getStorage();
    
    // Validate order data
    const orderData = insertMerchandiseOrderSchema.parse({
      ...req.body,
      customerId: req.user.id,
    });

    // Check product availability for all items
    for (const item of orderData.items) {
      const available = await storage.checkProductAvailability(
        item.productId, 
        item.variantId, 
        item.quantity
      );
      if (!available) {
        return res.status(400).json({ 
          error: `Product ${item.productName} is not available in requested quantity` 
        });
      }
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(orderData.totalAmount.toString()) * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        type: 'merchandise_order',
        organizationId: orderData.organizationId,
        customerId: orderData.customerId,
      },
    });

    // Create the order with payment info
    const order = await storage.createMerchandiseOrder({
      ...orderData,
      paymentInfo: {
        paymentMethod: 'stripe',
        paymentId: paymentIntent.id,
        paymentStatus: 'pending',
        transactionDate: new Date().toISOString(),
      }
    });

    // Update inventory for purchased items
    for (const item of orderData.items) {
      await storage.updateProductInventory(item.productId, item.quantity, 'subtract');
    }

    res.status(201).json({
      order,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Error creating merchandise order:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid order data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Create ticket order with payment processing
router.post("/orders/tickets", isAuthenticated, async (req, res) => {
  try {
    const storage = getStorage();
    
    // Validate order data
    const orderData = insertTicketOrderSchema.parse({
      ...req.body,
      customerId: req.user.id,
    });

    // Check ticket availability for all items
    for (const ticket of orderData.tickets) {
      const available = await storage.checkTicketAvailability(ticket.ticketId, ticket.quantity);
      if (!available) {
        return res.status(400).json({ 
          error: `Ticket ${ticket.ticketName} is not available in requested quantity` 
        });
      }
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(orderData.totalAmount.toString()) * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        type: 'ticket_order',
        organizationId: orderData.organizationId,
        customerId: orderData.customerId,
      },
    });

    // Create the order with payment info
    const order = await storage.createTicketOrder({
      ...orderData,
      paymentInfo: {
        paymentMethod: 'stripe',
        paymentId: paymentIntent.id,
        paymentStatus: 'pending',
        transactionDate: new Date().toISOString(),
      }
    });

    // Update ticket inventory
    for (const ticket of orderData.tickets) {
      await storage.updateTicketInventory(ticket.ticketId, ticket.quantity);
    }

    res.status(201).json({
      order,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Error creating ticket order:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid order data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Get merchandise orders
router.get("/orders/merchandise", isAuthenticated, async (req, res) => {
  try {
    const storage = getStorage();
    
    // Tournament directors can see all orders for their organization
    // Regular users can only see their own orders
    let orders;
    const allowedRoles = ["tournament_manager", "district_athletic_director", "school_athletic_director"];
    
    if (allowedRoles.includes(req.user.userRole)) {
      orders = await storage.getMerchandiseOrdersByOrganization(req.user.organizationId);
    } else {
      orders = await storage.getMerchandiseOrdersByCustomer(req.user.id);
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching merchandise orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get ticket orders
router.get("/orders/tickets", isAuthenticated, async (req, res) => {
  try {
    const storage = getStorage();
    
    // Tournament directors can see all orders for their organization
    // Regular users can only see their own orders
    let orders;
    const allowedRoles = ["tournament_manager", "district_athletic_director", "school_athletic_director"];
    
    if (allowedRoles.includes(req.user.userRole)) {
      orders = await storage.getTicketOrdersByOrganization(req.user.organizationId);
    } else {
      orders = await storage.getTicketOrdersByCustomer(req.user.id);
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching ticket orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update order fulfillment status (admin only)
router.put("/orders/merchandise/:id/fulfillment", isAuthenticated, requireTournamentDirectorOrAdmin, async (req, res) => {
  try {
    const storage = getStorage();
    const { status, trackingInfo } = req.body;

    const updatedOrder = await storage.updateOrderFulfillmentStatus(req.params.id, status, trackingInfo);
    if (updatedOrder) {
      res.json(updatedOrder);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Error updating order fulfillment:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// =============================================================================
// REVENUE CALCULATION ROUTES
// =============================================================================

// Calculate merchandise revenue
router.get("/revenue/merchandise", isAuthenticated, requireTournamentDirectorOrAdmin, async (req, res) => {
  try {
    const storage = getStorage();
    const { startDate, endDate } = req.query;

    const revenue = await storage.calculateMerchandiseRevenue(
      req.user.organizationId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(revenue);
  } catch (error) {
    console.error("Error calculating merchandise revenue:", error);
    res.status(500).json({ error: "Failed to calculate revenue" });
  }
});

// Calculate ticket revenue
router.get("/revenue/tickets", isAuthenticated, requireTournamentDirectorOrAdmin, async (req, res) => {
  try {
    const storage = getStorage();
    const { startDate, endDate } = req.query;

    const revenue = await storage.calculateTicketRevenue(
      req.user.organizationId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(revenue);
  } catch (error) {
    console.error("Error calculating ticket revenue:", error);
    res.status(500).json({ error: "Failed to calculate revenue" });
  }
});

export default router;