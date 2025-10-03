import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { School, Building2, ArrowRight, Plus, Pencil } from "lucide-react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { queryClient, apiRequest } from "@/lib/queryClient";

const emptyStringToUndefined = z.string().transform(val => val === "" ? undefined : val);

const updateSchoolSchema = z.object({
  feedsIntoSchoolId: emptyStringToUndefined.optional(),
  districtSchoolCode: emptyStringToUndefined.optional(),
});

type UpdateSchoolFormData = z.infer<typeof updateSchoolSchema>;

interface SchoolData {
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

export default function VLCDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: mySchool, isLoading: schoolLoading } = useQuery<SchoolData>({
    queryKey: ["/api/user/school"],
    enabled: !!user,
  });

  const { data: feederSchools = [], isLoading: feedersLoading } = useQuery<SchoolData[]>({
    queryKey: ["/api/schools", mySchool?.id, "feeders"],
    enabled: !!mySchool?.id,
  });

  const { data: allDistrictSchools = [] } = useQuery<SchoolData[]>({
    queryKey: ["/api/schools"],
    enabled: !!user,
  });

  const editForm = useForm<UpdateSchoolFormData>({
    resolver: zodResolver(updateSchoolSchema),
    defaultValues: {
      feedsIntoSchoolId: "",
      districtSchoolCode: "",
    },
  });

  const updateSchoolMutation = useMutation({
    mutationFn: async ({ schoolId, data }: { schoolId: string; data: UpdateSchoolFormData }) => {
      return await apiRequest(`/api/schools/${schoolId}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/school"] });
      setShowEditDialog(false);
      editForm.reset();
      toast({
        title: "School Updated",
        description: "The school has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating School",
        description: error.message || "Failed to update school. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEditSchool = (school: SchoolData) => {
    setSelectedSchool(school);
    editForm.reset({
      feedsIntoSchoolId: school.feedsIntoSchoolId || "",
      districtSchoolCode: school.districtSchoolCode || "",
    });
    setShowEditDialog(true);
  };

  const onUpdateSchool = (data: UpdateSchoolFormData) => {
    if (!selectedSchool) return;
    updateSchoolMutation.mutate({ schoolId: selectedSchool.id, data });
  };

  const highSchools = allDistrictSchools.filter(s => s.schoolType === "high" && s.id !== mySchool?.id);

  if (schoolLoading) {
    return (
      <AuthenticatedLayout>
        <div className="p-8">
          <div className="text-center">Loading...</div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!mySchool) {
    return (
      <AuthenticatedLayout>
        <div className="p-8">
          <Card>
            <CardHeader>
              <CardTitle>No School Assigned</CardTitle>
              <CardDescription>
                You don't have a school assigned yet. Please contact your District AD.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">VLC Feeder Management</h1>
          <p className="text-muted-foreground">
            Manage your school's Vertical Learning Community hierarchy and feeder schools
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    {mySchool.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="outline">{mySchool.schoolType.toUpperCase()}</Badge>
                    {mySchool.districtSchoolCode && (
                      <Badge variant="secondary" className="ml-2">
                        Code: {mySchool.districtSchoolCode}
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSchool(mySchool)}
                  data-testid="button-edit-my-school"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {mySchool.address && (
                  <p className="text-muted-foreground">
                    {mySchool.address}, {mySchool.city}, {mySchool.state} {mySchool.zipCode}
                  </p>
                )}
                {mySchool.feedsIntoSchoolId && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Feeds into:</span>
                    <Badge variant="default">
                      {allDistrictSchools.find(s => s.id === mySchool.feedsIntoSchoolId)?.name || "Unknown"}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {mySchool.schoolType === "high" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Feeder Schools ({feederSchools.length})
                </CardTitle>
                <CardDescription>
                  Schools that feed into your high school's VLC pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedersLoading ? (
                  <div className="text-center py-4">Loading feeder schools...</div>
                ) : feederSchools.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No feeder schools configured yet</p>
                    <p className="text-sm mt-1">
                      Contact your District AD to add feeder schools to your VLC
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {feederSchools.map((school) => (
                      <div
                        key={school.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`feeder-school-${school.id}`}
                      >
                        <div>
                          <div className="font-medium">{school.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            <Badge variant="outline" className="mr-2">
                              {school.schoolType.toUpperCase()}
                            </Badge>
                            {school.districtSchoolCode && (
                              <Badge variant="secondary">
                                Code: {school.districtSchoolCode}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSchool(school)}
                          data-testid={`button-edit-feeder-${school.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent data-testid="dialog-edit-school">
            <DialogHeader>
              <DialogTitle>Edit School Settings</DialogTitle>
              <DialogDescription>
                Update VLC hierarchy and administrative settings for {selectedSchool?.name}
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onUpdateSchool)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="feedsIntoSchoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VLC Parent School</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-parent-school">
                            <SelectValue placeholder="Select parent high school (if applicable)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="" data-testid="option-no-parent">
                            None (Standalone)
                          </SelectItem>
                          {highSchools.map((hs) => (
                            <SelectItem key={hs.id} value={hs.id} data-testid={`option-parent-${hs.id}`}>
                              {hs.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        For middle/elementary schools, select the high school they feed into
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="districtSchoolCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District School Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0472"
                          {...field}
                          data-testid="input-district-code"
                        />
                      </FormControl>
                      <FormDescription>
                        Administrative code for integration with systems like School Business Plus
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditDialog(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateSchoolMutation.isPending}
                    data-testid="button-save-school"
                  >
                    {updateSchoolMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  );
}
