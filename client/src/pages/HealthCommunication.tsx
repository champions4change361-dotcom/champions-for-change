import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, MessageSquare, Bell, Search, Filter, AlertTriangle, Heart, CheckCircle, Clock, Phone, Video, Send, Paperclip, Users, Activity } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface HealthMessage {
  id: string;
  type: 'injury_alert' | 'clearance_update' | 'recommendation' | 'emergency' | 'routine_check';
  priority: 'low' | 'medium' | 'high' | 'critical';
  from: {
    name: string;
    role: 'athletic_trainer' | 'coach' | 'nurse' | 'doctor' | 'parent';
    school: string;
  };
  to: {
    name: string;
    role: 'athletic_trainer' | 'coach' | 'nurse' | 'doctor' | 'parent';
    school: string;
  };
  athlete: {
    name: string;
    id: string;
    grade: number;
    sport: string;
  };
  subject: string;
  message: string;
  aiInsights?: string;
  injuryPrediction?: {
    riskLevel: number;
    recommendations: string[];
  };
  attachments?: string[];
  timestamp: string;
  read: boolean;
  urgent: boolean;
  followUpRequired: boolean;
  parentNotified: boolean;
}

export default function HealthCommunication() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<HealthMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<HealthMessage | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockMessages: HealthMessage[] = [
      {
        id: '1',
        type: 'injury_alert',
        priority: 'critical',
        from: {
          name: 'Dr. Sarah Martinez',
          role: 'athletic_trainer',
          school: 'Miller High School'
        },
        to: {
          name: 'Coach Thompson',
          role: 'coach',
          school: 'Miller High School'
        },
        athlete: {
          name: 'Marcus Johnson',
          id: '543797',
          grade: 11,
          sport: 'Football'
        },
        subject: 'CRITICAL: Concussion Protocol Activated - Marcus Johnson',
        message: 'Marcus sustained a head impact during practice. Immediate removal from play initiated. Concussion protocol assessment shows Grade 2 symptoms. Requires 7-day minimum rest period with graduated return protocol. Parent contacted and medical clearance required before return.',
        aiInsights: 'AI Analysis: Based on impact data and symptom assessment, recommend extending rest period to 10 days. Previous concussion history increases risk. Monitor for delayed symptoms.',
        injuryPrediction: {
          riskLevel: 85,
          recommendations: [
            'Extend rest period to 10 days minimum',
            'Schedule neurological evaluation',
            'Implement enhanced helmet protocol',
            'Review tackling technique in practice'
          ]
        },
        timestamp: '2024-08-20T14:30:00Z',
        read: false,
        urgent: true,
        followUpRequired: true,
        parentNotified: true
      },
      {
        id: '2',
        type: 'clearance_update',
        priority: 'medium',
        from: {
          name: 'Dr. Lisa Chen',
          role: 'doctor',
          school: 'Carroll High School'
        },
        to: {
          name: 'Coach Davis',
          role: 'coach',
          school: 'Carroll High School'
        },
        athlete: {
          name: 'Sarah Williams',
          id: '354993',
          grade: 10,
          sport: 'Volleyball'
        },
        subject: 'Medical Clearance Update - Sarah Williams Knee Recovery',
        message: 'Sarah has completed her physical therapy program for her knee injury. Cleared for full volleyball activities with the following restrictions: 1) Wear knee brace during all activities, 2) Ice after practices/games, 3) Monitor for pain/swelling. Follow-up in 2 weeks.',
        aiInsights: 'AI Analysis: Recovery timeline is optimal. Recommend gradual increase in jumping activities. Monitor for fatigue patterns that could indicate re-injury risk.',
        injuryPrediction: {
          riskLevel: 25,
          recommendations: [
            'Gradual return to full jumping activities',
            'Strength training focus on supporting muscles',
            'Weekly progress monitoring',
            'Proper warm-up protocols essential'
          ]
        },
        timestamp: '2024-08-20T11:15:00Z',
        read: true,
        urgent: false,
        followUpRequired: true,
        parentNotified: true
      },
      {
        id: '3',
        type: 'recommendation',
        priority: 'high',
        from: {
          name: 'Maria Rodriguez, ATC',
          role: 'athletic_trainer',
          school: 'Ray High School'
        },
        to: {
          name: 'Coach Martinez',
          role: 'coach',
          school: 'Ray High School'
        },
        athlete: {
          name: 'Antonio Rodriguez',
          id: '362401',
          grade: 12,
          sport: 'Baseball'
        },
        subject: 'Shoulder Injury Prevention - Antonio Rodriguez',
        message: 'Based on AI analysis and recent shoulder strain, Antonio shows 75% risk for major shoulder injury. Recommend: 1) Reduce pitching load by 30%, 2) Enhanced shoulder strengthening program, 3) Biomechanical analysis of throwing motion, 4) Weekly monitoring sessions.',
        aiInsights: 'AI Analysis: Throwing velocity and shoulder stress indicators exceed safe thresholds. Previous minor strain increases re-injury probability to 75%. Immediate intervention required.',
        injuryPrediction: {
          riskLevel: 75,
          recommendations: [
            'Immediate pitching workload reduction',
            'Biomechanical throwing analysis',
            'Enhanced strength and mobility program',
            'Consider position change if patterns persist'
          ]
        },
        timestamp: '2024-08-20T09:45:00Z',
        read: false,
        urgent: false,
        followUpRequired: true,
        parentNotified: false
      },
      {
        id: '4',
        type: 'routine_check',
        priority: 'low',
        from: {
          name: 'Nurse Johnson',
          role: 'nurse',
          school: 'Veterans Memorial'
        },
        to: {
          name: 'Coach Wilson',
          role: 'coach',
          school: 'Veterans Memorial'
        },
        athlete: {
          name: 'Ashley Davis',
          id: '354765',
          grade: 9,
          sport: 'Tennis'
        },
        subject: 'Routine Health Check - Ashley Davis',
        message: 'Ashley completed her annual sports physical. All vitals normal, no restrictions. Cleared for all tennis activities. Note: Mild asthma, inhaler available as needed. Excellent fitness baseline established.',
        aiInsights: 'AI Analysis: Excellent health profile. No injury risk factors detected. Recommend maintaining current fitness regimen.',
        injuryPrediction: {
          riskLevel: 8,
          recommendations: [
            'Continue current training program',
            'Monitor for exercise-induced asthma',
            'Maintain hydration protocols',
            'Seasonal allergy awareness'
          ]
        },
        timestamp: '2024-08-19T16:20:00Z',
        read: true,
        urgent: false,
        followUpRequired: false,
        parentNotified: true
      }
    ];
    
    setMessages(mockMessages);
  }, []);

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = searchTerm === '' || 
      msg.athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.from.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || msg.type === filterType;
    const matchesPriority = filterPriority === 'all' || msg.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  const getPriorityBadge = (priority: string, urgent: boolean) => {
    const priorityConfig = {
      critical: { color: 'bg-red-100 text-red-800 border-red-200', text: 'CRITICAL' },
      high: { color: 'bg-orange-100 text-orange-800 border-orange-200', text: 'HIGH' },
      medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'MEDIUM' },
      low: { color: 'bg-green-100 text-green-800 border-green-200', text: 'LOW' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    
    return (
      <div className="flex items-center space-x-2">
        <Badge className={`${config.color} border font-medium`}>
          {config.text}
        </Badge>
        {urgent && (
          <Badge className="bg-red-500 text-white animate-pulse">
            URGENT
          </Badge>
        )}
      </div>
    );
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = {
      injury_alert: { icon: AlertTriangle, color: 'text-red-500' },
      clearance_update: { icon: CheckCircle, color: 'text-green-500' },
      recommendation: { icon: Heart, color: 'text-blue-500' },
      emergency: { icon: Phone, color: 'text-red-600' },
      routine_check: { icon: Activity, color: 'text-gray-500' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    const IconComponent = config.icon;
    
    return <IconComponent className={`w-5 h-5 ${config.color}`} />;
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    // Here would be the API call to send the reply
    console.log('Sending reply:', replyText);
    setReplyText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-green-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Health Communication</h1>
                <p className="text-xs text-green-600 dark:text-green-400">AI-Enhanced Medical Messaging</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button className="bg-red-600 hover:bg-red-700">
                <Phone className="w-4 h-4 mr-2" />
                Emergency Protocol
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Activity className="w-4 h-4 mr-2" />
                AI Health Analysis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Health Messages ({filteredMessages.length})</span>
                  <Bell className="w-5 h-5 text-orange-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="injury_alert">Injury Alert</SelectItem>
                        <SelectItem value="clearance_update">Clearance</SelectItem>
                        <SelectItem value="recommendation">Recommendation</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="routine_check">Routine</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Message List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id
                          ? 'bg-green-50 border-green-200'
                          : message.read
                          ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        {getTypeIcon(message.type)}
                        <div className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {message.athlete.name}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {message.subject}
                        </div>
                        <div className="text-xs text-gray-500">
                          From: {message.from.name}
                        </div>
                        {getPriorityBadge(message.priority, message.urgent)}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        {!message.read && (
                          <Badge className="bg-blue-500 text-white text-xs">
                            NEW
                          </Badge>
                        )}
                        {message.followUpRequired && (
                          <Badge className="bg-orange-500 text-white text-xs">
                            FOLLOW-UP
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Detail & Reply */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="space-y-6">
                {/* Message Detail */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>From: {selectedMessage.from.name} ({selectedMessage.from.role})</span>
                          <span>To: {selectedMessage.to.name} ({selectedMessage.to.role})</span>
                        </div>
                      </div>
                      {getPriorityBadge(selectedMessage.priority, selectedMessage.urgent)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Athlete Info */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Athlete Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span> {selectedMessage.athlete.name}
                        </div>
                        <div>
                          <span className="text-gray-600">ID:</span> {selectedMessage.athlete.id}
                        </div>
                        <div>
                          <span className="text-gray-600">Grade:</span> {selectedMessage.athlete.grade}
                        </div>
                        <div>
                          <span className="text-gray-600">Sport:</span> {selectedMessage.athlete.sport}
                        </div>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="prose max-w-none mb-6">
                      <p className="text-gray-900 leading-relaxed">{selectedMessage.message}</p>
                    </div>

                    {/* AI Insights */}
                    {selectedMessage.aiInsights && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                          <Activity className="w-4 h-4 mr-2" />
                          AI Health Analysis
                        </h4>
                        <p className="text-blue-800 text-sm">{selectedMessage.aiInsights}</p>
                      </div>
                    )}

                    {/* Injury Prediction */}
                    {selectedMessage.injuryPrediction && (
                      <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-orange-900 mb-3 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Injury Risk Assessment: {selectedMessage.injuryPrediction.riskLevel}%
                        </h4>
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                selectedMessage.injuryPrediction.riskLevel < 25 ? 'bg-green-500' :
                                selectedMessage.injuryPrediction.riskLevel < 50 ? 'bg-yellow-500' :
                                selectedMessage.injuryPrediction.riskLevel < 75 ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${selectedMessage.injuryPrediction.riskLevel}%` }}
                            ></div>
                          </div>
                          <div>
                            <h5 className="font-medium text-orange-900 mb-1">Recommendations:</h5>
                            <ul className="text-sm text-orange-800 space-y-1">
                              {selectedMessage.injuryPrediction.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-orange-600 mr-2">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status Indicators */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {selectedMessage.parentNotified && (
                        <Badge className="bg-green-100 text-green-800">
                          <Users className="w-3 h-3 mr-1" />
                          Parent Notified
                        </Badge>
                      )}
                      {selectedMessage.followUpRequired && (
                        <Badge className="bg-orange-100 text-orange-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Follow-up Required
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Reply Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reply</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Paperclip className="w-4 h-4 mr-2" />
                            Attach File
                          </Button>
                          <Button variant="outline" size="sm">
                            <Users className="w-4 h-4 mr-2" />
                            Notify Parent
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline">
                            Save Draft
                          </Button>
                          <Button 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleSendReply}
                            disabled={!replyText.trim()}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a message to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}