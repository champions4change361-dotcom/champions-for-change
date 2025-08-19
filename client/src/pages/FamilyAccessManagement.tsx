import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Users, 
  UserPlus, 
  UserX, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Eye,
  EyeOff,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  User,
  FileCheck,
  Ban,
  Key,
  Lock,
  Unlock,
  Camera,
  MessageSquare,
  Bell
} from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  relationship: 'parent' | 'guardian' | 'grandparent' | 'aunt_uncle' | 'sibling' | 'family_friend';
  email: string;
  phone: string;
  verificationStatus: 'pending' | 'verified' | 'denied';
  accessLevel: 'full' | 'events_only' | 'results_only' | 'none';
  canViewLocation: boolean;
  canReceiveNotifications: boolean;
  approvedBy: string;
  approvedAt?: string;
  lastActive?: string;
  emergencyContact: boolean;
}

interface Student {
  id: string;
  name: string;
  grade: string;
  school: string;
  primaryParent: string;
  familyMembers: FamilyMember[];
}

export default function FamilyAccessManagement() {
  const [selectedStudent, setSelectedStudent] = useState<string>('1');
  const [showAddMember, setShowAddMember] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<FamilyMember[]>([]);

  // Sample data - would come from database
  const students: Student[] = [
    {
      id: '1',
      name: 'Emma Martinez',
      grade: '9th Grade',
      school: 'Miller High School',
      primaryParent: 'Sarah Martinez',
      familyMembers: [
        {
          id: '1',
          name: 'Sarah Martinez',
          relationship: 'parent',
          email: 'sarah.martinez@email.com',
          phone: '(361) 555-0123',
          verificationStatus: 'verified',
          accessLevel: 'full',
          canViewLocation: true,
          canReceiveNotifications: true,
          approvedBy: 'District Athletic Director',
          approvedAt: '2025-08-01T10:00:00Z',
          lastActive: '2025-08-19T15:30:00Z',
          emergencyContact: true
        },
        {
          id: '2',
          name: 'Miguel Martinez',
          relationship: 'parent',
          email: 'miguel.martinez@email.com',
          phone: '(361) 555-0124',
          verificationStatus: 'verified',
          accessLevel: 'full',
          canViewLocation: true,
          canReceiveNotifications: true,
          approvedBy: 'Sarah Martinez',
          approvedAt: '2025-08-01T10:05:00Z',
          lastActive: '2025-08-19T14:45:00Z',
          emergencyContact: true
        },
        {
          id: '3',
          name: 'Rosa Gonzalez',
          relationship: 'aunt_uncle',
          email: 'rosa.gonzalez@email.com',
          phone: '(361) 555-0125',
          verificationStatus: 'verified',
          accessLevel: 'events_only',
          canViewLocation: false,
          canReceiveNotifications: true,
          approvedBy: 'Sarah Martinez',
          approvedAt: '2025-08-15T14:30:00Z',
          lastActive: '2025-08-19T16:00:00Z',
          emergencyContact: false
        },
        {
          id: '4',
          name: 'Carlos Martinez',
          relationship: 'grandparent',
          email: 'carlos.martinez.sr@email.com',
          phone: '(361) 555-0126',
          verificationStatus: 'pending',
          accessLevel: 'none',
          canViewLocation: false,
          canReceiveNotifications: false,
          approvedBy: '',
          emergencyContact: false
        }
      ]
    }
  ];

  const currentStudent = students.find(s => s.id === selectedStudent);

  const getRelationshipDisplay = (relationship: string) => {
    const relationships: Record<string, string> = {
      'parent': 'Parent',
      'guardian': 'Legal Guardian',
      'grandparent': 'Grandparent',
      'aunt_uncle': 'Aunt/Uncle',
      'sibling': 'Sibling (18+)',
      'family_friend': 'Family Friend'
    };
    return relationships[relationship] || relationship;
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-black"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'denied':
        return <Badge className="bg-red-500 text-white"><Ban className="h-3 w-3 mr-1" />Denied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case 'full':
        return <Badge className="bg-blue-500 text-white"><Key className="h-3 w-3 mr-1" />Full Access</Badge>;
      case 'events_only':
        return <Badge className="bg-purple-500 text-white"><Calendar className="h-3 w-3 mr-1" />Events Only</Badge>;
      case 'results_only':
        return <Badge className="bg-green-500 text-white"><Trophy className="h-3 w-3 mr-1" />Results Only</Badge>;
      case 'none':
        return <Badge className="bg-gray-500 text-white"><Lock className="h-3 w-3 mr-1" />No Access</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const approveAccess = (memberId: string, accessLevel: 'full' | 'events_only' | 'results_only') => {
    console.log(`Approving ${memberId} with ${accessLevel} access`);
  };

  const denyAccess = (memberId: string) => {
    console.log(`Denying access for ${memberId}`);
  };

  const revokeAccess = (memberId: string) => {
    console.log(`Revoking access for ${memberId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Family Access Management</h1>
              <p className="text-slate-300">Secure student location and event access control</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-400" />
              <span className="text-green-400 font-semibold">FERPA/COPPA Compliant</span>
            </div>
          </div>
        </div>

        {/* Critical Security Notice */}
        <Card className="mb-6 bg-red-500/20 border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Student Safety & Privacy Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="text-red-300 font-semibold mb-2">Security Protocols:</h4>
                <ul className="text-red-200 space-y-1">
                  <li>• Real-time location access requires parent approval</li>
                  <li>• Non-parents limited to post-event results only</li>
                  <li>• All access requests logged and audited</li>
                  <li>• Emergency contacts verified through school records</li>
                </ul>
              </div>
              <div>
                <h4 className="text-red-300 font-semibold mb-2">Who Can Grant Access:</h4>
                <ul className="text-red-200 space-y-1">
                  <li>• <strong>Parents/Legal Guardians:</strong> Full authority</li>
                  <li>• <strong>Athletic Director:</strong> Emergency verification</li>
                  <li>• <strong>Principal:</strong> Override authority</li>
                  <li>• <strong>School Nurse:</strong> Medical emergency access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="current-access" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
            <TabsTrigger value="current-access" className="data-[state=active]:bg-blue-600">
              Current Access ({currentStudent?.familyMembers.filter(m => m.verificationStatus === 'verified').length || 0})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600">
              Pending Requests ({currentStudent?.familyMembers.filter(m => m.verificationStatus === 'pending').length || 0})
            </TabsTrigger>
            <TabsTrigger value="add-member" className="data-[state=active]:bg-green-600">
              Add Family Member
            </TabsTrigger>
            <TabsTrigger value="audit-log" className="data-[state=active]:bg-purple-600">
              Audit Log
            </TabsTrigger>
          </TabsList>

          {/* Current Access Tab */}
          <TabsContent value="current-access" className="space-y-4">
            <div className="grid gap-4">
              {currentStudent?.familyMembers
                .filter(member => member.verificationStatus === 'verified')
                .map((member) => (
                <Card key={member.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg flex items-center">
                          <User className="h-4 w-4 mr-2 text-blue-400" />
                          {member.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {getRelationshipDisplay(member.relationship)}
                          {member.emergencyContact && (
                            <Badge className="ml-2 bg-orange-500/20 text-orange-400 text-xs">
                              Emergency Contact
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {getVerificationBadge(member.verificationStatus)}
                        {getAccessLevelBadge(member.accessLevel)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Contact & Access Info */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-slate-300">
                            <Mail className="h-4 w-4 mr-2 text-blue-400" />
                            <span className="text-sm">{member.email}</span>
                          </div>
                          <div className="flex items-center text-slate-300">
                            <Phone className="h-4 w-4 mr-2 text-green-400" />
                            <span className="text-sm">{member.phone}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-slate-300">
                            <Eye className="h-4 w-4 mr-2 text-purple-400" />
                            <span className="text-sm">
                              Location Access: {member.canViewLocation ? 'Allowed' : 'Denied'}
                            </span>
                          </div>
                          <div className="flex items-center text-slate-300">
                            <Bell className="h-4 w-4 mr-2 text-yellow-400" />
                            <span className="text-sm">
                              Notifications: {member.canReceiveNotifications ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Access Details */}
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-400 mb-1">Approved By:</p>
                            <p className="text-white font-semibold">{member.approvedBy}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 mb-1">Approved Date:</p>
                            <p className="text-white">
                              {member.approvedAt ? new Date(member.approvedAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 mb-1">Last Active:</p>
                            <p className="text-green-400">
                              {member.lastActive ? new Date(member.lastActive).toLocaleString() : 'Never'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Access Capabilities */}
                      <div className="space-y-2">
                        <p className="text-slate-400 font-semibold text-sm">Access Capabilities:</p>
                        <div className="flex flex-wrap gap-2">
                          {member.accessLevel === 'full' && (
                            <>
                              <Badge className="bg-blue-500/20 text-blue-400">Live Event Tracking</Badge>
                              <Badge className="bg-green-500/20 text-green-400">Real-time Notifications</Badge>
                              <Badge className="bg-purple-500/20 text-purple-400">Schedule Management</Badge>
                              {member.canViewLocation && (
                                <Badge className="bg-red-500/20 text-red-400">Location Access</Badge>
                              )}
                            </>
                          )}
                          {member.accessLevel === 'events_only' && (
                            <>
                              <Badge className="bg-purple-500/20 text-purple-400">Event Schedule Only</Badge>
                              <Badge className="bg-green-500/20 text-green-400">Results After Completion</Badge>
                            </>
                          )}
                          {member.accessLevel === 'results_only' && (
                            <Badge className="bg-green-500/20 text-green-400">Final Results Only</Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                          data-testid={`button-edit-access-${member.id}`}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Modify Access
                        </Button>
                        {member.relationship !== 'parent' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                            onClick={() => revokeAccess(member.id)}
                            data-testid={`button-revoke-${member.id}`}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Revoke Access
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-4">
              {currentStudent?.familyMembers
                .filter(member => member.verificationStatus === 'pending')
                .map((member) => (
                <Card key={member.id} className="bg-slate-800/50 border-slate-700 border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg flex items-center">
                          <User className="h-4 w-4 mr-2 text-yellow-400" />
                          {member.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Requesting {getRelationshipDisplay(member.relationship)} Access
                        </CardDescription>
                      </div>
                      {getVerificationBadge(member.verificationStatus)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
                          <p className="text-yellow-400 font-semibold">Verification Required</p>
                        </div>
                        <p className="text-yellow-300 text-sm">
                          This person has requested access to {currentStudent?.name}'s athletic information. 
                          Verify their identity and relationship before granting access.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-slate-300">
                            <Mail className="h-4 w-4 mr-2 text-blue-400" />
                            <span className="text-sm">{member.email}</span>
                          </div>
                          <div className="flex items-center text-slate-300">
                            <Phone className="h-4 w-4 mr-2 text-green-400" />
                            <span className="text-sm">{member.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => approveAccess(member.id, 'events_only')}
                          data-testid={`button-approve-events-${member.id}`}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve (Events Only)
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => approveAccess(member.id, 'full')}
                          data-testid={`button-approve-full-${member.id}`}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Approve (Full Access)
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500/10"
                          onClick={() => denyAccess(member.id)}
                          data-testid={`button-deny-${member.id}`}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {currentStudent?.familyMembers.filter(m => m.verificationStatus === 'pending').length === 0 && (
                <Card className="bg-slate-800/30 border-slate-700">
                  <CardContent className="py-16 text-center">
                    <CheckCircle2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-xl text-slate-400 mb-2">No Pending Requests</p>
                    <p className="text-slate-500">All family access requests have been processed</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Add Family Member Tab */}
          <TabsContent value="add-member" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-green-400" />
                  Add Authorized Family Member
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Grant access to family members for {currentStudent?.name}'s athletic information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input placeholder="Full Name" className="bg-slate-700 border-slate-600 text-white" />
                    <select className="bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2">
                      <option value="">Select Relationship</option>
                      <option value="parent">Parent</option>
                      <option value="guardian">Legal Guardian</option>
                      <option value="grandparent">Grandparent</option>
                      <option value="aunt_uncle">Aunt/Uncle</option>
                      <option value="sibling">Sibling (18+)</option>
                      <option value="family_friend">Family Friend</option>
                    </select>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input placeholder="Email Address" type="email" className="bg-slate-700 border-slate-600 text-white" />
                    <Input placeholder="Phone Number" type="tel" className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                  
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                    <h4 className="text-blue-400 font-semibold mb-2">Access Level Selection:</h4>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm text-slate-300">
                        <input type="radio" name="access" value="results_only" className="mr-2" />
                        <span><strong>Results Only:</strong> View final results after events complete (Recommended for extended family)</span>
                      </label>
                      <label className="flex items-center text-sm text-slate-300">
                        <input type="radio" name="access" value="events_only" className="mr-2" />
                        <span><strong>Events Only:</strong> View schedules and results, no real-time location</span>
                      </label>
                      <label className="flex items-center text-sm text-slate-300">
                        <input type="radio" name="access" value="full" className="mr-2" />
                        <span><strong>Full Access:</strong> Real-time tracking and notifications (Parents/Guardians only)</span>
                      </label>
                    </div>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Access Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit-log" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileCheck className="h-5 w-5 mr-2 text-purple-400" />
                  Family Access Audit Trail
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Complete log of all access requests, approvals, and modifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">Rosa Gonzalez access approved</p>
                        <p className="text-slate-400 text-sm">Granted "Events Only" access by Sarah Martinez</p>
                      </div>
                      <span className="text-slate-500 text-sm">Aug 15, 2:30 PM</span>
                    </div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">Miguel Martinez verified</p>
                        <p className="text-slate-400 text-sm">Co-parent verification completed through school records</p>
                      </div>
                      <span className="text-slate-500 text-sm">Aug 1, 10:05 AM</span>
                    </div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">Sarah Martinez registered</p>
                        <p className="text-slate-400 text-sm">Primary parent account established by District Athletic Director</p>
                      </div>
                      <span className="text-slate-500 text-sm">Aug 1, 10:00 AM</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}