import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { School, Plus, Mail, Users, Building2, ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { queryClient, apiRequest } from "@/lib/queryClient";

const addSchoolSchema = z.object({
  name: z.string().min(3, "School name must be at least 3 characters"),
  schoolType: z.enum(["high", "middle", "elementary"]),
  feedsIntoSchoolId: z.string().optional(),
  districtSchoolCode: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

const inviteSchoolADSchema = z.object({
  schoolName: z.string().min(3, "School name must be at least 3 characters"),
  schoolType: z.enum(["high", "middle", "elementary"]),
  districtSchoolCode: z.string().optional(),
  inviteeEmail: z.string().email("Invalid email address"),
  inviteeName: z.string().min(2, "Name must be at least 2 characters"),
  invitedRole: z.enum(["school_athletic_director", "school_athletic_coordinator"]).default("school_athletic_director"),
});

type AddSchoolFormData = z.infer<typeof addSchoolSchema>;
type InviteSchoolADFormData = z.infer<typeof inviteSchoolADSchema>;

interface School {
  id: string;
  name: string;
  schoolType: string;
  districtSchoolCode?: string;
  districtId: string;
  athleticDirectorId?: string;
  feedsIntoSchoolId?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface SchoolInvite {
  id: string;
  schoolName: string;
  schoolType: string;
  inviteeEmail: string;
  inviteeName?: string;
  inviteStatus: string;
  expiresAt: Date;
  createdAt: Date;
}

interface District {
  id: string;
  name: string;
}

export default function SchoolManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showAddSchoolDialog, setShowAddSchoolDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { data: userDistrict } = useQuery<District>({
    queryKey: ["/api/user/district"],
    enabled: !!user,
  });

  const { data: schools = [], isLoading: schoolsLoading } = useQuery<School[]>({
    queryKey: ["/api/schools"],
    enabled: !!userDistrict,
  });

  const { data: invites = [], isLoading: invitesLoading } = useQuery<SchoolInvite[]>({
    queryKey: ["/api/schools/invites"],
    enabled: !!userDistrict,
  });

  const addSchoolForm = useForm<AddSchoolFormData>({
    resolver: zodResolver(addSchoolSchema),
    defaultValues: {
      name: "",
      schoolType: "high",
      feedsIntoSchoolId: "",
      districtSchoolCode: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const inviteForm = useForm<InviteSchoolADFormData>({
    resolver: zodResolver(inviteSchoolADSchema),
    defaultValues: {
      schoolName: "",
      schoolType: "high",
      districtSchoolCode: "",
      inviteeEmail: "",
      inviteeName: "",
      invitedRole: "school_athletic_director",
    },
  });

  const addSchoolMutation = useMutation({
    mutationFn: async (data: AddSchoolFormData) => {
      // districtId is derived server-side from user context
      return await apiRequest("/api/schools", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools"] });
      setShowAddSchoolDialog(false);
      addSchoolForm.reset();
      toast({
        title: "School Added",
        description: "The school has been successfully added to your district.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding School",
        description: error.message || "Failed to add school. Please try again.",
        variant: "destructive",
      });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: InviteSchoolADFormData) => {
      // districtId is derived server-side from user context
      return await apiRequest("/api/schools/invite", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools/invites"] });
      setShowInviteDialog(false);
      inviteForm.reset();
      toast({
        title: "Invitation Sent",
        description: "The School AD invitation has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Sending Invitation",
        description: error.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onAddSchool = (data: AddSchoolFormData) => {
    addSchoolMutation.mutate(data);
  };

  const onSendInvite = (data: InviteSchoolADFormData) => {
    inviteMutation.mutate(data);
  };

  const highSchools = schools.filter(s => s.schoolType === "high");
  const middleSchools = schools.filter(s => s.schoolType === "middle");
  const elementarySchools = schools.filter(s => s.schoolType === "elementary");

  const getSchoolsByType = (type: string) => {
    switch (type) {
      case "high":
        return highSchools;
      case "middle":
        return middleSchools;
      case "elementary":
        return elementarySchools;
      default:
        return schools;
    }
  };

  const displaySchools = activeTab === "all" ? schools : getSchoolsByType(activeTab);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="default" data-testid={`badge-status-pending`}><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "accepted":
        return <Badge variant="default" className="bg-green-500" data-testid={`badge-status-accepted`}><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case "expired":
        return <Badge variant="destructive" data-testid={`badge-status-expired`}><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="secondary" data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  const getSchoolTypeLabel = (type: string) => {
    switch (type) {
      case "high":
        return "High School";
      case "middle":
        return "Middle School";
      case "elementary":
        return "Elementary School";
      default:
        return type;
    }
  };

  return (
    <AuthenticatedLayout
      title="School Management"
      subtitle={`Manage schools in ${userDistrict?.name || "your district"}`}
      backButtonHref="/district-overview"
      variant="default"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Schools Directory</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {schools.length} schools • {invites.filter(i => i.inviteStatus === "pending").length} pending invitations
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowInviteDialog(true)} variant="outline" data-testid="button-invite-ad">
              <Mail className="h-4 w-4 mr-2" />
              Invite School AD
            </Button>
            <Button onClick={() => setShowAddSchoolDialog(true)} data-testid="button-add-school">
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" data-testid="tab-all">All Schools ({schools.length})</TabsTrigger>
            <TabsTrigger value="high" data-testid="tab-high">High Schools ({highSchools.length})</TabsTrigger>
            <TabsTrigger value="middle" data-testid="tab-middle">Middle Schools ({middleSchools.length})</TabsTrigger>
            <TabsTrigger value="elementary" data-testid="tab-elementary">Elementary ({elementarySchools.length})</TabsTrigger>
            <TabsTrigger value="invites" data-testid="tab-invites">Invites ({invites.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {schoolsLoading ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-slate-600">Loading schools...</p>
                </CardContent>
              </Card>
            ) : displaySchools.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-slate-600">No schools found. Add your first school to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displaySchools.map((school) => (
                  <Card key={school.id} className="hover:shadow-lg transition-shadow" data-testid={`card-school-${school.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg" data-testid={`text-school-name-${school.id}`}>{school.name}</CardTitle>
                          <CardDescription className="mt-1">
                            <Badge variant="secondary" data-testid={`badge-type-${school.id}`}>
                              {getSchoolTypeLabel(school.schoolType)}
                            </Badge>
                            {school.districtSchoolCode && (
                              <Badge variant="outline" className="ml-2" data-testid={`badge-code-${school.id}`}>
                                Code: {school.districtSchoolCode}
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                        <Building2 className="h-5 w-5 text-slate-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {school.address && (
                          <p className="text-slate-600 dark:text-slate-400" data-testid={`text-address-${school.id}`}>
                            {school.address}
                            {school.city && `, ${school.city}`}
                            {school.state && `, ${school.state}`}
                            {school.zipCode && ` ${school.zipCode}`}
                          </p>
                        )}
                        {school.athleticDirectorId ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span data-testid={`text-ad-assigned-${school.id}`}>AD Assigned</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-600">
                            <Clock className="h-4 w-4" />
                            <span data-testid={`text-ad-pending-${school.id}`}>No AD Assigned</span>
                          </div>
                        )}
                        {school.feedsIntoSchoolId && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <ArrowRight className="h-4 w-4" />
                            <span className="text-xs" data-testid={`text-feeder-${school.id}`}>Feeder School</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="high">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highSchools.map((school) => (
                <Card key={school.id} className="hover:shadow-lg transition-shadow" data-testid={`card-school-${school.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid={`text-school-name-${school.id}`}>{school.name}</CardTitle>
                    <CardDescription>
                      {school.districtSchoolCode && (
                        <Badge variant="outline" data-testid={`badge-code-${school.id}`}>Code: {school.districtSchoolCode}</Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {school.athleticDirectorId ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span data-testid={`text-ad-assigned-${school.id}`}>AD Assigned</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <Clock className="h-4 w-4" />
                          <span data-testid={`text-ad-pending-${school.id}`}>No AD Assigned</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="middle">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {middleSchools.map((school) => (
                <Card key={school.id} className="hover:shadow-lg transition-shadow" data-testid={`card-school-${school.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid={`text-school-name-${school.id}`}>{school.name}</CardTitle>
                    <CardDescription>
                      {school.districtSchoolCode && (
                        <Badge variant="outline" data-testid={`badge-code-${school.id}`}>Code: {school.districtSchoolCode}</Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {school.athleticDirectorId ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span data-testid={`text-ad-assigned-${school.id}`}>AD Assigned</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <Clock className="h-4 w-4" />
                          <span data-testid={`text-ad-pending-${school.id}`}>No AD Assigned</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="elementary">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {elementarySchools.map((school) => (
                <Card key={school.id} className="hover:shadow-lg transition-shadow" data-testid={`card-school-${school.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid={`text-school-name-${school.id}`}>{school.name}</CardTitle>
                    <CardDescription>
                      {school.districtSchoolCode && (
                        <Badge variant="outline" data-testid={`badge-code-${school.id}`}>Code: {school.districtSchoolCode}</Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {school.athleticDirectorId ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span data-testid={`text-ad-assigned-${school.id}`}>AD Assigned</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <Clock className="h-4 w-4" />
                          <span data-testid={`text-ad-pending-${school.id}`}>No AD Assigned</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="invites">
            {invitesLoading ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-slate-600">Loading invitations...</p>
                </CardContent>
              </Card>
            ) : invites.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-slate-600">No pending invitations.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {invites.map((invite) => (
                  <Card key={invite.id} data-testid={`card-invite-${invite.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white" data-testid={`text-invite-school-${invite.id}`}>
                                {invite.schoolName}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400" data-testid={`text-invite-email-${invite.id}`}>
                                {invite.inviteeName || invite.inviteeEmail} ({invite.inviteeEmail})
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" data-testid={`badge-invite-type-${invite.id}`}>
                                  {getSchoolTypeLabel(invite.schoolType)}
                                </Badge>
                                <span className="text-xs text-slate-500" data-testid={`text-invite-date-${invite.id}`}>
                                  Sent {new Date(invite.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            {getStatusBadge(invite.inviteStatus)}
                            <p className="text-xs text-slate-500 mt-1" data-testid={`text-invite-expires-${invite.id}`}>
                              Expires {new Date(invite.expiresAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddSchoolDialog} onOpenChange={setShowAddSchoolDialog}>
        <DialogContent className="max-w-2xl" data-testid="dialog-add-school">
          <DialogHeader>
            <DialogTitle>Add New School</DialogTitle>
            <DialogDescription>
              Add a school to your district. You can invite a School AD after creation.
            </DialogDescription>
          </DialogHeader>
          <Form {...addSchoolForm}>
            <form onSubmit={addSchoolForm.handleSubmit(onAddSchool)} className="space-y-4">
              <FormField
                control={addSchoolForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Lincoln High School" {...field} data-testid="input-school-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addSchoolForm.control}
                name="feedsIntoSchoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VLC Feeder Relationship (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-feeder-parent">
                          <SelectValue placeholder="Select parent high school (if this is a feeder school)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="" data-testid="option-no-parent">None (Standalone School)</SelectItem>
                        {highSchools.map((hs) => (
                          <SelectItem key={hs.id} value={hs.id} data-testid={`option-parent-${hs.id}`}>
                            {hs.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Middle/Elementary schools can be designated as feeders to a High School for VLC hierarchy management
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addSchoolForm.control}
                  name="schoolType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-school-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high" data-testid="option-high">High School</SelectItem>
                          <SelectItem value="middle" data-testid="option-middle">Middle School</SelectItem>
                          <SelectItem value="elementary" data-testid="option-elementary">Elementary School</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addSchoolForm.control}
                  name="districtSchoolCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District School Code</FormLabel>
                      <FormControl>
                        <Input placeholder="0472" {...field} data-testid="input-district-code" />
                      </FormControl>
                      <FormDescription>
                        Optional code for integration with systems like School Business Plus
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={addSchoolForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} data-testid="input-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={addSchoolForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Austin" {...field} data-testid="input-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addSchoolForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="TX" {...field} data-testid="input-state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addSchoolForm.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="78701" {...field} data-testid="input-zip" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddSchoolDialog(false)} data-testid="button-cancel-add">
                  Cancel
                </Button>
                <Button type="submit" disabled={addSchoolMutation.isPending} data-testid="button-submit-add">
                  {addSchoolMutation.isPending ? "Adding..." : "Add School"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-2xl" data-testid="dialog-invite-ad">
          <DialogHeader>
            <DialogTitle>Invite School Athletic Director</DialogTitle>
            <DialogDescription>
              Send an invitation to a School AD. They'll receive an email with a registration link.
            </DialogDescription>
          </DialogHeader>
          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(onSendInvite)} className="space-y-4">
              <FormField
                control={inviteForm.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Lincoln High School" {...field} data-testid="input-invite-school-name" />
                    </FormControl>
                    <FormDescription>
                      The school will be created when the AD accepts the invitation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={inviteForm.control}
                  name="schoolType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-invite-school-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high" data-testid="option-invite-high">High School</SelectItem>
                          <SelectItem value="middle" data-testid="option-invite-middle">Middle School</SelectItem>
                          <SelectItem value="elementary" data-testid="option-invite-elementary">Elementary School</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={inviteForm.control}
                  name="districtSchoolCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District School Code</FormLabel>
                      <FormControl>
                        <Input placeholder="0472" {...field} data-testid="input-invite-district-code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={inviteForm.control}
                name="inviteeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AD Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} data-testid="input-invitee-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inviteForm.control}
                name="inviteeEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AD Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.smith@school.edu" {...field} data-testid="input-invitee-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inviteForm.control}
                name="invitedRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-invite-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="school_athletic_director" data-testid="option-role-ad">Athletic Director</SelectItem>
                        <SelectItem value="school_athletic_coordinator" data-testid="option-role-coordinator">Athletic Coordinator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)} data-testid="button-cancel-invite">
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteMutation.isPending} data-testid="button-submit-invite">
                  {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  );
}
