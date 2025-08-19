import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Users, 
  FileText,
  Calendar,
  Bell,
  UserPlus,
  Send,
  Paperclip,
  Video,
  Phone,
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  Star
} from "lucide-react";

interface Message {
  id: string;
  sender: {
    name: string;
    avatar: string;
    role: string;
    isOnline: boolean;
  };
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'announcement' | 'task';
  isRead: boolean;
  attachments?: {
    name: string;
    type: string;
    size: string;
  }[];
}

interface CollaborationChannel {
  id: string;
  name: string;
  type: 'team' | 'direct' | 'announcement';
  members: number;
  unreadCount: number;
  lastActivity: string;
  isPrivate: boolean;
}

export function CollaborationTools() {
  const [selectedChannel, setSelectedChannel] = useState('coaching-staff');
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const mockChannels: CollaborationChannel[] = [
    {
      id: 'coaching-staff',
      name: 'Coaching Staff',
      type: 'team',
      members: 12,
      unreadCount: 3,
      lastActivity: '5 minutes ago',
      isPrivate: false
    },
    {
      id: 'athletic-trainers',
      name: 'Athletic Trainers',
      type: 'team',
      members: 8,
      unreadCount: 1,
      lastActivity: '15 minutes ago',
      isPrivate: false
    },
    {
      id: 'tournament-organizers',
      name: 'Tournament Organizers',
      type: 'team',
      members: 25,
      unreadCount: 7,
      lastActivity: '2 hours ago',
      isPrivate: false
    },
    {
      id: 'announcements',
      name: 'Announcements',
      type: 'announcement',
      members: 45,
      unreadCount: 0,
      lastActivity: '1 day ago',
      isPrivate: false
    }
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      sender: {
        name: 'Coach Martinez',
        avatar: '/api/placeholder/32/32',
        role: 'Head Coach',
        isOnline: true
      },
      content: 'Great practice today everyone! The team\'s energy was fantastic. Let\'s keep this momentum going into the tournament.',
      timestamp: '10:30 AM',
      type: 'text',
      isRead: true
    },
    {
      id: '2',
      sender: {
        name: 'Athletic Trainer Chen',
        avatar: '/api/placeholder/32/32',
        role: 'Athletic Trainer',
        isOnline: true
      },
      content: 'Quick reminder: Player #23 needs ice treatment post-practice. Also attached the updated injury report.',
      timestamp: '10:25 AM',
      type: 'file',
      isRead: true,
      attachments: [
        {
          name: 'weekly-injury-report.pdf',
          type: 'PDF',
          size: '2.3 MB'
        }
      ]
    },
    {
      id: '3',
      sender: {
        name: 'Assistant Coach Johnson',
        avatar: '/api/placeholder/32/32',
        role: 'Assistant Coach',
        isOnline: false
      },
      content: 'Can we schedule a strategy meeting for tomorrow? I have some ideas for the upcoming district championship.',
      timestamp: '9:45 AM',
      type: 'text',
      isRead: false
    },
    {
      id: '4',
      sender: {
        name: 'Team Captain Davis',
        avatar: '/api/placeholder/32/32',
        role: 'Team Captain',
        isOnline: true
      },
      content: 'Team dinner tonight at 7 PM. Location shared in the team calendar. Looking forward to seeing everyone!',
      timestamp: '9:15 AM',
      type: 'announcement',
      isRead: false
    }
  ];

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'team': return Users;
      case 'direct': return MessageSquare;
      case 'announcement': return Bell;
      default: return Users;
    }
  };

  return (
    <div className="flex h-full max-h-96 border rounded-lg overflow-hidden">
      {/* Channel Sidebar */}
      <div className="w-64 bg-gray-50 border-r">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Collaboration</h3>
          <div className="flex items-center space-x-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 text-xs h-7"
              />
            </div>
            <Button size="sm" className="h-7 px-2">
              <UserPlus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto">
          {mockChannels
            .filter(channel => 
              channel.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((channel) => {
              const Icon = getChannelIcon(channel.type);
              return (
                <div
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`p-3 cursor-pointer hover:bg-gray-100 border-b transition-colors ${
                    selectedChannel === channel.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium truncate">{channel.name}</span>
                    </div>
                    {channel.unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">
                        {channel.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                    <span>{channel.members} members</span>
                    <span>{channel.lastActivity}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <h4 className="font-semibold text-sm">
                {mockChannels.find(c => c.id === selectedChannel)?.name}
              </h4>
              <Badge variant="secondary" className="text-xs">
                {mockChannels.find(c => c.id === selectedChannel)?.members} members
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Video className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockMessages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender.avatar} />
                <AvatarFallback className="text-xs">
                  {message.sender.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{message.sender.name}</span>
                  <Badge variant="outline" className="text-xs">{message.sender.role}</Badge>
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                  {message.sender.isOnline && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </div>
                
                <div className="mt-1">
                  <p className="text-sm text-gray-700">{message.content}</p>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-xs">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{attachment.name}</span>
                          <span className="text-gray-500">({attachment.size})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {message.type === 'announcement' && (
                  <div className="mt-2">
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      <Bell className="h-3 w-3 mr-1" />
                      Team Announcement
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {!message.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Star className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Paperclip className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}