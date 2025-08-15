import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { requireComplianceRole, requireHipaaCompliance, requireFerpaCompliance } from "./complianceMiddleware";

export function registerRoleBasedDashboardRoutes(app: Express) {

  // DISTRICT ATHLETIC DIRECTOR DASHBOARD DATA
  app.get("/api/dashboard/district-athletic-director", 
    isAuthenticated, 
    requireComplianceRole(['district_athletic_director']),
    requireFerpaCompliance,
    async (req, res) => {
      try {
        // District-wide overview data
        const dashboardData = {
          districtOverview: {
            totalSchools: 12,
            totalAthletes: 2847,
            totalCoaches: 156,
            totalTrainers: 8,
            activeSports: 15,
            currentTournaments: 23
          },
          schoolsData: [
            {
              id: 'miller-high',
              name: 'Roy Miller High School',
              athletes: 347,
              coaches: 22,
              activeSports: ['Football', 'Basketball', 'Baseball', 'Track', 'Soccer'],
              currentInjuries: 8,
              complianceStatus: 'compliant'
            },
            {
              id: 'driscoll-middle',
              name: 'Robert Driscoll Middle School',
              athletes: 156,
              coaches: 12,
              activeSports: ['Football', 'Basketball', 'Track', 'Soccer'],
              currentInjuries: 3,
              complianceStatus: 'compliant'
            },
            {
              id: 'martin-middle',
              name: 'Sterling B. Martin Middle School',
              athletes: 142,
              coaches: 11,
              activeSports: ['Football', 'Basketball', 'Track', 'Soccer'],
              currentInjuries: 2,
              complianceStatus: 'compliant'
            }
          ],
          sportsProgramsData: [
            { sport: 'Football', schools: 12, athletes: 456, coaches: 24, budget: 125000 },
            { sport: 'Basketball', schools: 12, athletes: 378, coaches: 18, budget: 89000 },
            { sport: 'Baseball', schools: 8, athletes: 234, coaches: 12, budget: 67000 },
            { sport: 'Track & Field', schools: 12, athletes: 567, coaches: 15, budget: 78000 },
            { sport: 'Soccer', schools: 10, athletes: 289, coaches: 14, budget: 54000 }
          ],
          healthSafetyData: {
            activeInjuries: 23,
            pendingClearances: 8,
            trainersAvailable: 15,
            criticalSupplies: 3,
            upcomingCertifications: 7
          },
          budgetData: {
            totalBudget: 850000,
            allocated: 720000,
            remaining: 130000,
            byCategory: {
              equipment: 245000,
              transportation: 156000,
              facilities: 189000,
              personnel: 130000,
              medical: 45000,
              other: 85000
            }
          }
        };
        
        res.json(dashboardData);
      } catch (error) {
        console.error("Error fetching district athletic director dashboard:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
      }
    }
  );

  // DISTRICT HEAD ATHLETIC TRAINER DASHBOARD DATA
  app.get("/api/dashboard/district-head-athletic-trainer", 
    isAuthenticated, 
    requireComplianceRole(['district_head_athletic_trainer']),
    requireHipaaCompliance,
    async (req, res) => {
      try {
        const dashboardData = {
          trainerNetwork: [
            {
              id: 'trainer-1',
              name: 'Sarah Johnson',
              school: 'Roy Miller High School',
              certification: 'Licensed Athletic Trainer',
              expirationDate: '2025-06-15',
              currentCaseload: 23,
              specialties: ['Concussion Protocol', 'Rehabilitation']
            },
            {
              id: 'trainer-2', 
              name: 'Mike Rodriguez',
              school: 'Robert Driscoll Middle School',
              certification: 'Licensed Athletic Trainer',
              expirationDate: '2025-08-22',
              currentCaseload: 15,
              specialties: ['Injury Prevention', 'Emergency Care']
            },
            {
              id: 'trainer-3',
              name: 'Lisa Chen',
              school: 'Sterling B. Martin Middle School',
              certification: 'Licensed Athletic Trainer',
              expirationDate: '2025-04-10',
              currentCaseload: 12,
              specialties: ['Youth Athletics', 'Nutrition']
            }
          ],
          districtInjuries: {
            concussions: 5,
            aclInjuries: 3,
            minorSprains: 15,
            fractures: 2,
            otherInjuries: 8,
            totalActive: 33,
            bySchool: {
              'miller-high': 18,
              'driscoll-middle': 8,
              'martin-middle': 7
            }
          },
          supplyCoordination: {
            criticalStock: [
              { item: 'Ice Packs', currentStock: 5, minimumRequired: 20, school: 'Miller High' },
              { item: 'Elastic Bandages', currentStock: 8, minimumRequired: 25, school: 'Driscoll Middle' }
            ],
            lowStock: [
              { item: 'Antiseptic Wipes', currentStock: 12, minimumRequired: 30, school: 'Martin Middle' },
              { item: 'Medical Tape', currentStock: 15, minimumRequired: 25, school: 'Miller High' }
            ],
            adequateStock: [
              { item: 'Gauze Pads', currentStock: 45, minimumRequired: 30, school: 'All Schools' }
            ]
          },
          trainingStatus: {
            cprCertified: 15,
            totalTrainers: 15,
            expiringSoon: [
              { trainerId: 'trainer-3', name: 'Lisa Chen', expirationDate: '2025-04-10', daysRemaining: 58 }
            ],
            upcomingTraining: [
              { course: 'Advanced Concussion Management', date: '2024-09-15', enrolled: 8 },
              { course: 'Emergency Response Update', date: '2024-10-01', enrolled: 12 }
            ]
          }
        };
        
        res.json(dashboardData);
      } catch (error) {
        console.error("Error fetching district head athletic trainer dashboard:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
      }
    }
  );

  // SCHOOL ATHLETIC DIRECTOR DASHBOARD DATA
  app.get("/api/dashboard/school-athletic-director", 
    isAuthenticated, 
    requireComplianceRole(['school_athletic_director']),
    requireFerpaCompliance,
    async (req, res) => {
      try {
        const dashboardData = {
          schoolTeams: [
            {
              id: 'varsity-football',
              name: 'Varsity Football',
              sport: 'Football',
              level: 'Varsity',
              athletes: 35,
              coach: 'Coach Thompson',
              season: 'Fall 2024',
              record: '5-2',
              nextGame: '2024-08-20 19:00:00'
            },
            {
              id: 'jv-basketball',
              name: 'JV Basketball',
              sport: 'Basketball',
              level: 'Junior Varsity',
              athletes: 15,
              coach: 'Coach Martinez',
              season: 'Winter 2024',
              record: '8-3',
              nextGame: '2024-08-22 18:00:00'
            },
            {
              id: 'freshman-baseball',
              name: 'Freshman Baseball',
              sport: 'Baseball',
              level: 'Freshman',
              athletes: 18,
              coach: 'Coach Wilson',
              season: 'Spring 2024',
              record: '12-4',
              nextGame: '2024-08-25 16:00:00'
            }
          ],
          gradeLevels: {
            '9th': { athletes: 67, teams: 5 },
            '10th': { athletes: 72, teams: 6 },
            '11th': { athletes: 89, teams: 8 },
            '12th': { athletes: 95, teams: 9 }
          },
          schoolAnalytics: {
            activeAthletes: 247,
            activeCoaches: 18,
            pendingForms: 12,
            complianceRate: 94.5,
            academicEligibility: 236,
            medicalClearances: 245
          },
          upcomingEvents: [
            { event: 'Homecoming Game', date: '2024-08-25', time: '19:00', sport: 'Football' },
            { event: 'Basketball Tournament', date: '2024-08-28', time: '15:00', sport: 'Basketball' },
            { event: 'Track Meet', date: '2024-09-02', time: '14:00', sport: 'Track & Field' }
          ]
        };
        
        res.json(dashboardData);
      } catch (error) {
        console.error("Error fetching school athletic director dashboard:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
      }
    }
  );

  // SCHOOL ATHLETIC TRAINER DASHBOARD DATA
  app.get("/api/dashboard/school-athletic-trainer", 
    isAuthenticated, 
    requireComplianceRole(['school_athletic_trainer']),
    requireHipaaCompliance,
    async (req, res) => {
      try {
        const { sport, status } = req.query;
        
        let athletes = [
          {
            id: 'athlete-1',
            name: 'Sarah Johnson',
            sport: 'Basketball',
            grade: '11th',
            status: 'active',
            lastVisit: '2024-08-12',
            nextAppointment: null,
            medicalAlerts: ['Asthma']
          },
          {
            id: 'athlete-2',
            name: 'Mike Rodriguez',
            sport: 'Football',
            grade: '12th',
            status: 'injured',
            lastVisit: '2024-08-14',
            nextAppointment: '2024-08-18 14:00:00',
            medicalAlerts: ['Concussion Protocol']
          },
          {
            id: 'athlete-3',
            name: 'Lisa Chen',
            sport: 'Soccer',
            grade: '10th',
            status: 'cleared',
            lastVisit: '2024-08-10',
            nextAppointment: null,
            medicalAlerts: []
          },
          {
            id: 'athlete-4',
            name: 'David Wilson',
            sport: 'Baseball',
            grade: '11th',
            status: 'restricted',
            lastVisit: '2024-08-13',
            nextAppointment: '2024-08-20 15:00:00',
            medicalAlerts: ['Previous ACL Surgery']
          }
        ];

        // Apply filters
        if (sport && sport !== 'all') {
          athletes = athletes.filter(athlete => 
            athlete.sport.toLowerCase() === (sport as string).toLowerCase()
          );
        }
        
        if (status && status !== 'all') {
          athletes = athletes.filter(athlete => athlete.status === status);
        }

        const dashboardData = {
          athletes,
          athleteStats: {
            total: 4,
            active: athletes.filter(a => a.status === 'active').length,
            injured: athletes.filter(a => a.status === 'injured').length,
            cleared: athletes.filter(a => a.status === 'cleared').length,
            restricted: athletes.filter(a => a.status === 'restricted').length
          },
          upcomingAppointments: athletes
            .filter(a => a.nextAppointment)
            .map(a => ({
              athleteId: a.id,
              athleteName: a.name,
              date: a.nextAppointment,
              type: 'Follow-up'
            })),
          recentVisits: athletes
            .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
            .slice(0, 5)
            .map(a => ({
              athleteId: a.id,
              athleteName: a.name,
              date: a.lastVisit,
              sport: a.sport
            }))
        };
        
        res.json(dashboardData);
      } catch (error) {
        console.error("Error fetching school athletic trainer dashboard:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
      }
    }
  );

  // HEAD COACH DASHBOARD DATA
  app.get("/api/dashboard/head-coach", 
    isAuthenticated, 
    requireComplianceRole(['head_coach', 'assistant_coach']),
    async (req, res) => {
      try {
        const { viewMode } = req.query;
        
        let players = [
          {
            id: 'player-1',
            name: 'John Smith',
            position: 'QB',
            jersey: 12,
            grade: '12th',
            status: 'active',
            medicalClearance: 'cleared',
            academicEligibility: true,
            stats: { games: 7, starts: 7, performance: 'excellent' }
          },
          {
            id: 'player-2',
            name: 'Mike Johnson',
            position: 'RB',
            jersey: 24,
            grade: '11th',
            status: 'active',
            medicalClearance: 'cleared',
            academicEligibility: true,
            stats: { games: 7, starts: 5, performance: 'good' }
          },
          {
            id: 'player-3',
            name: 'David Lee',
            position: 'WR',
            jersey: 84,
            grade: '10th',
            status: 'injured',
            medicalClearance: 'restricted',
            academicEligibility: true,
            stats: { games: 5, starts: 3, performance: 'good' }
          },
          {
            id: 'player-4',
            name: 'Tom Wilson',
            position: 'LB',
            jersey: 52,
            grade: '12th',
            status: 'active',
            medicalClearance: 'cleared',
            academicEligibility: false,
            stats: { games: 7, starts: 7, performance: 'excellent' }
          }
        ];

        // Apply view mode filter
        switch (viewMode) {
          case 'starters':
            players = players.filter(p => p.stats.starts >= 5);
            break;
          case 'injured':
            players = players.filter(p => p.status === 'injured');
            break;
          case 'cleared':
            players = players.filter(p => p.medicalClearance === 'cleared');
            break;
          case 'roster':
          default:
            // Show all players
            break;
        }

        const dashboardData = {
          players,
          teamStats: {
            totalPlayers: 4,
            activePlayers: players.filter(p => p.status === 'active').length,
            injured: players.filter(p => p.status === 'injured').length,
            medicalCleared: players.filter(p => p.medicalClearance === 'cleared').length,
            academicEligible: players.filter(p => p.academicEligibility).length
          },
          upcomingGames: [
            { opponent: 'Central High', date: '2024-08-20', time: '19:00', location: 'Home' },
            { opponent: 'East High', date: '2024-08-27', time: '19:00', location: 'Away' }
          ],
          practiceSchedule: [
            { date: '2024-08-16', time: '15:30', type: 'Full Practice', duration: '2 hours' },
            { date: '2024-08-17', time: '15:30', type: 'Light Practice', duration: '1.5 hours' }
          ]
        };
        
        res.json(dashboardData);
      } catch (error) {
        console.error("Error fetching head coach dashboard:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
      }
    }
  );

  // SCOREKEEPER DASHBOARD DATA
  app.get("/api/dashboard/scorekeeper", 
    isAuthenticated, 
    requireComplianceRole(['scorekeeper']),
    async (req, res) => {
      try {
        const dashboardData = {
          assignedEvents: [
            {
              id: 'event-1',
              sport: 'Football',
              teams: ['Miller High vs. Central High'],
              date: '2024-08-20',
              time: '19:00',
              location: 'Miller Stadium',
              status: 'scheduled'
            },
            {
              id: 'event-2',
              sport: 'Basketball',
              teams: ['Miller JV vs. East High'],
              date: '2024-08-22',
              time: '18:00',
              location: 'Miller Gym',
              status: 'scheduled'
            },
            {
              id: 'event-3',
              sport: 'Soccer',
              teams: ['Miller Girls vs. West High'],
              date: '2024-08-24',
              time: '16:00',
              location: 'Miller Field',
              status: 'active'
            }
          ],
          currentGames: [
            {
              id: 'game-1',
              sport: 'Soccer',
              homeTeam: 'Miller Girls',
              awayTeam: 'West High',
              homeScore: 2,
              awayScore: 1,
              quarter: '2nd Half',
              timeRemaining: '15:30',
              status: 'active'
            }
          ],
          completedGames: [
            {
              id: 'game-2',
              sport: 'Basketball',
              homeTeam: 'Miller JV',
              awayTeam: 'North High',
              finalScore: '68-54',
              date: '2024-08-14',
              status: 'completed'
            }
          ]
        };
        
        res.json(dashboardData);
      } catch (error) {
        console.error("Error fetching scorekeeper dashboard:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
      }
    }
  );

  // ATHLETE DASHBOARD DATA
  app.get("/api/dashboard/athlete", 
    isAuthenticated, 
    async (req, res) => {
      try {
        const dashboardData = {
          personalSchedule: [
            {
              date: '2024-08-16',
              events: [
                { time: '15:30', activity: 'Football Practice', location: 'Main Field' },
                { time: '17:00', activity: 'Study Hall', location: 'Library' }
              ]
            },
            {
              date: '2024-08-17',
              events: [
                { time: '19:00', activity: 'Game vs. Central High', location: 'Miller Stadium' }
              ]
            }
          ],
          healthStatus: {
            clearanceStatus: 'cleared',
            physicalExpiration: '2025-06-15',
            daysUntilExpiration: 304,
            restrictions: [],
            upcomingAppointments: []
          },
          myTeams: [
            {
              teamId: 'varsity-football',
              teamName: 'Varsity Football',
              sport: 'Football',
              position: 'Wide Receiver',
              jerseyNumber: 84,
              coachName: 'Coach Thompson',
              record: '5-2',
              nextGame: {
                opponent: 'Central High',
                date: '2024-08-20',
                time: '19:00',
                location: 'Miller Stadium'
              }
            }
          ],
          academicStatus: {
            gpa: 3.7,
            eligibilityStatus: 'eligible',
            creditsNeeded: 24,
            creditsCompleted: 18
          },
          achievements: [
            { type: 'Academic', title: 'Honor Roll', date: '2024-05-15' },
            { type: 'Athletic', title: 'Team MVP', date: '2024-03-20' }
          ]
        };
        
        res.json(dashboardData);
      } catch (error) {
        console.error("Error fetching athlete dashboard:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
      }
    }
  );

  // GENERIC USER DASHBOARD (FAN/OTHER ROLES)
  app.get("/api/dashboard/general", 
    isAuthenticated, 
    async (req, res) => {
      try {
        const dashboardData = {
          upcomingGames: [
            {
              sport: 'Football',
              teams: 'Miller High vs. Central High',
              date: '2024-08-20',
              time: '19:00',
              location: 'Miller Stadium'
            },
            {
              sport: 'Basketball',
              teams: 'Miller JV vs. East High',
              date: '2024-08-22',
              time: '18:00',
              location: 'Miller Gym'
            }
          ],
          recentResults: [
            {
              sport: 'Basketball',
              teams: 'Miller JV vs. North High',
              result: '68-54 Win',
              date: '2024-08-14'
            }
          ],
          schoolNews: [
            {
              title: 'Fall Sports Registration Open',
              date: '2024-08-10',
              summary: 'Registration for fall sports is now open through August 25th.'
            }
          ]
        };
        
        res.json(dashboardData);
      } catch (error) {
        console.error("Error fetching general dashboard:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
      }
    }
  );
}