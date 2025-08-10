import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertTournamentSchema } from "@shared/schema";

const formSchema = insertTournamentSchema.extend({
  teamSize: z.number().min(4).max(32),
  tournamentType: z.enum(["single", "double"]).default("single"),
});

type FormData = z.infer<typeof formSchema>;

export default function TournamentCreationForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      teamSize: 8,
      tournamentType: "single",
      status: "upcoming",
      bracket: {},
    },
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/tournaments", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Tournament Created",
        description: `${data.tournament.name} has been created successfully!`,
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tournament",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createTournamentMutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="card-create-tournament">
      <h2 className="text-lg font-semibold text-neutral mb-4">
        <i className="fas fa-plus-circle text-tournament-primary mr-2"></i>
        Create Tournament
      </h2>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-create-tournament">
        <div>
          <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Tournament Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter tournament name"
            {...form.register("name")}
            data-testid="input-tournament-name"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600 mt-1" data-testid="error-tournament-name">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Teams
          </Label>
          <Select
            value={form.watch("teamSize")?.toString()}
            onValueChange={(value) => form.setValue("teamSize", parseInt(value))}
            data-testid="select-team-size"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select number of teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4 Teams</SelectItem>
              <SelectItem value="8">8 Teams</SelectItem>
              <SelectItem value="16">16 Teams</SelectItem>
              <SelectItem value="32">32 Teams</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.teamSize && (
            <p className="text-sm text-red-600 mt-1" data-testid="error-team-size">
              {form.formState.errors.teamSize.message}
            </p>
          )}
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">Tournament Type</Label>
          <div className="flex space-x-3">
            <label className="flex items-center">
              <input 
                type="radio" 
                value="single" 
                checked={form.watch("tournamentType") === "single"}
                onChange={() => form.setValue("tournamentType", "single")}
                className="text-tournament-primary focus:ring-tournament-primary"
                data-testid="radio-single-elimination"
              />
              <span className="ml-2 text-sm text-gray-700">Single Elimination</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                value="double" 
                checked={form.watch("tournamentType") === "double"}
                onChange={() => form.setValue("tournamentType", "double")}
                className="text-tournament-primary focus:ring-tournament-primary"
                data-testid="radio-double-elimination"
              />
              <span className="ml-2 text-sm text-gray-700">Double Elimination</span>
            </label>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-tournament-primary text-white hover:bg-blue-700"
          disabled={createTournamentMutation.isPending}
          data-testid="button-create-tournament"
        >
          {createTournamentMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <i className="fas fa-trophy mr-2"></i>
              Create Tournament
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
