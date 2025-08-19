import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Users, 
  Building, 
  Download,
  Upload,
  Settings,
  User,
  Crown,
  Shield
} from "lucide-react";

interface OrgPosition {
  id: string;
  title: string;
  name: string;
  email: string;
  level: number;
  parentId?: string;
  children: string[];
  permissions: string[];
  color: string;
}

interface OrgChartBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orgChart: OrgPosition[]) => void;
}

export function OrgChartBuilder({ isOpen, onClose, onSave }: OrgChartBuilderProps) {
  const [positions, setPositions] = useState<OrgPosition[]>([
    {
      id: 'root',
      title: 'Superintendent',
      name: '',
      email: '',
      level: 0,
      children: [],
      permissions: ['full_access'],
      color: 'bg-purple-100 text-purple-800 border-purple-300'
    }
  ]);

  const [selectedPosition, setSelectedPosition] = useState<OrgPosition | null>(null);
  const [showPositionEditor, setShowPositionEditor] = useState(false);

  const templateOrgCharts = {
    small_district: [
      { id: 'super', title: 'Superintendent', level: 0, permissions: ['full_access'], color: 'bg-purple-100 text-purple-800 border-purple-300' },
      { id: 'ad', title: 'Athletic Director', level: 1, parentId: 'super', permissions: ['athletics_full'], color: 'bg-blue-100 text-blue-800 border-blue-300' },
      { id: 'at1', title: 'Athletic Trainer', level: 2, parentId: 'ad', permissions: ['medical_access'], color: 'bg-green-100 text-green-800 border-green-300' },
      { id: 'coach1', title: 'Head Coach', level: 2, parentId: 'ad', permissions: ['team_management'], color: 'bg-orange-100 text-orange-800 border-orange-300' }
    ],
    large_district: [
      { id: 'super', title: 'Superintendent', level: 0, permissions: ['full_access'], color: 'bg-purple-100 text-purple-800 border-purple-300' },
      { id: 'ad', title: 'Athletic Director', level: 1, parentId: 'super', permissions: ['athletics_full'], color: 'bg-blue-100 text-blue-800 border-blue-300' },
      { id: 'aad', title: 'Assistant Athletic Director', level: 1, parentId: 'super', permissions: ['athletics_admin'], color: 'bg-blue-100 text-blue-800 border-blue-300' },
      { id: 'hat', title: 'Head Athletic Trainer', level: 2, parentId: 'ad', permissions: ['medical_full'], color: 'bg-red-100 text-red-800 border-red-300' },
      { id: 'at1', title: 'School Athletic Trainer', level: 3, parentId: 'hat', permissions: ['medical_school'], color: 'bg-green-100 text-green-800 border-green-300' },
      { id: 'at2', title: 'School Athletic Trainer', level: 3, parentId: 'hat', permissions: ['medical_school'], color: 'bg-green-100 text-green-800 border-green-300' }
    ],
    vlc_model: [
      { id: 'super', title: 'Superintendent', level: 0, permissions: ['full_access'], color: 'bg-purple-100 text-purple-800 border-purple-300' },
      { id: 'ad', title: 'Athletic Director', level: 1, parentId: 'super', permissions: ['athletics_full'], color: 'bg-blue-100 text-blue-800 border-blue-300' },
      { id: 'miller', title: 'Miller VLC Athletic Trainer', level: 2, parentId: 'ad', permissions: ['medical_school'], color: 'bg-green-100 text-green-800 border-green-300' },
      { id: 'carroll', title: 'Carroll VLC Athletic Trainer', level: 2, parentId: 'ad', permissions: ['medical_school'], color: 'bg-green-100 text-green-800 border-green-300' },
      { id: 'veterans', title: 'Veterans Memorial VLC Athletic Trainer', level: 2, parentId: 'ad', permissions: ['medical_school'], color: 'bg-green-100 text-green-800 border-green-300' },
      { id: 'ray', title: 'Ray VLC Athletic Trainer', level: 2, parentId: 'ad', permissions: ['medical_school'], color: 'bg-green-100 text-green-800 border-green-300' }
    ]
  };

  const addPosition = (parentId: string) => {
    const parent = positions.find(p => p.id === parentId);
    if (!parent) return;

    const newPosition: OrgPosition = {
      id: `pos-${Date.now()}`,
      title: 'New Position',
      name: '',
      email: '',
      level: parent.level + 1,
      parentId: parentId,
      children: [],
      permissions: ['basic_access'],
      color: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    setPositions(prev => {
      const updated = [...prev, newPosition];
      // Update parent's children array
      return updated.map(p => 
        p.id === parentId 
          ? { ...p, children: [...p.children, newPosition.id] }
          : p
      );
    });
  };

  const deletePosition = (positionId: string) => {
    if (positionId === 'root') return; // Can't delete root

    setPositions(prev => {
      const toDelete = prev.find(p => p.id === positionId);
      if (!toDelete) return prev;

      // Remove from parent's children
      const updated = prev.filter(p => p.id !== positionId)
        .map(p => 
          p.children.includes(positionId)
            ? { ...p, children: p.children.filter(c => c !== positionId) }
            : p
        );

      // Reassign orphaned children to deleted position's parent
      const orphans = prev.filter(p => p.parentId === positionId);
      return updated.map(p => {
        const isOrphan = orphans.find(o => o.id === p.id);
        return isOrphan ? { ...p, parentId: toDelete.parentId, level: p.level - 1 } : p;
      });
    });
  };

  const updatePosition = (updatedPosition: OrgPosition) => {
    setPositions(prev => prev.map(p => p.id === updatedPosition.id ? updatedPosition : p));
  };

  const loadTemplate = (template: keyof typeof templateOrgCharts) => {
    const templateData = templateOrgCharts[template];
    const newPositions: OrgPosition[] = templateData.map(pos => ({
      ...pos,
      name: '',
      email: '',
      children: templateData.filter(p => p.parentId === pos.id).map(p => p.id)
    }));
    setPositions(newPositions);
  };

  const exportOrgChart = () => {
    const dataStr = JSON.stringify(positions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'org-chart.json';
    link.click();
  };

  const renderPosition = (position: OrgPosition) => {
    const children = positions.filter(p => p.parentId === position.id);
    
    return (
      <div key={position.id} className="flex flex-col items-center">
        <Card 
          className={`w-64 mb-4 cursor-pointer hover:shadow-lg transition-shadow border-2 ${position.color}`}
          onClick={() => {
            setSelectedPosition(position);
            setShowPositionEditor(true);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {position.level === 0 && <Crown className="h-4 w-4" />}
                {position.level === 1 && <Shield className="h-4 w-4" />}
                {position.level >= 2 && <User className="h-4 w-4" />}
                <h4 className="font-semibold text-sm">{position.title}</h4>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPosition(position.id);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                {position.id !== 'root' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePosition(position.id);
                    }}
                    className="h-6 w-6 p-0 text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="text-xs space-y-1">
              <div className="font-medium">{position.name || 'No name assigned'}</div>
              <div className="text-gray-600">{position.email || 'No email'}</div>
              <div className="flex flex-wrap gap-1">
                {position.permissions.slice(0, 2).map(perm => (
                  <Badge key={perm} variant="secondary" className="text-xs">
                    {perm.replace('_', ' ')}
                  </Badge>
                ))}
                {position.permissions.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{position.permissions.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {children.length > 0 && (
          <>
            <div className="w-px h-6 bg-gray-300 mb-2"></div>
            <div className="flex space-x-8">
              {children.map(child => renderPosition(child))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>District Organizational Chart Builder</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Selection */}
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Quick Templates:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadTemplate('small_district')}
            >
              Small District
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadTemplate('large_district')}
            >
              Large District
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadTemplate('vlc_model')}
            >
              VLC Model (CCISD)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={exportOrgChart}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>

          {/* Org Chart Visualization */}
          <div className="bg-white border rounded-lg p-6 overflow-x-auto">
            <div className="min-w-max">
              {positions.filter(p => p.level === 0).map(rootPosition => 
                renderPosition(rootPosition)
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                onSave(positions);
                onClose();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Organizational Chart
            </Button>
          </div>
        </div>

        {/* Position Editor Modal */}
        {showPositionEditor && selectedPosition && (
          <Dialog open={showPositionEditor} onOpenChange={setShowPositionEditor}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Position</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Position Title</label>
                  <Input
                    value={selectedPosition.title}
                    onChange={(e) => setSelectedPosition({...selectedPosition, title: e.target.value})}
                    placeholder="Athletic Director, Head Coach, etc."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Employee Name</label>
                  <Input
                    value={selectedPosition.name}
                    onChange={(e) => setSelectedPosition({...selectedPosition, name: e.target.value})}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={selectedPosition.email}
                    onChange={(e) => setSelectedPosition({...selectedPosition, email: e.target.value})}
                    placeholder="john.smith@district.edu"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowPositionEditor(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    updatePosition(selectedPosition);
                    setShowPositionEditor(false);
                  }}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}