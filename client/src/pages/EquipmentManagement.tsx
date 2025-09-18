import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Search, Filter, Download, Upload, Plus, Edit, Trash2, Package, AlertTriangle, CheckCircle, FileSpreadsheet, FileText } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Equipment {
  id: string;
  name: string;
  category: string;
  sport: string;
  school: string;
  totalQuantity: number;
  availableQuantity: number;
  checkedOut: number;
  size?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_replacement';
  location: string;
  lastInventory: string;
  cost?: number;
  vendor?: string;
  purchaseDate?: string;
  warrantyExpires?: string;
  athleteAssignments?: {
    athleteName: string;
    quantity: number;
    identifier?: string;
    checkoutDate: string;
  }[];
}

export default function EquipmentManagement() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Load equipment data based on the real CCISD data provided
  useEffect(() => {
    const realEquipmentData: Equipment[] = [
      {
        id: '1',
        name: 'McGregor MXJ',
        category: 'Training Equipment',
        sport: 'Football (M)',
        school: 'Driscoll Middle School',
        totalQuantity: 5,
        availableQuantity: 5,
        checkedOut: 0,
        condition: 'good',
        location: 'Equipment Room A',
        lastInventory: '2024-08-15',
        cost: 250.00,
        vendor: 'McGregor Sports',
        athleteAssignments: []
      },
      {
        id: '2',
        name: 'Ball Inflator',
        category: 'Maintenance Equipment',
        sport: 'Football (M)',
        school: 'Driscoll Middle School',
        totalQuantity: 1,
        availableQuantity: 1,
        checkedOut: 0,
        condition: 'excellent',
        location: 'Equipment Room A',
        lastInventory: '2024-08-15',
        cost: 45.00,
        athleteAssignments: []
      },
      {
        id: '3',
        name: 'Footballs Wilson',
        category: 'Game Equipment',
        sport: 'Football (M)',
        school: 'Driscoll Middle School',
        totalQuantity: 5,
        availableQuantity: 3,
        checkedOut: 2,
        condition: 'good',
        location: 'Equipment Room A',
        lastInventory: '2024-08-15',
        cost: 35.00,
        athleteAssignments: [
          { athleteName: 'Marcus Johnson', quantity: 1, checkoutDate: '2024-08-18', identifier: 'FB-001' },
          { athleteName: 'Antonio Rodriguez', quantity: 1, checkoutDate: '2024-08-18', identifier: 'FB-002' }
        ]
      },
      {
        id: '4',
        name: 'Tees Kickoff',
        category: 'Training Equipment',
        sport: 'Football (M)',
        school: 'Driscoll Middle School',
        totalQuantity: 8,
        availableQuantity: 8,
        checkedOut: 0,
        condition: 'good',
        location: 'Equipment Room A',
        lastInventory: '2024-08-15',
        cost: 12.00,
        athleteAssignments: []
      },
      {
        id: '5',
        name: 'Footballs Rawling',
        category: 'Game Equipment',
        sport: 'Football (M)',
        school: 'Driscoll Middle School',
        totalQuantity: 2,
        availableQuantity: 2,
        checkedOut: 0,
        condition: 'excellent',
        location: 'Equipment Room A',
        lastInventory: '2024-08-15',
        cost: 40.00,
        athleteAssignments: []
      },
      {
        id: '6',
        name: 'Game Belts w/D Ring Fasteners Color Maroon',
        category: 'Uniforms',
        sport: 'Football (M)',
        school: 'Driscoll Middle School',
        totalQuantity: 100,
        availableQuantity: 85,
        checkedOut: 15,
        condition: 'good',
        location: 'Uniform Storage',
        lastInventory: '2024-08-15',
        cost: 8.50,
        athleteAssignments: [
          { athleteName: 'Various Players', quantity: 15, checkoutDate: '2024-08-18' }
        ]
      },
      {
        id: '7',
        name: 'Practice Jerseys Russell Belt Length Plain Porthole Mesh Body, Color Maroon',
        category: 'Uniforms',
        sport: 'Football (M)',
        school: 'Driscoll Middle School',
        totalQuantity: 112,
        availableQuantity: 95,
        checkedOut: 17,
        condition: 'good',
        location: 'Uniform Storage',
        lastInventory: '2024-08-15',
        cost: 25.00,
        athleteAssignments: [
          { athleteName: 'Team Practice Squad', quantity: 17, checkoutDate: '2024-08-18' }
        ]
      },
      {
        id: '8',
        name: 'Practice Jerseys Russell Belt Length Plain Porthole Mesh Body and Sleeves, Color White',
        category: 'Uniforms',
        sport: 'Football (M)',
        school: 'Driscoll Middle School',
        totalQuantity: 112,
        availableQuantity: 95,
        checkedOut: 17,
        condition: 'good',
        location: 'Uniform Storage',
        lastInventory: '2024-08-15',
        cost: 25.00,
        athleteAssignments: [
          { athleteName: 'Team Practice Squad', quantity: 17, checkoutDate: '2024-08-18' }
        ]
      },
      {
        id: '9',
        name: 'Practice Pants Russell 14/ Slot Waist',
        category: 'Uniforms',
        sport: 'Football (M)',
        school: 'Driscoll Middle School',
        totalQuantity: 163,
        availableQuantity: 140,
        checkedOut: 23,
        condition: 'good',
        location: 'Uniform Storage',
        lastInventory: '2024-08-15',
        cost: 35.00,
        athleteAssignments: [
          { athleteName: 'Various Players', quantity: 23, checkoutDate: '2024-08-18' }
        ]
      },
      {
        id: '10',
        name: 'Scrimmage Vest-Russell Nylon Mesh Scoop Neck /Color Blue',
        category: 'Training Equipment',
        sport: 'Football (M)',
        school: 'Driscoll Middle School',
        totalQuantity: 20,
        availableQuantity: 20,
        checkedOut: 0,
        condition: 'good',
        location: 'Equipment Room A',
        lastInventory: '2024-08-15',
        cost: 15.00,
        athleteAssignments: []
      },
      {
        id: '11',
        name: 'Helmets Riddell Little Pro 4pt Chin Strap Color White Kralite Mask',
        category: 'Safety Equipment',
        sport: 'Football (M)',
        school: 'Driscoll Middle School',
        totalQuantity: 125,
        availableQuantity: 105,
        checkedOut: 20,
        condition: 'good',
        location: 'Helmet Storage',
        lastInventory: '2024-08-15',
        cost: 175.00,
        vendor: 'Riddell',
        warrantyExpires: '2025-08-15',
        athleteAssignments: [
          { athleteName: 'Starting Lineup', quantity: 20, checkoutDate: '2024-08-18' }
        ]
      },
      {
        id: '12',
        name: 'Shoulder Pads All Brands',
        category: 'Safety Equipment',
        sport: 'Football (M)',
        school: 'Driscoll Middle School',
        totalQuantity: 118,
        availableQuantity: 98,
        checkedOut: 20,
        condition: 'good',
        location: 'Pad Storage',
        lastInventory: '2024-08-15',
        cost: 125.00,
        athleteAssignments: [
          { athleteName: 'Starting Lineup', quantity: 20, checkoutDate: '2024-08-18' }
        ]
      }
    ];
    
    setEquipment(realEquipmentData);
    setFilteredEquipment(realEquipmentData);
  }, []);

  // Filter equipment based on search and filters
  useEffect(() => {
    let filtered = equipment.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSchool = selectedSchool === 'all' || item.school === selectedSchool;
      const matchesSport = selectedSport === 'all' || item.sport === selectedSport;
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesCondition = selectedCondition === 'all' || item.condition === selectedCondition;
      
      return matchesSearch && matchesSchool && matchesSport && matchesCategory && matchesCondition;
    });
    
    setFilteredEquipment(filtered);
  }, [searchTerm, selectedSchool, selectedSport, selectedCategory, selectedCondition, equipment]);

  const getConditionBadge = (condition: string) => {
    const conditionConfig = {
      excellent: { color: 'bg-green-900/50 text-green-300 border border-green-600/50', text: 'Excellent' },
      good: { color: 'bg-blue-900/50 text-blue-300 border border-blue-600/50', text: 'Good' },
      fair: { color: 'bg-yellow-900/50 text-yellow-300 border border-yellow-600/50', text: 'Fair' },
      poor: { color: 'bg-orange-900/50 text-orange-300 border border-orange-600/50', text: 'Poor' },
      needs_replacement: { color: 'bg-red-900/50 text-red-300 border border-red-600/50', text: 'Needs Replacement' }
    };
    
    const config = conditionConfig[condition as keyof typeof conditionConfig];
    
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getAvailabilityStatus = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    
    if (percentage >= 80) {
      return <Badge className="bg-green-900/50 text-green-300 border border-green-600/50">Available</Badge>;
    } else if (percentage >= 50) {
      return <Badge className="bg-yellow-900/50 text-yellow-300 border border-yellow-600/50">Limited</Badge>;
    } else if (percentage > 0) {
      return <Badge className="bg-orange-900/50 text-orange-300 border border-orange-600/50">Low Stock</Badge>;
    } else {
      return <Badge className="bg-red-900/50 text-red-300 border border-red-600/50">Out of Stock</Badge>;
    }
  };

  const handleExportCSV = () => {
    const csvHeaders = ['Equipment Name', 'Size', 'Qty', 'Available', 'School', 'Sport', 'Category', 'Condition', 'Location'];
    const csvData = filteredEquipment.map(item => [
      item.name,
      item.size || '',
      item.totalQuantity,
      item.availableQuantity,
      item.school,
      item.sport,
      item.category,
      item.condition,
      item.location
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipment-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // In a real implementation, this would generate a PDF
    console.log('Exporting to PDF...');
    alert('PDF export functionality would be implemented here using a PDF library like jsPDF');
  };

  const handleEquipmentCheckout = (equipmentId: string) => {
    // Equipment checkout functionality
    console.log('Equipment checkout for:', equipmentId);
  };

  const handleAddEquipment = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
  };

  const totalItems = filteredEquipment.reduce((sum, item) => sum + item.totalQuantity, 0);
  const checkedOutItems = filteredEquipment.reduce((sum, item) => sum + item.checkedOut, 0);
  const availableItems = filteredEquipment.reduce((sum, item) => sum + item.availableQuantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-green-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Equipment Management</h1>
                <p className="text-xs text-green-600 dark:text-green-400">CCISD Sports Equipment System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={handleAddEquipment} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
              <Button variant="outline">
                Equipment Checkout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Available</p>
                  <p className="text-2xl font-bold text-green-600">{availableItems}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Checked Out</p>
                  <p className="text-2xl font-bold text-orange-600">{checkedOutItems}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Equipment Types</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredEquipment.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Equipment Inventory</span>
              <div className="flex items-center space-x-2">
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
                <Button onClick={handleExportPDF} variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Equipment Name Search:"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="Select School:" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  <SelectItem value="Driscoll Middle School">Driscoll Middle School</SelectItem>
                  <SelectItem value="Miller High School">Miller High School</SelectItem>
                  <SelectItem value="Carroll High School">Carroll High School</SelectItem>
                  <SelectItem value="Ray High School">Ray High School</SelectItem>
                  <SelectItem value="Veterans Memorial">Veterans Memorial</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Sport:" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="Football (M)">Football (M)</SelectItem>
                  <SelectItem value="Basketball (M)">Basketball (M)</SelectItem>
                  <SelectItem value="Volleyball (F)">Volleyball (F)</SelectItem>
                  <SelectItem value="Track">Track</SelectItem>
                  <SelectItem value="Baseball">Baseball</SelectItem>
                  <SelectItem value="Soccer">Soccer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category:" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Safety Equipment">Safety Equipment</SelectItem>
                  <SelectItem value="Game Equipment">Game Equipment</SelectItem>
                  <SelectItem value="Training Equipment">Training Equipment</SelectItem>
                  <SelectItem value="Uniforms">Uniforms</SelectItem>
                  <SelectItem value="Maintenance Equipment">Maintenance Equipment</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Condition:" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="needs_replacement">Needs Replacement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Table */}
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Equipment Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Size</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Qty</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Available</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">School</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Sport</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Condition</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">{item.size || '-'}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{item.totalQuantity}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{item.availableQuantity}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{item.school}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{item.sport}</td>
                      <td className="py-4 px-4">{getConditionBadge(item.condition)}</td>
                      <td className="py-4 px-4">{getAvailabilityStatus(item.availableQuantity, item.totalQuantity)}</td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditEquipment(item)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEquipmentCheckout(item.id)}
                          >
                            Checkout
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add Equipment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="equipmentName">Equipment Name</Label>
              <Input id="equipmentName" placeholder="Enter equipment name" />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">Safety Equipment</SelectItem>
                  <SelectItem value="game">Game Equipment</SelectItem>
                  <SelectItem value="training">Training Equipment</SelectItem>
                  <SelectItem value="uniforms">Uniforms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" placeholder="Enter quantity" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Add Equipment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}