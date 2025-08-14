import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, MapPin, Phone, Globe, Users, GraduationCap } from "lucide-react";
import type { District, School, SchoolAsset } from "@shared/schema";

export default function Schools() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Initialize CCISD data
  const initializeCCISD = useMutation({
    mutationFn: () => apiRequest("/api/districts/init-ccisd", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/districts"] });
    }
  });

  // Fetch all districts
  const { data: districts, isLoading: districtsLoading } = useQuery({
    queryKey: ["/api/districts"],
    enabled: !authLoading
  });

  // Fetch schools for CCISD when districts are loaded
  const ccisdId = districts?.find((d: District) => d.districtCode === "CCISD")?.id;
  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ["/api/schools"],
    queryFn: () => apiRequest(`/api/schools?districtId=${ccisdId}`),
    enabled: !!ccisdId
  });

  // Fetch assets for selected school
  const { data: schoolAssets, isLoading: assetsLoading } = useQuery({
    queryKey: ["/api/schools", selectedSchool?.id, "assets"],
    queryFn: () => apiRequest(`/api/schools/${selectedSchool?.id}/assets`),
    enabled: !!selectedSchool?.id
  });

  const handleInitializeCCISD = () => {
    initializeCCISD.mutate();
  };

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
  };

  if (authLoading || districtsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading district information...</span>
      </div>
    );
  }

  const ccisd = districts?.find((d: District) => d.districtCode === "CCISD");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">District Athletics Management</h1>
        <p className="text-muted-foreground">
          VLC-based school organization for athletic program coordination
        </p>
      </div>

      {!ccisd ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Initialize Corpus Christi ISD</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Set up the demonstration district with Roy Miller High School and other CCISD schools.
            </p>
            <Button 
              onClick={handleInitializeCCISD} 
              disabled={initializeCCISD.isPending}
              data-testid="button-init-ccisd"
            >
              {initializeCCISD.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Initialize CCISD
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* District Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                {ccisd.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    {ccisd.city}, {ccisd.state} {ccisd.zipCode}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Phone className="h-4 w-4" />
                    {ccisd.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={ccisd.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {ccisd.website}
                    </a>
                  </div>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">
                    District Code: {ccisd.districtCode}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {schools?.length || 0} Schools Registered
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schools Grid */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">CCISD Schools</h2>
            {schoolsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading schools...</span>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools?.map((school: School) => (
                  <Card 
                    key={school.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedSchool?.id === school.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSchoolSelect(school)}
                    data-testid={`card-school-${school.vlcCode}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {school.name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {school.mascotName || 'Mascot'}
                        </Badge>
                        <Badge variant="outline">
                          VLC: {school.vlcCode}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {school.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {school.address}
                          </div>
                        )}
                        {school.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {school.phone}
                          </div>
                        )}
                        {school.totalEnrollment && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {school.totalEnrollment.toLocaleString()} students
                          </div>
                        )}
                      </div>
                      {school.grades && school.grades.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-muted-foreground mb-1">Grades:</div>
                          <div className="flex flex-wrap gap-1">
                            {school.grades.map((grade) => (
                              <Badge key={grade} variant="outline" className="text-xs">
                                {grade}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Selected School Details */}
          {selectedSchool && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedSchool.name} - Detailed View
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  VLC Code: {selectedSchool.vlcCode}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">School Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Type:</strong> {selectedSchool.schoolType}</div>
                      <div><strong>Mascot:</strong> {selectedSchool.mascotName}</div>
                      {selectedSchool.totalEnrollment && (
                        <div><strong>Enrollment:</strong> {selectedSchool.totalEnrollment.toLocaleString()}</div>
                      )}
                      {selectedSchool.athleticParticipation && (
                        <div><strong>Athletic Participation:</strong> {selectedSchool.athleticParticipation}</div>
                      )}
                      {selectedSchool.website && (
                        <div>
                          <strong>Website:</strong>{' '}
                          <a 
                            href={selectedSchool.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {selectedSchool.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">School Assets</h4>
                    {assetsLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading assets...
                      </div>
                    ) : schoolAssets && schoolAssets.length > 0 ? (
                      <div className="space-y-2">
                        {schoolAssets.map((asset: SchoolAsset) => (
                          <div key={asset.id} className="p-3 border rounded-lg">
                            <div className="font-medium">{asset.fileName}</div>
                            <div className="text-sm text-muted-foreground">
                              Type: {asset.assetType} • Size: {asset.fileSize ? Math.round(asset.fileSize / 1024) + 'KB' : 'Unknown'}
                            </div>
                            {asset.description && (
                              <div className="text-sm mt-1">{asset.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No assets uploaded yet. School logos, photos, and documents can be managed here.
                      </div>
                    )}
                  </div>
                </div>

                {/* School Colors Preview */}
                {selectedSchool.schoolColors && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">School Colors</h4>
                    <div className="flex gap-2">
                      {selectedSchool.schoolColors.primary && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: selectedSchool.schoolColors.primary }}
                          />
                          <span className="text-sm">Primary</span>
                        </div>
                      )}
                      {selectedSchool.schoolColors.secondary && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: selectedSchool.schoolColors.secondary }}
                          />
                          <span className="text-sm">Secondary</span>
                        </div>
                      )}
                      {selectedSchool.schoolColors.accent && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: selectedSchool.schoolColors.accent }}
                          />
                          <span className="text-sm">Accent</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Special highlight for Roy Miller High School */}
      {schools?.find((s: School) => s.vlcCode === "RMHS-001") && (
        <Card className="mt-8 border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">
              🏫 Roy Miller High School - VLC Integration Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 dark:text-green-300">
              Roy Miller High School (VLC: RMHS-001) is configured and ready for image uploads and asset management. 
              The VLC-based filing system allows for organized school-specific content and athletic program coordination.
            </p>
            <div className="mt-4 text-sm text-green-600 dark:text-green-400">
              <strong>Athletic Programs:</strong> Football, Basketball, Track & Field, Cross Country, Soccer, Tennis, Baseball, Softball
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}