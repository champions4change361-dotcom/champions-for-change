import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Heart, GraduationCap, Clipboard, UserCheck } from "lucide-react";

interface RoleInfo {
  role: string;
  title: string;
  description: string;
  level: 'district' | 'school' | 'team' | 'general';
  permissions: string[];
  icon: React.ElementType;
  medicalAccess: boolean;
}

const roleHierarchy: RoleInfo[] = [
  // District Level
  {
    role: 'district_athletic_director',
    title: 'District Athletic Director',
    description: 'Super Admin - Oversees all athletic operations across the district',
    level: 'district',
    permissions: [
      'All district operations',
      'Budget management',
      'Policy creation',
      'Staff oversight',
      'Medical data access',
      'FERPA student data'
    ],
    icon: Shield,
    medicalAccess: true
  },
  {
    role: 'district_head_athletic_trainer',
    title: 'District Head Athletic Trainer',
    description: 'Health Admin - Manages medical programs district-wide',
    level: 'district',
    permissions: [
      'District health protocols',
      'Medical staff coordination',
      'Health data analytics',
      'Emergency response',
      'Medical data access',
      'Training oversight'
    ],
    icon: Heart,
    medicalAccess: true
  },

  // School Level
  {
    role: 'school_athletic_director',
    title: 'School Athletic Director',
    description: 'School Admin - Manages athletics for individual school',
    level: 'school',
    permissions: [
      'School athletic programs',
      'Team coordination',
      'Facility management',
      'Coach supervision',
      'Medical data access',
      'Student records'
    ],
    icon: GraduationCap,
    medicalAccess: true
  },
  {
    role: 'school_athletic_trainer',
    title: 'School Athletic Trainer',
    description: 'Health Monitor - Provides medical care for school athletes',
    level: 'school',
    permissions: [
      'Student health monitoring',
      'Injury assessment',
      'Treatment plans',
      'Medical documentation',
      'Medical data access',
      'Parent communication'
    ],
    icon: Heart,
    medicalAccess: true
  },
  {
    role: 'school_principal',
    title: 'School Principal',
    description: 'Oversight Access - Administrative oversight of athletic programs',
    level: 'school',
    permissions: [
      'Program oversight',
      'Budget approval',
      'Staff evaluation',
      'Policy enforcement',
      'Student discipline',
      'Parent meetings'
    ],
    icon: Users,
    medicalAccess: false
  },

  // Team Level
  {
    role: 'head_coach',
    title: 'Head Coach',
    description: 'Team Manager - Leads and manages team operations',
    level: 'team',
    permissions: [
      'Team management',
      'Practice planning',
      'Game strategy',
      'Player development',
      'Parent communication',
      'Basic health monitoring'
    ],
    icon: UserCheck,
    medicalAccess: false
  },
  {
    role: 'assistant_coach',
    title: 'Assistant Coach',
    description: 'Limited Team Access - Supports head coach with team activities',
    level: 'team',
    permissions: [
      'Practice assistance',
      'Player instruction',
      'Equipment management',
      'Game support',
      'Basic reporting'
    ],
    icon: Users,
    medicalAccess: false
  },
  {
    role: 'athletic_training_student',
    title: 'Athletic Training Student',
    description: 'Read-only Health Data - Student learning medical protocols',
    level: 'team',
    permissions: [
      'Health data observation',
      'Learning protocols',
      'Supervised assistance',
      'Documentation review',
      'Training participation'
    ],
    icon: GraduationCap,
    medicalAccess: false // Read-only access only
  }
];

const getLevelColor = (level: string) => {
  switch (level) {
    case 'district': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'school': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'team': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export default function RoleHierarchy() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          District Athletics Role Hierarchy
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Three-tiered organizational structure for proper district athletics management with HIPAA/FERPA compliance
        </p>
      </div>

      {/* District Level */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <Shield className="mr-2 h-6 w-6 text-red-600" />
          District Level
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {roleHierarchy.filter(role => role.level === 'district').map((role) => (
            <Card key={role.role} className="border-red-200 dark:border-red-800" data-testid={`card-role-${role.role}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <role.icon className="h-5 w-5 mr-2 text-red-600" />
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getLevelColor(role.level)} data-testid={`badge-level-${role.role}`}>
                      {role.level.toUpperCase()}
                    </Badge>
                    {role.medicalAccess && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" data-testid={`badge-medical-${role.role}`}>
                        Medical Access
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Permissions:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1" data-testid={`list-permissions-${role.role}`}>
                    {role.permissions.map((permission, index) => (
                      <li key={index} className="flex items-center">
                        <Clipboard className="h-3 w-3 mr-2 text-gray-400" />
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* School Level */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <GraduationCap className="mr-2 h-6 w-6 text-blue-600" />
          School Level
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleHierarchy.filter(role => role.level === 'school').map((role) => (
            <Card key={role.role} className="border-blue-200 dark:border-blue-800" data-testid={`card-role-${role.role}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <role.icon className="h-5 w-5 mr-2 text-blue-600" />
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getLevelColor(role.level)} data-testid={`badge-level-${role.role}`}>
                      {role.level.toUpperCase()}
                    </Badge>
                    {role.medicalAccess && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" data-testid={`badge-medical-${role.role}`}>
                        Medical Access
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Permissions:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1" data-testid={`list-permissions-${role.role}`}>
                    {role.permissions.map((permission, index) => (
                      <li key={index} className="flex items-center">
                        <Clipboard className="h-3 w-3 mr-2 text-gray-400" />
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team Level */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <Users className="mr-2 h-6 w-6 text-green-600" />
          Team Level
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleHierarchy.filter(role => role.level === 'team').map((role) => (
            <Card key={role.role} className="border-green-200 dark:border-green-800" data-testid={`card-role-${role.role}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <role.icon className="h-5 w-5 mr-2 text-green-600" />
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getLevelColor(role.level)} data-testid={`badge-level-${role.role}`}>
                      {role.level.toUpperCase()}
                    </Badge>
                    {role.medicalAccess && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" data-testid={`badge-medical-${role.role}`}>
                        Medical Access
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Permissions:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1" data-testid={`list-permissions-${role.role}`}>
                    {role.permissions.map((permission, index) => (
                      <li key={index} className="flex items-center">
                        <Clipboard className="h-3 w-3 mr-2 text-gray-400" />
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Compliance Note */}
      <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          HIPAA/FERPA Compliance Notes
        </h3>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>• Medical data access is restricted to district and school-level health roles only</li>
          <li>• Athletic Training Students have read-only access for educational purposes</li>
          <li>• All medical data access is logged for compliance auditing</li>
          <li>• Student data requires FERPA agreement and organizational affiliation</li>
          <li>• Role-based permissions enforce proper data access controls</li>
        </ul>
      </div>
    </div>
  );
}