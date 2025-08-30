import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Trash2, Tag, Calendar, Users, Percent, DollarSign, Edit3 
} from "lucide-react";

interface DiscountCode {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  maxUses?: number;
  currentUses: number;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
}

interface DiscountCodeManagerProps {
  tournamentId: string;
  onDiscountCodesChange: (codes: DiscountCode[]) => void;
}

export default function DiscountCodeManager({ tournamentId, onDiscountCodesChange }: DiscountCodeManagerProps) {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [newCode, setNewCode] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed_amount',
    discountValue: 0,
    maxUses: undefined as number | undefined,
    validUntil: ''
  });

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(prev => ({ ...prev, code: result }));
  };

  const addDiscountCode = () => {
    if (!newCode.code.trim()) return;

    const code: DiscountCode = {
      id: Date.now().toString(), // Temporary ID for frontend
      code: newCode.code.toUpperCase(),
      description: newCode.description,
      discountType: newCode.discountType,
      discountValue: newCode.discountValue,
      maxUses: newCode.maxUses,
      currentUses: 0,
      validFrom: new Date().toISOString(),
      validUntil: newCode.validUntil || undefined,
      isActive: true
    };

    const updatedCodes = [...discountCodes, code];
    setDiscountCodes(updatedCodes);
    onDiscountCodesChange(updatedCodes);
    
    // Reset form
    setNewCode({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      maxUses: undefined,
      validUntil: ''
    });
    setShowAddForm(false);
  };

  const updateDiscountCode = () => {
    if (!editingCode) return;

    const updatedCodes = discountCodes.map(code => 
      code.id === editingCode.id 
        ? { ...editingCode, code: editingCode.code.toUpperCase() }
        : code
    );
    setDiscountCodes(updatedCodes);
    onDiscountCodesChange(updatedCodes);
    setEditingCode(null);
  };

  const deleteDiscountCode = (id: string) => {
    const updatedCodes = discountCodes.filter(code => code.id !== id);
    setDiscountCodes(updatedCodes);
    onDiscountCodesChange(updatedCodes);
  };

  const toggleCodeStatus = (id: string) => {
    const updatedCodes = discountCodes.map(code => 
      code.id === id ? { ...code, isActive: !code.isActive } : code
    );
    setDiscountCodes(updatedCodes);
    onDiscountCodesChange(updatedCodes);
  };

  const formatDiscountDisplay = (type: string, value: number) => {
    return type === 'percentage' ? `${value}% off` : `$${value} off`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Tag className="h-5 w-5" />
            <span>Discount Codes</span>
          </h3>
          <p className="text-sm text-gray-600">Create discount codes to reduce registration fees</p>
        </div>
        {!showAddForm && (
          <Button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2"
            data-testid="button-add-discount-code"
          >
            <Plus className="h-4 w-4" />
            <span>Add Code</span>
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingCode) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingCode ? 'Edit Discount Code' : 'Create New Discount Code'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discount Code</label>
                <div className="flex space-x-2">
                  <Input
                    value={editingCode ? editingCode.code : newCode.code}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      if (editingCode) {
                        setEditingCode({ ...editingCode, code: value });
                      } else {
                        setNewCode(prev => ({ ...prev, code: value }));
                      }
                    }}
                    placeholder="EARLY2024"
                    className="uppercase"
                    data-testid="input-discount-code"
                  />
                  {!editingCode && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateRandomCode}
                      data-testid="button-generate-code"
                    >
                      Generate
                    </Button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <Input
                  value={editingCode ? editingCode.description : newCode.description}
                  onChange={(e) => {
                    if (editingCode) {
                      setEditingCode({ ...editingCode, description: e.target.value });
                    } else {
                      setNewCode(prev => ({ ...prev, description: e.target.value }));
                    }
                  }}
                  placeholder="Early bird discount"
                  data-testid="input-discount-description"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discount Type</label>
                <Select 
                  value={editingCode ? editingCode.discountType : newCode.discountType}
                  onValueChange={(value: 'percentage' | 'fixed_amount') => {
                    if (editingCode) {
                      setEditingCode({ ...editingCode, discountType: value });
                    } else {
                      setNewCode(prev => ({ ...prev, discountType: value }));
                    }
                  }}
                >
                  <SelectTrigger data-testid="select-discount-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <div className="flex items-center space-x-2">
                        <Percent className="h-4 w-4" />
                        <span>Percentage</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed_amount">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Fixed Amount</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Discount Value {(editingCode ? editingCode.discountType : newCode.discountType) === 'percentage' ? '(%)' : '($)'}
                </label>
                <Input
                  type="number"
                  value={editingCode ? editingCode.discountValue : newCode.discountValue}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    if (editingCode) {
                      setEditingCode({ ...editingCode, discountValue: value });
                    } else {
                      setNewCode(prev => ({ ...prev, discountValue: value }));
                    }
                  }}
                  placeholder="15"
                  data-testid="input-discount-value"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Max Uses (Optional)</label>
                <Input
                  type="number"
                  value={editingCode ? editingCode.maxUses || '' : newCode.maxUses || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    if (editingCode) {
                      setEditingCode({ ...editingCode, maxUses: value });
                    } else {
                      setNewCode(prev => ({ ...prev, maxUses: value }));
                    }
                  }}
                  placeholder="100"
                  data-testid="input-max-uses"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Expiration Date (Optional)</label>
              <Input
                type="datetime-local"
                value={editingCode ? editingCode.validUntil?.slice(0, 16) || '' : newCode.validUntil}
                onChange={(e) => {
                  if (editingCode) {
                    setEditingCode({ ...editingCode, validUntil: e.target.value ? new Date(e.target.value).toISOString() : undefined });
                  } else {
                    setNewCode(prev => ({ ...prev, validUntil: e.target.value }));
                  }
                }}
                data-testid="input-expiration-date"
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={editingCode ? updateDiscountCode : addDiscountCode}
                data-testid="button-save-discount-code"
              >
                {editingCode ? 'Update Code' : 'Add Code'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCode(null);
                }}
                data-testid="button-cancel-discount-code"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Discount Codes */}
      {discountCodes.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Active Discount Codes</h4>
          {discountCodes.map((code) => (
            <Card key={code.id} className={`${code.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="font-mono text-lg font-bold bg-white px-3 py-1 rounded border">
                      {code.code}
                    </div>
                    <div>
                      <div className="font-semibold text-green-600">
                        {formatDiscountDisplay(code.discountType, code.discountValue)}
                      </div>
                      {code.description && (
                        <div className="text-sm text-gray-600">{code.description}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {code.maxUses && (
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{code.currentUses}/{code.maxUses}</span>
                      </Badge>
                    )}
                    
                    {code.validUntil && (
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Until {new Date(code.validUntil).toLocaleDateString()}</span>
                      </Badge>
                    )}
                    
                    <Badge variant={code.isActive ? "default" : "secondary"}>
                      {code.isActive ? "Active" : "Inactive"}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCode(code)}
                      data-testid={`button-edit-${code.id}`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCodeStatus(code.id)}
                      data-testid={`button-toggle-${code.id}`}
                    >
                      {code.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteDiscountCode(code.id)}
                      data-testid={`button-delete-${code.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {discountCodes.length === 0 && !showAddForm && (
        <Card className="border-dashed border-gray-300">
          <CardContent className="p-8 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No discount codes yet</h3>
            <p className="text-gray-500 mb-4">
              Create discount codes to offer special pricing to your participants
            </p>
            <Button onClick={() => setShowAddForm(true)} data-testid="button-create-first-code">
              Create Your First Discount Code
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}