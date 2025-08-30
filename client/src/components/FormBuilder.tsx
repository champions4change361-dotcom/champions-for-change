import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Trash2, GripVertical, Edit3, Save, X, Check, 
  Type, Hash, Mail, Phone, Calendar, FileText, List, 
  CheckSquare, RadioIcon, Upload
} from "lucide-react";

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  label: string;
  placeholder?: string;
  isRequired: boolean;
  position: number;
  options?: string[]; // for select, radio, checkbox
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

interface FormBuilderProps {
  moduleId: string;
  initialFields?: FormField[];
  onChange: (fields: FormField[]) => void;
}

const fieldTypes = [
  { value: 'text', label: 'Text Input', icon: Type, description: 'Single line text' },
  { value: 'email', label: 'Email', icon: Mail, description: 'Email address' },
  { value: 'phone', label: 'Phone Number', icon: Phone, description: 'Phone number' },
  { value: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
  { value: 'textarea', label: 'Long Text', icon: FileText, description: 'Multi-line text' },
  { value: 'select', label: 'Dropdown', icon: List, description: 'Select from options' },
  { value: 'checkbox', label: 'Checkboxes', icon: CheckSquare, description: 'Multiple selections' },
  { value: 'radio', label: 'Radio Buttons', icon: RadioIcon, description: 'Single selection' },
  { value: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { value: 'file', label: 'File Upload', icon: Upload, description: 'File attachment' },
];

export default function FormBuilder({ moduleId, initialFields = [], onChange }: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draggedField, setDraggedField] = useState<string | null>(null);

  // Default fields that are commonly needed for sports registration
  const defaultFields: FormField[] = [
    {
      id: 'athlete-name',
      type: 'text',
      label: 'Athlete Name',
      placeholder: 'Full name of athlete',
      isRequired: true,
      position: 0
    },
    {
      id: 'date-of-birth',
      type: 'date',
      label: 'Date of Birth',
      isRequired: true,
      position: 1
    },
    {
      id: 'parent-name',
      type: 'text',
      label: 'Parent/Guardian Name',
      placeholder: 'Full name of parent or guardian',
      isRequired: true,
      position: 2
    },
    {
      id: 'phone-number',
      type: 'phone',
      label: 'Contact Phone',
      placeholder: '(555) 123-4567',
      isRequired: true,
      position: 3
    },
    {
      id: 'email',
      type: 'email',
      label: 'Contact Email',
      placeholder: 'parent@email.com',
      isRequired: true,
      position: 4
    },
    {
      id: 'address',
      type: 'textarea',
      label: 'Address',
      placeholder: 'Street address, city, state, zip',
      isRequired: true,
      position: 5
    }
  ];

  useEffect(() => {
    // Initialize with default fields if no fields provided
    if (fields.length === 0 && initialFields.length === 0) {
      setFields(defaultFields);
    }
  }, []);

  useEffect(() => {
    onChange(fields);
  }, [fields, onChange]);

  const addField = (fieldType: string) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: fieldType as FormField['type'],
      label: `New ${fieldTypes.find(ft => ft.value === fieldType)?.label}`,
      isRequired: false,
      position: fields.length,
      ...(fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox' ? { options: ['Option 1', 'Option 2'] } : {})
    };
    setFields(prev => [...prev, newField]);
    setEditingField(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const deleteField = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId).map((field, index) => ({
      ...field,
      position: index
    })));
  };

  const moveField = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = fields[dragIndex];
    const newFields = [...fields];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, draggedItem);
    
    setFields(newFields.map((field, index) => ({ ...field, position: index })));
  };

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedField(fieldId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedField) return;

    const draggedIndex = fields.findIndex(f => f.id === draggedField);
    if (draggedIndex !== -1) {
      moveField(draggedIndex, targetIndex);
    }
    setDraggedField(null);
  };

  const renderField = (field: FormField, index: number) => {
    const fieldType = fieldTypes.find(ft => ft.value === field.type);
    const IconComponent = fieldType?.icon || Type;
    const isEditing = editingField === field.id;

    return (
      <div
        key={field.id}
        draggable={!isEditing}
        onDragStart={(e) => handleDragStart(e, field.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
        className={`group border rounded-lg p-4 transition-all ${
          draggedField === field.id ? 'opacity-50' : ''
        } ${isEditing ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
        data-testid={`form-field-${field.type}-${index}`}
      >
        {isEditing ? (
          <EditFieldForm 
            field={field} 
            onSave={(updates) => {
              updateField(field.id, updates);
              setEditingField(null);
            }}
            onCancel={() => setEditingField(null)}
          />
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
              <div className="p-2 bg-blue-100 rounded-md">
                <IconComponent className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{field.label}</span>
                  {field.isRequired && (
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {fieldType?.description}
                  {field.placeholder && ` • ${field.placeholder}`}
                </div>
                {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && field.options && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {field.options.map((option, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {option}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingField(field.id)}
                data-testid={`button-edit-field-${field.id}`}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteField(field.id)}
                data-testid={`button-delete-field-${field.id}`}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Registration Form Builder</h3>
          <p className="text-sm text-gray-600">Create a custom form for athlete registration</p>
        </div>
        <Button
          size="sm"
          onClick={() => setFields(defaultFields)}
          variant="outline"
          data-testid="button-reset-form"
        >
          Reset to Default
        </Button>
      </div>

      {/* Field Type Picker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Form Fields</CardTitle>
          <CardDescription>Click to add different types of fields to your form</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {fieldTypes.map((fieldType) => {
              const IconComponent = fieldType.icon;
              return (
                <button
                  key={fieldType.value}
                  onClick={() => addField(fieldType.value)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  data-testid={`add-field-${fieldType.value}`}
                >
                  <IconComponent className="h-5 w-5 text-blue-600 mb-2" />
                  <div className="font-medium text-sm">{fieldType.label}</div>
                  <div className="text-xs text-gray-500">{fieldType.description}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Form Fields ({fields.length})</CardTitle>
          <CardDescription>Drag and drop to reorder fields</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3" data-testid="form-fields-container">
            {fields.map((field, index) => renderField(field, index))}
            
            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No form fields yet</p>
                <p className="text-sm">Add fields using the options above</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Field editing form component
interface EditFieldFormProps {
  field: FormField;
  onSave: (updates: Partial<FormField>) => void;
  onCancel: () => void;
}

function EditFieldForm({ field, onSave, onCancel }: EditFieldFormProps) {
  const [label, setLabel] = useState(field.label);
  const [placeholder, setPlaceholder] = useState(field.placeholder || '');
  const [isRequired, setIsRequired] = useState(field.isRequired);
  const [options, setOptions] = useState(field.options || []);
  const [newOption, setNewOption] = useState('');

  const hasOptions = field.type === 'select' || field.type === 'radio' || field.type === 'checkbox';

  const addOption = () => {
    if (newOption.trim()) {
      setOptions(prev => [...prev, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      label,
      placeholder: placeholder || undefined,
      isRequired,
      ...(hasOptions ? { options } : {})
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Field Label</label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter field label"
            data-testid="input-field-label"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Placeholder Text</label>
          <Input
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            placeholder="Enter placeholder text"
            data-testid="input-field-placeholder"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isRequired}
          onChange={(e) => setIsRequired(e.target.checked)}
          className="rounded"
          data-testid="checkbox-field-required"
        />
        <label className="text-sm font-medium">Required field</label>
      </div>

      {hasOptions && (
        <div>
          <label className="block text-sm font-medium mb-2">Options</label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input value={option} readOnly className="flex-1" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeOption(index)}
                  data-testid={`remove-option-${index}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add new option"
                onKeyPress={(e) => e.key === 'Enter' && addOption()}
                data-testid="input-new-option"
              />
              <Button size="sm" onClick={addOption} data-testid="button-add-option">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-2">
        <Button size="sm" variant="outline" onClick={onCancel} data-testid="button-cancel-edit">
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} data-testid="button-save-field">
          <Save className="h-4 w-4 mr-2" />
          Save Field
        </Button>
      </div>
    </div>
  );
}