# Architecture & Security Documentation
**Champions for Change Platform**

*Professional-grade athletic and academic management system with enterprise security*

---

## Security Architecture Overview

### Multi-Layered Security Framework

The Champions for Change platform implements a comprehensive, multi-tiered security architecture designed for educational institutions with stringent compliance requirements:

**🔒 Authentication Layer**
- Dual authentication system: Replit OAuth + Form-based authentication
- Session management with PostgreSQL session store
- Domain-specific authentication strategies
- Secure session handling with rolling cookies and XSS protection

**🛡️ Authorization Layer**
- Role-based access control (RBAC) with 5-tier hierarchy
- HIPAA/FERPA compliance middleware
- Resource-level permissions with audit trails
- Object-level access control lists (ACLs)

**📊 Compliance Layer**
- Real-time audit logging for all data access
- HIPAA training verification system
- FERPA agreement enforcement
- Automated compliance violation detection

---

## Database Schema & Security Configuration

### Core Security Tables

#### Users Table (Primary Authentication)
```sql
users (
  id: varchar (UUID, Primary Key)
  email: varchar (Unique)
  userRole: enum (14 distinct roles)
  complianceRole: enum (District → School → Coaching hierarchy)
  organizationId: varchar (Multi-tenant isolation)
  subscriptionPlan: enum (Feature access control)
  hipaaTrainingCompleted: boolean
  ferpaAgreementSigned: boolean
  medicalDataAccess: boolean
  lastComplianceAudit: timestamp
)
```

#### Compliance Audit Log (Security Tracking)
```sql
complianceAuditLog (
  id: varchar (UUID, Primary Key)
  userId: varchar (Foreign Key → users.id)
  actionType: enum (data_access, data_modification, export, view, login, permission_change)
  resourceType: enum (student_data, health_data, tournament_data, administrative_data)
  resourceId: varchar (Specific record accessed)
  ipAddress: varchar
  userAgent: text
  complianceNotes: text
  createdAt: timestamp
)
```

#### Role Permissions (Granular Access Control)
```sql
rolePermissions (
  userRole: enum (11 distinct roles from District to Fan level)
  permission: enum (9 specific permissions)
  isAllowed: boolean
)
```

### Multi-Tenant Data Isolation

**Organizations & Districts**
- Hierarchical organization structure (District → School → Team)
- Data partitioning by `organizationId` 
- VLC (Venue Location Code) system for athletic facilities
- White-label domain isolation with custom branding

---

## User Role & Permission Matrix

### 5-Tier Hierarchy System

#### **Tier 1: District Level (Maximum Access)**
- `district_athletic_director` - Full platform access, all schools
- `district_head_athletic_trainer` - District-wide health data access
- `district_athletic_coordinator` - District-wide athletic coordination

#### **Tier 2: School Level (School-Specific Access)**
- `school_athletic_director` - School-specific full access
- `school_athletic_trainer` - School health data + athletic management
- `school_athletic_coordinator` - School athletic coordination

#### **Tier 3: Coaching Level (Team-Specific Access)**
- `head_coach` - Team management + limited health data
- `assistant_coach` - Team support + roster management

#### **Tier 4: Operational Level (Event-Specific Access)**
- `tournament_manager` - Tournament creation + management
- `scorekeeper` - Scoring + results entry only

#### **Tier 5: General Access (Read-Only/Limited)**
- `athlete` - Personal data + team information view
- `fan` - Public results + event information only

### Permission Matrix

| Role | Health Data | Student Data | Tournament Mgmt | Analytics | Admin |
|------|-------------|--------------|-----------------|-----------|-------|
| District AD | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| School AD | ✅ School | ✅ School | ✅ School | ✅ School | ❌ |
| Head Coach | ⚠️ Limited | ⚠️ Team Only | ✅ Team | ⚠️ Team | ❌ |
| Scorekeeper | ❌ | ❌ | ⚠️ Scoring Only | ❌ | ❌ |
| Athlete | ⚠️ Personal | ⚠️ Personal | ❌ | ❌ | ❌ |
| Fan | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## API Security Implementation

### Route Protection Middleware

#### **Authentication Middleware**
```typescript
// Primary authentication check
isAuthenticated: RequestHandler
  - Verifies active session or OAuth token
  - Checks token expiration and refresh
  - Logs authentication attempts with IP/User-Agent

// Domain-specific authentication
setupAuth(app: Express)
  - Multi-domain OAuth strategy setup
  - Session configuration with PostgreSQL store
  - Cookie security with httpOnly, secure, sameSite
```

#### **Compliance Middleware**
```typescript
// HIPAA compliance for health data
requireHipaaCompliance(req, res, next)
  - Verifies HIPAA training completion
  - Checks medical data access permissions
  - Validates role hierarchy for health access
  - Logs all access attempts with compliance context

// FERPA compliance for student data
requireFerpaCompliance(req, res, next)
  - Verifies FERPA agreement signature
  - Validates organizational affiliation
  - Ensures proper educational context
  - Maintains FERPA audit trail

// Role-based access control
requireComplianceRole(allowedRoles: string[])
  - Validates user role against required roles
  - Provides detailed access denial logging
  - Returns specific error codes for debugging
```

#### **Audit & Monitoring**
```typescript
// Comprehensive data access logging
auditDataAccess(resourceType)
  - Logs all data interactions
  - Tracks resource-specific access patterns
  - Maintains IP address and user agent logs
  - Provides compliance report generation

// Real-time security monitoring
logComplianceAction(userId, actionType, resourceType, resourceId, req, notes)
  - Immediate security event logging
  - Detailed context preservation
  - Compliance violation detection
  - Automated alert generation
```

### Object-Level Security

#### **Access Control Lists (ACLs)**
```typescript
// Granular object permissions
ObjectAclPolicy {
  owner: string
  visibility: "public" | "private"
  aclRules: ObjectAclRule[]
}

// Permission verification
canAccessObject(userId, objectFile, requestedPermission)
  - Owner-based access control
  - Group membership verification
  - Permission inheritance handling
  - Public/private visibility enforcement
```

---

## Domain Security & Multi-Tenant Architecture

### Supported Domains & Authentication

#### **Production Domains**
- `trantortournaments.org` (Primary platform domain)
- `championsforchange.net` (Nonprofit mission domain)

#### **Domain-Specific Security**
```typescript
// Multi-domain OAuth configuration
supportedDomains: string[]
  - Domain validation for OAuth callbacks
  - SSL certificate verification
  - Cross-domain session isolation
  - Subdomain routing security

// Domain-specific features
domainConfig {
  schoolSafe: boolean
  fantasyEnabled: boolean
  proFeaturesEnabled: boolean
}
```

### White-Label Security

#### **Client Isolation**
- Separate database schemas per white-label client
- Custom domain SSL certificate management
- Branded authentication flows
- Isolated user bases with cross-contamination prevention

#### **Feature Gate Security**
- Subscription-tier based access control
- Feature flag enforcement
- API rate limiting per client tier
- Usage quota monitoring and enforcement

---

## Data Protection & Privacy

### HIPAA Compliance (Health Data)

#### **Technical Safeguards**
- Encrypted data transmission (TLS 1.3)
- Encrypted data storage (AES-256)
- Access logging and monitoring
- Automatic session timeout
- Failed login attempt monitoring

#### **Administrative Safeguards**
- Role-based access assignments
- Regular compliance training verification
- Incident response procedures
- Business associate agreements

#### **Physical Safeguards**
- Cloud infrastructure security (Neon Database)
- Data center access controls
- Redundant backup systems
- Disaster recovery procedures

### FERPA Compliance (Student Data)

#### **Educational Purpose Verification**
- Organizational affiliation validation
- Educational interest documentation
- Parent consent management (where required)
- Directory information handling

#### **Data Minimization**
- Purpose limitation enforcement
- Data retention policy automation
- Automatic data purging schedules
- Consent withdrawal processing

---

## Security Monitoring & Incident Response

### Real-Time Security Monitoring

#### **Automated Threat Detection**
```typescript
// Suspicious activity patterns
- Multiple failed login attempts
- Unusual data access patterns
- Cross-organizational data requests
- Privilege escalation attempts
- After-hours administrative access

// Compliance violation detection
- Unauthorized health data access
- Student data access without FERPA compliance
- Role privilege violations
- Data export without proper authorization
```

#### **Security Event Logging**
```typescript
// Comprehensive audit trail
SecurityEvent {
  timestamp: Date
  userId: string
  ipAddress: string
  userAgent: string
  action: string
  resource: string
  outcome: 'success' | 'failure' | 'violation'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  complianceContext: ComplianceContext
}
```

### Incident Response Procedures

#### **Automated Response**
1. **Immediate**: Account lockout for critical violations
2. **Alert**: Security team notification within 5 minutes
3. **Investigation**: Automated evidence collection
4. **Containment**: Resource access restriction
5. **Recovery**: Service restoration with enhanced monitoring

#### **Compliance Reporting**
- Automated HIPAA breach notification (within 72 hours)
- FERPA violation reporting to educational authorities
- Security incident documentation
- Remediation action tracking

---

## Infrastructure Security

### Database Security (PostgreSQL on Neon)

#### **Connection Security**
- SSL-only database connections
- Connection pooling with authentication
- IP address whitelisting
- Database credential rotation

#### **Data Encryption**
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Key management through cloud provider
- Regular encryption key rotation

### API Security

#### **Request Security**
- Rate limiting per user/IP
- Request size limitations
- Input validation and sanitization
- SQL injection prevention
- XSS protection headers

#### **Response Security**
- Data minimization in responses
- Sensitive data filtering
- Error message sanitization
- Security header enforcement

---

## Security Certifications & Compliance Status

### Current Compliance Status

#### **✅ Implemented**
- HIPAA Technical Safeguards
- FERPA Educational Purpose Controls
- SOC 2 Type I Controls (in progress)
- Role-based access control
- Comprehensive audit logging
- Data encryption (rest + transit)

#### **🔄 In Progress**
- SOC 2 Type II Certification
- State education department certifications
- Third-party security assessments
- Penetration testing program

#### **📋 Planned**
- FedRAMP Moderate certification (for federal education clients)
- State-specific education compliance certifications
- International privacy compliance (GDPR readiness)

---

## Developer Security Guidelines

### Secure Development Practices

#### **Code Security**
```typescript
// Input validation requirements
- All user inputs validated with Zod schemas
- SQL injection prevention with parameterized queries
- XSS prevention with output encoding
- CSRF protection with token validation

// Authentication requirements
- Multi-factor authentication for admin accounts
- Session management with secure cookies
- Password complexity enforcement
- Account lockout for failed attempts
```

#### **API Development Standards**
```typescript
// Required security middleware for all protected routes
app.use(isAuthenticated)
app.use(requireFerpaCompliance) // for student data routes
app.use(requireHipaaCompliance) // for health data routes
app.use(auditDataAccess('resource_type'))
app.use(requireComplianceRole(['allowed_roles']))
```

### Security Testing Requirements

#### **Automated Security Testing**
- Static code analysis (ESLint security rules)
- Dependency vulnerability scanning
- Automated penetration testing
- Compliance rule validation

#### **Manual Security Reviews**
- Code review for all authentication/authorization changes
- Third-party security assessments
- Compliance audits for educational standards
- Incident response testing

---

*Last Updated: January 2025*
*Document Version: 1.0*
*Security Classification: Internal - Champions for Change Platform*

**Contact Information:**
- Security Team: security@championsforchange.net
- Compliance Officer: compliance@championsforchange.net
- Emergency Security Response: security-emergency@championsforchange.net