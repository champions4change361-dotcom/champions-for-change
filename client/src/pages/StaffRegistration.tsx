import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload, UserPlus, Users, FileText, Download, Check } from "lucide-react";
import { useLocation } from "wouter";

export default function StaffRegistration() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [csvData, setCsvData] = useState("");
  const [bulkUsers, setBulkUsers] = useState<any[]>([]);
  
  // Individual user form state
  const [individualUser, setIndividualUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    school: ''
  });

  const roles = [
    { value: 'district_athletic_director', label: 'District Athletic Director' },
    { value: 'district_head_athletic_trainer', label: 'District Head Athletic Trainer' },
    { value: 'school_athletic_director', label: 'School Athletic Director' },
    { value: 'school_athletic_trainer', label: 'School Athletic Trainer' },
    { value: 'school_principal', label: 'School Principal' },
    { value: 'head_coach', label: 'Head Coach' },
    { value: 'assistant_coach', label: 'Assistant Coach' },
    { value: 'athletic_training_student', label: 'Athletic Training Student' },
  ];

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        setCsvData(csv);
        parseCsv(csv);
      };
      reader.readAsText(file);
    }
  };

  const parseCsv = (csv: string) => {
    const lines = csv.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const users = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const user: any = {};
      headers.forEach((header, index) => {
        user[header.toLowerCase().replace(' ', '_')] = values[index];
      });
      return user;
    });
    
    setBulkUsers(users);
  };

  const bulkCreateMutation = useMutation({
    mutationFn: async (users: any[]) => {
      return apiRequest('/api/admin/bulk-users', 'POST', { users });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${bulkUsers.length} staff members registered successfully`,
      });
      setBulkUsers([]);
      setCsvData("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to register staff members",
        variant: "destructive",
      });
    },
  });

  const individualCreateMutation = useMutation({
    mutationFn: async (user: any) => {
      return apiRequest('/api/admin/fake-user', 'POST', user);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff member registered successfully",
      });
      setIndividualUser({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        school: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to register staff member",
        variant: "destructive",
      });
    },
  });

  const downloadTemplate = () => {
    const template = "first_name,last_name,email,role,school_name\nJohn,Smith,jsmith@district.edu,head_coach,Lincoln High School\nJane,Doe,jdoe@district.edu,athletic_trainer,Washington Middle School";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff_registration_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Staff Registration</h1>
          <p className="text-slate-600">Register district staff members individually or in bulk</p>
        </div>

        <Tabs defaultValue="bulk" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bulk">Bulk Registration</TabsTrigger>
            <TabsTrigger value="individual">Individual Registration</TabsTrigger>
          </TabsList>

          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  CSV Upload
                </CardTitle>
                <CardDescription>
                  Upload a CSV file to register multiple staff members at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={downloadTemplate}
                    className="flex items-center gap-2"
                    data-testid="button-download-template"
                  >
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>
                  <div>
                    <Label htmlFor="csv-upload" className="cursor-pointer">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload CSV
                      </Button>
                    </Label>
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="hidden"
                      data-testid="input-csv-upload"
                    />
                  </div>
                </div>

                {bulkUsers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Preview ({bulkUsers.length} users)</h3>
                    <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
                      {bulkUsers.map((user, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <span>{user.first_name} {user.last_name} ({user.email})</span>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => bulkCreateMutation.mutate(bulkUsers)}
                      disabled={bulkCreateMutation.isPending}
                      data-testid="button-create-bulk-users"
                    >
                      {bulkCreateMutation.isPending ? 'Creating...' : `Register ${bulkUsers.length} Staff Members`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Individual Registration
                </CardTitle>
                <CardDescription>
                  Register a single staff member
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={individualUser.firstName}
                      onChange={(e) => setIndividualUser({...individualUser, firstName: e.target.value})}
                      data-testid="input-first-name" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={individualUser.lastName}
                      onChange={(e) => setIndividualUser({...individualUser, lastName: e.target.value})}
                      data-testid="input-last-name" 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={individualUser.email}
                    onChange={(e) => setIndividualUser({...individualUser, email: e.target.value})}
                    data-testid="input-email" 
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select 
                    id="role"
                    value={individualUser.role}
                    onChange={(e) => {
                      console.log('Selected role:', e.target.value);
                      setIndividualUser({...individualUser, role: e.target.value});
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    data-testid="select-role"
                  >
                    <option value="">Select role</option>
                    <option value="district_athletic_director">District Athletic Director</option>
                    <option value="district_head_athletic_trainer">District Head Athletic Trainer</option>
                    <option value="school_athletic_director">School Athletic Director</option>
                    <option value="school_athletic_trainer">School Athletic Trainer</option>
                    <option value="school_principal">School Principal</option>
                    <option value="head_coach">Head Coach</option>
                    <option value="assistant_coach">Assistant Coach</option>
                    <option value="athletic_training_student">Athletic Training Student</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="school">School/Department</Label>
                  <Input 
                    id="school" 
                    value={individualUser.school}
                    onChange={(e) => setIndividualUser({...individualUser, school: e.target.value})}
                    data-testid="input-school" 
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => individualCreateMutation.mutate({
                    firstName: individualUser.firstName,
                    lastName: individualUser.lastName,
                    email: individualUser.email,
                    role: individualUser.role,
                    organizationName: individualUser.school,
                    userType: 'district'
                  })}
                  disabled={individualCreateMutation.isPending || !individualUser.firstName || !individualUser.lastName || !individualUser.email || !individualUser.role}
                  data-testid="button-register-individual"
                >
                  {individualCreateMutation.isPending ? 'Registering...' : 'Register Staff Member'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}