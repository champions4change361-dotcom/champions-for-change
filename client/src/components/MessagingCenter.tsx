import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Bell, 
  Calendar, 
  DollarSign,
  Trophy,
  AlertCircle,
  Smartphone,
  Mail,
  Clock,
  CheckCircle
} from 'lucide-react';

interface MessagingCenterProps {
  userRole: string;
  messageLimit: number;
  messagesUsed: number;
  tournaments: Array<{ id: string; name: string }>;
  teams: Array<{ id: string; name: string; tournamentName: string }>;
}

export function MessagingCenter({
  userRole,
  messageLimit,
  messagesUsed,
  tournaments,
  teams
}: MessagingCenterProps) {
  const [messageType, setMessageType] = useState<string>('team_notification');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<string>('normal');
  const [selectedTournament, setSelectedTournament] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [targetRoles, setTargetRoles] = useState<string[]>(['coach']);
  const [scheduledFor, setScheduledFor] = useState('');
  const [sendPushNotification, setSendPushNotification] = useState(true);

  const messageTypes = [
    { value: 'tournament_update', label: 'Tournament Update', icon: Trophy },
    { value: 'team_notification', label: 'Team Notification', icon: Users },
    { value: 'payment_reminder', label: 'Payment Reminder', icon: DollarSign },
    { value: 'document_deadline', label: 'Document Deadline', icon: AlertCircle },
    { value: 'game_schedule', label: 'Game Schedule', icon: Calendar },
    { value: 'broadcast', label: 'Broadcast Message', icon: Bell },
  ];

  const targetRoleOptions = [
    { value: 'coach', label: 'Coaches' },
    { value: 'parent', label: 'Parents' },
    { value: 'player', label: 'Players' },
    { value: 'scorekeeper', label: 'Scorekeepers' }
  ];

  const usagePercentage = (messagesUsed / messageLimit) * 100;
  const remainingMessages = messageLimit - messagesUsed;

  const getMessageTemplate = (type: string) => {
    const templates = {
      tournament_update: {
        subject: 'Tournament Update: [Tournament Name]',
        content: 'Important update regarding your upcoming tournament...'
      },
      team_notification: {
        subject: 'Team Update: [Team Name]',
        content: 'Team notification for upcoming games and events...'
      },
      payment_reminder: {
        subject: 'Payment Reminder - Registration Fee Due',
        content: 'This is a friendly reminder that your registration fee is due...'
      },
      document_deadline: {
        subject: 'Document Deadline Approaching',
        content: 'Please ensure all required documents are submitted by...'
      },
      game_schedule: {
        subject: 'Game Schedule Released',
        content: 'Your game schedule has been finalized...'
      },
      broadcast: {
        subject: 'Important Announcement',
        content: 'We wanted to share this important information with everyone...'
      }
    };
    return templates[type] || { subject: '', content: '' };
  };

  const handleMessageTypeChange = (type: string) => {
    setMessageType(type);
    const template = getMessageTemplate(type);
    setSubject(template.subject);
    setContent(template.content);
  };

  const handleSend = () => {
    // Implementation for sending message
    console.log('Sending message:', {
      messageType,
      subject,
      content,
      priority,
      selectedTournament,
      selectedTeam,
      targetRoles,
      scheduledFor,
      sendPushNotification
    });
  };

  return (
    <div className="space-y-6" data-testid="messaging-center">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messaging Center
          </CardTitle>
          <CardDescription>
            Send notifications to coaches, parents, and players
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Usage Tracking */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Monthly Message Usage</span>
              <span className="text-sm text-gray-600">
                {messagesUsed} / {messageLimit} messages
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{remainingMessages} messages remaining</span>
              <span className={usagePercentage > 90 ? 'text-red-500 font-medium' : ''}>
                {Math.round(usagePercentage)}% used
              </span>
            </div>
            {usagePercentage > 90 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You're approaching your message limit. Consider upgrading for unlimited messaging.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Composer */}
      <Card>
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
          <CardDescription>
            Create and send notifications with mobile push notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message Type Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Message Type</Label>
              <Select value={messageType} onValueChange={handleMessageTypeChange}>
                <SelectTrigger data-testid="select-message-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {messageTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority Level</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger data-testid="select-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tournament/Team Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Tournament (Optional)</Label>
              <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                <SelectTrigger data-testid="select-tournament">
                  <SelectValue placeholder="Select tournament" />
                </SelectTrigger>
                <SelectContent>
                  {tournaments.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Team (Optional)</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger data-testid="select-team">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} - {team.tournamentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <Label>Send To</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {targetRoleOptions.map((role) => (
                <div key={role.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={role.value}
                    checked={targetRoles.includes(role.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTargetRoles([...targetRoles, role.value]);
                      } else {
                        setTargetRoles(targetRoles.filter(r => r !== role.value));
                      }
                    }}
                    data-testid={`checkbox-${role.value}`}
                  />
                  <Label htmlFor={role.value} className="text-sm">
                    {role.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-4">
            <div>
              <Label>Subject Line</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
                maxLength={100}
                data-testid="input-subject"
              />
              <div className="text-xs text-gray-500 mt-1">
                {subject.length}/100 characters
              </div>
            </div>

            <div>
              <Label>Message Content</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your message content"
                rows={6}
                maxLength={1000}
                data-testid="textarea-content"
              />
              <div className="text-xs text-gray-500 mt-1">
                {content.length}/1000 characters
              </div>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="push-notification"
                checked={sendPushNotification}
                onCheckedChange={setSendPushNotification}
                data-testid="checkbox-push-notification"
              />
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <Label htmlFor="push-notification">Send mobile push notification</Label>
              </div>
            </div>

            <div>
              <Label>Schedule Message (Optional)</Label>
              <Input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                data-testid="input-schedule"
              />
              <div className="text-xs text-gray-500 mt-1">
                Leave empty to send immediately
              </div>
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              {scheduledFor ? (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Scheduled for {new Date(scheduledFor).toLocaleString()}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Send className="h-4 w-4" />
                  Will be sent immediately
                </div>
              )}
            </div>
            
            <Button
              onClick={handleSend}
              disabled={!subject || !content || targetRoles.length === 0 || remainingMessages <= 0}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4 mr-2" />
              {scheduledFor ? 'Schedule Message' : 'Send Message'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile App Features Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile App Notifications
          </CardTitle>
          <CardDescription>
            Your messages will be delivered via push notifications on mobile devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">iOS & Android Features:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Push notifications with custom sounds
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Badge counts for unread messages
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Rich media notifications with images
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Quick actions (Reply, Mark Read)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3">User Preferences:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Quiet hours (no notifications 10pm-8am)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Message type preferences
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Tournament-specific notifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Priority level filtering
                </li>
              </ul>
            </div>
          </div>

          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              <strong>Coming Soon:</strong> Tournament Empire mobile apps for iOS and Android with 
              white-label branding for Enterprise clients. Users will receive push notifications 
              directly from your branded tournament app.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}