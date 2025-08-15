import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Send, AlertTriangle, User, Clock } from "lucide-react";

export default function HealthCommunicationHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [priority, setPriority] = useState<string>("medium");

  const isCoach = user?.userRole === 'head_coach' || user?.userRole === 'assistant_coach';
  const isTrainer = user?.userRole === 'school_athletic_trainer' || user?.userRole === 'district_head_athletic_trainer';

  // Fetch communication threads
  const { data: threads, isLoading: threadsLoading } = useQuery({
    queryKey: ['/api/health-communications/threads'],
    enabled: !!user?.id
  });

  // Fetch messages for selected thread
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/health-communications/messages', selectedThread],
    enabled: !!selectedThread
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { threadId: string; message: string; priority: string }) => {
      return await apiRequest('/api/health-communications/send', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/health-communications/messages', selectedThread] });
      queryClient.invalidateQueries({ queryKey: ['/api/health-communications/threads'] });
      setNewMessage("");
      toast({
        title: "Message Sent",
        description: "Your message has been delivered successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Send",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  if (threadsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">Loading communications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Health Communication Hub</h1>
            <p className="text-slate-600">Secure communication between coaches and athletic trainers</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            data-testid="button-back"
          >
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Communication Threads */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Active Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {threads?.map((thread: any) => (
                  <div 
                    key={thread.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedThread === thread.id ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedThread(thread.id)}
                    data-testid={`thread-${thread.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{thread.studentName}</h4>
                        <p className="text-xs text-slate-600">{thread.teamName}</p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            thread.priority === 'critical' ? 'destructive' :
                            thread.priority === 'high' ? 'secondary' :
                            'outline'
                          }
                          className="text-xs"
                        >
                          {thread.priority}
                        </Badge>
                        {thread.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center mt-1">
                            {thread.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">{thread.subject}</p>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>
                        {isCoach ? `Trainer: ${thread.trainerName}` : `Coach: ${thread.coachName}`}
                      </span>
                      <span>{thread.lastMessageTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="lg:col-span-2">
            {selectedThread ? (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {threads?.find(t => t.id === selectedThread)?.studentName} - Health Communication
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    Team: {threads?.find(t => t.id === selectedThread)?.teamName}
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Messages */}
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {messagesLoading ? (
                      <div className="text-center py-4">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    ) : (
                      messages?.map((message: any) => (
                        <div 
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.senderId === user?.id 
                              ? 'bg-blue-100 ml-8' 
                              : 'bg-slate-100 mr-8'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{message.senderName}</span>
                              <Badge variant="outline" className="text-xs">
                                {message.senderRole.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />
                              {message.timestamp}
                            </div>
                          </div>
                          <p className="text-sm mb-2">{message.content}</p>
                          {message.priority !== 'medium' && (
                            <Badge 
                              variant={message.priority === 'critical' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {message.priority.toUpperCase()} PRIORITY
                            </Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="border-t pt-4">
                    <div className="flex gap-2 mb-3">
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here..."
                        rows={3}
                        data-testid="textarea-message"
                      />
                      <Button
                        onClick={() => sendMessageMutation.mutate({
                          threadId: selectedThread,
                          message: newMessage,
                          priority
                        })}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        data-testid="button-send-message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-slate-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to view messages</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isTrainer && (
                <>
                  <Button 
                    className="h-16"
                    onClick={() => window.location.href = '/new-health-alert'}
                    data-testid="button-new-alert"
                  >
                    <div className="text-center">
                      <AlertTriangle className="h-6 w-6 mx-auto mb-1" />
                      Create Health Alert
                    </div>
                  </Button>
                  <Button 
                    className="h-16"
                    onClick={() => window.location.href = '/clearance-notifications'}
                    data-testid="button-clearance-notifications"
                  >
                    <div className="text-center">
                      <User className="h-6 w-6 mx-auto mb-1" />
                      Send Clearance Update
                    </div>
                  </Button>
                </>
              )}
              {isCoach && (
                <Button 
                  className="h-16"
                  onClick={() => window.location.href = '/request-health-consultation'}
                  data-testid="button-request-consultation"
                >
                  <div className="text-center">
                    <MessageSquare className="h-6 w-6 mx-auto mb-1" />
                    Request Health Consultation
                  </div>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}