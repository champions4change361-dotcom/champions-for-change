import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X } from "lucide-react";

interface TeamNameEditorProps {
  tournamentId: string;
  currentName: string;
  onNameUpdate: (newName: string) => void;
}

export default function TeamNameEditor({ tournamentId, currentName, onNameUpdate }: TeamNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentName);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateTeamMutation = useMutation({
    mutationFn: async (newName: string) => {
      const response = await apiRequest("PATCH", `/api/tournaments/${tournamentId}/teams`, {
        oldName: currentName,
        newName: newName,
      });
      return response.json();
    },
    onSuccess: () => {
      onNameUpdate(editedName);
      setIsEditing(false);
      toast({
        title: "Team Updated",
        description: `Team name changed to "${editedName}"`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "matches"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update team name",
        variant: "destructive",
      });
      setEditedName(currentName);
    },
  });

  const handleSave = () => {
    if (editedName.trim() && editedName !== currentName) {
      updateTeamMutation.mutate(editedName.trim());
    } else {
      setIsEditing(false);
      setEditedName(currentName);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(currentName);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 min-w-0" data-testid="team-name-editor-active">
        <Input
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="text-sm h-7 min-w-0 flex-1"
          autoFocus
          data-testid="input-team-name"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={updateTeamMutation.isPending}
          className="h-7 w-7 p-0"
          data-testid="button-save-team-name"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={updateTeamMutation.isPending}
          className="h-7 w-7 p-0"
          data-testid="button-cancel-team-name"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group min-w-0" data-testid="team-name-display">
      <span className="text-sm truncate flex-1" data-testid="text-team-name">
        {currentName}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        data-testid="button-edit-team-name"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
}