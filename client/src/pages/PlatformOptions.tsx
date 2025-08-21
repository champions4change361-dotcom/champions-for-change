import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  School, 
  Users, 
  Trophy, 
  Heart, 
  Briefcase,
  GraduationCap,
  Target,
  ArrowRight,
  ChevronRight,
  Star,
  Zap,
  Globe,
  BookOpen,
  Award
} from "lucide-react";
import { useLocation } from "wouter";
import championLogo from "@assets/IMG_1442_1754896656003.jpeg";

export default function PlatformOptions() {
  const [, setLocation] = useLocation();

  const platformOptions = [
    {
      id: "charter-schools",
      title: "Charter Schools",
      description: "Comprehensive athletic & academic management for charter school networks",
      icon: Building,
      color: "blue",
      features: ["Multi-Campus Coordination", "Academic Competition Tracking", "Budget Allocation", "Health Monitoring", "HIPAA/FERPA Compliance"],
      action: "Charter Registration",
      route: "/register",
      price: "Enterprise pricing",
      badge: "Network Ready"
    },
    {
      id: "private-school",
      title: "Private Schools",
      description: "Comprehensive management for independent educational institutions", 
      icon: School,
      color: "purple",
      features: ["Multi-Sport Coordination", "Student Health Management", "Tournament Organization", "Custom Branding", "Priority Support"],
      action: "Private School Setup",
      route: "/login/district", // Can reuse district login for private schools
      price: "From $199/month",
      badge: "Independent Schools"
    },
    {
      id: "tournament-organizer",
      title: "Tournament Organizers",
      description: "Professional tournament management for coaches and event organizers",
      icon: Trophy,
      color: "orange",
      features: ["Unlimited Events", "Team Registration", "Payment Processing", "Custom Branding", "Real-time Scoring"],
      action: "Start Organizing",
      route: "/login/organizer",
      price: "$39/month or $399/year",
      badge: "2 Months Free"
    },
    {
      id: "nonprofit",
      title: "Community Nonprofits",
      description: "Tournament platform for churches, youth organizations, and community groups",
      icon: Users,
      color: "green",
      features: ["Community Events", "Donation Integration", "Volunteer Management", "Youth Programs", "Educational Mission"],
      action: "Community Setup",
      route: "/nonprofit-register",
      price: "Special nonprofit pricing",
      badge: "Mission-Driven"
    },
    {
      id: "business",
      title: "Business Enterprise", 
      description: "White-label tournament platform for businesses and service providers",
      icon: Briefcase,
      color: "slate",
      features: ["White-Label Platform", "Custom Domain", "Enterprise Support", "API Access", "Multi-Tenant"],
      action: "Business Registration",
      route: "/login/business",
      price: "$149/month or $1,499/year",
      badge: "White-Label Ready"
    },
    {
      id: "fantasy-coaching",
      title: "Fantasy Coaching AI",
      description: "Professional fantasy sports intelligence with real Yahoo Sports data",
      icon: Star,
      color: "yellow",
      features: ["Live Injury Reports", "Usage Rate Analysis", "Matchup Intelligence", "Player Projections", "Yahoo Sports API"],
      action: "Access Fantasy AI", 
      route: "/fantasy-coaching",
      price: "Included with all plans",
      badge: "Real Sports Data"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "border-blue-500/30 hover:border-blue-400/50 from-blue-500/10 to-blue-600/10",
      purple: "border-purple-500/30 hover:border-purple-400/50 from-purple-500/10 to-purple-600/10", 
      orange: "border-orange-500/30 hover:border-orange-400/50 from-orange-500/10 to-orange-600/10",
      green: "border-green-500/30 hover:border-green-400/50 from-green-500/10 to-green-600/10",
      slate: "border-slate-500/30 hover:border-slate-400/50 from-slate-500/10 to-slate-600/10",
      yellow: "border-yellow-500/30 hover:border-yellow-400/50 from-yellow-500/10 to-yellow-600/10"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: "text-blue-400",
      purple: "text-purple-400",
      orange: "text-orange-400", 
      green: "text-green-400",
      slate: "text-slate-400",
      yellow: "text-yellow-400"
    };
    return colors[color as keyof typeof colors] || "text-blue-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 via-transparent to-orange-400/5"></div>
        <header className="relative border-b border-orange-500/20 bg-slate-900/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <img 
                  src={championLogo} 
                  alt="Champions for Change" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-xl font-bold text-white">Champions for Change</h1>
                  <p className="text-xs text-orange-400">Choose Your Platform</p>
                </div>
              </div>
              
              <Button 
                onClick={() => setLocation('/')}
                variant="outline"
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                data-testid="button-back-to-home"
              >
                ← Back to Home
              </Button>
            </div>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30">
            <Trophy className="h-3 w-3 mr-1" />
            Complete Platform Solutions
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Choose Your Perfect <span className="text-orange-400">Platform</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Professional tournament and athletic management solutions for every organization type. 
            Built by coaches to support educational opportunities for student competitors.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Award className="h-5 w-5" />
              <span className="font-semibold">Professional Features</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <Globe className="h-5 w-5" />
              <span className="font-semibold">Mission-Driven Platform</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-400">
              <Heart className="h-5 w-5" />
              <span className="font-semibold">Supporting Student Education</span>
            </div>
          </div>
        </div>

        {/* Platform Options Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {platformOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card 
                key={option.id}
                className={`bg-gradient-to-br ${getColorClasses(option.color)} bg-slate-800 border transition-all duration-300 hover:transform hover:scale-105 cursor-pointer group`}
                onClick={() => setLocation(option.route)}
                data-testid={`card-platform-${option.id}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${option.color}-500/20 rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${getIconColor(option.color)}`} />
                    </div>
                    {option.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {option.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                    {option.title}
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-sm leading-relaxed">
                    {option.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {option.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-slate-300">
                          <ChevronRight className="h-3 w-3 mr-2 text-emerald-400 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-orange-400">{option.price}</span>
                      </div>
                      
                      <Button 
                        className={`w-full bg-${option.color}-600 hover:bg-${option.color}-700 text-white font-semibold`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(option.route);
                        }}
                        data-testid={`button-${option.id}`}
                      >
                        {option.action}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-emerald-600/20 via-emerald-500/20 to-emerald-600/20 rounded-2xl border border-emerald-500/30 p-8 text-center">
          <Heart className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Built by Coaches, For Education
          </h2>
          <p className="text-lg text-slate-300 mb-6 max-w-3xl mx-auto leading-relaxed">
            Every platform subscription helps fund educational opportunities for underprivileged student competitors. 
            Choose your solution and join our mission to create life-changing experiences through sports and academics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3"
              onClick={() => setLocation("/your-why")}
              data-testid="button-learn-mission"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Learn About Our Mission
            </Button>
            <Button 
              variant="outline"
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 px-8 py-3"
              onClick={() => setLocation("/donate")}
              data-testid="button-support-students"
            >
              <Heart className="mr-2 h-4 w-4" />
              Support Students Directly
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}