/**
 * 🏈 ADVANCED FANTASY SALARY CALCULATOR
 * Professional DraftKings-style salary system for Champions for Change
 * Implements position scarcity, injury adjustments, and realistic pricing
 */

export interface SalaryConfig {
  totalCap: number;
  rosterSlots: number;
  basePricePerPoint: number;
  minSalary: number;
  maxSalary: number;
}

export interface PositionMultiplier {
  scarcity: number;
  minPrice: number;
  maxPrice: number;
  slotsNeeded: number;
}

export interface PositionMultipliers {
  QB: PositionMultiplier;
  RB: PositionMultiplier;
  WR: PositionMultiplier;
  TE: PositionMultiplier;
  DEF: PositionMultiplier;
}

export interface AdjustmentFactors {
  injuryStatus: {
    healthy: number;
    questionable: number;
    doubtful: number;
    out: number;
  };
  gameScript: {
    heavyFavorite: { RB: number; QB: number; WR: number };
    neutral: { RB: number; QB: number; WR: number };
    heavyUnderdog: { RB: number; QB: number; WR: number };
  };
  weather: {
    clear: number;
    rain: number;
    wind15plus: number;
    snow: number;
  };
}

export interface PlayerAdjustments {
  injuryStatus?: 'healthy' | 'questionable' | 'doubtful' | 'out';
  gameScript?: 'heavyFavorite' | 'neutral' | 'heavyUnderdog';
  weather?: 'clear' | 'rain' | 'wind15plus' | 'snow';
  ownershipProjection?: number;
}

export class FantasySalaryCalculator {
  private config: {
    salaryConfig: SalaryConfig;
    positionMultipliers: PositionMultipliers;
    adjustmentFactors: AdjustmentFactors;
  };

  constructor() {
    // Configuration from your provided JSON - optimized for Champions for Change
    this.config = {
      salaryConfig: {
        totalCap: 50000,
        rosterSlots: 9,
        basePricePerPoint: 333,
        minSalary: 3000,
        maxSalary: 12000
      },
      positionMultipliers: {
        QB: {
          scarcity: 0.90,  // QBs slightly cheaper due to consistency
          minPrice: 4000,
          maxPrice: 9000,
          slotsNeeded: 1
        },
        RB: {
          scarcity: 1.10,  // RBs premium due to scarcity and usage
          minPrice: 3500,
          maxPrice: 12000,
          slotsNeeded: 2.5  // 2 RB + 0.5 FLEX
        },
        WR: {
          scarcity: 1.00,  // WRs baseline pricing
          minPrice: 3000,
          maxPrice: 11000,
          slotsNeeded: 3.5  // 3 WR + 0.5 FLEX
        },
        TE: {
          scarcity: 1.15,  // TEs premium due to positional scarcity
          minPrice: 3000,
          maxPrice: 8500,
          slotsNeeded: 1
        },
        DEF: {
          scarcity: 0.75,  // DEF cheaper due to volatility
          minPrice: 3000,
          maxPrice: 5000,
          slotsNeeded: 1
        }
      },
      adjustmentFactors: {
        injuryStatus: {
          healthy: 1.0,
          questionable: 0.95,
          doubtful: 0.85,
          out: 0
        },
        gameScript: {
          heavyFavorite: { RB: 1.05, QB: 0.98, WR: 0.97 },
          neutral: { RB: 1.0, QB: 1.0, WR: 1.0 },
          heavyUnderdog: { RB: 0.95, QB: 1.03, WR: 1.05 }
        },
        weather: {
          clear: 1.0,
          rain: 0.97,
          wind15plus: 0.94,
          snow: 0.92
        }
      }
    };
  }

  /**
   * 💰 Calculate professional fantasy salary
   * Formula: projectedPoints × basePricePerPoint × positionScarcity × adjustments
   */
  calculateSalary(
    projectedPoints: number, 
    position: keyof PositionMultipliers, 
    adjustments: PlayerAdjustments = {}
  ): number {
    // Base price calculation
    const basePrice = projectedPoints * this.config.salaryConfig.basePricePerPoint;
    const positionMultiplier = this.config.positionMultipliers[position].scarcity;

    let adjustedPrice = basePrice * positionMultiplier;

    // Apply injury status adjustment
    if (adjustments.injuryStatus) {
      adjustedPrice *= this.config.adjustmentFactors.injuryStatus[adjustments.injuryStatus];
    }

    // Apply game script adjustment (position-specific)
    if (adjustments.gameScript) {
      const scriptMultipliers = this.config.adjustmentFactors.gameScript[adjustments.gameScript];
      if (scriptMultipliers[position as keyof typeof scriptMultipliers]) {
        adjustedPrice *= scriptMultipliers[position as keyof typeof scriptMultipliers];
      }
    }

    // Apply weather adjustment
    if (adjustments.weather) {
      adjustedPrice *= this.config.adjustmentFactors.weather[adjustments.weather];
    }

    // Ownership adjustment (higher ownership = higher price)
    if (adjustments.ownershipProjection) {
      const ownershipFactor = 1 + (adjustments.ownershipProjection - 0.15) * 0.2;
      adjustedPrice *= ownershipFactor;
    }

    // Ensure within position bounds
    const minPrice = this.config.positionMultipliers[position].minPrice;
    const maxPrice = this.config.positionMultipliers[position].maxPrice;

    let finalSalary = Math.max(minPrice, Math.min(maxPrice, adjustedPrice));

    // Round to nearest 100 for clean pricing
    return Math.round(finalSalary / 100) * 100;
  }

  /**
   * 🎯 Get salary tier for styling purposes
   */
  getSalaryTier(salary: number): 'elite' | 'solid' | 'value' | 'budget' {
    if (salary >= 8000) return 'elite';
    if (salary >= 6000) return 'solid';
    if (salary >= 4500) return 'value';
    return 'budget';
  }

  /**
   * 📊 Validate salary cap compliance
   */
  validateSalaryCap(lineup: Array<{ salary: number }>): {
    totalSalary: number;
    isValid: boolean;
    remaining: number;
  } {
    const totalSalary = lineup.reduce((sum, player) => sum + player.salary, 0);
    return {
      totalSalary,
      isValid: totalSalary <= this.config.salaryConfig.totalCap,
      remaining: this.config.salaryConfig.totalCap - totalSalary
    };
  }

  /**
   * 🏈 Generate realistic projected points for demo players
   */
  generateProjectedPoints(position: string, tier: 'elite' | 'solid' | 'value' | 'budget'): number {
    const basePoints = {
      QB: { elite: 24, solid: 18, value: 14, budget: 10 },
      RB: { elite: 22, solid: 16, value: 12, budget: 8 },
      WR: { elite: 20, solid: 15, value: 11, budget: 7 },
      TE: { elite: 16, solid: 12, value: 9, budget: 6 },
      DEF: { elite: 12, solid: 9, value: 7, budget: 5 }
    };

    const points = basePoints[position as keyof typeof basePoints]?.[tier] || 10;
    
    // Add some randomness (±10%) for realism
    const variance = points * 0.1;
    const randomFactor = (Math.random() - 0.5) * 2 * variance;
    
    return Math.round((points + randomFactor) * 10) / 10;
  }

  /**
   * 📈 Get position scarcity info for transparency
   */
  getPositionInfo(position: keyof PositionMultipliers) {
    return this.config.positionMultipliers[position];
  }
}

// Export singleton instance
export const fantasySalaryCalculator = new FantasySalaryCalculator();