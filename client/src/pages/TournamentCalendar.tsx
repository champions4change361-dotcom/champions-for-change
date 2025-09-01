import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ArrowLeft, MapPin, Clock, Users, Trophy, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

export default function TournamentCalendar() {
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [userLocation, setUserLocation] = useState<{
    region: string;
    state: string;
    city?: string;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedSport, setSelectedSport] = useState<string>('all');

  // US States, territories, and DC
  const usStates = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'DC', label: 'District of Columbia' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'PR', label: 'Puerto Rico' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];

  // Detect user location on component mount
  React.useEffect(() => {
    // Define fallback function FIRST to avoid hoisting issues
    const fallbackToIPLocation = async () => {
      try {
        // Simple IP-based location as fallback
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        const region = getRegionFromLocation(data.region, data.city);
        setUserLocation({
          region: region,
          state: data.region || 'Unknown',
          city: data.city || 'Unknown'
        });
      } catch (error) {
        console.error('IP location failed:', error);
        // Default to Texas Coastal Bend
        setUserLocation({
          region: 'Texas Coastal Bend',
          state: 'Texas',
          city: 'Corpus Christi'
        });
      }
      setIsLoadingLocation(false);
    };

    const detectLocation = async () => {
      // Set a timeout to prevent hanging on mobile
      const locationTimeout = setTimeout(() => {
        console.log('Location detection timed out, showing all tournaments');
        setIsLoadingLocation(false);
        setUserLocation(null);
      }, 5000); // 5 second timeout

      try {
        // Try geolocation first
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              clearTimeout(locationTimeout);
              try {
                // Use reverse geocoding to get location details
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
                );
                const data = await response.json();
                
                const region = getRegionFromLocation(data.principalSubdivision, data.city);
                setUserLocation({
                  region: region,
                  state: data.principalSubdivision || 'Unknown',
                  city: data.city || 'Unknown'
                });
                setIsLoadingLocation(false);
              } catch (error) {
                console.error('Geocoding failed:', error);
                fallbackToIPLocation();
              }
            },
            () => {
              // User denied geolocation, fall back to IP-based detection
              clearTimeout(locationTimeout);
              fallbackToIPLocation();
            }
          );
        } else {
          fallbackToIPLocation();
        }
      } catch (error) {
        console.error('Location detection failed:', error);
        setUserLocation({
          region: 'Texas Coastal Bend',
          state: 'Texas',
          city: 'Corpus Christi'
        });
        setIsLoadingLocation(false);
      }
    };

    const getRegionFromLocation = (state: string, city: string) => {
      // Define regional mappings
      const regionMappings: { [key: string]: string } = {
        'Texas': city?.toLowerCase().includes('corpus') || city?.toLowerCase().includes('rockport') || city?.toLowerCase().includes('aransas') 
          ? 'Texas Coastal Bend' 
          : 'Texas',
        'Minnesota': 'Minnesota Twin Cities',
        'California': city?.toLowerCase().includes('angeles') 
          ? 'Los Angeles Area' 
          : city?.toLowerCase().includes('francisco') || city?.toLowerCase().includes('san jose')
          ? 'San Francisco Bay Area'
          : 'California',
        'Florida': city?.toLowerCase().includes('miami') 
          ? 'South Florida' 
          : city?.toLowerCase().includes('orlando')
          ? 'Central Florida'
          : 'Florida',
        'New York': city?.toLowerCase().includes('new york') || city?.toLowerCase().includes('brooklyn') || city?.toLowerCase().includes('queens')
          ? 'New York City Area'
          : 'New York',
        'Illinois': city?.toLowerCase().includes('chicago')
          ? 'Chicago Metro'
          : 'Illinois'
      };

      return regionMappings[state] || `${city}, ${state}`;
    };

    detectLocation();
  }, []);

  // All tournament data - will be filtered by user's region
  const allTournaments = [
    // Texas Coastal Bend tournaments
    {
      id: '1',
      title: 'Youth Basketball Championship',
      organizer: 'Community Church',
      organizerEmail: 'tournaments@communitychurch.org',
      date: '2025-09-14',
      time: '9:00 AM - 3:00 PM',
      location: 'Corpus Christi, TX',
      region: 'Texas Coastal Bend',
      sport: 'Basketball',
      divisions: ['Middle School Boys', 'Middle School Girls'],
      estimatedTeams: 16,
      status: 'open'
    },
    {
      id: '2',
      title: 'Track & Field Invitational',
      organizer: 'YMCA Coastal Bend',
      organizerEmail: 'events@ymcacb.org',
      date: '2025-09-15',
      time: '8:00 AM - 12:00 PM',
      location: 'Rockport, TX',
      region: 'Texas Coastal Bend',
      sport: 'Track & Field',
      divisions: ['High School', 'Open'],
      estimatedTeams: 8,
      status: 'open'
    },
    {
      id: '3',
      title: 'Baseball Tournament',
      organizer: 'Saints Baseball Club',
      organizerEmail: 'coach@saintsbaseball.com',
      date: '2025-09-22',
      time: '10:00 AM - 6:00 PM',
      location: 'Aransas Pass, TX',
      region: 'Texas Coastal Bend',
      sport: 'Baseball',
      divisions: ['14U', '16U'],
      estimatedTeams: 12,
      status: 'open'
    },
    // October 2025
    {
      id: '4',
      title: 'Fall Soccer League Championship',
      organizer: 'Coastal Bend Soccer Association',
      organizerEmail: 'info@cbsoccer.org',
      date: '2025-10-12',
      time: '8:00 AM - 4:00 PM',
      location: 'Corpus Christi, TX',
      region: 'Texas Coastal Bend',
      sport: 'Soccer',
      divisions: ['U12', 'U14', 'U16'],
      estimatedTeams: 24,
      status: 'open'
    },
    // Minnesota tournaments
    {
      id: '7',
      title: 'Twin Cities Hockey Tournament',
      organizer: 'Minneapolis Youth Hockey',
      organizerEmail: 'tournaments@minneapolishockey.org',
      date: '2025-10-19',
      time: '8:00 AM - 6:00 PM',
      location: 'Minneapolis, MN',
      region: 'Minnesota Twin Cities',
      sport: 'Hockey',
      divisions: ['Bantam', 'Midget'],
      estimatedTeams: 20,
      status: 'open'
    },
    // California tournaments
    {
      id: '8',
      title: 'Bay Area Volleyball Classic',
      organizer: 'San Francisco Volleyball Club',
      organizerEmail: 'events@sfvolleyball.com',
      date: '2025-10-26',
      time: '9:00 AM - 5:00 PM',
      location: 'San Francisco, CA',
      region: 'San Francisco Bay Area',
      sport: 'Volleyball',
      divisions: ['JV', 'Varsity'],
      estimatedTeams: 18,
      status: 'open'
    },
    // November 2025
    {
      id: '5',
      title: 'Thanksgiving Basketball Classic',
      organizer: 'First Baptist Church',
      organizerEmail: 'sports@fbccorpus.org',
      date: '2025-11-28',
      time: '9:00 AM - 6:00 PM',
      location: 'Corpus Christi, TX',
      region: 'Texas Coastal Bend',
      sport: 'Basketball',
      divisions: ['Adult Rec', 'High School'],
      estimatedTeams: 16,
      status: 'open'
    },
    // December 2025
    {
      id: '6',
      title: 'Winter Volleyball Tournament',
      organizer: 'Aransas Pass Athletic Club',
      organizerEmail: 'volleyball@apac.com',
      date: '2025-12-14',
      time: '10:00 AM - 8:00 PM',
      location: 'Aransas Pass, Texas',
      region: 'Texas Coastal Bend',
      sport: 'Volleyball',
      divisions: ['Women\'s Open', 'Coed Rec'],
      estimatedTeams: 20,
      status: 'open'
    },
    // REAL NATIONWIDE TOURNAMENTS - 2025
    
    // North Carolina - USA Basketball
    {
      id: '9',
      title: 'U.S. Open Basketball Championships (East)',
      organizer: 'USA Basketball',
      organizerEmail: 'events@usab.com',
      date: '2025-06-06',
      time: '8:00 AM - 8:00 PM',
      location: 'Bermuda Run, North Carolina',
      region: 'North Carolina',
      sport: 'Basketball',
      divisions: ['12U Boys', '12U Girls', '8th Grade', '9th Grade', '10th Grade'],
      estimatedTeams: 200,
      status: 'open'
    },
    {
      id: '10',
      title: 'U.S. Open Basketball Championships (East) Day 2',
      organizer: 'USA Basketball',
      organizerEmail: 'events@usab.com',
      date: '2025-06-07',
      time: '8:00 AM - 8:00 PM',
      location: 'Bermuda Run, North Carolina',
      region: 'North Carolina',
      sport: 'Basketball',
      divisions: ['12U Boys', '12U Girls', '8th Grade', '9th Grade', '10th Grade'],
      estimatedTeams: 200,
      status: 'open'
    },
    {
      id: '11',
      title: 'U.S. Open Basketball Championships (East) Finals',
      organizer: 'USA Basketball',
      organizerEmail: 'events@usab.com',
      date: '2025-06-08',
      time: '9:00 AM - 6:00 PM',
      location: 'Bermuda Run, North Carolina',
      region: 'North Carolina',
      sport: 'Basketball',
      divisions: ['12U Boys', '12U Girls', '8th Grade', '9th Grade', '10th Grade'],
      estimatedTeams: 64,
      status: 'open'
    },
    
    // Kansas - USA Basketball Central
    {
      id: '12',
      title: 'U.S. Open Basketball Championships (Central)',
      organizer: 'USA Basketball',
      organizerEmail: 'events@usab.com',
      date: '2025-06-27',
      time: '8:00 AM - 8:00 PM',
      location: 'Kansas City, Kansas',
      region: 'Kansas',
      sport: 'Basketball',
      divisions: ['12U Boys', '12U Girls', '8th Grade', '9th Grade', '10th Grade'],
      estimatedTeams: 180,
      status: 'open'
    },
    {
      id: '13',
      title: 'U.S. Open Basketball Championships (Central) Day 2',
      organizer: 'USA Basketball',
      organizerEmail: 'events@usab.com',
      date: '2025-06-28',
      time: '8:00 AM - 8:00 PM',
      location: 'Kansas City, Kansas',
      region: 'Kansas',
      sport: 'Basketball',
      divisions: ['12U Boys', '12U Girls', '8th Grade', '9th Grade', '10th Grade'],
      estimatedTeams: 180,
      status: 'open'
    },
    {
      id: '14',
      title: 'U.S. Open Basketball Championships (Central) Finals',
      organizer: 'USA Basketball',
      organizerEmail: 'events@usab.com',
      date: '2025-06-29',
      time: '9:00 AM - 6:00 PM',
      location: 'Kansas City, Kansas',
      region: 'Kansas',
      sport: 'Basketball',
      divisions: ['12U Boys', '12U Girls', '8th Grade', '9th Grade', '10th Grade'],
      estimatedTeams: 60,
      status: 'open'
    },
    
    // Massachusetts - AAU Northeast
    {
      id: '15',
      title: 'AAU Northeast Conference Championships',
      organizer: 'AAU Northeast Conference',
      organizerEmail: 'lliu@neaau.org',
      date: '2025-05-10',
      time: '8:00 AM - 7:00 PM',
      location: 'Springfield, Massachusetts',
      region: 'Massachusetts',
      sport: 'Basketball',
      divisions: ['10U', '12U', '14U', '16U', '17U'],
      estimatedTeams: 96,
      status: 'open'
    },
    {
      id: '16',
      title: 'AAU Northeast Conference Championships Finals',
      organizer: 'AAU Northeast Conference',
      organizerEmail: 'lliu@neaau.org',
      date: '2025-05-11',
      time: '9:00 AM - 6:00 PM',
      location: 'Springfield, Massachusetts',
      region: 'Massachusetts',
      sport: 'Basketball',
      divisions: ['10U', '12U', '14U', '16U', '17U'],
      estimatedTeams: 48,
      status: 'open'
    },
    
    // Ohio - AAU State Events
    {
      id: '17',
      title: 'Ohio AAU Basketball Membership Tip Off Shootout',
      organizer: 'Ohio AAU Basketball',
      organizerEmail: 'gbcoachfish@gmail.com',
      date: '2025-03-16',
      time: '9:00 AM - 6:00 PM',
      location: 'Columbus, Ohio',
      region: 'Ohio',
      sport: 'Basketball',
      divisions: ['3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade'],
      estimatedTeams: 120,
      status: 'open'
    },
    
    // Virginia - AAU World Championship
    {
      id: '18',
      title: 'AAU Basketball World Championship',
      organizer: 'AAU Sports',
      organizerEmail: 'basketball@aausports.org',
      date: '2025-06-27',
      time: '7:00 AM - 9:00 PM',
      location: 'Hampton, Virginia',
      region: 'Virginia',
      sport: 'Basketball',
      divisions: ['10U', '11U', '12U', '13U', '14U', '15U', '16U', '17U'],
      estimatedTeams: 400,
      status: 'open'
    },
    {
      id: '19',
      title: 'AAU Basketball World Championship Day 2',
      organizer: 'AAU Sports',
      organizerEmail: 'basketball@aausports.org',
      date: '2025-06-28',
      time: '7:00 AM - 9:00 PM',
      location: 'Hampton, Virginia',
      region: 'Virginia',
      sport: 'Basketball',
      divisions: ['10U', '11U', '12U', '13U', '14U', '15U', '16U', '17U'],
      estimatedTeams: 400,
      status: 'open'
    },
    {
      id: '20',
      title: 'AAU Basketball World Championship Finals',
      organizer: 'AAU Sports',
      organizerEmail: 'basketball@aausports.org',
      date: '2025-06-29',
      time: '8:00 AM - 8:00 PM',
      location: 'Hampton, Virginia',
      region: 'Virginia',
      sport: 'Basketball',
      divisions: ['10U', '11U', '12U', '13U', '14U', '15U', '16U', '17U'],
      estimatedTeams: 200,
      status: 'open'
    },
    
    // Minnesota - Fargo Basketball Academy Regional
    {
      id: '21',
      title: 'SHADA 3-on-3 Basketball Tournament',
      organizer: 'Fargo Basketball Academy',
      organizerEmail: 'tournaments@fargobasketball.com',
      date: '2025-06-06',
      time: '9:00 AM - 5:00 PM',
      location: 'Pelican Rapids, Minnesota',
      region: 'Minnesota',
      sport: 'Basketball',
      divisions: ['3rd Grade', '4th Grade', '5th-6th Grade', '7th-8th Grade', '9th-12th Grade'],
      estimatedTeams: 64,
      status: 'open'
    },
    {
      id: '22',
      title: 'MN Heat Summer Showcase',
      organizer: 'MN Heat Basketball',
      organizerEmail: 'info@mnheatbasketball.com',
      date: '2025-06-07',
      time: '8:00 AM - 6:00 PM',
      location: 'Forest Lake, Minnesota',
      region: 'Minnesota',
      sport: 'Basketball',
      divisions: ['3rd Grade Boys', '4th Grade Boys', '5th Grade Boys', '6th Grade Boys', '7th Grade Boys', '8th Grade Boys'],
      estimatedTeams: 80,
      status: 'open'
    },
    
    // North Dakota - Regional Events
    {
      id: '23',
      title: 'Jesse Jacobson Memorial Tournament',
      organizer: 'Fargo Basketball Academy',
      organizerEmail: 'tournaments@fargobasketball.com',
      date: '2025-06-14',
      time: '8:00 AM - 7:00 PM',
      location: 'Fargo, North Dakota',
      region: 'North Dakota',
      sport: 'Basketball',
      divisions: ['6th Grade Girls', '7th Grade Girls', '8th Grade Girls', 'High School Girls'],
      estimatedTeams: 48,
      status: 'open'
    },
    {
      id: '24',
      title: 'Class B Battle for the Bubble',
      organizer: 'Valley City Basketball Association',
      organizerEmail: 'basketball@valleycity.org',
      date: '2025-06-17',
      time: '9:00 AM - 6:00 PM',
      location: 'Valley City, North Dakota',
      region: 'North Dakota',
      sport: 'Basketball',
      divisions: ['7th Grade Boys', '8th Grade Boys', '9th Grade Boys', '10th Grade Boys', '11th Grade Boys', '12th Grade Boys'],
      estimatedTeams: 32,
      status: 'open'
    },
    
    // California - Soccer CIF Regional Championships
    {
      id: '25',
      title: 'CIF Regional Soccer Championships Round I',
      organizer: 'California Interscholastic Federation',
      organizerEmail: 'soccer@cifstate.org',
      date: '2025-03-04',
      time: '5:00 PM - 9:00 PM',
      location: 'Los Angeles, California',
      region: 'California',
      sport: 'Soccer',
      divisions: ['Division I Boys', 'Division I Girls', 'Division II Boys', 'Division II Girls'],
      estimatedTeams: 64,
      status: 'open'
    },
    {
      id: '26',
      title: 'CIF Regional Soccer Championships Semifinals',
      organizer: 'California Interscholastic Federation',
      organizerEmail: 'soccer@cifstate.org',
      date: '2025-03-06',
      time: '5:00 PM - 9:00 PM',
      location: 'Los Angeles, California',
      region: 'California',
      sport: 'Soccer',
      divisions: ['Division I Boys', 'Division I Girls', 'Division II Boys', 'Division II Girls'],
      estimatedTeams: 32,
      status: 'open'
    },
    {
      id: '27',
      title: 'CIF Regional Soccer Championships Finals',
      organizer: 'California Interscholastic Federation',
      organizerEmail: 'soccer@cifstate.org',
      date: '2025-03-08',
      time: '5:00 PM - 8:00 PM',
      location: 'Los Angeles, California',
      region: 'California',
      sport: 'Soccer',
      divisions: ['Division I Boys', 'Division I Girls', 'Division II Boys', 'Division II Girls'],
      estimatedTeams: 16,
      status: 'open'
    },
    
    // Washington - Youth Soccer Tournaments
    {
      id: '28',
      title: 'Evergreen Challenge Soccer Tournament',
      organizer: 'Starfire Sports',
      organizerEmail: 'tournaments@starfiresports.com',
      date: '2025-05-24',
      time: '8:00 AM - 6:00 PM',
      location: 'Seattle, Washington',
      region: 'Washington',
      sport: 'Soccer',
      divisions: ['U12', 'U14', 'U16', 'U18'],
      estimatedTeams: 120,
      status: 'open'
    },
    {
      id: '29',
      title: 'Spring Classic Soccer Tournament',
      organizer: 'Starfire Sports',
      organizerEmail: 'tournaments@starfiresports.com',
      date: '2025-06-13',
      time: '8:00 AM - 6:00 PM',
      location: 'Seattle, Washington',
      region: 'Washington',
      sport: 'Soccer',
      divisions: ['U10', 'U12', 'U14', 'U16', 'U18'],
      estimatedTeams: 140,
      status: 'open'
    },
    
    // Nebraska - State Soccer Championships
    {
      id: '30',
      title: 'NSAA State Soccer Championships',
      organizer: 'Nebraska School Activities Association',
      organizerEmail: 'soccer@nsaahome.org',
      date: '2025-05-15',
      time: '9:00 AM - 7:00 PM',
      location: 'Omaha, Nebraska',
      region: 'Nebraska',
      sport: 'Soccer',
      divisions: ['Class A Boys', 'Class A Girls', 'Class B Boys', 'Class B Girls'],
      estimatedTeams: 32,
      status: 'open'
    },
    
    // VOLLEYBALL TOURNAMENTS
    // Nebraska - NSAA Volleyball Championships
    {
      id: '31',
      title: 'NSAA State Volleyball Championships',
      organizer: 'Nebraska School Activities Association',
      organizerEmail: 'volleyball@nsaahome.org',
      date: '2025-11-06',
      time: '8:00 AM - 8:00 PM',
      location: 'Lincoln, Nebraska',
      region: 'Nebraska',
      sport: 'Volleyball',
      divisions: ['Class A', 'Class B', 'Class C1', 'Class C2', 'Class D1', 'Class D2'],
      estimatedTeams: 96,
      status: 'open'
    },
    
    // Minnesota - State Volleyball Championships
    {
      id: '32',
      title: 'Minnesota State Volleyball Championships',
      organizer: 'Minnesota State High School League',
      organizerEmail: 'volleyball@mshsl.org',
      date: '2025-11-05',
      time: '9:00 AM - 9:00 PM',
      location: 'Hinckley, Minnesota',
      region: 'Minnesota',
      sport: 'Volleyball',
      divisions: ['Class 1A', 'Class 2A', 'Class 3A', 'Class 4A'],
      estimatedTeams: 64,
      status: 'open'
    },
    
    // Texas - UIL Volleyball State Tournament
    {
      id: '33',
      title: 'UIL State Volleyball Championships',
      organizer: 'University Interscholastic League',
      organizerEmail: 'volleyball@uiltexas.org',
      date: '2025-11-12',
      time: '8:00 AM - 8:00 PM',
      location: 'Garland, Texas',
      region: 'Texas',
      sport: 'Volleyball',
      divisions: ['1A', '2A', '3A', '4A', '5A', '6A'],
      estimatedTeams: 96,
      status: 'open'
    },
    
    // BASEBALL TOURNAMENTS
    // California - CIF Baseball Championships
    {
      id: '34',
      title: 'CIF State Baseball Championships',
      organizer: 'California Interscholastic Federation',
      organizerEmail: 'baseball@cifstate.org',
      date: '2025-05-30',
      time: '10:00 AM - 6:00 PM',
      location: 'Fresno, California',
      region: 'California',
      sport: 'Baseball',
      divisions: ['Division I', 'Division II', 'Division III', 'Division IV', 'Division V'],
      estimatedTeams: 40,
      status: 'open'
    },
    
    // Texas - UIL Baseball State Tournament
    {
      id: '35',
      title: 'UIL State Baseball Championships',
      organizer: 'University Interscholastic League',
      organizerEmail: 'baseball@uiltexas.org',
      date: '2025-06-05',
      time: '9:00 AM - 7:00 PM',
      location: 'Austin, Texas',
      region: 'Texas',
      sport: 'Baseball',
      divisions: ['1A', '2A', '3A', '4A', '5A', '6A'],
      estimatedTeams: 48,
      status: 'open'
    },
    
    // CHEER/DANCE TOURNAMENTS
    // Florida - State Cheer Championships
    {
      id: '36',
      title: 'Florida State Cheer Championships',
      organizer: 'Florida High School Athletic Association',
      organizerEmail: 'cheer@fhsaa.org',
      date: '2025-12-08',
      time: '9:00 AM - 8:00 PM',
      location: 'Orlando, Florida',
      region: 'Florida',
      sport: 'Cheer/Dance',
      divisions: ['Small Varsity', 'Medium Varsity', 'Large Varsity', 'Game Day'],
      estimatedTeams: 80,
      status: 'open'
    },
    
    // Texas - UIL Spirit State Championships
    {
      id: '37',
      title: 'UIL Spirit State Championships',
      organizer: 'University Interscholastic League',
      organizerEmail: 'spirit@uiltexas.org',
      date: '2025-01-18',
      time: '8:00 AM - 6:00 PM',
      location: 'Fort Worth, Texas',
      region: 'Texas',
      sport: 'Cheer/Dance',
      divisions: ['1A-2A Cheer', '3A-4A Cheer', '5A-6A Cheer', 'Dance Team'],
      estimatedTeams: 120,
      status: 'open'
    },
    
    // FOOTBALL TOURNAMENTS
    // Texas - UIL Football State Championships
    {
      id: '38',
      title: 'UIL Football State Championships',
      organizer: 'University Interscholastic League',
      organizerEmail: 'football@uiltexas.org',
      date: '2025-12-19',
      time: '10:00 AM - 8:00 PM',
      location: 'Arlington, Texas',
      region: 'Texas',
      sport: 'Football',
      divisions: ['1A Division I', '1A Division II', '2A Division I', '2A Division II', '3A Division I', '3A Division II'],
      estimatedTeams: 12,
      status: 'open'
    },
    
    // Ohio - OHSAA Football State Championships
    {
      id: '39',
      title: 'OHSAA Football State Championships',
      organizer: 'Ohio High School Athletic Association',
      organizerEmail: 'football@ohsaa.org',
      date: '2025-12-05',
      time: '11:00 AM - 7:00 PM',
      location: 'Canton, Ohio',
      region: 'Ohio',
      sport: 'Football',
      divisions: ['Division I', 'Division II', 'Division III', 'Division IV', 'Division V', 'Division VI', 'Division VII'],
      estimatedTeams: 14,
      status: 'open'
    },
    
    // SWIM/DIVE TOURNAMENTS
    // California - CIF Swimming & Diving Championships
    {
      id: '40',
      title: 'CIF State Swimming & Diving Championships',
      organizer: 'California Interscholastic Federation',
      organizerEmail: 'swimming@cifstate.org',
      date: '2025-05-16',
      time: '9:00 AM - 6:00 PM',
      location: 'Fresno, California',
      region: 'California',
      sport: 'Swim/Dive',
      divisions: ['Division I', 'Division II'],
      estimatedTeams: 60,
      status: 'open'
    },
    
    // Texas - UIL Swimming & Diving State Meet
    {
      id: '41',
      title: 'UIL Swimming & Diving State Championships',
      organizer: 'University Interscholastic League',
      organizerEmail: 'swimming@uiltexas.org',
      date: '2025-02-21',
      time: '8:00 AM - 6:00 PM',
      location: 'Austin, Texas',
      region: 'Texas',
      sport: 'Swim/Dive',
      divisions: ['Class 4A', 'Class 5A', 'Class 6A'],
      estimatedTeams: 90,
      status: 'open'
    }
  ];

  // Define available sports
  const availableSports = [
    { value: 'all', label: 'All Sports' },
    { value: 'Basketball', label: 'Basketball' },
    { value: 'Baseball', label: 'Baseball' },
    { value: 'Cheer/Dance', label: 'Cheer/Dance' },
    { value: 'Football', label: 'Football' },
    { value: 'Soccer', label: 'Soccer' },
    { value: 'Swim/Dive', label: 'Swim/Dive' },
    { value: 'Volleyball', label: 'Volleyball' }
  ];

  // Filter tournaments by selected state and sport
  const tournaments = React.useMemo(() => {
    return allTournaments.filter(tournament => {
      // Apply state filter
      let passesStateFilter = false;
      
      if (selectedState && selectedState !== 'auto' && selectedState !== '') {
        // Filter by manually selected state
        const stateName = getStateFullName(selectedState);
        passesStateFilter = tournament.location.toLowerCase().includes(stateName.toLowerCase()) || 
                           tournament.region.toLowerCase() === stateName.toLowerCase();
      } else if (userLocation && (selectedState === 'auto' || selectedState === '')) {
        // Filter by detected region
        passesStateFilter = tournament.region === userLocation.region;
      } else {
        // Show all if no state filter applied
        passesStateFilter = true;
      }
      
      // Apply sport filter
      const passesSportFilter = selectedSport === 'all' || tournament.sport === selectedSport;
      
      return passesStateFilter && passesSportFilter;
    });
  }, [allTournaments, selectedState, selectedSport, userLocation]);

  const getStateFullName = (stateCode: string) => {
    const state = usStates.find(s => s.value === stateCode);
    return state ? state.label : stateCode;
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date);
  };

  const getDateTournaments = (date: string) => {
    return tournaments.filter(t => t.date === date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    setSelectedDate(null); // Clear selected date when changing months
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getSportIcon = (sport: string) => {
    return <Trophy className="h-4 w-4" />;
  };

  const getSportColor = (sport: string) => {
    const colors = {
      'Basketball': 'bg-orange-100 text-orange-800 border-orange-200',
      'Track & Field': 'bg-green-100 text-green-800 border-green-200',
      'Baseball': 'bg-blue-100 text-blue-800 border-blue-200',
      'Soccer': 'bg-purple-100 text-purple-800 border-purple-200',
      'Volleyball': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[sport as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Show loading screen while location is being detected
  if (isLoadingLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading tournaments...</p>
          <p className="text-slate-300 text-sm mt-2">Detecting your location</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-blue-500/20 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/')}
                className="text-white hover:text-blue-300 p-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-200">Live Calendar</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Calendar className="h-12 w-12 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLoadingLocation 
                ? 'Local Tournament Calendar' 
                : `${userLocation?.region || 'Local'} Tournament Calendar`
              }
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              {isLoadingLocation 
                ? 'Detecting your location...'
                : `Discover upcoming tournaments in ${userLocation?.region || 'your area'} and coordinate with other organizers`
              }
            </p>
            <Badge className="mt-4 bg-blue-600 text-white">
              Regional Sports Coordination Hub
            </Badge>
            
            {/* Filter Dropdowns - State and Sport */}
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Filter by State</label>
                  <select 
                    value={selectedState} 
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedDate(null); // Clear selected date when changing filter
                    }}
                    className="w-full px-4 py-3 bg-slate-800/80 border border-blue-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-slate-700/80 transition-colors"
                  >
                    <option value="" className="bg-slate-800 text-white">
                      {userLocation 
                        ? `Show ${userLocation.region} (auto-detected)` 
                        : 'All States'
                      }
                    </option>
                    {usStates.map((state) => (
                      <option 
                        key={state.value} 
                        value={state.value}
                        className="bg-slate-800 text-white"
                      >
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Sport Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Sport</label>
                  <select 
                    value={selectedSport} 
                    onChange={(e) => {
                      setSelectedSport(e.target.value);
                      setSelectedDate(null); // Clear selected date when changing filter
                    }}
                    className="w-full px-4 py-3 bg-slate-800/80 border border-blue-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-slate-700/80 transition-colors"
                  >
                    {availableSports.map((sport) => (
                      <option 
                        key={sport.value} 
                        value={sport.value}
                        className="bg-slate-800 text-white"
                      >
                        {sport.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar View */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/80 backdrop-blur-sm border-blue-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">{formatMonthYear(currentMonth)}</CardTitle>
                      <CardDescription className="text-slate-300">
                        Click dates to see tournament details
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth('prev')}
                        className="text-slate-400 hover:text-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth('next')}
                        className="text-slate-400 hover:text-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    {/* Calendar header */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-slate-400 font-medium">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days */}
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: getFirstDayOfMonth(currentMonth) }, (_, i) => (
                      <div key={`empty-${i}`} className="p-2"></div>
                    ))}
                    
                    {/* Days of the month */}
                    {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => {
                      const day = i + 1;
                      // Create date object for proper date handling
                      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                      const date = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
                      const dayTournaments = getDateTournaments(date);
                      const hasEvents = dayTournaments.length > 0;
                      const isSelected = selectedDate === date;
                      
                      return (
                        <button
                          key={day}
                          onClick={() => handleDateClick(date)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            hasEvents 
                              ? 'bg-blue-600 text-white hover:bg-blue-700 font-bold' 
                              : 'text-slate-400 hover:bg-slate-700'
                          } ${
                            isSelected ? 'ring-2 ring-yellow-400' : ''
                          }`}
                        >
                          <div>{day}</div>
                          {hasEvents && (
                            <div className="flex justify-center space-x-1 mt-1">
                              {dayTournaments.slice(0, 3).map((_, idx) => (
                                <div key={idx} className="w-1 h-1 bg-yellow-300 rounded-full"></div>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tournament Details */}
            <div className="space-y-6">
              <Card className="bg-slate-800/80 backdrop-blur-sm border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-green-400" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div>
                      <strong className="text-blue-300">Blue dates</strong> have scheduled tournaments
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <div>
                      Click dates to see tournament details and contact organizers
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      Coordinate with other organizers to avoid conflicts
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedDate && (
                <Card className="bg-slate-800/80 backdrop-blur-sm border-yellow-500/20">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {(() => {
                        // Parse the date string properly to avoid timezone issues
                        const [year, month, day] = selectedDate.split('-').map(Number);
                        const date = new Date(year, month - 1, day);
                        return date.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      })()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {getDateTournaments(selectedDate).map(tournament => (
                      <div key={tournament.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white text-sm">{tournament.title}</h3>
                          <Badge className={`text-xs ${getSportColor(tournament.sport)}`}>
                            {tournament.sport}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-xs text-slate-300">
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-2" />
                            {tournament.organizer}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-2" />
                            {tournament.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-2" />
                            {tournament.location}
                          </div>
                          <div className="text-slate-400">
                            Divisions: {tournament.divisions.join(', ')}
                          </div>
                          <div className="text-slate-400">
                            Expected Teams: {tournament.estimatedTeams}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <Button
                            size="sm"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            onClick={() => window.open(`mailto:${tournament.organizerEmail}?subject=Tournament Coordination - ${tournament.title}`)}
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Contact Organizer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-blue-800/50 to-purple-800/50 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white">Want to Add Your Tournament?</CardTitle>
                <CardDescription className="text-slate-300">
                  Join the regional coordination network and get free exposure for your events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setLocation('/smart-signup?type=individual')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Create Tournament Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}