import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Trophy, 
  Target, 
  Send, 
  Crown, 
  Zap,
  Flame,
  ThumbsDown
} from 'lucide-react';

interface FantasySmackTalkProps {
  leagueId: string;
  leagueName: string;
  userRole: 'commissioner' | 'player';
  remainingMessages: number;
  messageLimit: number;
}

export function FantasySmackTalk({
  leagueId,
  leagueName,
  userRole,
  remainingMessages,
  messageLimit
}: FantasySmackTalkProps) {
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState('smack_talk');
  const [targetPlayer, setTargetPlayer] = useState('all');

  // Quick smack talk templates
  const smackTalkTemplates = {
    winning: [
      "My team is CRUSHING yours this week! 😎",
      "Still looking up at me from [RANK] place!",
      "Your roster looks like a clearance rack!",
      "Hope you're ready for this beatdown!",
    ],
    losing: [
      "Lucky week for you, won't happen again!",
      "My studs are just warming up!",
      "Enjoy your temporary lead!",
      "Next week you're toast!",
    ],
    general: [
      "Fantasy football is about skill, not luck!",
      "Your draft strategy was... interesting",
      "Time to separate the pros from the amateurs!",
      "May the best manager win!",
    ],
    playoffs: [
      "Playoff time - no more Mr. Nice Guy!",
      "Your Cinderella story ends HERE!",
      "Time for the championship-caliber teams!",
      "Hope you enjoyed the regular season!",
    ]
  };

  // Mock league members for demonstration
  const leagueMembers = [
    { id: 'all', name: 'Everyone', role: 'broadcast' },
    { id: '1', name: 'Mike "The Shark"', currentRank: 1 },
    { id: '2', name: 'Sarah "Destroyer"', currentRank: 3 },
    { id: '3', name: 'Coach Johnson', currentRank: 5 },
    { id: '4', name: 'Danny "Points"', currentRank: 8 },
  ];

  const handleQuickMessage = (template: string) => {
    const targetMember = leagueMembers.find(m => m.id === targetPlayer);
    let message = template;
    
    // Replace placeholders
    if (targetMember && 'currentRank' in targetMember) {
      message = message.replace('[RANK]', targetMember.currentRank.toString());
    }
    
    setMessageContent(message);
  };

  const sendSmackTalk = () => {
    if (!messageContent.trim()) return;
    
    console.log('Sending fantasy smack talk:', {
      fantasyLeagueId: leagueId,
      messageType,
      content: messageContent,
      targetPlayer: targetPlayer === 'all' ? null : targetPlayer,
      domainType: 'fantasy',
      deliveredViaPush: true
    });
    
    // Clear form
    setMessageContent('');
  };

  return (
    <div className="space-y-6" data-testid="fantasy-smack-talk">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Smack Talk Central - {leagueName}
          </CardTitle>
          <CardDescription>
            Fire up the competition with some friendly trash talk!
          </CardDescription>
          
          <div className="flex items-center gap-4 text-sm">
            {userRole === 'commissioner' && (
              <Badge variant="default">
                <Crown className="h-3 w-3 mr-1" />
                Commissioner
              </Badge>
            )}
            
            <div className="text-gray-600">
              Messages remaining: {remainingMessages}/{messageLimit}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Fire Templates</CardTitle>
          <CardDescription>
            One-click smack talk for when you're winning (or losing)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-600" />
                Victory Lap
              </h4>
              <div className="space-y-2">
                {smackTalkTemplates.winning.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start text-xs"
                    onClick={() => handleQuickMessage(template)}
                    data-testid={`button-winning-${index}`}
                  >
                    "{template}"
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-600" />
                Comeback Fire
              </h4>
              <div className="space-y-2">
                {smackTalkTemplates.losing.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start text-xs"
                    onClick={() => handleQuickMessage(template)}
                    data-testid={`button-losing-${index}`}
                  >
                    "{template}"
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Smack Talk</CardTitle>
          <CardDescription>
            Craft your own masterpiece of trash talk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target</label>
              <Select value={targetPlayer} onValueChange={setTargetPlayer}>
                <SelectTrigger data-testid="select-target-player">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leagueMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                      {'currentRank' in member && ` (${member.currentRank}${member.currentRank === 1 ? 'st' : member.currentRank === 2 ? 'nd' : member.currentRank === 3 ? 'rd' : 'th'} place)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Message Type</label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger data-testid="select-message-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smack_talk">Smack Talk</SelectItem>
                  <SelectItem value="congratulations">Good Game</SelectItem>
                  <SelectItem value="league_update">League Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Your Message</label>
            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder={
                messageType === 'smack_talk' 
                  ? "Time to show them who runs this league! 🏆" 
                  : "Type your message here..."
              }
              rows={4}
              maxLength={200}
              data-testid="textarea-smack-talk"
            />
            <div className="text-xs text-gray-500 mt-1">
              {messageContent.length}/200 characters
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {targetPlayer === 'all' 
                ? `Broadcasting to entire league (${leagueMembers.length - 1} players)`
                : `Direct message to ${leagueMembers.find(m => m.id === targetPlayer)?.name}`
              }
            </div>
            
            <Button
              onClick={sendSmackTalk}
              disabled={!messageContent.trim() || remainingMessages <= 0}
              className="bg-orange-600 hover:bg-orange-700"
              data-testid="button-send-smack-talk"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Smack Talk
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Game Integration Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Live Game Fire
          </CardTitle>
          <CardDescription>
            Real-time smack talk during NFL games (Coming Soon)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600 space-y-2">
            <div>🏈 "Your QB just threw a pick-six! Time to panic! 😂"</div>
            <div>🏃‍♂️ "My RB just scored again - you're officially toast!"</div>
            <div>📊 "Check the scoreboard - I'm destroying you by 40 points!"</div>
            <div>⏰ "4th quarter comeback? Keep dreaming!"</div>
          </div>
          
          <Badge variant="outline" className="text-xs">
            <MessageSquare className="h-3 w-3 mr-1" />
            Live NFL integration with ESPN API
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}