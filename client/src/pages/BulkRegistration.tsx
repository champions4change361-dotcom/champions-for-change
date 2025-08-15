import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface StaffMember {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organizationName: string;
}

export default function BulkRegistration() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [bulkText, setBulkText] = useState("");

  // Check if user has permission
  const hasPermission = user?.userRole === 'district_athletic_director' || user?.userRole === 'district_head_athletic_trainer';

  const bulkRegistrationMutation = useMutation({
    mutationFn: async (staff: StaffMember[]) => {
      return await apiRequest('/api/staff/bulk-register', {
        method: 'POST',
        body: JSON.stringify({ staff })
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Successfully registered ${staffList.length} staff members`,
      });
      setStaffList([]);
      setBulkText("");
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register staff members",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || !hasPermission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">Only District Athletic Directors and District Head Athletic Trainers can access bulk registration.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const addStaffMember = () => {
    setStaffList([...staffList, {
      firstName: "",
      lastName: "",
      email: "",
      role: "head_coach",
      organizationName: user?.organizationName || ""
    }]);
  };

  const removeStaffMember = (index: number) => {
    setStaffList(staffList.filter((_, i) => i !== index));
  };

  const updateStaffMember = (index: number, field: keyof StaffMember, value: string) => {
    const updated = [...staffList];
    updated[index] = { ...updated[index], [field]: value };
    setStaffList(updated);
  };

  const parseBulkText = () => {
    try {
      const lines = bulkText.split('\n').filter(line => line.trim());
      const newStaff: StaffMember[] = [];

      lines.forEach(line => {
        // Expected format: "First Name,Last Name,Email,Role,School"
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          newStaff.push({
            firstName: parts[0] || "",
            lastName: parts[1] || "",
            email: parts[2] || "",
            role: parts[3] || "head_coach",
            organizationName: parts[4] || user?.organizationName || ""
          });
        }
      });

      setStaffList([...staffList, ...newStaff]);
      setBulkText("");
      toast({
        title: "Parsed Successfully",
        description: `Added ${newStaff.length} staff members to the list`,
      });
    } catch (error) {
      toast({
        title: "Parse Error",
        description: "Failed to parse bulk text. Check format: FirstName,LastName,Email,Role,School",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Bulk Staff Registration</h1>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            data-testid="button-back"
          >
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bulk Import */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk Import (CSV Format)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="bulk-text">
                Paste staff data (FirstName,LastName,Email,Role,School)
              </Label>
              <Textarea
                id="bulk-text"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="John,Doe,john.doe@district.edu,head_coach,Miller High School
Jane,Smith,jane.smith@district.edu,assistant_coach,Miller High School"
                rows={6}
                data-testid="textarea-bulk-import"
              />
              <Button onClick={parseBulkText} disabled={!bulkText.trim()}>
                Parse & Add to List
              </Button>
            </CardContent>
          </Card>

          {/* Individual Entry */}
          <Card>
            <CardHeader>
              <CardTitle>Add Individual Staff Member</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={addStaffMember} data-testid="button-add-individual">
                Add New Staff Member
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Staff List */}
        {staffList.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Staff Registration List ({staffList.length} members)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffList.map((staff, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <Label>First Name</Label>
                        <Input
                          value={staff.firstName}
                          onChange={(e) => updateStaffMember(index, 'firstName', e.target.value)}
                          data-testid={`input-firstname-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          value={staff.lastName}
                          onChange={(e) => updateStaffMember(index, 'lastName', e.target.value)}
                          data-testid={`input-lastname-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={staff.email}
                          onChange={(e) => updateStaffMember(index, 'email', e.target.value)}
                          data-testid={`input-email-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Select 
                          value={staff.role} 
                          onValueChange={(value) => updateStaffMember(index, 'role', value)}
                        >
                          <SelectTrigger data-testid={`select-role-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="head_coach">Head Coach</SelectItem>
                            <SelectItem value="assistant_coach">Assistant Coach</SelectItem>
                            <SelectItem value="school_athletic_trainer">School Athletic Trainer</SelectItem>
                            <SelectItem value="school_athletic_director">School Athletic Director</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>School</Label>
                        <Input
                          value={staff.organizationName}
                          onChange={(e) => updateStaffMember(index, 'organizationName', e.target.value)}
                          data-testid={`input-organization-${index}`}
                        />
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => removeStaffMember(index)}
                      data-testid={`button-remove-${index}`}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <span className="text-lg font-semibold">
                  Total: {staffList.length} staff members
                </span>
                <Button 
                  onClick={() => bulkRegistrationMutation.mutate(staffList)}
                  disabled={staffList.length === 0 || bulkRegistrationMutation.isPending}
                  size="lg"
                  data-testid="button-register-all"
                >
                  {bulkRegistrationMutation.isPending ? "Registering..." : "Register All Staff"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}