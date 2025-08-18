import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Target,
  Activity,
  TrendingUp,
  Info,
  FileText
} from "lucide-react";

interface CheerleadingInjuryAssessmentProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InjuryAssessment {
  memberName: string;
  position: string;
  injuryLocation: string;
  activityWhenInjured: string;
  stuntingPosition: string;
  surfaceType: string;
  symptoms: string;
  stuntingActivity: boolean;
  basketTossInvolved: boolean;
  severity: string;
  painLevel: string;
  description: string;
}

export function CheerleadingInjuryAssessment({ isOpen, onClose }: CheerleadingInjuryAssessmentProps) {
  const [step, setStep] = useState(1);
  const [assessment, setAssessment] = useState<InjuryAssessment>({
    memberName: '',
    position: '',
    injuryLocation: '',
    activityWhenInjured: '',
    stuntingPosition: '',
    surfaceType: '',
    symptoms: '',
    stuntingActivity: false,
    basketTossInvolved: false,
    severity: '',
    painLevel: '',
    description: ''
  });
  const [aiResult, setAiResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof InjuryAssessment, value: any) => {
    setAssessment(prev => ({ ...prev, [field]: value }));
  };

  const generateAIAssessment = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/support-team-ai-consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          athleticTrainerId: 'current-trainer',
          consultationType: 'injury_assessment',
          sport: 'cheerleading',
          injuryLocation: assessment.injuryLocation,
          symptoms: assessment.symptoms,
          activityDescription: `${assessment.activityWhenInjured} - ${assessment.description}`,
          stuntingActivity: assessment.stuntingActivity,
          basketTossInvolved: assessment.basketTossInvolved,
          surfaceType: assessment.surfaceType
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAiResult(result.data);
        setStep(3);
      } else {
        console.error('Failed to get AI consultation');
      }
    } catch (error) {
      console.error('Error getting AI consultation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setAssessment({
      memberName: '',
      position: '',
      injuryLocation: '',
      activityWhenInjured: '',
      stuntingPosition: '',
      surfaceType: '',
      symptoms: '',
      stuntingActivity: false,
      basketTossInvolved: false,
      severity: '',
      painLevel: '',
      description: ''
    });
    setAiResult(null);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            Cheerleading Injury Assessment AI
          </DialogTitle>
          <DialogDescription>
            Evidence-based injury assessment with USA Cheer safety protocols
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Cheerleading Injury Statistics
              </h3>
              <div className="text-sm text-purple-800 space-y-1">
                <p>• <strong>44.9% of injuries</strong> are ankle-related</p>
                <p>• <strong>96% of concussions</strong> occur during stunting</p>
                <p>• <strong>85% reduction</strong> in catastrophic injuries since 2014</p>
                <p>• Most common mechanism: Landing from stunts and tumbling</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="memberName">Cheerleader Name</Label>
                <Input
                  id="memberName"
                  value={assessment.memberName}
                  onChange={(e) => handleInputChange('memberName', e.target.value)}
                  placeholder="Enter team member name"
                  data-testid="input-member-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Team Position</Label>
                <Select value={assessment.position} onValueChange={(value) => handleInputChange('position', value)}>
                  <SelectTrigger data-testid="select-position">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base">Base</SelectItem>
                    <SelectItem value="flyer">Flyer</SelectItem>
                    <SelectItem value="back_spot">Back Spot</SelectItem>
                    <SelectItem value="front_spot">Front Spot</SelectItem>
                    <SelectItem value="tumbler">Tumbler</SelectItem>
                    <SelectItem value="captain">Captain</SelectItem>
                    <SelectItem value="member">General Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="injuryLocation">Injury Location</Label>
                <Select value={assessment.injuryLocation} onValueChange={(value) => handleInputChange('injuryLocation', value)}>
                  <SelectTrigger data-testid="select-injury-location">
                    <SelectValue placeholder="Select injury location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ankle">Ankle (44.9% prevalence)</SelectItem>
                    <SelectItem value="knee">Knee</SelectItem>
                    <SelectItem value="wrist">Wrist</SelectItem>
                    <SelectItem value="shoulder">Shoulder</SelectItem>
                    <SelectItem value="neck">Neck/Head (Critical)</SelectItem>
                    <SelectItem value="back">Back</SelectItem>
                    <SelectItem value="hip">Hip</SelectItem>
                    <SelectItem value="elbow">Elbow</SelectItem>
                    <SelectItem value="finger">Finger</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityWhenInjured">Activity When Injured</Label>
                <Select value={assessment.activityWhenInjured} onValueChange={(value) => handleInputChange('activityWhenInjured', value)}>
                  <SelectTrigger data-testid="select-activity">
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stunting">Stunting</SelectItem>
                    <SelectItem value="tumbling">Tumbling</SelectItem>
                    <SelectItem value="jumping">Jumping</SelectItem>
                    <SelectItem value="dancing">Dancing</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="practice">General Practice</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stuntingActivity"
                  checked={assessment.stuntingActivity}
                  onCheckedChange={(checked) => handleInputChange('stuntingActivity', checked)}
                  data-testid="checkbox-stunting"
                />
                <Label htmlFor="stuntingActivity" className="text-sm">
                  Stunting activity was involved (96% concussion risk)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="basketTossInvolved"
                  checked={assessment.basketTossInvolved}
                  onCheckedChange={(checked) => handleInputChange('basketTossInvolved', checked)}
                  data-testid="checkbox-basket-toss"
                />
                <Label htmlFor="basketTossInvolved" className="text-sm">
                  Basket toss was involved (Higher risk activity)
                </Label>
              </div>
            </div>

            {assessment.stuntingActivity && (
              <div className="space-y-2">
                <Label htmlFor="stuntingPosition">Stunting Position</Label>
                <Select value={assessment.stuntingPosition} onValueChange={(value) => handleInputChange('stuntingPosition', value)}>
                  <SelectTrigger data-testid="select-stunt-position">
                    <SelectValue placeholder="Select stunting position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base">Base</SelectItem>
                    <SelectItem value="flyer">Flyer</SelectItem>
                    <SelectItem value="back_spot">Back Spot</SelectItem>
                    <SelectItem value="front_spot">Front Spot</SelectItem>
                    <SelectItem value="none">Not applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="surfaceType">Surface Type</Label>
              <Select value={assessment.surfaceType} onValueChange={(value) => handleInputChange('surfaceType', value)}>
                <SelectTrigger data-testid="select-surface">
                  <SelectValue placeholder="Select surface type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mats">Safety Mats (Recommended)</SelectItem>
                  <SelectItem value="spring_floor">Spring Floor</SelectItem>
                  <SelectItem value="gym_floor">Gym Floor (Higher risk)</SelectItem>
                  <SelectItem value="outdoor_surface">Outdoor Surface</SelectItem>
                  <SelectItem value="football_field">Football Field</SelectItem>
                  <SelectItem value="track">Track Surface</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms Description</Label>
              <Textarea
                id="symptoms"
                value={assessment.symptoms}
                onChange={(e) => handleInputChange('symptoms', e.target.value)}
                placeholder="Describe immediate symptoms, pain level, swelling, mobility..."
                className="min-h-[80px]"
                data-testid="textarea-symptoms"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Incident Description</Label>
              <Textarea
                id="description"
                value={assessment.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe exactly what happened during the injury..."
                className="min-h-[100px]"
                data-testid="textarea-description"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={() => setStep(2)}
                disabled={!assessment.memberName || !assessment.injuryLocation || !assessment.activityWhenInjured}
                data-testid="button-continue-assessment"
              >
                Continue Assessment
                <Brain className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Review Assessment Details</h3>
              <div className="bg-slate-50 p-4 rounded-lg text-left space-y-2">
                <p><strong>Cheerleader:</strong> {assessment.memberName}</p>
                <p><strong>Position:</strong> {assessment.position}</p>
                <p><strong>Injury Location:</strong> {assessment.injuryLocation}</p>
                <p><strong>Activity:</strong> {assessment.activityWhenInjured}</p>
                {assessment.stuntingActivity && <p><strong>Stunting Position:</strong> {assessment.stuntingPosition}</p>}
                <p><strong>Surface:</strong> {assessment.surfaceType}</p>
                {assessment.stuntingActivity && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    High Risk: Stunting Activity Involved
                  </Badge>
                )}
                {assessment.basketTossInvolved && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Critical Risk: Basket Toss Involved
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex justify-between space-x-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={generateAIAssessment}
                disabled={isLoading}
                data-testid="button-generate-ai-assessment"
              >
                {isLoading ? "Analyzing..." : "Generate AI Assessment"}
                <Brain className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && aiResult && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-center">
                <Target className="h-5 w-5 mr-2 text-purple-600" />
                AI Assessment Results
              </h3>
            </div>

            <div className="space-y-4">
              {/* Risk Level */}
              <Card className={`border-2 ${getRiskLevelColor(aiResult.riskLevel)}`}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Risk Level: {aiResult.riskLevel.toUpperCase()}
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-purple-600" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-sm leading-relaxed">
                    {aiResult.aiRecommendations}
                  </div>
                </CardContent>
              </Card>

              {/* Red Flags */}
              {aiResult.redFlags && aiResult.redFlags.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center text-red-800">
                      <XCircle className="h-4 w-4 mr-2" />
                      Red Flags - Immediate Attention Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {aiResult.redFlags.map((flag: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-red-800">
                          <AlertTriangle className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommended Actions */}
              {aiResult.recommendedActions && aiResult.recommendedActions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Recommended Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiResult.recommendedActions.map((action: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-green-800">{index + 1}</span>
                          </div>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Follow-up Required */}
              {aiResult.followUpRequired && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium">Follow-up assessment required within 24-48 hours</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-between space-x-3">
              <Button variant="outline" onClick={handleReset}>
                New Assessment
              </Button>
              <div className="space-x-2">
                <Button variant="outline" data-testid="button-save-assessment">
                  <FileText className="h-4 w-4 mr-2" />
                  Save Assessment
                </Button>
                <Button onClick={onClose} data-testid="button-close-assessment">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}