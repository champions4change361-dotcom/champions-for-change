import { z } from "zod";
import { drizzle } from "drizzle-orm/postgres-js";

// Merchandise Product Schema
export const merchandiseProductSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  tournamentId: z.string().optional(), // Can be tournament-specific or organization-wide
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category: z.enum([
    "apparel",
    "accessories", 
    "equipment",
    "digital",
    "food_beverage",
    "custom"
  ]),
  subCategory: z.string().optional(), // e.g., "t-shirts", "hoodies", "water_bottles"
  basePrice: z.number().min(0),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(), // e.g., "Small", "Red", "Home Jersey"
    type: z.enum(["size", "color", "style", "custom"]),
    priceAdjustment: z.number().default(0), // +/- from base price
    inventory: z.number().min(0).default(0),
    sku: z.string().optional()
  })).default([]),
  images: z.array(z.string()).default([]), // Array of image URLs
  isActive: z.boolean().default(true),
  inventory: z.number().min(0).default(0), // Base inventory if no variants
  maxQuantityPerOrder: z.number().min(1).default(10),
  customizationOptions: z.object({
    allowNamePersonalization: z.boolean().default(false),
    allowNumberPersonalization: z.boolean().default(false),
    personalizationFee: z.number().min(0).default(0),
    customFields: z.array(z.object({
      fieldName: z.string(),
      fieldType: z.enum(["text", "number", "select", "multiselect"]),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional()
    })).default([])
  }).optional(),
  shippingInfo: z.object({
    weight: z.number().min(0).default(0), // in pounds
    dimensions: z.object({
      length: z.number().min(0),
      width: z.number().min(0), 
      height: z.number().min(0)
    }).optional(),
    shippingClass: z.enum(["standard", "expedited", "digital", "pickup_only"]).default("standard")
  }).optional(),
  availabilityWindow: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    preOrderOnly: z.boolean().default(false)
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// Merchandise Order Schema
export const merchandiseOrderSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  tournamentId: z.string().optional(),
  customerId: z.string(),
  customerInfo: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    participantName: z.string().optional(), // If ordering for someone else (team member)
    teamName: z.string().optional()
  }),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    variantId: z.string().optional(),
    variantName: z.string().optional(),
    quantity: z.number().min(1),
    unitPrice: z.number(),
    totalPrice: z.number(),
    customization: z.object({
      playerName: z.string().optional(),
      playerNumber: z.string().optional(),
      customFields: z.record(z.string()).optional()
    }).optional()
  })),
  subtotal: z.number(),
  shippingCost: z.number().default(0),
  taxAmount: z.number().default(0),
  totalAmount: z.number(),
  shippingAddress: z.object({
    street1: z.string(),
    street2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default("US")
  }).optional(),
  paymentInfo: z.object({
    paymentMethod: z.string(),
    paymentId: z.string(),
    paymentStatus: z.enum(["pending", "completed", "failed", "refunded"]),
    transactionDate: z.string()
  }),
  fulfillmentStatus: z.enum([
    "pending",
    "processing", 
    "shipped",
    "delivered",
    "pickup_ready",
    "completed",
    "cancelled"
  ]).default("pending"),
  trackingInfo: z.object({
    carrier: z.string().optional(),
    trackingNumber: z.string().optional(),
    shippedDate: z.string().optional(),
    estimatedDelivery: z.string().optional()
  }).optional(),
  specialInstructions: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type MerchandiseProduct = z.infer<typeof merchandiseProductSchema>;
export type MerchandiseOrder = z.infer<typeof merchandiseOrderSchema>;

// Predefined product templates for tournaments
export const TOURNAMENT_MERCHANDISE_TEMPLATES = {
  basketball: {
    name: "Basketball Tournament Package",
    products: [
      {
        name: "Tournament T-Shirt",
        category: "apparel" as const,
        subCategory: "t-shirts",
        basePrice: 15.99,
        variants: [
          { name: "Youth Small", type: "size" as const, priceAdjustment: -2 },
          { name: "Youth Medium", type: "size" as const, priceAdjustment: -2 },
          { name: "Youth Large", type: "size" as const, priceAdjustment: -2 },
          { name: "Adult Small", type: "size" as const, priceAdjustment: 0 },
          { name: "Adult Medium", type: "size" as const, priceAdjustment: 0 },
          { name: "Adult Large", type: "size" as const, priceAdjustment: 0 },
          { name: "Adult XL", type: "size" as const, priceAdjustment: 2 },
          { name: "Adult XXL", type: "size" as const, priceAdjustment: 4 }
        ],
        customizationOptions: {
          allowNamePersonalization: true,
          allowNumberPersonalization: true,
          personalizationFee: 5.00
        }
      },
      {
        name: "Tournament Hoodie",
        category: "apparel" as const,
        subCategory: "hoodies",
        basePrice: 32.99,
        variants: [
          { name: "Youth Medium", type: "size" as const, priceAdjustment: -5 },
          { name: "Youth Large", type: "size" as const, priceAdjustment: -5 },
          { name: "Adult Small", type: "size" as const, priceAdjustment: 0 },
          { name: "Adult Medium", type: "size" as const, priceAdjustment: 0 },
          { name: "Adult Large", type: "size" as const, priceAdjustment: 0 },
          { name: "Adult XL", type: "size" as const, priceAdjustment: 3 },
          { name: "Adult XXL", type: "size" as const, priceAdjustment: 6 }
        ]
      },
      {
        name: "Water Bottle",
        category: "accessories" as const,
        subCategory: "drinkware", 
        basePrice: 12.99,
        customizationOptions: {
          allowNamePersonalization: true,
          personalizationFee: 3.00
        }
      },
      {
        name: "Tournament Program (Digital)",
        category: "digital" as const,
        basePrice: 4.99,
        shippingInfo: {
          shippingClass: "digital" as const
        }
      }
    ]
  },
  
  track_field: {
    name: "Track & Field Meet Package",
    products: [
      {
        name: "Performance T-Shirt", 
        category: "apparel" as const,
        subCategory: "athletic_wear",
        basePrice: 18.99,
        variants: [
          { name: "Unisex Small", type: "size" as const, priceAdjustment: 0 },
          { name: "Unisex Medium", type: "size" as const, priceAdjustment: 0 },
          { name: "Unisex Large", type: "size" as const, priceAdjustment: 0 },
          { name: "Unisex XL", type: "size" as const, priceAdjustment: 2 }
        ]
      },
      {
        name: "Drawstring Bag",
        category: "accessories" as const,
        subCategory: "bags",
        basePrice: 8.99
      },
      {
        name: "Event Medal",
        category: "accessories" as const,
        subCategory: "awards",
        basePrice: 6.99,
        customizationOptions: {
          customFields: [
            { fieldName: "Event", fieldType: "select" as const, required: true, options: ["100m", "200m", "400m", "800m", "1500m", "High Jump", "Long Jump", "Shot Put"] },
            { fieldName: "Place", fieldType: "select" as const, required: true, options: ["1st Place", "2nd Place", "3rd Place", "Participation"] }
          ]
        }
      }
    ]
  },

  soccer: {
    name: "Soccer Tournament Package",
    products: [
      {
        name: "Team Jersey",
        category: "apparel" as const,
        subCategory: "jerseys",
        basePrice: 24.99,
        variants: [
          { name: "Youth Small", type: "size" as const, priceAdjustment: -3 },
          { name: "Youth Medium", type: "size" as const, priceAdjustment: -3 },
          { name: "Youth Large", type: "size" as const, priceAdjustment: -3 },
          { name: "Adult Small", type: "size" as const, priceAdjustment: 0 },
          { name: "Adult Medium", type: "size" as const, priceAdjustment: 0 },
          { name: "Adult Large", type: "size" as const, priceAdjustment: 0 },
          { name: "Home", type: "style" as const, priceAdjustment: 0 },
          { name: "Away", type: "style" as const, priceAdjustment: 0 }
        ],
        customizationOptions: {
          allowNamePersonalization: true,
          allowNumberPersonalization: true,
          personalizationFee: 8.00
        }
      },
      {
        name: "Soccer Ball",
        category: "equipment" as const,
        subCategory: "balls",
        basePrice: 19.99,
        variants: [
          { name: "Size 3 (Youth)", type: "size" as const, priceAdjustment: -2 },
          { name: "Size 4 (Junior)", type: "size" as const, priceAdjustment: 0 },
          { name: "Size 5 (Official)", type: "size" as const, priceAdjustment: 3 }
        ]
      }
    ]
  }
};

// Revenue sharing calculation for merchandise
export const calculateRevenueSharing = (
  orderTotal: number,
  revenueSharePercentage: number,
  productCosts: number = 0
): {
  grossRevenue: number;
  productCosts: number;
  netRevenue: number;
  platformFee: number;
  organizationRevenue: number;
} => {
  const grossRevenue = orderTotal;
  const netRevenue = grossRevenue - productCosts;
  const platformFee = netRevenue * (1 - revenueSharePercentage / 100);
  const organizationRevenue = netRevenue * (revenueSharePercentage / 100);
  
  return {
    grossRevenue,
    productCosts,
    netRevenue,
    platformFee,
    organizationRevenue
  };
};