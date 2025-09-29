import { Request, Response, NextFunction } from 'express';
import { SubscriptionAccessService, OrganizationType, AccessLevel } from '../services/subscriptionAccessService';
import { User } from '@shared/schema';

// Extend Express Request to include subscription access info
declare module 'express-serve-static-core' {
  interface Request {
    subscriptionAccess?: {
      organizationType: OrganizationType;
      subscriptionStatus: string;
      subscriptionPlan: string;
      availableFeatures: string[];
      accessLevel: AccessLevel;
      hasValidAccess: boolean;
      isFreeTier: boolean;
    };
  }
}

/**
 * Middleware to load subscription access information for authenticated users
 */
export function loadSubscriptionAccess(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User;
    
    if (!user) {
      return next(); // No user, continue without subscription info
    }

    // Get subscription access information
    const subscriptionAccess = SubscriptionAccessService.getSubscriptionAccess(user);
    
    // Attach to request for use by other middleware and routes
    req.subscriptionAccess = subscriptionAccess;
    
    next();
  } catch (error) {
    console.error('Error loading subscription access:', error);
    next(); // Continue even if there's an error, but without subscription info
  }
}

/**
 * Middleware to require valid subscription access for protected routes
 */
export function requireValidSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as User;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const subscriptionAccess = req.subscriptionAccess || SubscriptionAccessService.getSubscriptionAccess(user);
    
    // Fantasy sports (free tier) always have valid access
    if (subscriptionAccess.isFreeTier) {
      return next();
    }
    
    // Other tiers need active subscription
    if (!subscriptionAccess.hasValidAccess) {
      return res.status(403).json({
        error: 'Valid subscription required',
        code: 'SUBSCRIPTION_REQUIRED',
        organizationType: subscriptionAccess.organizationType,
        subscriptionStatus: subscriptionAccess.subscriptionStatus,
        message: getSubscriptionErrorMessage(subscriptionAccess.organizationType, subscriptionAccess.subscriptionStatus)
      });
    }
    
    next();
  } catch (error) {
    console.error('Subscription validation error:', error);
    res.status(500).json({ 
      error: 'Subscription validation failed',
      code: 'SUBSCRIPTION_VALIDATION_ERROR'
    });
  }
}

/**
 * Middleware to require specific features for route access
 */
export function requireFeature(requiredFeature: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const hasAccess = SubscriptionAccessService.hasFeatureAccess(user, requiredFeature);
      
      if (!hasAccess) {
        const subscriptionAccess = req.subscriptionAccess || SubscriptionAccessService.getSubscriptionAccess(user);
        
        return res.status(403).json({
          error: 'Feature access denied',
          code: 'FEATURE_ACCESS_DENIED',
          requiredFeature,
          organizationType: subscriptionAccess.organizationType,
          subscriptionStatus: subscriptionAccess.subscriptionStatus,
          availableFeatures: subscriptionAccess.availableFeatures,
          message: getFeatureAccessErrorMessage(requiredFeature, subscriptionAccess.organizationType)
        });
      }
      
      next();
    } catch (error) {
      console.error('Feature access validation error:', error);
      res.status(500).json({ 
        error: 'Feature access validation failed',
        code: 'FEATURE_VALIDATION_ERROR'
      });
    }
  };
}

/**
 * Middleware to require specific access level for route access
 */
export function requireAccessLevel(requiredLevel: AccessLevel) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const subscriptionAccess = req.subscriptionAccess || SubscriptionAccessService.getSubscriptionAccess(user);
      
      // Check if user's access level meets the requirement
      const accessLevelHierarchy = {
        'free': 1,
        'basic': 2, 
        'standard': 3,
        'enterprise': 4
      };
      
      const userLevel = accessLevelHierarchy[subscriptionAccess.accessLevel];
      const requiredLevelValue = accessLevelHierarchy[requiredLevel];
      
      if (userLevel < requiredLevelValue) {
        return res.status(403).json({
          error: 'Insufficient access level',
          code: 'ACCESS_LEVEL_INSUFFICIENT',
          requiredLevel,
          currentLevel: subscriptionAccess.accessLevel,
          organizationType: subscriptionAccess.organizationType,
          message: getAccessLevelErrorMessage(requiredLevel, subscriptionAccess.accessLevel, subscriptionAccess.organizationType)
        });
      }
      
      next();
    } catch (error) {
      console.error('Access level validation error:', error);
      res.status(500).json({ 
        error: 'Access level validation failed',
        code: 'ACCESS_LEVEL_VALIDATION_ERROR'
      });
    }
  };
}

/**
 * Middleware to require specific organization type
 */
export function requireOrganizationType(allowedTypes: OrganizationType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const subscriptionAccess = req.subscriptionAccess || SubscriptionAccessService.getSubscriptionAccess(user);
      
      if (!allowedTypes.includes(subscriptionAccess.organizationType)) {
        return res.status(403).json({
          error: 'Organization type not allowed',
          code: 'ORGANIZATION_TYPE_NOT_ALLOWED',
          allowedTypes,
          currentType: subscriptionAccess.organizationType,
          message: `This feature is only available to ${allowedTypes.join(', ')} organizations.`
        });
      }
      
      next();
    } catch (error) {
      console.error('Organization type validation error:', error);
      res.status(500).json({ 
        error: 'Organization type validation failed',
        code: 'ORGANIZATION_TYPE_VALIDATION_ERROR'
      });
    }
  };
}

/**
 * Utility function to get user subscription status for debugging
 */
export function getSubscriptionStatus(req: Request): any {
  const user = req.user as User;
  
  if (!user) {
    return { error: 'No user found' };
  }
  
  return SubscriptionAccessService.getSubscriptionAccess(user);
}

// Helper functions for error messages

function getSubscriptionErrorMessage(organizationType: OrganizationType, subscriptionStatus: string): string {
  switch (organizationType) {
    case 'fantasy_sports':
      return 'Fantasy sports access should be free. Please contact support if you see this error.';
    
    case 'youth_organization':
      switch (subscriptionStatus) {
        case 'canceled':
          return 'Your Youth Organization subscription has been canceled. Reactivate to continue using advanced features.';
        case 'past_due':
          return 'Your Youth Organization subscription payment is past due. Please update your payment method.';
        case 'unpaid':
          return 'Your Youth Organization subscription is unpaid. Please complete payment to continue access.';
        default:
          return 'Active Youth Organization subscription required. Choose from $50/month or $480/year (20% discount).';
      }
    
    case 'private_school':
      switch (subscriptionStatus) {
        case 'canceled':
          return 'Your Private School enterprise subscription has been canceled. Reactivate to continue access.';
        case 'past_due':
          return 'Your Private School subscription payment is past due. Please update your payment method.';
        case 'unpaid':
          return 'Your Private School subscription is unpaid. Please complete payment to continue access.';
        default:
          return 'Active Private School enterprise subscription required ($2,000/year).';
      }
    
    default:
      return 'Valid subscription required to access this feature.';
  }
}

function getFeatureAccessErrorMessage(feature: string, organizationType: OrganizationType): string {
  const featureDisplayNames: Record<string, string> = {
    'full_tournament_management': 'Full Tournament Management',
    'unlimited_tournaments': 'Unlimited Tournaments',
    'unlimited_participants': 'Unlimited Participants',
    'advanced_analytics': 'Advanced Analytics',
    'enterprise_management': 'Enterprise Management',
    'compliance_tools': 'Compliance Tools',
    'white_label_branding': 'White Label Branding',
    'custom_integrations': 'Custom Integrations'
  };
  
  const displayName = featureDisplayNames[feature] || feature;
  
  switch (organizationType) {
    case 'fantasy_sports':
      return `${displayName} is not available for fantasy sports. Consider upgrading to Youth Organization access.`;
    
    case 'youth_organization':
      return `${displayName} requires a Youth Organization subscription ($50/month or $480/year).`;
    
    case 'private_school':
      return `${displayName} requires a Private School enterprise subscription ($2,000/year).`;
    
    default:
      return `${displayName} is not available with your current subscription.`;
  }
}

function getAccessLevelErrorMessage(requiredLevel: AccessLevel, currentLevel: AccessLevel, organizationType: OrganizationType): string {
  const levelNames = {
    'free': 'Free',
    'basic': 'Basic',
    'standard': 'Standard', 
    'enterprise': 'Enterprise'
  };
  
  const requiredName = levelNames[requiredLevel];
  const currentName = levelNames[currentLevel];
  
  let upgradeMessage = '';
  switch (organizationType) {
    case 'fantasy_sports':
      if (requiredLevel !== 'free') {
        upgradeMessage = ' Consider upgrading to Youth Organization ($50/month) or Private School ($2,000/year) access.';
      }
      break;
    case 'youth_organization':
      if (requiredLevel === 'enterprise') {
        upgradeMessage = ' Upgrade to Private School enterprise access ($2,000/year) for enterprise features.';
      }
      break;
  }
  
  return `${requiredName} access level required. You currently have ${currentName} access.${upgradeMessage}`;
}