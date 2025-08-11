import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Upload, Users, Mail, Search, Filter, Plus, 
  Edit, Trash2, Eye, Send, UserPlus, Download,
  School, Building, MapPin, Phone, Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Contact, InsertContactType } from "@shared/schema";

export default function Contacts() {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contacts
  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: async (contact: InsertContactType) => {
      return apiRequest("POST", "/api/contacts", contact);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setShowAddDialog(false);
      toast({
        title: "Contact Added",
        description: "Contact has been successfully added to your database",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Import contacts mutation
  const importContactsMutation = useMutation({
    mutationFn: async (contactsData: InsertContactType[]) => {
      return apiRequest("POST", "/api/contacts/import", { contacts: contactsData });
    },
    onSuccess: (data: Contact[]) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setShowImportDialog(false);
      toast({
        title: "Import Successful",
        description: `Successfully imported ${data.length} contacts`,
      });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter contacts
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      contact.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.organization?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || contact.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddContact = (formData: FormData) => {
    const contact: InsertContactType = {
      userId: '', // Will be set by the server
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      organization: formData.get("organization") as string,
      organizationType: formData.get("organizationType") as any,
      position: formData.get("position") as string,
      sport: formData.get("sport") as string,
      state: formData.get("state") as string,
      city: formData.get("city") as string,
      source: "manual_entry",
      subscriptionInterest: formData.get("subscriptionInterest") as any,
      notes: formData.get("notes") as string,
    };
    
    addContactMutation.mutate(contact);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file. Export your Excel file as CSV first.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Empty File",
            description: "The CSV file appears to be empty or has no data rows.",
            variant: "destructive",
          });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
        
        // Map common Excel column names to our schema
        const fieldMapping: Record<string, string> = {
          'first name': 'firstName',
          'firstname': 'firstName', 
          'last name': 'lastName',
          'lastname': 'lastName',
          'email': 'email',
          'email address': 'email',
          'phone': 'phone',
          'phone number': 'phone',
          'organization': 'organization',
          'company': 'organization',
          'school': 'organization',
          'position': 'position',
          'title': 'position',
          'role': 'position',
          'sport': 'sport',
          'sports': 'sport',
          'state': 'state',
          'city': 'city',
          'zip': 'zipCode',
          'zip code': 'zipCode',
          'zipcode': 'zipCode',
          'notes': 'notes',
          'source': 'source',
        };
        
        const contacts: InsertContactType[] = lines.slice(1).map(line => {
          // Handle CSV parsing with proper quote handling
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim()); // Add the last value
          
          const contact: InsertContactType = {
            userId: '', // Will be set by the server
            firstName: '',
            lastName: '',
            email: '',
            source: 'jersey_watch', // Default source for imported contacts
            subscriptionInterest: 'unknown',
          };

          headers.forEach((header, index) => {
            const value = values[index]?.replace(/['"]/g, '').trim() || '';
            const mappedField = fieldMapping[header] || header;
            
            switch (mappedField) {
              case 'firstName':
                contact.firstName = value;
                break;
              case 'lastName':
                contact.lastName = value;
                break;
              case 'email':
                contact.email = value;
                break;
              case 'phone':
                contact.phone = value;
                break;
              case 'organization':
                contact.organization = value;
                break;
              case 'position':
                contact.position = value;
                break;
              case 'sport':
                contact.sport = value;
                break;
              case 'state':
                contact.state = value;
                break;
              case 'city':
                contact.city = value;
                break;
              case 'zipCode':
                contact.zipCode = value;
                break;
              case 'notes':
                contact.notes = value;
                break;
            }
          });
          
          // Skip contacts without email (required field)
          if (!contact.email) {
            return null;
          }
          
          return contact;
        }).filter(contact => contact !== null); // Only include valid contacts
        
        importContactsMutation.mutate(contacts);
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to parse the uploaded file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const exportContacts = () => {
    const csvContent = [
      // Headers
      "First Name,Last Name,Email,Phone,Organization,Position,Sport,State,City,Source,Status,Subscription Interest,Notes",
      // Data
      ...filteredContacts.map((contact: Contact) => [
        contact.firstName || "",
        contact.lastName || "",
        contact.email,
        contact.phone || "",
        contact.organization || "",
        contact.position || "",
        contact.sport || "",
        contact.state || "",
        contact.city || "",
        contact.source || "",
        contact.status || "",
        contact.subscriptionInterest || "",
        (contact.notes || "").replace(/,/g, ';') // Replace commas in notes
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `champions-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your Jersey Watch contacts and launch outreach for Champions for Change platform
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-import-contacts">
                <Upload className="h-4 w-4 mr-2" />
                Import Contacts
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Jersey Watch Contacts</DialogTitle>
                <DialogDescription>
                  Upload your Jersey Watch contact export (CSV format) to import all your contacts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contact-file">Select CSV File</Label>
                  <Input
                    id="contact-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    data-testid="input-contact-file"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Supported columns: First Name, Last Name, Email, Phone, Organization, Position, Sport, State, City
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-contact">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Add a new contact to your Champions for Change outreach database
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleAddContact(formData);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" data-testid="input-first-name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" data-testid="input-last-name" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" name="email" type="email" required data-testid="input-email" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" data-testid="input-phone" />
                  </div>
                  <div>
                    <Label htmlFor="sport">Primary Sport</Label>
                    <Input id="sport" name="sport" data-testid="input-sport" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organization">Organization</Label>
                    <Input id="organization" name="organization" placeholder="School District, Club, etc." data-testid="input-organization" />
                  </div>
                  <div>
                    <Label htmlFor="organizationType">Organization Type</Label>
                    <Select name="organizationType">
                      <SelectTrigger data-testid="select-organization-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school_district">School District</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="club">Sports Club</SelectItem>
                        <SelectItem value="nonprofit">Nonprofit</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="position">Position/Title</Label>
                  <Input id="position" name="position" placeholder="Athletic Director, Coach, etc." data-testid="input-position" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" data-testid="input-city" />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" data-testid="input-state" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subscriptionInterest">Subscription Interest</Label>
                  <Select name="subscriptionInterest">
                    <SelectTrigger data-testid="select-subscription-interest">
                      <SelectValue placeholder="Select interest level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="foundation">Foundation ($79/month)</SelectItem>
                      <SelectItem value="champion">Champion ($199/month)</SelectItem>
                      <SelectItem value="enterprise">Enterprise ($499/month)</SelectItem>
                      <SelectItem value="district_enterprise">District Enterprise ($999/month)</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" rows={3} data-testid="textarea-notes" />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addContactMutation.isPending}
                    data-testid="button-save-contact"
                  >
                    {addContactMutation.isPending ? "Adding..." : "Add Contact"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Total Contacts</p>
                <p className="text-2xl font-bold" data-testid="text-total-contacts">{contacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <School className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">School Districts</p>
                <p className="text-2xl font-bold" data-testid="text-school-districts">
                  {contacts.filter((c: Contact) => c.organizationType === "school_district").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Sports Clubs</p>
                <p className="text-2xl font-bold" data-testid="text-sports-clubs">
                  {contacts.filter((c: Contact) => c.organizationType === "club").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500">Jersey Watch</p>
                <p className="text-2xl font-bold" data-testid="text-jersey-watch">
                  {contacts.filter((c: Contact) => c.source === "jersey_watch").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search contacts by name, email, or organization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-contacts"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40" data-testid="select-filter-status">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="do_not_contact">Do Not Contact</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportContacts} data-testid="button-export-contacts">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts Database</CardTitle>
          <CardDescription>
            {filteredContacts.length} contacts ready for Champions for Change platform launch outreach
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center p-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filterStatus !== "all" 
                  ? "No contacts match your search criteria" 
                  : "Import your Jersey Watch contacts to get started"}
              </p>
              {!searchQuery && filterStatus === "all" && (
                <Button onClick={() => setShowImportDialog(true)} data-testid="button-import-first-contacts">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Jersey Watch Contacts
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact: Contact) => (
                    <TableRow key={contact.id} data-testid={`row-contact-${contact.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </div>
                          {contact.phone && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {contact.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`mailto:${contact.email}`} 
                          className="text-blue-600 hover:underline"
                          data-testid={`link-email-${contact.id}`}
                        >
                          {contact.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contact.organization}</div>
                          {contact.organizationType && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {contact.organizationType.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{contact.position}</TableCell>
                      <TableCell>{contact.sport}</TableCell>
                      <TableCell>
                        {contact.city && contact.state ? (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            {contact.city}, {contact.state}
                          </div>
                        ) : contact.state}
                      </TableCell>
                      <TableCell>
                        {contact.subscriptionInterest && contact.subscriptionInterest !== "unknown" && (
                          <Badge 
                            variant={
                              contact.subscriptionInterest === "enterprise" ? "default" :
                              contact.subscriptionInterest === "district_enterprise" ? "default" :
                              contact.subscriptionInterest === "champion" ? "secondary" : "outline"
                            }
                          >
                            {contact.subscriptionInterest}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={contact.source === "jersey_watch" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {contact.source?.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            contact.status === "active" ? "default" :
                            contact.status === "inactive" ? "secondary" : "destructive"
                          }
                        >
                          {contact.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Launch Campaign Section */}
      {filteredContacts.length > 0 && (
        <Card className="mt-6 bg-green-50 dark:bg-green-900/20 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800 dark:text-green-200">
              <Send className="h-5 w-5 mr-2" />
              Ready to Launch Champions for Change Platform
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              You have {filteredContacts.length} contacts ready for platform launch outreach. 
              Contact them about the new tax-advantaged tournament platform that funds student education.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Launch Message Template:</h4>
                <div className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>Subject:</strong> New Tax-Advantaged Tournament Platform - Champions for Change</p>
                  <p><strong>Message:</strong></p>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded border-l-4 border-green-500">
                    <p>Hi [Name],</p>
                    <p className="mt-2">
                      I wanted to reach out about our new tournament management platform - Champions for Change. 
                      Unlike Jersey Watch and other platforms, we offer:
                    </p>
                    <ul className="mt-2 ml-4 space-y-1">
                      <li>• <strong>Tax Benefits:</strong> 100% business expense deduction + CSR benefits</li>
                      <li>• <strong>More Sports:</strong> 65+ sports vs Jersey Watch's 15</li>
                      <li>• <strong>AI Features:</strong> Tournament generation and consultation</li>
                      <li>• <strong>Educational Mission:</strong> Revenue funds student trips in Corpus Christi, TX</li>
                      <li>• <strong>Better Pricing:</strong> Foundation $79, Champion $199, Enterprise $499</li>
                    </ul>
                    <p className="mt-2">
                      Would you like to see a demo of the platform? We're already helping schools save money 
                      while supporting educational opportunities for students.
                    </p>
                    <p className="mt-2">Best regards,<br />Daniel Thornton<br />Champions for Change</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="bg-green-600 hover:bg-green-700" data-testid="button-copy-template">
                  Copy Template
                </Button>
                <Button variant="outline" data-testid="button-email-all">
                  Email All Active Contacts
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}