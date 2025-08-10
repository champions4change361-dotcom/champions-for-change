import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Database, CheckCircle } from "lucide-react";

export default function DataImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importBubbleData = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/import/bubble-data");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import Successful",
        description: `Imported ${data.imported} records from Bubble database`,
      });
      setImportStatus(`Successfully imported: ${data.summary}`);
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import Bubble data",
        variant: "destructive",
      });
      setImportStatus("Import failed. Please check your data format.");
    },
  });

  const handleImport = () => {
    setIsImporting(true);
    setImportStatus("Processing Bubble data...");
    importBubbleData.mutate();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="card-data-import">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Import Bubble Database
        </CardTitle>
        <CardDescription>
          Import your existing tournament data, sports, and events from Bubble
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Track Events (21 events)
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Sport Options (59 sports)
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Tournament Structures (30 formats)
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Competition Settings (3 formats)
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Available Tournament Formats:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>• Single & Double Elimination</div>
            <div>• Pool Play → Single/Double Elimination</div>
            <div>• Swiss System & Round Robin</div>
            <div>• King of the Hill & Step Ladder</div>
            <div>• Best of 3/5/7 Series</div>
            <div>• Seeded Brackets & Custom Formats</div>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">{importStatus}</p>
          </div>
        )}

        <Button 
          onClick={handleImport}
          disabled={isImporting || importBubbleData.isPending}
          className="w-full"
          data-testid="button-import-data"
        >
          {isImporting || importBubbleData.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Importing Bubble Data...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Import Bubble Database
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}