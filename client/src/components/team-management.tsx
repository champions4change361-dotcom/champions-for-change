import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Download, Upload, Plus, X, FileText, Users } from "lucide-react";
import { 
  generateCSVTemplate, 
  parseCSV, 
  downloadTeamTemplate, 
  validateTeamNames,
  type TeamData 
} from "@/utils/csv-utils";
import { generateRandomNames } from "@/utils/name-generator";

interface TeamManagementProps {
  teamCount: number;
  initialTeams?: string[];
  onTeamsUpdate: (teams: TeamData[]) => void;
  tournamentType?: 'district' | 'enterprise' | 'free' | 'general';
  competitionFormat: 'bracket' | 'leaderboard' | 'series' | 'bracket-to-series' | 'multi-stage';
}

export default function TeamManagement({ 
  teamCount, 
  initialTeams = [], 
  onTeamsUpdate, 
  tournamentType = 'general',
  competitionFormat 
}: TeamManagementProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [teams, setTeams] = useState<TeamData[]>(() => {
    // Initialize teams from props or create empty teams
    const initial: TeamData[] = [];
    for (let i = 0; i < teamCount; i++) {
      initial.push({
        teamName: initialTeams[i] || `${competitionFormat === 'leaderboard' ? 'Participant' : 'Team'} ${i + 1}`,
        captainName: '',
        contactEmail: '',
        notes: ''
      });
    }
    return initial;
  });

  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkTeamNames, setBulkTeamNames] = useState('');

  const updateTeam = (index: number, field: keyof TeamData, value: string) => {
    const updatedTeams = [...teams];
    updatedTeams[index] = { ...updatedTeams[index], [field]: value };
    setTeams(updatedTeams);
    onTeamsUpdate(updatedTeams);
  };

  const handleGenerateRandomNames = () => {
    if (competitionFormat !== 'leaderboard') return;
    
    const randomNames = generateRandomNames(teamCount);
    console.log('Generated names:', randomNames, 'for count:', teamCount);
    const updatedTeams = teams.map((team, index) => ({
      ...team,
      teamName: randomNames[index] || `Participant ${index + 1}`
    }));
    
    setTeams(updatedTeams);
    onTeamsUpdate(updatedTeams);
    
    toast({
      title: "Random Names Generated",
      description: "Participant names have been generated. You can edit them individually if needed.",
    });
  };

  const handleBulkNamesUpdate = () => {
    const names = bulkTeamNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length !== teamCount) {
      toast({
        title: "Invalid Input",
        description: `Please enter exactly ${teamCount} ${competitionFormat === 'leaderboard' ? 'participant' : 'team'} names, one per line.`,
        variant: "destructive",
      });
      return;
    }

    const updatedTeams = teams.map((team, index) => ({
      ...team,
      teamName: names[index] || team.teamName
    }));

    setTeams(updatedTeams);
    onTeamsUpdate(updatedTeams);
    setShowBulkInput(false);
    setBulkTeamNames('');
    
    toast({
      title: "Teams Updated",
      description: `${competitionFormat === 'leaderboard' ? 'Participant' : 'Team'} names updated successfully!`,
    });
  };

  const downloadTemplate = () => {
    downloadTeamTemplate(tournamentType, teamCount);
    toast({
      title: "Template Downloaded",
      description: `CSV template with ${teamCount} sample ${competitionFormat === 'leaderboard' ? 'participants' : 'teams'} has been downloaded.`,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const template = generateCSVTemplate(tournamentType);
      const { data, errors } = parseCSV(csvText, template.headers);

      if (errors.length > 0) {
        toast({
          title: "CSV Import Errors",
          description: `${errors.length} error(s) found: ${errors[0]}`,
          variant: "destructive",
        });
        return;
      }

      if (data.length !== teamCount) {
        toast({
          title: "Team Count Mismatch",
          description: `CSV contains ${data.length} ${competitionFormat === 'leaderboard' ? 'participants' : 'teams'}, but tournament requires ${teamCount}.`,
          variant: "destructive",
        });
        return;
      }

      const validation = validateTeamNames(data);
      if (!validation.isValid) {
        toast({
          title: "Validation Errors",
          description: `${validation.errors.length} error(s): ${validation.errors[0]}`,
          variant: "destructive",
        });
        return;
      }

      setTeams(data);
      onTeamsUpdate(data);
      
      toast({
        title: "Teams Imported",
        description: `Successfully imported ${data.length} ${competitionFormat === 'leaderboard' ? 'participants' : 'teams'} from CSV.`,
      });
    };

    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateTeamNames = () => {
    const animalNames = [
      'Eagles', 'Tigers', 'Lions', 'Panthers', 'Bears', 'Wolves', 'Hawks', 'Falcons',
      'Dragons', 'Phoenix', 'Sharks', 'Dolphins', 'Thunderbolts', 'Lightning', 'Storm', 'Blazers'
    ];
    
    const colors = [
      'Red', 'Blue', 'Green', 'Golden', 'Silver', 'Black', 'White', 'Purple',
      'Crimson', 'Azure', 'Emerald', 'Royal', 'Dark', 'Bright', 'Wild', 'Mighty'
    ];

    const cities = [
      'Metro', 'Central', 'North', 'South', 'East', 'West', 'Valley', 'Ridge',
      'Hill', 'Lake', 'River', 'Bay', 'Harbor', 'Canyon', 'Mesa', 'Peak'
    ];

    const updatedTeams = teams.map((team, index) => {
      let newName;
      if (competitionFormat === 'leaderboard') {
        // For leaderboard competitions, use individual names
        const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Cameron', 'Avery'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
        newName = `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`;
      } else {
        // For team competitions, use team names
        const animal = animalNames[index % animalNames.length];
        const modifier = index < colors.length ? colors[index] : cities[index % cities.length];
        newName = `${modifier} ${animal}`;
      }
      
      return {
        ...team,
        teamName: newName
      };
    });

    setTeams(updatedTeams);
    onTeamsUpdate(updatedTeams);
    
    toast({
      title: "Names Generated",
      description: `Random ${competitionFormat === 'leaderboard' ? 'participant' : 'team'} names generated successfully!`,
    });
  };

  return (
    <div className="space-y-6" data-testid="team-management">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {competitionFormat === 'leaderboard' ? 'Participant' : 'Team'} Management
            <Badge variant="outline" className="ml-2">
              {teamCount} {competitionFormat === 'leaderboard' ? 'Participants' : 'Teams'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Import/Export Controls */}
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              data-testid="button-download-template"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-import-csv"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import from CSV
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkInput(!showBulkInput)}
              data-testid="button-bulk-input"
            >
              <FileText className="w-4 h-4 mr-2" />
              Bulk Text Input
            </Button>

            {competitionFormat === 'leaderboard' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateRandomNames}
                data-testid="button-generate-names"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Random Names
              </Button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              data-testid="input-file-upload"
            />
          </div>

          {/* Bulk Text Input */}
          {showBulkInput && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label htmlFor="bulk-names" className="block text-sm font-medium text-blue-900 mb-2">
                Enter {competitionFormat === 'leaderboard' ? 'Participant' : 'Team'} Names (one per line)
              </Label>
              <Textarea
                id="bulk-names"
                value={bulkTeamNames}
                onChange={(e) => setBulkTeamNames(e.target.value)}
                placeholder={`${competitionFormat === 'leaderboard' ? 'Participant' : 'Team'} 1\n${competitionFormat === 'leaderboard' ? 'Participant' : 'Team'} 2\n${competitionFormat === 'leaderboard' ? 'Participant' : 'Team'} 3\n...`}
                rows={Math.min(teamCount, 8)}
                className="mb-3"
                data-testid="textarea-bulk-names"
              />
              <div className="flex gap-2">
                <Button onClick={handleBulkNamesUpdate} size="sm" data-testid="button-apply-bulk">
                  Apply Names
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowBulkInput(false)} 
                  size="sm"
                  data-testid="button-cancel-bulk"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Individual Team Inputs */}
          <div className="grid gap-4">
            {teams.map((team, index) => (
              <div 
                key={index} 
                className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border border-gray-200 rounded-lg"
                data-testid={`team-input-${index}`}
              >
                <div>
                  <Label htmlFor={`team-${index}-name`} className="text-sm font-medium">
                    {competitionFormat === 'leaderboard' ? 'Participant' : 'Team'} Name *
                  </Label>
                  <Input
                    id={`team-${index}-name`}
                    value={team.teamName}
                    onChange={(e) => updateTeam(index, 'teamName', e.target.value)}
                    placeholder={`${competitionFormat === 'leaderboard' ? 'Participant' : 'Team'} ${index + 1}`}
                    className="mt-1"
                    data-testid={`input-team-name-${index}`}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`team-${index}-captain`} className="text-sm font-medium">
                    {competitionFormat === 'leaderboard' ? 'Contact Name' : 'Captain Name'}
                  </Label>
                  <Input
                    id={`team-${index}-captain`}
                    value={team.captainName || ''}
                    onChange={(e) => updateTeam(index, 'captainName', e.target.value)}
                    placeholder={competitionFormat === 'leaderboard' ? 'Contact person' : 'Team captain'}
                    className="mt-1"
                    data-testid={`input-captain-name-${index}`}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`team-${index}-email`} className="text-sm font-medium">
                    Contact Email
                  </Label>
                  <Input
                    id={`team-${index}-email`}
                    type="email"
                    value={team.contactEmail || ''}
                    onChange={(e) => updateTeam(index, 'contactEmail', e.target.value)}
                    placeholder="email@example.com"
                    className="mt-1"
                    data-testid={`input-contact-email-${index}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-green-800">
                <strong>{teams.filter(t => t.teamName.trim()).length}</strong> of <strong>{teamCount}</strong> {competitionFormat === 'leaderboard' ? 'participants' : 'teams'} have names
              </div>
              {teams.filter(t => t.teamName.trim()).length === teamCount && (
                <Badge variant="default" className="bg-green-600">
                  All {competitionFormat === 'leaderboard' ? 'Participants' : 'Teams'} Ready!
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}