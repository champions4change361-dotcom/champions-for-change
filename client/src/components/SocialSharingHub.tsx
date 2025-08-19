import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Share2, 
  Users, 
  MessageCircle, 
  Heart,
  Trophy,
  Camera,
  Video,
  Calendar,
  MapPin,
  Copy,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  UserPlus,
  Bell,
  Hash,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Eye,
  Download
} from "lucide-react";

interface SocialPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    school?: string;
  };
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    caption?: string;
  }[];
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  tournament?: {
    name: string;
    sport: string;
    location: string;
    date: string;
  };
  tags: string[];
  isLiked: boolean;
  isBookmarked: boolean;
}

interface SocialSharingHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SocialSharingHub({ isOpen, onClose }: SocialSharingHubProps) {
  const [activeTab, setActiveTab] = useState('feed');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('');
  const [postTags, setPostTags] = useState<string[]>([]);

  const mockPosts: SocialPost[] = [
    {
      id: '1',
      author: {
        name: 'Coach Sarah Martinez',
        avatar: '/api/placeholder/40/40',
        role: 'Head Coach',
        school: 'Miller VLC'
      },
      content: 'Incredible performance by our basketball team at the district championships! The dedication these athletes showed all season paid off with a hard-fought victory. 🏀',
      media: [
        {
          type: 'image',
          url: '/api/placeholder/400/300',
          caption: 'Team celebrating after the championship win'
        }
      ],
      timestamp: '2 hours ago',
      likes: 47,
      comments: 12,
      shares: 8,
      tournament: {
        name: 'District Basketball Championship',
        sport: 'Basketball',
        location: 'CCISD Arena',
        date: 'March 15, 2024'
      },
      tags: ['basketball', 'championship', 'teamwork', 'victory'],
      isLiked: false,
      isBookmarked: true
    },
    {
      id: '2',
      author: {
        name: 'Athletic Trainer Lisa Chen',
        avatar: '/api/placeholder/40/40',
        role: 'Athletic Trainer',
        school: 'Carroll VLC'
      },
      content: 'Quick injury prevention tip: Proper warm-up routines can reduce injury risk by up to 50%. Here\'s our pre-practice protocol that\'s been game-changing for our athletes.',
      timestamp: '5 hours ago',
      likes: 23,
      comments: 7,
      shares: 15,
      tags: ['injury-prevention', 'athletic-training', 'safety', 'wellness'],
      isLiked: true,
      isBookmarked: false
    },
    {
      id: '3',
      author: {
        name: 'Tournament Director Mike Rodriguez',
        avatar: '/api/placeholder/40/40',
        role: 'Tournament Organizer',
        school: 'Regional Athletics'
      },
      content: 'Registration is now open for the Spring Multi-Sport Tournament! 16 schools, 8 sports, 3 days of incredible competition. Early bird pricing ends Friday.',
      timestamp: '1 day ago',
      likes: 89,
      comments: 34,
      shares: 42,
      tournament: {
        name: 'Spring Multi-Sport Tournament',
        sport: 'Multi-Sport',
        location: 'Regional Sports Complex',
        date: 'April 20-22, 2024'
      },
      tags: ['tournament', 'registration', 'multi-sport', 'spring'],
      isLiked: false,
      isBookmarked: false
    }
  ];

  const mockSharingOptions = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600', action: 'share-facebook' },
    { name: 'Twitter', icon: Twitter, color: 'bg-sky-400', action: 'share-twitter' },
    { name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 to-pink-600', action: 'share-instagram' },
    { name: 'Email', icon: Mail, color: 'bg-gray-600', action: 'share-email' },
    { name: 'SMS', icon: Phone, color: 'bg-green-600', action: 'share-sms' },
    { name: 'Copy Link', icon: Copy, color: 'bg-purple-600', action: 'copy-link' }
  ];

  const handleLike = (postId: string) => {
    // Implementation for liking posts
    console.log('Liked post:', postId);
  };

  const handleBookmark = (postId: string) => {
    // Implementation for bookmarking posts
    console.log('Bookmarked post:', postId);
  };

  const handleShare = (postId: string, platform: string) => {
    // Implementation for sharing posts
    console.log('Shared post:', postId, 'on', platform);
  };

  const handleNewPost = () => {
    if (!newPostContent.trim()) return;
    
    // Implementation for creating new posts
    console.log('New post:', {
      content: newPostContent,
      tournament: selectedTournament,
      tags: postTags
    });
    
    setNewPostContent('');
    setSelectedTournament('');
    setPostTags([]);
  };

  const addTag = (tag: string) => {
    if (tag && !postTags.includes(tag)) {
      setPostTags([...postTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPostTags(postTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Social Hub - Connect & Share</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed">Activity Feed</TabsTrigger>
            <TabsTrigger value="create">Create Post</TabsTrigger>
            <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          {/* Activity Feed Tab */}
          <TabsContent value="feed" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Latest Updates</h3>
              <Button size="sm" variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </div>

            <div className="space-y-4">
              {mockPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {/* Post Header */}
                    <div className="flex items-start space-x-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-sm">{post.author.name}</h4>
                          <Badge variant="secondary" className="text-xs">{post.author.role}</Badge>
                          {post.author.school && (
                            <Badge variant="outline" className="text-xs">{post.author.school}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{post.timestamp}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-sm leading-relaxed">{post.content}</p>
                    </div>

                    {/* Tournament Context */}
                    {post.tournament && (
                      <Card className="bg-blue-50 border-blue-200 mb-4">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <Trophy className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{post.tournament.name}</span>
                            <span className="text-gray-500">•</span>
                            <span>{post.tournament.sport}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{post.tournament.location}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{post.tournament.date}</span>
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Media */}
                    {post.media && post.media.length > 0 && (
                      <div className="mb-4">
                        {post.media.map((media, index) => (
                          <div key={index} className="relative">
                            {media.type === 'image' ? (
                              <img 
                                src={media.url} 
                                alt={media.caption || 'Post media'}
                                className="w-full max-h-64 object-cover rounded-lg"
                              />
                            ) : (
                              <video 
                                controls 
                                className="w-full max-h-64 rounded-lg"
                                poster={media.url}
                              >
                                <source src={media.url} type="video/mp4" />
                              </video>
                            )}
                            {media.caption && (
                              <p className="text-xs text-gray-600 mt-1">{media.caption}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Hash className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-4">
                        <Button
                          size="sm"
                          variant={post.isLiked ? "default" : "ghost"}
                          onClick={() => handleLike(post.id)}
                          className="flex items-center space-x-2"
                        >
                          <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likes}</span>
                        </Button>
                        
                        <Button size="sm" variant="ghost" className="flex items-center space-x-2">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </Button>
                        
                        <Button size="sm" variant="ghost" className="flex items-center space-x-2">
                          <Share2 className="h-4 w-4" />
                          <span>{post.shares}</span>
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant={post.isBookmarked ? "default" : "ghost"}
                          onClick={() => handleBookmark(post.id)}
                        >
                          <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Create Post Tab */}
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Share Your Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Share tournament results, training tips, athlete achievements, or upcoming events..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-24"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Link to Tournament</label>
                    <select
                      value={selectedTournament}
                      onChange={(e) => setSelectedTournament(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                    >
                      <option value="">Select tournament (optional)</option>
                      <option value="district-basketball">District Basketball Championship</option>
                      <option value="spring-multi-sport">Spring Multi-Sport Tournament</option>
                      <option value="track-regionals">Track & Field Regionals</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Add Tags</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Enter tag"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="text-sm"
                      />
                      <Button size="sm" variant="outline">Add</Button>
                    </div>
                  </div>
                </div>

                {postTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {postTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                        <Hash className="h-3 w-3" />
                        <span>{tag}</span>
                        <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-600">×</button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  <Button size="sm" variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Add Photo
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>

                <div className="flex justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Share to:</span>
                    {mockSharingOptions.slice(0, 3).map((option) => (
                      <Button key={option.name} size="sm" variant="outline" className="p-2">
                        <option.icon className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                  <Button onClick={handleNewPost} disabled={!newPostContent.trim()}>
                    Post Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collaborate Tab */}
          <TabsContent value="collaborate" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Team Collaboration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-sm">Coaching Staff Group</h4>
                      <p className="text-xs text-gray-600 mt-1">12 active members</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button size="sm">Join Discussion</Button>
                        <Button size="sm" variant="outline">View Files</Button>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-sm">Athletic Trainers Network</h4>
                      <p className="text-xs text-gray-600 mt-1">8 active members</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button size="sm">Join Discussion</Button>
                        <Button size="sm" variant="outline">View Files</Button>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-sm">Tournament Organizers</h4>
                      <p className="text-xs text-gray-600 mt-1">25 active members</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button size="sm">Join Discussion</Button>
                        <Button size="sm" variant="outline">View Files</Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create New Group
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shared Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Training Plans - Basketball</span>
                        <Download className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-600">Shared by Coach Martinez</p>
                    </div>
                    
                    <div className="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Injury Prevention Guide</span>
                        <Download className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-600">Shared by AT Lisa Chen</p>
                    </div>
                    
                    <div className="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tournament Rules 2024</span>
                        <Download className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-600">Shared by Regional Athletics</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    Upload Resource
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Connect with Professionals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Dr. Maria Gonzalez', role: 'Sports Medicine Physician', school: 'CCISD', mutual: 5 },
                      { name: 'Coach Tony Williams', role: 'Head Basketball Coach', school: 'Veterans Memorial', mutual: 12 },
                      { name: 'Jennifer Lee', role: 'Athletic Director', school: 'Ray VLC', mutual: 8 },
                      { name: 'Physical Therapist Alex Kim', role: 'Rehabilitation Specialist', school: 'Carroll VLC', mutual: 3 }
                    ].map((person, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-sm">{person.name}</h4>
                            <p className="text-xs text-gray-600">{person.role} • {person.school}</p>
                            <p className="text-xs text-gray-500">{person.mutual} mutual connections</p>
                          </div>
                        </div>
                        <Button size="sm">
                          <UserPlus className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Platform Sharing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockSharingOptions.map((option) => (
                    <Button
                      key={option.name}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleShare('platform', option.action)}
                    >
                      <option.icon className="h-4 w-4 mr-2" />
                      {option.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}