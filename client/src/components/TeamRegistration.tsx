import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Plus, 
  Upload, 
  FileCheck, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
  dateOfBirth?: string;
  jerseyNumber?: string;
  position?: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalNotes?: string;
  allergies?: string;
  medications?: string;
  documents: {
    birthCertificate: boolean;
    medicalForm: boolean;
    photoConsent: boolean;
    liabilityWaiver: boolean;
  };
  paymentStatus: 'unpaid' | 'paid';
  paymentAmount?: number;
}

interface TeamRegistrationProps {
  tournamentId: string;
  tournamentName: string;
  entryFeePerPlayer: number;
  requiredDocuments: string[];
  onSubmit?: (teamData: any) => void;
}

export function TeamRegistration({
  tournamentId,
  tournamentName,
  entryFeePerPlayer,
  requiredDocuments,
  onSubmit
}: TeamRegistrationProps) {
  const [activeTab, setActiveTab] = useState('team-info');
  const [teamData, setTeamData] = useState({
    teamName: '',
    organizationName: '',
    coachName: '',
    coachEmail: '',
    coachPhone: '',
    assistantCoaches: [] as Array<{name: string; email: string; phone: string}>,
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({
    name: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    documents: {
      birthCertificate: false,
      medicalForm: false,
      photoConsent: false,
      liabilityWaiver: false,
    },
    paymentStatus: 'unpaid'
  });

  const addPlayer = () => {
    if (newPlayer.name && newPlayer.parentName && newPlayer.parentEmail) {
      const player: Player = {
        ...newPlayer as Player,
        id: Date.now().toString(),
        paymentAmount: entryFeePerPlayer
      };
      setPlayers([...players, player]);
      setNewPlayer({
        name: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        documents: {
          birthCertificate: false,
          medicalForm: false,
          photoConsent: false,
          liabilityWaiver: false,
        },
        paymentStatus: 'unpaid'
      });
    }
  };

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const updatePlayerPayment = (playerId: string, status: 'paid' | 'unpaid') => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, paymentStatus: status } : p
    ));
  };

  const updatePlayerDocument = (playerId: string, docType: keyof Player['documents'], status: boolean) => {
    setPlayers(players.map(p => 
      p.id === playerId 
        ? { ...p, documents: { ...p.documents, [docType]: status } }
        : p
    ));
  };

  // Calculate completion stats
  const totalFee = players.length * entryFeePerPlayer;
  const paidAmount = players.filter(p => p.paymentStatus === 'paid').length * entryFeePerPlayer;
  const paymentProgress = players.length > 0 ? (paidAmount / totalFee) * 100 : 0;
  
  const documentsComplete = players.reduce((acc, player) => {
    const playerDocsComplete = Object.values(player.documents).every(doc => doc);
    return acc + (playerDocsComplete ? 1 : 0);
  }, 0);
  const documentProgress = players.length > 0 ? (documentsComplete / players.length) * 100 : 0;

  const canSubmitRegistration = players.length > 0 && 
    paymentProgress === 100 && 
    documentProgress === 100 &&
    teamData.teamName && 
    teamData.coachName &&
    teamData.coachEmail;

  const handleSubmit = () => {
    if (canSubmitRegistration && onSubmit) {
      onSubmit({
        ...teamData,
        players,
        tournamentId,
        totalFee,
        paidAmount,
        documentStatus: 'complete'
      });
    }
  };

  return (
    <div className="space-y-6" data-testid="team-registration">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Registration - {tournamentName}
          </CardTitle>
          <CardDescription>
            Register your complete team with payment tracking and document management
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{players.length}</div>
              <p className="text-sm text-gray-600">Players Registered</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${paidAmount}</div>
              <p className="text-sm text-gray-600">of ${totalFee} Paid</p>
              <Progress value={paymentProgress} className="mt-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{documentsComplete}</div>
              <p className="text-sm text-gray-600">of {players.length} Docs Complete</p>
              <Progress value={documentProgress} className="mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="team-info">Team Info</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="team-info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Team Name *</Label>
                  <Input
                    value={teamData.teamName}
                    onChange={(e) => setTeamData(prev => ({ ...prev, teamName: e.target.value }))}
                    placeholder="e.g., Lightning Bolts"
                    data-testid="input-team-name"
                  />
                </div>
                <div>
                  <Label>Organization</Label>
                  <Input
                    value={teamData.organizationName}
                    onChange={(e) => setTeamData(prev => ({ ...prev, organizationName: e.target.value }))}
                    placeholder="School or Club Name"
                    data-testid="input-organization"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Coach Name *</Label>
                  <Input
                    value={teamData.coachName}
                    onChange={(e) => setTeamData(prev => ({ ...prev, coachName: e.target.value }))}
                    placeholder="Head Coach"
                    data-testid="input-coach-name"
                  />
                </div>
                <div>
                  <Label>Coach Email *</Label>
                  <Input
                    type="email"
                    value={teamData.coachEmail}
                    onChange={(e) => setTeamData(prev => ({ ...prev, coachEmail: e.target.value }))}
                    placeholder="coach@email.com"
                    data-testid="input-coach-email"
                  />
                </div>
                <div>
                  <Label>Coach Phone</Label>
                  <Input
                    value={teamData.coachPhone}
                    onChange={(e) => setTeamData(prev => ({ ...prev, coachPhone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    data-testid="input-coach-phone"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Players</CardTitle>
              <CardDescription>
                Add players one by one with parent contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Player Name *</Label>
                  <Input
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Player full name"
                    data-testid="input-player-name"
                  />
                </div>
                <div>
                  <Label>Jersey Number</Label>
                  <Input
                    value={newPlayer.jerseyNumber}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, jerseyNumber: e.target.value }))}
                    placeholder="##"
                    data-testid="input-jersey-number"
                  />
                </div>
                <div>
                  <Label>Position</Label>
                  <Input
                    value={newPlayer.position}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Position"
                    data-testid="input-position"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Parent/Guardian Name *</Label>
                  <Input
                    value={newPlayer.parentName}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, parentName: e.target.value }))}
                    placeholder="Parent name"
                    data-testid="input-parent-name"
                  />
                </div>
                <div>
                  <Label>Parent Email *</Label>
                  <Input
                    type="email"
                    value={newPlayer.parentEmail}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, parentEmail: e.target.value }))}
                    placeholder="parent@email.com"
                    data-testid="input-parent-email"
                  />
                </div>
                <div>
                  <Label>Parent Phone</Label>
                  <Input
                    value={newPlayer.parentPhone}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, parentPhone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    data-testid="input-parent-phone"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Emergency Contact Name *</Label>
                  <Input
                    value={newPlayer.emergencyContactName}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                    placeholder="Emergency contact"
                    data-testid="input-emergency-name"
                  />
                </div>
                <div>
                  <Label>Emergency Contact Phone *</Label>
                  <Input
                    value={newPlayer.emergencyContactPhone}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                    placeholder="(555) 987-6543"
                    data-testid="input-emergency-phone"
                  />
                </div>
              </div>

              <Button onClick={addPlayer} className="w-full" data-testid="button-add-player">
                <Plus className="h-4 w-4 mr-2" />
                Add Player to Team
              </Button>
            </CardContent>
          </Card>

          {/* Players List */}
          {players.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Team Roster ({players.length} players)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {players.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{player.name}</div>
                          {player.jerseyNumber && (
                            <Badge variant="outline">#{player.jerseyNumber}</Badge>
                          )}
                          {player.position && (
                            <Badge variant="secondary">{player.position}</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Parent: {player.parentName} ({player.parentEmail})
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={player.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                          {player.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removePlayer(player.id)}
                          data-testid={`button-remove-player-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Legal Disclaimer:</strong> These consent forms are generic templates. 
              Please verify compliance with your local and state laws as requirements may differ.
            </AlertDescription>
          </Alert>

          {players.map((player) => (
            <Card key={player.id}>
              <CardHeader>
                <CardTitle className="text-lg">{player.name} - Documents</CardTitle>
                <CardDescription>Required documents for tournament participation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(player.documents).map(([docType, completed]) => (
                    <div key={docType} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="capitalize">
                          {docType.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <Button
                        variant={completed ? "outline" : "default"}
                        size="sm"
                        onClick={() => updatePlayerDocument(player.id, docType as keyof Player['documents'], !completed)}
                        data-testid={`button-${docType}-${player.id}`}
                      >
                        {completed ? <Eye className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Tracking</CardTitle>
              <CardDescription>Track individual player payments toward team total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total Team Fee:</span>
                  <span className="text-xl font-bold">${totalFee}</span>
                </div>
                
                <div className="space-y-3">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-gray-600">${entryFeePerPlayer}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={player.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                          {player.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePlayerPayment(
                            player.id, 
                            player.paymentStatus === 'paid' ? 'unpaid' : 'paid'
                          )}
                          data-testid={`button-payment-${player.id}`}
                        >
                          {player.paymentStatus === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Progress value={paymentProgress} className="mt-4" />
                <div className="text-center text-sm text-gray-600">
                  {Math.round(paymentProgress)}% Complete (${paidAmount} of ${totalFee})
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit Registration */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Ready to Submit?</h3>
              <p className="text-sm text-gray-600">
                {canSubmitRegistration 
                  ? "All players registered, paid, and documents complete!"
                  : "Complete team info, payments, and documents to submit registration"
                }
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmitRegistration}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-submit-team-registration"
            >
              {canSubmitRegistration ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Team Registration
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Incomplete Registration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}