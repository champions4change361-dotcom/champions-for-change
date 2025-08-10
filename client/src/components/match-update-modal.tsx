import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Match } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MatchUpdateModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
}

const updateMatchSchema = z.object({
  team1Score: z.number().min(0),
  team2Score: z.number().min(0),
  status: z.enum(["upcoming", "in-progress", "completed"]),
});

type UpdateMatchData = z.infer<typeof updateMatchSchema>;

export default function MatchUpdateModal({ match, isOpen, onClose }: MatchUpdateModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateMatchData>({
    resolver: zodResolver(updateMatchSchema),
    defaultValues: {
      team1Score: match.team1Score || 0,
      team2Score: match.team2Score || 0,
      status: match.status,
    },
  });

  const updateMatchMutation = useMutation({
    mutationFn: async (data: UpdateMatchData) => {
      const response = await apiRequest("PATCH", `/api/matches/${match.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Match Updated",
        description: "Match result has been saved successfully!",
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", match.tournamentId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update match",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateMatchData) => {
    updateMatchMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-match-update">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Update Match Result
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Match Details:</div>
            <div className="flex justify-between items-center">
              <span className="text-neutral font-medium" data-testid="text-match-team1">{match.team1}</span>
              <span className="text-gray-400 mx-2">vs</span>
              <span className="text-neutral font-medium" data-testid="text-match-team2">{match.team2}</span>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-update-match">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team1Score" className="block text-sm font-medium text-gray-700 mb-2">
                  {match.team1} Score
                </Label>
                <Input
                  id="team1Score"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...form.register("team1Score", { valueAsNumber: true })}
                  data-testid="input-team1-score"
                />
                {form.formState.errors.team1Score && (
                  <p className="text-sm text-red-600 mt-1" data-testid="error-team1-score">
                    {form.formState.errors.team1Score.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="team2Score" className="block text-sm font-medium text-gray-700 mb-2">
                  {match.team2} Score
                </Label>
                <Input
                  id="team2Score"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...form.register("team2Score", { valueAsNumber: true })}
                  data-testid="input-team2-score"
                />
                {form.formState.errors.team2Score && (
                  <p className="text-sm text-red-600 mt-1" data-testid="error-team2-score">
                    {form.formState.errors.team2Score.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-2">Match Status:</p>
              <div className="flex space-x-3">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    value="upcoming" 
                    {...form.register("status")}
                    className="text-tournament-primary focus:ring-tournament-primary"
                    data-testid="radio-status-upcoming"
                  />
                  <span className="ml-2 text-sm">Upcoming</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    value="in-progress" 
                    {...form.register("status")}
                    className="text-tournament-primary focus:ring-tournament-primary"
                    data-testid="radio-status-in-progress"
                  />
                  <span className="ml-2 text-sm">In Progress</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    value="completed" 
                    {...form.register("status")}
                    className="text-tournament-primary focus:ring-tournament-primary"
                    data-testid="radio-status-completed"
                  />
                  <span className="ml-2 text-sm">Completed</span>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button 
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                data-testid="button-cancel-match-update"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-1 bg-tournament-primary hover:bg-blue-700"
                disabled={updateMatchMutation.isPending}
                data-testid="button-save-match-result"
              >
                {updateMatchMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Result'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
