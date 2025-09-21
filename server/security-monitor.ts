// Security monitoring and alerting system
interface SecurityEvent {
  timestamp: Date;
  type: 'malicious_path' | 'suspicious_referrer' | 'rate_limit' | 'injection_attempt' | 'blocked_request';
  ip: string;
  userAgent: string;
  path: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private alertThresholds = {
    malicious_path: 5, // 5 attempts in 15 minutes
    rate_limit: 3,     // 3 rate limit hits in 15 minutes  
    injection_attempt: 1, // Any SQL injection attempt
    suspicious_referrer: 3, // 3 suspicious referrer attempts
    blocked_request: 5, // 5 blocked requests
  };

  logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    this.events.push(securityEvent);
    
    // Keep only last 1000 events to prevent memory issues
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Log to console with appropriate emoji
    const emoji = this.getSeverityEmoji(event.severity);
    console.log(`${emoji} Security Event [${event.type}]: ${event.ip} -> ${event.path}`);
    console.log(`   Details: ${event.details}`);
    
    // Check if we need to alert
    this.checkAlertThresholds(event.type, event.ip);
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'low': return '🟡';
      case 'medium': return '🟠'; 
      case 'high': return '🔴';
      case 'critical': return '🚨';
      default: return '⚠️';
    }
  }

  private checkAlertThresholds(type: keyof typeof this.alertThresholds, ip: string) {
    const threshold = this.alertThresholds[type];
    if (!threshold) return;

    // Count events of this type from this IP in last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentEvents = this.events.filter(event => 
      event.type === type && 
      event.ip === ip && 
      event.timestamp > fifteenMinutesAgo
    );

    if (recentEvents.length >= threshold) {
      this.sendAlert(type, ip, recentEvents.length);
    }
  }

  private sendAlert(type: string, ip: string, count: number) {
    console.log(`🚨 SECURITY ALERT: ${count} ${type} events from IP ${ip} in last 15 minutes`);
    console.log(`🛡️  Consider reviewing this IP for potential blocking`);
    
    // In production, you could send emails or Slack notifications here
    // For now, we'll just log prominently
  }

  getRecentEvents(minutes: number = 60): SecurityEvent[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.events.filter(event => event.timestamp > cutoff);
  }

  getTopThreatIPs(hours: number = 24): Array<{ip: string, count: number, types: string[]}> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentEvents = this.events.filter(event => event.timestamp > cutoff);
    
    const ipCounts = new Map<string, {count: number, types: Set<string>}>();
    
    recentEvents.forEach(event => {
      const existing = ipCounts.get(event.ip) || {count: 0, types: new Set()};
      existing.count++;
      existing.types.add(event.type);
      ipCounts.set(event.ip, existing);
    });

    return Array.from(ipCounts.entries())
      .map(([ip, data]) => ({
        ip,
        count: data.count,
        types: Array.from(data.types)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 threat IPs
  }

  printSecuritySummary() {
    const last24Hours = this.getRecentEvents(24 * 60);
    const topThreats = this.getTopThreatIPs(24);
    
    console.log('🛡️  Security Summary (Last 24 Hours):');
    console.log(`   Total security events: ${last24Hours.length}`);
    console.log(`   Unique threat IPs: ${topThreats.length}`);
    
    if (topThreats.length > 0) {
      console.log('   Top threat IPs:');
      topThreats.slice(0, 3).forEach((threat, i) => {
        console.log(`   ${i + 1}. ${threat.ip} (${threat.count} events: ${threat.types.join(', ')})`);
      });
    }
  }
}

export const securityMonitor = new SecurityMonitor();

// Export helper function for easy logging
export function logSecurityEvent(
  type: SecurityEvent['type'],
  ip: string,
  userAgent: string,
  path: string,
  details: string,
  severity: SecurityEvent['severity'] = 'medium'
) {
  securityMonitor.logEvent({
    type,
    ip,
    userAgent,
    path,
    details,
    severity
  });
}