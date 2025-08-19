import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar,
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  ArrowLeftRight,
  MapPin,
  Trophy,
  MessageSquare,
  Bell,
  Filter,
  Plus,
  Edit3,
  Eye,
  School,
  Target,
  Timer
} from 'lucide-react';

interface ScorekeeperAssignment {
  id: string;
  eventId: string;
  eventName: string;
  eventType: 'throwing' | 'running' | 'jumping' | 'field';
  date: string;
  time: string;
  location: string;
  division: 'boys' | 'girls' | 'mixed';
  level: 'middle_school' | 'high_school' | 'junior_varsity' | 'varsity';
  assignedCoach: string;
  assignedCoachId: string;
  assignedCoachSchool: string;
  status: 'open' | 'assigned' | 'confirmed' | 'completed';
  canSwap: boolean;
  swapRequests: SwapRequest[];
  notes?: string;
  athleticCoordinator: string;
  createdBy: string;
}

interface SwapRequest {
  id: string;
  requestedBy: string;
  requestedByName: string;
  requestedBySchool: string;
  targetAssignmentId: string;
  targetAssignmentName: string;
  targetDate: string;
  targetTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
  respondedAt?: string;
}

interface Coach {
  id: string;
  name: string;
  school: string;
  email: string;
  phone: string;
  specialties: string[];
  availability: string[];
}

export default function ScorekeeperScheduling() {
  const [selectedView, setSelectedView] = useState<'available' | 'my-assignments' | 'swap-requests'>('available');
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');

  // Sample data - would come from database
  const currentCoach: Coach = {
    id: 'coach-1',
    name: 'Coach Thornton',
    school: 'Miller Middle School',
    email: 'thornton@miller.edu',
    phone: '(361) 555-0100',
    specialties: ['throwing', 'field'],
    availability: ['weekday_afternoon', 'weekend_morning']
  };

  const assignments: ScorekeeperAssignment[] = [
    {
      id: 'assign-1',
      eventId: 'event-1',
      eventName: 'Discus Throw',
      eventType: 'throwing',
      date: '2025-04-17',
      time: '5:30 PM',
      location: 'Miller High School Track Complex',
      division: 'girls',
      level: 'middle_school',
      assignedCoach: 'Coach Thornton',
      assignedCoachId: 'coach-1',
      assignedCoachSchool: 'Miller Middle School',
      status: 'assigned',
      canSwap: true,
      swapRequests: [],
      notes: 'Familiar with discus equipment and safety protocols',
      athleticCoordinator: 'Ms. Rodriguez',
      createdBy: 'coord-1'
    },
    {
      id: 'assign-2',
      eventId: 'event-2',
      eventName: 'Boys Track Meet',
      eventType: 'running',
      date: '2025-04-18',
      time: '5:30 PM',
      location: 'Carroll High School',
      division: 'boys',
      level: 'middle_school',
      assignedCoach: 'Coach Lopez',
      assignedCoachId: 'coach-2',
      assignedCoachSchool: 'Carroll Middle School',
      status: 'assigned',
      canSwap: true,
      swapRequests: [
        {
          id: 'swap-1',
          requestedBy: 'coach-2',
          requestedByName: 'Coach Lopez',
          requestedBySchool: 'Carroll Middle School',
          targetAssignmentId: 'assign-1',
          targetAssignmentName: 'Discus Throw - Girls (April 17)',
          targetDate: '2025-04-17',
          targetTime: '5:30 PM',
          reason: 'Family commitment on April 18th, April 17th works better for my schedule',
          status: 'pending',
          requestedAt: '2025-08-19T10:30:00Z'
        }
      ],
      athleticCoordinator: 'Mr. Thompson',
      createdBy: 'coord-2'
    },
    {
      id: 'assign-3',
      eventId: 'event-3',
      eventName: 'Shot Put',
      eventType: 'throwing',
      date: '2025-04-19',
      time: '3:00 PM',
      location: 'Veterans Memorial Stadium',
      division: 'mixed',
      level: 'middle_school',
      assignedCoach: '',
      assignedCoachId: '',
      assignedCoachSchool: '',
      status: 'open',
      canSwap: false,
      swapRequests: [],
      athleticCoordinator: 'Ms. Rodriguez',
      createdBy: 'coord-1'
    },
    {
      id: 'assign-4',
      eventId: 'event-4',
      eventName: 'Long Jump',
      eventType: 'jumping',
      date: '2025-04-20',
      time: '4:15 PM',
      location: 'Ray High School',
      division: 'girls',
      level: 'middle_school',
      assignedCoach: '',
      assignedCoachId: '',
      assignedCoachSchool: '',
      status: 'open',
      canSwap: false,
      swapRequests: [],
      athleticCoordinator: 'Mr. Davis',
      createdBy: 'coord-3'
    }
  ];

  const myAssignments = assignments.filter(a => a.assignedCoachId === currentCoach.id);
  const availableAssignments = assignments.filter(a => a.status === 'open');
  const pendingSwapRequests = assignments.flatMap(a => 
    a.swapRequests.filter(sr => 
      sr.status === 'pending' && 
      (sr.requestedBy === currentCoach.id || a.assignedCoachId === currentCoach.id)
    )
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-500 text-white"><Plus className="h-3 w-3 mr-1" />Available</Badge>;
      case 'assigned':
        return <Badge className="bg-blue-500 text-white"><UserCheck className="h-3 w-3 mr-1" />Assigned</Badge>;
      case 'confirmed':
        return <Badge className="bg-purple-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500 text-white"><Trophy className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDivisionIcon = (division: string, level: string) => {
    const color = division === 'girls' ? 'text-pink-400' : division === 'boys' ? 'text-blue-400' : 'text-purple-400';
    return <School className={`h-4 w-4 ${color}`} />;
  };

  const requestSwap = (assignmentId: string, targetAssignmentId: string) => {
    console.log(`Requesting swap from ${assignmentId} to ${targetAssignmentId}`);
  };

  const signUpForAssignment = (assignmentId: string) => {
    console.log(`Signing up for assignment ${assignmentId}`);
  };

  const approveSwap = (swapRequestId: string) => {
    console.log(`Approving swap request ${swapRequestId}`);
  };

  const denySwap = (swapRequestId: string) => {
    console.log(`Denying swap request ${swapRequestId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Scorekeeper Scheduling</h1>
              <p className="text-slate-300">Manage your assignments and coordinate swaps with other coaches</p>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">{currentCoach.name}</p>
              <p className="text-slate-300 text-sm">{currentCoach.school}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">My Assignments</p>
                  <p className="text-2xl font-bold text-white">{myAssignments.length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Available Events</p>
                  <p className="text-2xl font-bold text-white">{availableAssignments.length}</p>
                </div>
                <Plus className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Pending Swaps</p>
                  <p className="text-2xl font-bold text-white">{pendingSwapRequests.length}</p>
                </div>
                <ArrowLeftRight className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">This Month</p>
                  <p className="text-2xl font-bold text-white">8</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
            <TabsTrigger value="available" className="data-[state=active]:bg-green-600">
              Available Events ({availableAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="my-assignments" className="data-[state=active]:bg-blue-600">
              My Assignments ({myAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="swap-requests" className="data-[state=active]:bg-orange-600">
              Swap Requests ({pendingSwapRequests.length})
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-600">
              Calendar View
            </TabsTrigger>
          </TabsList>

          {/* Available Events */}
          <TabsContent value="available" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Available Scorekeeper Assignments</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-slate-600 text-white hover:bg-slate-700 hover:text-white bg-slate-800">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {availableAssignments.map((assignment) => (
                <Card key={assignment.id} className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg flex items-center">
                          {getDivisionIcon(assignment.division, assignment.level)}
                          <span className="ml-2">{assignment.eventName}</span>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {assignment.division === 'girls' ? 'Girls' : assignment.division === 'boys' ? 'Boys' : 'Mixed'} {' '}
                          {assignment.level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </CardDescription>
                      </div>
                      {getStatusBadge(assignment.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center text-white">
                          <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                          <div>
                            <p className="font-semibold text-white">{new Date(assignment.date).toLocaleDateString()}</p>
                            <p className="text-sm text-slate-300">{assignment.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-white">
                          <MapPin className="h-4 w-4 mr-2 text-red-400" />
                          <div>
                            <p className="font-semibold text-white">{assignment.location}</p>
                            <p className="text-sm text-slate-300">{assignment.eventType.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-white">
                          <Users className="h-4 w-4 mr-2 text-purple-400" />
                          <div>
                            <p className="font-semibold text-white">{assignment.athleticCoordinator}</p>
                            <p className="text-sm text-slate-300">Athletic Coordinator</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => signUpForAssignment(assignment.id)}
                          data-testid={`button-signup-${assignment.id}`}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Sign Up
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-slate-600 text-white hover:bg-slate-700 hover:text-white bg-slate-800"
                          data-testid={`button-details-${assignment.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {availableAssignments.length === 0 && (
                <Card className="bg-slate-800/30 border-slate-700">
                  <CardContent className="py-16 text-center">
                    <CheckCircle2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-xl text-slate-400 mb-2">All Events Assigned</p>
                    <p className="text-slate-500">No available scorekeeper assignments at this time</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* My Assignments */}
          <TabsContent value="my-assignments" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">My Scorekeeper Assignments</h2>
            </div>

            <div className="grid gap-4">
              {myAssignments.map((assignment) => (
                <Card key={assignment.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg flex items-center">
                          {getDivisionIcon(assignment.division, assignment.level)}
                          <span className="ml-2">{assignment.eventName}</span>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          You are assigned as scorekeeper for this event
                        </CardDescription>
                      </div>
                      {getStatusBadge(assignment.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center text-white">
                          <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                          <div>
                            <p className="font-semibold text-white">{new Date(assignment.date).toLocaleDateString()}</p>
                            <p className="text-sm text-slate-300">{assignment.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-white">
                          <MapPin className="h-4 w-4 mr-2 text-red-400" />
                          <div>
                            <p className="font-semibold text-white">{assignment.location}</p>
                            <p className="text-sm text-slate-300">{assignment.eventType.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-white">
                          <Target className="h-4 w-4 mr-2 text-green-400" />
                          <div>
                            <p className="font-semibold text-white">{assignment.division === 'girls' ? 'Girls' : assignment.division === 'boys' ? 'Boys' : 'Mixed'}</p>
                            <p className="text-sm text-slate-300">{assignment.level.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </div>

                      {assignment.notes && (
                        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
                          <p className="text-blue-300 text-sm">{assignment.notes}</p>
                        </div>
                      )}

                      {/* Swap Requests for this assignment */}
                      {assignment.swapRequests.length > 0 && (
                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                          <h4 className="text-yellow-300 font-semibold mb-2">Incoming Swap Request</h4>
                          {assignment.swapRequests.map((swap) => (
                            <div key={swap.id} className="space-y-2">
                              <p className="text-yellow-200 text-sm">
                                <strong>{swap.requestedByName}</strong> from {swap.requestedBySchool} wants to swap their 
                                <strong> {swap.targetAssignmentName}</strong> assignment with your assignment.
                              </p>
                              <p className="text-yellow-300 text-sm italic">Reason: {swap.reason}</p>
                              <div className="flex gap-2 mt-2">
                                <Button 
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => approveSwap(swap.id)}
                                  data-testid={`button-approve-swap-${swap.id}`}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Approve Swap
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-400 hover:bg-red-500/10"
                                  onClick={() => denySwap(swap.id)}
                                  data-testid={`button-deny-swap-${swap.id}`}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {assignment.canSwap && (
                          <Button 
                            variant="outline"
                            className="border-orange-500 text-orange-300 hover:bg-orange-500/20 hover:text-white bg-slate-800"
                            onClick={() => {
                              setSelectedAssignment(assignment.id);
                              setShowSwapDialog(true);
                            }}
                            data-testid={`button-request-swap-${assignment.id}`}
                          >
                            <ArrowLeftRight className="h-4 w-4 mr-2" />
                            Request Swap
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          className="border-blue-500 text-blue-300 hover:bg-blue-500/20 hover:text-white bg-slate-800"
                          data-testid={`button-event-details-${assignment.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Event Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Swap Requests */}
          <TabsContent value="swap-requests" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Swap Requests</h2>
            </div>

            <div className="space-y-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <ArrowLeftRight className="h-5 w-5 mr-2 text-orange-400" />
                    How Swapping Works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Requesting a Swap:</h4>
                      <ul className="text-white text-sm space-y-1">
                        <li>• Find the assignment you want to swap with</li>
                        <li>• Send a swap request with your reason</li>
                        <li>• The other coach can approve or decline</li>
                        <li>• Athletic Coordinator gets notified of approved swaps</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Swap Guidelines:</h4>
                      <ul className="text-white text-sm space-y-1">
                        <li>• Swaps must be approved 48 hours before event</li>
                        <li>• Both coaches must be qualified for the event type</li>
                        <li>• Emergency swaps require coordinator approval</li>
                        <li>• All swaps are logged for record keeping</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {pendingSwapRequests.length > 0 ? (
                pendingSwapRequests.map((swap) => (
                  <Card key={swap.id} className="bg-slate-800/50 border-slate-700 border-l-4 border-l-orange-500">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-semibold">Swap Request</h3>
                          <Badge className="bg-orange-500/20 text-orange-400">Pending</Badge>
                        </div>
                        <p className="text-white">
                          <strong>{swap.requestedByName}</strong> from {swap.requestedBySchool} wants to swap assignments
                        </p>
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <p className="text-white text-sm mb-2"><strong>Their Assignment:</strong> {swap.targetAssignmentName}</p>
                          <p className="text-white text-sm mb-2"><strong>Your Assignment:</strong> Discus Throw - Girls (April 17, 5:30 PM)</p>
                          <p className="text-white text-sm"><strong>Reason:</strong> {swap.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => approveSwap(swap.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve Swap
                          </Button>
                          <Button 
                            variant="outline"
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                            onClick={() => denySwap(swap.id)}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-slate-800/30 border-slate-700">
                  <CardContent className="py-16 text-center">
                    <ArrowLeftRight className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-xl text-slate-400 mb-2">No Pending Swaps</p>
                    <p className="text-slate-500">All swap requests have been processed</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-400" />
                  April 2025 Scorekeeper Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-slate-400 font-semibold p-2">
                      {day}
                    </div>
                  ))}
                  {/* Calendar days would be generated here */}
                  <div className="text-center text-slate-500 p-2">30</div>
                  <div className="text-center text-slate-500 p-2">31</div>
                  <div className="text-center text-slate-500 p-2">1</div>
                  <div className="text-center text-slate-500 p-2">2</div>
                  <div className="text-center text-slate-500 p-2">3</div>
                  <div className="text-center text-slate-500 p-2">4</div>
                  <div className="text-center text-slate-500 p-2">5</div>
                  {/* Row 2 */}
                  <div className="text-center text-slate-500 p-2">6</div>
                  <div className="text-center text-slate-500 p-2">7</div>
                  <div className="text-center text-slate-500 p-2">8</div>
                  <div className="text-center text-slate-500 p-2">9</div>
                  <div className="text-center text-slate-500 p-2">10</div>
                  <div className="text-center text-slate-500 p-2">11</div>
                  <div className="text-center text-slate-500 p-2">12</div>
                  {/* Row 3 */}
                  <div className="text-center text-slate-500 p-2">13</div>
                  <div className="text-center text-slate-500 p-2">14</div>
                  <div className="text-center text-slate-500 p-2">15</div>
                  <div className="text-center text-slate-500 p-2">16</div>
                  <div className="bg-blue-500/20 border border-blue-500 rounded text-center text-white p-2">
                    <div className="text-sm font-bold">17</div>
                    <div className="text-xs">Discus 5:30</div>
                  </div>
                  <div className="bg-orange-500/20 border border-orange-500 rounded text-center text-white p-2">
                    <div className="text-sm font-bold">18</div>
                    <div className="text-xs">Swap Request</div>
                  </div>
                  <div className="bg-green-500/20 border border-green-500 rounded text-center text-white p-2">
                    <div className="text-sm font-bold">19</div>
                    <div className="text-xs">Available</div>
                  </div>
                  {/* Row 4 */}
                  <div className="bg-green-500/20 border border-green-500 rounded text-center text-white p-2">
                    <div className="text-sm font-bold">20</div>
                    <div className="text-xs">Available</div>
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500/20 border border-blue-500 rounded mr-2"></div>
                    <span className="text-white">My Assignments</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500/20 border border-green-500 rounded mr-2"></div>
                    <span className="text-white">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-500/20 border border-orange-500 rounded mr-2"></div>
                    <span className="text-white">Swap Requests</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Swap Request Dialog */}
        <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Request Assignment Swap</DialogTitle>
              <DialogDescription className="text-slate-400">
                Find another coach to swap assignments with
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Select assignment to swap with:</label>
                <select className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2">
                  <option value="" className="bg-slate-700 text-white">Choose an assignment...</option>
                  <option value="assign-2" className="bg-slate-700 text-white">Coach Lopez - Boys Track Meet (April 18, 5:30 PM)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Reason for swap:</label>
                <textarea 
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 h-20"
                  placeholder="Explain why you need to swap assignments..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSwapDialog(false)}>
                  Cancel
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Send Swap Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}