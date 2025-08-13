import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Navigation, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Smartphone,
  Wifi,
  WifiOff,
  Target,
  Users,
  Timer
} from 'lucide-react';

interface GeolocationTrackingProps {
  tournamentId: string;
  userRole: 'tournament_director' | 'scorekeeper' | 'coach' | 'parent' | 'player';
  eventLocation?: {
    id: string;
    eventName: string;
    venueName: string;
    address: string;
    latitude: number;
    longitude: number;
    geofenceRadius: number;
    requireLocationVerification: boolean;
  };
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface CheckInData {
  id: string;
  checkInType: string;
  verificationStatus: string;
  distanceFromVenue: number;
  checkInTime: string;
  user: {
    name: string;
    role: string;
  };
}

export function GeolocationTracking({ 
  tournamentId, 
  userRole, 
  eventLocation 
}: GeolocationTrackingProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [distanceFromVenue, setDistanceFromVenue] = useState<number | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<'none' | 'checking' | 'verified' | 'failed'>('none');
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInData[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get user's current location
  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          resolve(locationData);
        },
        (error) => {
          let errorMessage = 'Unable to retrieve location';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Start location tracking
  const startLocationTracking = async () => {
    try {
      setLocationError(null);
      setIsTracking(true);
      
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      setIsLocationEnabled(true);

      if (eventLocation) {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          eventLocation.latitude,
          eventLocation.longitude
        );
        setDistanceFromVenue(Math.round(distance));
      }
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Location error occurred');
      setIsLocationEnabled(false);
    } finally {
      setIsTracking(false);
    }
  };

  // Check in at event location
  const performLocationCheckIn = async (checkInType: string) => {
    if (!currentLocation || !eventLocation) {
      setLocationError('Location data not available');
      return;
    }

    setCheckInStatus('checking');

    try {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        eventLocation.latitude,
        eventLocation.longitude
      );

      const isWithinGeofence = distance <= eventLocation.geofenceRadius;
      
      // Mock API call for check-in
      const checkInData = {
        eventLocationId: eventLocation.id,
        tournamentId,
        checkInLatitude: currentLocation.latitude,
        checkInLongitude: currentLocation.longitude,
        distanceFromVenue: Math.round(distance),
        checkInType,
        verificationStatus: isWithinGeofence ? 'verified' : 'outside_range'
      };

      console.log('Location check-in:', checkInData);

      setCheckInStatus(isWithinGeofence ? 'verified' : 'failed');
      
      // Update recent check-ins
      const newCheckIn: CheckInData = {
        id: Math.random().toString(),
        checkInType,
        verificationStatus: checkInData.verificationStatus,
        distanceFromVenue: checkInData.distanceFromVenue,
        checkInTime: new Date().toISOString(),
        user: {
          name: 'Current User',
          role: userRole
        }
      };
      
      setRecentCheckIns(prev => [newCheckIn, ...prev.slice(0, 4)]);

    } catch (error) {
      setCheckInStatus('failed');
      setLocationError('Check-in failed. Please try again.');
    }
  };

  // Auto-update location periodically
  useEffect(() => {
    if (!isLocationEnabled) return;

    const interval = setInterval(() => {
      getCurrentLocation()
        .then(location => {
          setCurrentLocation(location);
          if (eventLocation) {
            const distance = calculateDistance(
              location.latitude,
              location.longitude,
              eventLocation.latitude,
              eventLocation.longitude
            );
            setDistanceFromVenue(Math.round(distance));
          }
        })
        .catch(error => {
          console.error('Location update error:', error);
        });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isLocationEnabled, eventLocation]);

  const isWithinGeofence = eventLocation && distanceFromVenue !== null 
    ? distanceFromVenue <= eventLocation.geofenceRadius 
    : false;

  const getLocationStatusColor = () => {
    if (!isLocationEnabled) return 'text-gray-500';
    if (isWithinGeofence) return 'text-green-600';
    if (distanceFromVenue !== null && distanceFromVenue > (eventLocation?.geofenceRadius || 0)) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getLocationStatusIcon = () => {
    if (!isLocationEnabled) return <WifiOff className="h-4 w-4" />;
    if (isWithinGeofence) return <CheckCircle className="h-4 w-4" />;
    if (distanceFromVenue !== null) return <AlertTriangle className="h-4 w-4" />;
    return <Wifi className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4" data-testid="geolocation-tracking">
      {/* Location Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Tracking
            {eventLocation && (
              <Badge variant="outline" className="ml-2">
                {eventLocation.eventName}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {eventLocation 
              ? `Verify your location at ${eventLocation.venueName}`
              : 'Enable location services for event participation'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Location Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getLocationStatusIcon()}
              <span className={`font-medium ${getLocationStatusColor()}`}>
                {!isLocationEnabled 
                  ? 'Location Disabled'
                  : isWithinGeofence 
                  ? 'At Event Location'
                  : distanceFromVenue !== null
                  ? `${distanceFromVenue}m from venue`
                  : 'Locating...'
                }
              </span>
            </div>
            
            <Button
              onClick={startLocationTracking}
              disabled={isTracking}
              size="sm"
              variant={isLocationEnabled ? "outline" : "default"}
              data-testid="button-enable-location"
            >
              {isTracking ? (
                <>
                  <Timer className="h-4 w-4 mr-2 animate-spin" />
                  Locating...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  {isLocationEnabled ? 'Refresh Location' : 'Enable Location'}
                </>
              )}
            </Button>
          </div>

          {/* Location Error */}
          {locationError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
          )}

          {/* Location Details */}
          {currentLocation && eventLocation && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Current Location</div>
                <div className="font-mono text-xs">
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </div>
                <div className="text-gray-500">
                  Accuracy: {Math.round(currentLocation.accuracy)}m
                </div>
              </div>
              
              <div>
                <div className="text-gray-600">Event Location</div>
                <div className="font-mono text-xs">
                  {eventLocation.latitude.toFixed(6)}, {eventLocation.longitude.toFixed(6)}
                </div>
                <div className="text-gray-500">
                  Geofence: {eventLocation.geofenceRadius}m radius
                </div>
              </div>
            </div>
          )}

          {/* Distance Progress Bar */}
          {distanceFromVenue !== null && eventLocation && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Distance from venue</span>
                <span className={getLocationStatusColor()}>
                  {distanceFromVenue}m / {eventLocation.geofenceRadius}m
                </span>
              </div>
              <Progress 
                value={Math.max(0, 100 - (distanceFromVenue / eventLocation.geofenceRadius * 100))}
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Check-in Actions */}
      {isLocationEnabled && eventLocation && (userRole === 'scorekeeper' || userRole === 'tournament_director') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location Check-in</CardTitle>
            <CardDescription>
              Verify your presence for scoring permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => performLocationCheckIn('scorekeeper_arrival')}
                disabled={checkInStatus === 'checking'}
                variant={isWithinGeofence ? "default" : "outline"}
                data-testid="button-checkin-arrival"
              >
                <Target className="h-4 w-4 mr-2" />
                Check In
              </Button>
              
              <Button
                onClick={() => performLocationCheckIn('event_start')}
                disabled={checkInStatus === 'checking' || !isWithinGeofence}
                variant="outline"
                data-testid="button-checkin-event-start"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Event Start
              </Button>
            </div>

            {checkInStatus === 'checking' && (
              <div className="text-center py-4">
                <Timer className="h-6 w-6 animate-spin mx-auto mb-2" />
                <div className="text-sm text-gray-600">Verifying location...</div>
              </div>
            )}

            {checkInStatus === 'verified' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Location verified! You can now update scores for this event.
                </AlertDescription>
              </Alert>
            )}

            {checkInStatus === 'failed' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Check-in failed. You are outside the event geofence area.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Check-ins */}
      {recentCheckIns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {checkIn.verificationStatus === 'verified' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium text-sm">
                        {checkIn.user.name} - {checkIn.checkInType.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {checkIn.distanceFromVenue}m from venue • {new Date(checkIn.checkInTime).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={checkIn.verificationStatus === 'verified' ? 'default' : 'destructive'}>
                    {checkIn.verificationStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Requirements Info */}
      {eventLocation?.requireLocationVerification && (
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            This event requires location verification. Enable location services and check in within {eventLocation.geofenceRadius}m of the venue to participate or update scores.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}