// Profile Picture Upload Component with Content Moderation
// Safe image uploads for all users across all subdomains

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ObjectUploader } from "./ObjectUploader";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { Camera, Upload, Shield, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import type { UploadResult } from "@uppy/core";

interface ProfilePictureData {
  userId: string;
  profileImageUrl: string | null;
  hasCustomImage: boolean;
  uploadHistory: any[];
}

interface DefaultAvatar {
  id: string;
  name: string;
  url: string;
  category: string;
}

interface AvatarsData {
  avatars: DefaultAvatar[];
  categories: string[];
  description: string;
}

interface UploadProcessResult {
  uploadId: string;
  status: string;
  message: string;
  moderationScore?: number;
  flags?: string[];
  nextSteps: string;
}

interface ProfilePictureUploaderProps {
  userId?: string; // If provided, shows read-only view for that user
  size?: "sm" | "md" | "lg" | "xl";
  showUploadButton?: boolean;
  className?: string;
}

export function ProfilePictureUploader({ 
  userId, 
  size = "md",
  showUploadButton = true,
  className = ""
}: ProfilePictureUploaderProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadProcessResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isReadOnly = !!userId; // Read-only mode if userId is provided
  const targetUserId = userId || 'me';

  // Get current profile picture
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/profile/picture', targetUserId],
    queryFn: userId 
      ? () => apiRequest(`/api/profile/${userId}/picture`)
      : () => apiRequest('/api/profile/picture'),
  });

  // Get available avatars
  const { data: avatarsData } = useQuery({
    queryKey: ['/api/profile/avatars'],
  });

  // Upload profile picture mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/profile/picture/upload', {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      console.log('Upload URL received:', data);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to get upload URL. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Process uploaded image mutation
  const processMutation = useMutation({
    mutationFn: async ({ uploadId, imageUrl }: { uploadId: string; imageUrl: string }) => {
      return await apiRequest('/api/profile/picture/process', {
        method: 'POST',
        body: { uploadId, imageUrl },
      });
    },
    onSuccess: (data: UploadProcessResult) => {
      setUploadStatus(data);
      setIsUploading(false);
      
      if (data.status === 'approved') {
        toast({
          title: "Profile Picture Approved!",
          description: data.message,
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/profile/picture'] });
      } else if (data.status === 'rejected') {
        toast({
          title: "Upload Rejected",
          description: data.message,
          variant: "destructive",
        });
      } else if (data.status === 'flagged') {
        toast({
          title: "Under Review",
          description: data.message,
          variant: "default",
        });
      }
    },
    onError: (error) => {
      setIsUploading(false);
      toast({
        title: "Processing Failed",
        description: "Failed to process uploaded image. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Set avatar mutation
  const setAvatarMutation = useMutation({
    mutationFn: async (avatarId: string) => {
      return await apiRequest('/api/profile/avatar', {
        method: 'POST',
        body: { avatarId },
      });
    },
    onSuccess: () => {
      toast({
        title: "Avatar Updated!",
        description: "Your profile avatar has been updated successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile/picture'] });
    },
    onError: (error) => {
      toast({
        title: "Avatar Update Failed",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const uploadData = await uploadMutation.mutateAsync();
    return {
      method: 'PUT' as const,
      url: uploadData.uploadUrl,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const imageUrl = uploadedFile.uploadURL;
      
      setIsUploading(true);
      
      // Process the uploaded image
      processMutation.mutate({
        uploadId: uploadMutation.data?.uploadId || '',
        imageUrl: imageUrl || '',
      });
    }
  };

  const handleSelectAvatar = (avatarId: string) => {
    setAvatarMutation.mutate(avatarId);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "w-8 h-8";
      case "md": return "w-12 h-12";
      case "lg": return "w-16 h-16";
      case "xl": return "w-24 h-24";
      default: return "w-12 h-12";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'flagged': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (profileLoading) {
    return (
      <div className={`flex items-center justify-center ${getSizeClasses()} ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentImageUrl = (profileData as ProfilePictureData)?.profileImageUrl;
  const hasCustomImage = (profileData as ProfilePictureData)?.hasCustomImage;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Profile Picture Display */}
      <Avatar className={getSizeClasses()}>
        <AvatarImage 
          src={currentImageUrl || '/public-objects/avatars/default.svg'} 
          alt="Profile picture"
        />
        <AvatarFallback>
          <Camera className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      {/* Upload/Edit Button (only in edit mode) */}
      {!isReadOnly && showUploadButton && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              {currentImageUrl ? 'Change Picture' : 'Add Picture'}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Profile Picture & Avatars</DialogTitle>
              <DialogDescription>
                Upload a custom profile picture or choose from safe, educational avatars.
                All uploads are automatically moderated for appropriate content.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </TabsTrigger>
                <TabsTrigger value="avatars">
                  <Camera className="h-4 w-4 mr-2" />
                  Choose Avatar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      Safe Upload with Content Moderation
                    </CardTitle>
                    <CardDescription>
                      Upload appropriate photos only. All images are automatically reviewed for educational appropriateness.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Upload Status */}
                    {uploadStatus && (
                      <Alert className={`border-l-4 ${uploadStatus.status === 'approved' ? 'border-green-500' : uploadStatus.status === 'rejected' ? 'border-red-500' : 'border-yellow-500'}`}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(uploadStatus.status)}
                          <AlertDescription>
                            <div>
                              <strong>{uploadStatus.message}</strong>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {uploadStatus.nextSteps}
                              </p>
                            </div>
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}

                    {/* Upload Component */}
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10485760} // 10MB
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handleUploadComplete}
                      buttonClassName="w-full"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Upload className="h-4 w-4" />
                        {isUploading ? 'Processing...' : 'Select & Upload Photo'}
                      </div>
                    </ObjectUploader>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Supported: JPG, PNG, GIF, WEBP</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Max size: 10MB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-green-500" />
                        <span>AI content moderation for safety</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="avatars" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Educational Avatars</CardTitle>
                    <CardDescription>
                      Choose from safe, appropriate avatars designed for educational environments.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {avatarsData?.categories?.map((category: string) => (
                        <div key={category} className="mb-6">
                          <h4 className="font-semibold mb-3 capitalize text-sm text-muted-foreground">
                            {category.replace('_', ' ')} Avatars
                          </h4>
                          <div className="grid grid-cols-4 gap-3">
                            {avatarsData?.avatars
                              ?.filter((avatar: DefaultAvatar) => avatar.category === category)
                              ?.map((avatar: DefaultAvatar) => (
                                <button
                                  key={avatar.id}
                                  onClick={() => handleSelectAvatar(avatar.id)}
                                  className="flex flex-col items-center p-3 rounded-lg border hover:bg-accent transition-colors"
                                  disabled={setAvatarMutation.isPending}
                                  data-testid={`avatar-option-${avatar.id}`}
                                >
                                  <Avatar className="w-12 h-12 mb-2">
                                    <AvatarImage src={avatar.url} alt={avatar.name} />
                                    <AvatarFallback>{avatar.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-center">{avatar.name}</span>
                                </button>
                              ))
                            }
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Status Indicators */}
      {hasCustomImage && !isReadOnly && (
        <Badge variant="secondary" className="text-xs">
          Custom Photo
        </Badge>
      )}
    </div>
  );
}