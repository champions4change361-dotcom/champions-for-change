import { storage } from "./storage";
import type { 
  InsertHealthAlert, 
  InsertAIHealthRecommendation,
  InsertFootballContactData,
  InsertWrestlingWeightData,
  InsertSoccerMovementData,
  PerformanceMonitoringSession 
} from "@shared/sports-monitoring-schema";

export class HealthMonitoringService {
  
  // Football-specific monitoring
  async analyzeFootballPerformance(contactData: InsertFootballContactData): Promise<void> {
    const alerts: InsertHealthAlert[] = [];
    const recommendations: InsertAIHealthRecommendation[] = [];

    // Contact overload detection
    if (contactData.totalContacts && contactData.totalContacts > 50) {
      alerts.push({
        id: `alert-${Date.now()}-contact`,
        athleteId: contactData.athleteId,
        alertType: "overtraining",
        severity: contactData.totalContacts > 80 ? "critical" : "high",
        sport: "football",
        description: `Excessive contact exposure: ${contactData.totalContacts} total contacts`,
        recommendedAction: contactData.totalContacts > 80 
          ? "Immediate rest required. Medical evaluation recommended."
          : "Reduce contact drills. Monitor recovery closely."
      });
    }

    // Technique degradation analysis
    if (contactData.techniqueQualityScore && contactData.techniqueQualityScore < 6.0) {
      alerts.push({
        id: `alert-${Date.now()}-technique`,
        athleteId: contactData.athleteId,
        alertType: "injury_risk",
        severity: contactData.techniqueQualityScore < 4.0 ? "high" : "medium",
        sport: "football",
        description: `Technique quality decline: ${contactData.techniqueQualityScore}/10`,
        recommendedAction: "Focus on form correction. Consider fatigue management."
      });

      recommendations.push({
        id: `rec-${Date.now()}-technique`,
        athleteId: contactData.athleteId,
        sport: "football",
        analysisType: "injury_prediction",
        recommendation: "Technique degradation often precedes injury. Implement form-focused drills and consider reducing contact volume until technique stabilizes.",
        confidenceScore: 0.85,
        dataPoints: { techniqueScore: contactData.techniqueQualityScore, position: contactData.position },
        implementationPriority: "immediate"
      });
    }

    // Recovery time analysis for linemen
    if (contactData.position.includes("line") && contactData.recoveryTime && contactData.recoveryTime < 15) {
      recommendations.push({
        id: `rec-${Date.now()}-recovery`,
        athleteId: contactData.athleteId,
        sport: "football",
        analysisType: "load_management",
        recommendation: "Lineman showing insufficient recovery between plays. Consider rotation strategy or conditioning focus.",
        confidenceScore: 0.78,
        dataPoints: { recoveryTime: contactData.recoveryTime, position: contactData.position },
        implementationPriority: "soon"
      });
    }

    // Save alerts and recommendations
    for (const alert of alerts) {
      await storage.createHealthAlert(alert);
    }
    for (const rec of recommendations) {
      await storage.createAIHealthRecommendation(rec);
    }
  }

  // Wrestling weight management monitoring
  async analyzeWrestlingWeight(weightData: InsertWrestlingWeightData): Promise<void> {
    const alerts: InsertHealthAlert[] = [];
    const recommendations: InsertAIHealthRecommendation[] = [];

    // Dangerous weight cutting detection
    if (weightData.preSessionWeight && weightData.postSessionWeight) {
      const weightLoss = Number(weightData.preSessionWeight) - Number(weightData.postSessionWeight);
      const weightLossPercentage = (weightLoss / Number(weightData.preSessionWeight)) * 100;

      if (weightLossPercentage > 3) {
        alerts.push({
          id: `alert-${Date.now()}-weightloss`,
          athleteId: weightData.athleteId,
          alertType: "dehydration",
          severity: weightLossPercentage > 5 ? "critical" : "high",
          sport: "wrestling",
          description: `Dangerous weight loss: ${weightLoss.toFixed(1)} lbs (${weightLossPercentage.toFixed(1)}%)`,
          recommendedAction: weightLossPercentage > 5 
            ? "CRITICAL: Immediate medical attention. Halt activity until rehydrated."
            : "Monitor hydration closely. Implement gradual rehydration protocol."
        });
      }
    }

    // Mental/physical performance correlation
    if (weightData.energyLevel && weightData.mentalSharpness) {
      if (weightData.energyLevel < 4 || weightData.mentalSharpness < 4) {
        recommendations.push({
          id: `rec-${Date.now()}-performance`,
          athleteId: weightData.athleteId,
          sport: "wrestling",
          analysisType: "performance_trend",
          recommendation: "Low energy and mental sharpness may indicate overtraining or inadequate nutrition. Consider adjusting training load and nutritional strategy.",
          confidenceScore: 0.72,
          dataPoints: { 
            energyLevel: weightData.energyLevel, 
            mentalSharpness: weightData.mentalSharpness,
            hydrationStatus: weightData.hydrationStatus 
          },
          implementationPriority: "soon"
        });
      }
    }

    // Save alerts and recommendations
    for (const alert of alerts) {
      await storage.createHealthAlert(alert);
    }
    for (const rec of recommendations) {
      await storage.createAIHealthRecommendation(rec);
    }
  }

  // Soccer endurance and cardiovascular monitoring
  async analyzeSoccerPerformance(movementData: InsertSoccerMovementData): Promise<void> {
    const alerts: InsertHealthAlert[] = [];
    const recommendations: InsertAIHealthRecommendation[] = [];

    // Sprint recovery analysis
    if (movementData.recoveryBetweenSprints && movementData.recoveryBetweenSprints > 45) {
      alerts.push({
        id: `alert-${Date.now()}-recovery`,
        athleteId: movementData.athleteId,
        alertType: "performance_decline",
        severity: movementData.recoveryBetweenSprints > 60 ? "high" : "medium",
        sport: "soccer",
        description: `Slow sprint recovery: ${movementData.recoveryBetweenSprints} seconds average`,
        recommendedAction: "Monitor cardiovascular fitness. Consider conditioning focus."
      });
    }

    // Distance vs. effectiveness analysis
    if (movementData.distanceCovered && movementData.touchesOnBall) {
      const touchesPerKm = Number(movementData.touchesOnBall) / (Number(movementData.distanceCovered) / 1000);
      
      if (touchesPerKm < 20 && movementData.position !== "goalkeeper") {
        recommendations.push({
          id: `rec-${Date.now()}-efficiency`,
          athleteId: movementData.athleteId,
          sport: "soccer",
          analysisType: "performance_trend",
          recommendation: "Low ball involvement relative to distance covered. Consider positional awareness training or tactical adjustment.",
          confidenceScore: 0.68,
          dataPoints: { 
            touchesPerKm: touchesPerKm,
            position: movementData.position,
            distanceCovered: movementData.distanceCovered 
          },
          implementationPriority: "monitor"
        });
      }
    }

    // Save alerts and recommendations
    for (const alert of alerts) {
      await storage.createHealthAlert(alert);
    }
    for (const rec of recommendations) {
      await storage.createAIHealthRecommendation(rec);
    }
  }

  // General performance trend analysis
  async analyzePerformanceTrends(athleteId: string, sport: string): Promise<void> {
    // Get recent sessions for trend analysis
    const recentSessions = await storage.getRecentPerformanceSessions(athleteId, 10);
    
    if (recentSessions.length < 3) return; // Need minimum data for trends

    // Analyze for declining performance patterns
    const performanceMetrics = this.extractPerformanceMetrics(recentSessions, sport);
    const trend = this.calculateTrend(performanceMetrics);

    if (trend.isDecline && trend.severity > 0.15) {
      const alert: InsertHealthAlert = {
        id: `alert-${Date.now()}-trend`,
        athleteId,
        alertType: "performance_decline",
        severity: trend.severity > 0.25 ? "high" : "medium",
        sport,
        description: `Consistent performance decline detected over ${recentSessions.length} sessions`,
        recommendedAction: "Evaluate training load, rest, nutrition, and potential underlying health issues."
      };

      await storage.createHealthAlert(alert);

      const recommendation: InsertAIHealthRecommendation = {
        id: `rec-${Date.now()}-trend`,
        athleteId,
        sport,
        analysisType: "performance_trend",
        recommendation: `Performance decline pattern suggests potential overtraining or health issue. Recommend medical evaluation and training load adjustment.`,
        confidenceScore: Math.min(0.95, 0.6 + trend.severity),
        dataPoints: { trendSeverity: trend.severity, sessionCount: recentSessions.length },
        implementationPriority: trend.severity > 0.25 ? "immediate" : "soon"
      };

      await storage.createAIHealthRecommendation(recommendation);
    }
  }

  private extractPerformanceMetrics(sessions: PerformanceMonitoringSession[], sport: string): number[] {
    // Extract sport-specific performance indicators
    // This would be expanded with actual performance data correlation
    return sessions.map((session, index) => {
      // Simplified metric - in real implementation, this would use sport-specific data
      const timeDecay = 1 - (index * 0.1); // Recent sessions weighted higher
      const intensityScore = session.intensity === "high" ? 0.8 : session.intensity === "medium" ? 0.6 : 0.4;
      return timeDecay * intensityScore;
    });
  }

  private calculateTrend(metrics: number[]): { isDecline: boolean; severity: number } {
    if (metrics.length < 3) return { isDecline: false, severity: 0 };

    // Simple linear regression to detect decline
    const n = metrics.length;
    const sumX = metrics.reduce((sum, _, i) => sum + i, 0);
    const sumY = metrics.reduce((sum, val) => sum + val, 0);
    const sumXY = metrics.reduce((sum, val, i) => sum + (i * val), 0);
    const sumXX = metrics.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    return {
      isDecline: slope < -0.05, // Negative slope indicates decline
      severity: Math.abs(slope)
    };
  }

  // Get athlete health dashboard data
  async getAthleteHealthDashboard(athleteId: string): Promise<{
    recentAlerts: any[];
    recommendations: any[];
    trendAnalysis: any;
  }> {
    const recentAlerts = await storage.getRecentHealthAlerts(athleteId, 30); // Last 30 days
    const recommendations = await storage.getActiveRecommendations(athleteId);
    
    return {
      recentAlerts,
      recommendations,
      trendAnalysis: await this.generateTrendSummary(athleteId)
    };
  }

  private async generateTrendSummary(athleteId: string): Promise<any> {
    // Generate summary of athlete's health trends
    const alerts = await storage.getRecentHealthAlerts(athleteId, 90);
    const alertsByType = alerts.reduce((acc, alert) => {
      acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAlerts: alerts.length,
      alertBreakdown: alertsByType,
      riskLevel: this.calculateOverallRiskLevel(alerts),
      lastEvaluation: new Date().toISOString()
    };
  }

  private calculateOverallRiskLevel(alerts: any[]): string {
    const criticalCount = alerts.filter(a => a.severity === "critical").length;
    const highCount = alerts.filter(a => a.severity === "high").length;
    
    if (criticalCount > 0) return "critical";
    if (highCount > 2) return "high";
    if (alerts.length > 5) return "medium";
    return "low";
  }
}

export const healthMonitoringService = new HealthMonitoringService();