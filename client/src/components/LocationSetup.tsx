import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Search, 
  CheckCircle, 
  Settings,
  Navigation,
  AlertTriangle,
  Building,
  Globe,
  Ruler
} from 'lucide-react';

interface LocationSetupProps {
  tournamentId: string;
  onLocationAdded: (location: any) => void;
}

interface LocationData {
  eventName: string;
  venueName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  geofenceRadius: number;
  allowRemoteScoring: boolean;
  requireLocationVerification: boolean;
}

export function LocationSetup({ tournamentId, onLocationAdded }: LocationSetupProps) {
  const [locationData, setLocationData] = useState<LocationData>({
    eventName: '',
    venueName: '',
    address: '',
    latitude: null,
    longitude: null,
    geofenceRadius: 100,
    allowRemoteScoring: false,
    requireLocationVerification: true,
  });

  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);

  // Mock geocoding function (in real implementation, use Google Maps API or similar)
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    setIsGeocodingAddress(true);
    setAddressError(null);

    try {
      // Mock geocoding delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock coordinates for common venues
      const mockCoordinates = {
        'robert driscoll middle school': { lat: 27.7749, lng: -97.4100 },
        'corpus christi high school': { lat: 27.7800, lng: -97.4000 },
        'miller high school': { lat: 27.7600, lng: -97.4200 },
        'veterans memorial high school': { lat: 27.7900, lng: -97.3900 },
      };

      const normalizedAddress = address.toLowerCase();
      for (const [venue, coords] of Object.entries(mockCoordinates)) {
        if (normalizedAddress.includes(venue)) {
          return coords;
        }
      }

      // Generate mock coordinates for demonstration
      const lat = 27.7749 + (Math.random() - 0.5) * 0.1;
      const lng = -97.4100 + (Math.random() - 0.5) * 0.1;
      return { lat, lng };

    } catch (error) {
      setAddressError('Unable to find coordinates for this address');
      return null;
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  // Get current location
  const useCurrentLocation = () => {
    setIsUsingCurrentLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setIsUsingCurrentLocation(false);
      },
      (error) => {
        setAddressError('Unable to get current location. Please enter address manually.');
        setIsUsingCurrentLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle address lookup
  const handleAddressLookup = async () => {
    if (!locationData.address.trim()) {
      setAddressError('Please enter an address');
      return;
    }

    const coords = await geocodeAddress(locationData.address);
    if (coords) {
      setLocationData(prev => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng
      }));
    }
  };

  // Save location
  const handleSaveLocation = () => {
    if (!locationData.eventName || !locationData.venueName || !locationData.address) {
      setAddressError('Please fill in all required fields');
      return;
    }

    if (locationData.latitude === null || locationData.longitude === null) {
      setAddressError('Please set location coordinates');
      return;
    }

    const eventLocation = {
      id: Math.random().toString(),
      tournamentId,
      ...locationData,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    };

    console.log('Saving event location:', eventLocation);
    onLocationAdded(eventLocation);

    // Reset form
    setLocationData({
      eventName: '',
      venueName: '',
      address: '',
      latitude: null,
      longitude: null,
      geofenceRadius: 100,
      allowRemoteScoring: false,
      requireLocationVerification: true,
    });
  };

  const coordinatesSet = locationData.latitude !== null && locationData.longitude !== null;

  return (
    <div className="space-y-6" data-testid="location-setup">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Event Location Setup
          </CardTitle>
          <CardDescription>
            Configure location tracking for tournament events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Location Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event-name">Event Name *</Label>
              <Input
                id="event-name"
                value={locationData.eventName}
                onChange={(e) => setLocationData(prev => ({...prev, eventName: e.target.value}))}
                placeholder="e.g., Boys Basketball Championship"
                data-testid="input-event-name"
              />
            </div>
            
            <div>
              <Label htmlFor="venue-name">Venue Name *</Label>
              <Input
                id="venue-name"
                value={locationData.venueName}
                onChange={(e) => setLocationData(prev => ({...prev, venueName: e.target.value}))}
                placeholder="e.g., Robert Driscoll Middle School"
                data-testid="input-venue-name"
              />
            </div>
          </div>

          {/* Address Input */}
          <div>
            <Label htmlFor="address">Venue Address *</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={locationData.address}
                onChange={(e) => setLocationData(prev => ({...prev, address: e.target.value}))}
                placeholder="Enter full address"
                data-testid="input-address"
              />
              <Button
                onClick={handleAddressLookup}
                disabled={isGeocodingAddress || !locationData.address.trim()}
                variant="outline"
                data-testid="button-lookup-address"
              >
                {isGeocodingAddress ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Lookup
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Current Location Option */}
          <div className="flex items-center justify-center py-2">
            <Button
              onClick={useCurrentLocation}
              disabled={isUsingCurrentLocation}
              variant="ghost"
              size="sm"
              data-testid="button-use-current-location"
            >
              {isUsingCurrentLocation ? (
                <>
                  <Navigation className="h-4 w-4 mr-2 animate-spin" />
                  Getting location...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Use Current Location
                </>
              )}
            </Button>
          </div>

          {/* Coordinates Display */}
          {coordinatesSet && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800 font-medium">Location Set</span>
              </div>
              <div className="text-sm text-green-700 font-mono">
                {locationData.latitude!.toFixed(6)}, {locationData.longitude!.toFixed(6)}
              </div>
            </div>
          )}

          {/* Address Error */}
          {addressError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{addressError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Location Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Location Settings
          </CardTitle>
          <CardDescription>
            Configure geofencing and verification requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Geofence Radius */}
          <div>
            <Label htmlFor="geofence-radius" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Geofence Radius (meters)
            </Label>
            <Input
              id="geofence-radius"
              type="number"
              value={locationData.geofenceRadius}
              onChange={(e) => setLocationData(prev => ({
                ...prev, 
                geofenceRadius: Math.max(10, parseInt(e.target.value) || 100)
              }))}
              min="10"
              max="1000"
              data-testid="input-geofence-radius"
            />
            <div className="text-xs text-gray-500 mt-1">
              Users must be within this radius to check in and update scores
            </div>
          </div>

          {/* Location Verification Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Require Location Verification</div>
              <div className="text-sm text-gray-500">
                Users must verify their location before participating
              </div>
            </div>
            <Switch
              checked={locationData.requireLocationVerification}
              onCheckedChange={(checked) => setLocationData(prev => ({
                ...prev, 
                requireLocationVerification: checked
              }))}
              data-testid="switch-require-verification"
            />
          </div>

          {/* Remote Scoring Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Allow Remote Scoring</div>
              <div className="text-sm text-gray-500">
                Permit scorekeepers to update scores from outside the geofence
              </div>
            </div>
            <Switch
              checked={locationData.allowRemoteScoring}
              onCheckedChange={(checked) => setLocationData(prev => ({
                ...prev, 
                allowRemoteScoring: checked
              }))}
              data-testid="switch-allow-remote"
            />
          </div>

          {/* Geofence Visualization */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800 font-medium">Coverage Area</span>
            </div>
            <div className="text-sm text-blue-700">
              A {locationData.geofenceRadius}m radius around the venue will be used for location verification.
              {locationData.allowRemoteScoring 
                ? ' Remote scoring is permitted for authorized users.'
                : ' All scoring must occur within the geofenced area.'
              }
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Coverage: ~{Math.round(Math.PI * Math.pow(locationData.geofenceRadius, 2) / 10000)} hectares
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveLocation}
          disabled={!locationData.eventName || !locationData.venueName || !coordinatesSet}
          className="min-w-[120px]"
          data-testid="button-save-location"
        >
          <Building className="h-4 w-4 mr-2" />
          Save Location
        </Button>
      </div>
    </div>
  );
}