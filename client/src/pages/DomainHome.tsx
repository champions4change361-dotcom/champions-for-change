import { useDomain } from "@/hooks/useDomain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function DomainHome() {
  const { config, isFeatureEnabled, isSchoolSafe, isFantasyDomain } = useDomain();

  const getWelcomeMessage = () => {
    if (isSchoolSafe()) {
      return {
        title: "Welcome to Educational Tournament Management",
        subtitle: "Professional tools for schools and districts",
        description: "Create and manage tournaments for basketball, soccer, track & field, and more. Built by coaches for educational athletics.",
        cta: "Start Managing Tournaments"
      };
    }
    
    if (isFantasyDomain()) {
      return {
        title: "Welcome to Fantasy League Central",
        subtitle: "Free fantasy sports competition",
        description: "Compete in NFL Survivor, NBA DFS, College Football Pick Em, and Esports leagues. Join the fun and support a great cause!",
        cta: "Join Fantasy Leagues"
      };
    }
    
    return {
      title: "Welcome to Tournament Pro",
      subtitle: "Professional tournament management",
      description: "Advanced tournament management with fantasy league integration for professional and adult recreational sports.",
      cta: "Explore Features"
    };
  };

  const welcome = getWelcomeMessage();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className={`text-5xl font-bold mb-4 ${
          isFantasyDomain() ? 'text-white' : isSchoolSafe() ? 'text-blue-900' : 'text-orange-900'
        }`}>
          {welcome.title}
        </h1>
        <p className={`text-xl mb-8 ${
          isFantasyDomain() ? 'text-purple-200' : isSchoolSafe() ? 'text-blue-600' : 'text-orange-600'
        }`}>
          {welcome.subtitle}
        </p>
        <p className={`text-lg max-w-2xl mx-auto mb-8 ${
          isFantasyDomain() ? 'text-purple-100' : isSchoolSafe() ? 'text-slate-700' : 'text-slate-600'
        }`}>
          {welcome.description}
        </p>
        
        <div className="flex justify-center gap-4">
          {isSchoolSafe() && (
            <Link href="/tournament-empire">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                {welcome.cta}
              </Button>
            </Link>
          )}
          
          {isFantasyDomain() && (
            <Link href="/fantasy-tournaments">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                {welcome.cta}
              </Button>
            </Link>
          )}
          
          {!isSchoolSafe() && !isFantasyDomain() && (
            <>
              <Link href="/tournament-empire">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  Tournament Management
                </Button>
              </Link>
              <Link href="/fantasy-tournaments">
                <Button size="lg" variant="outline">
                  Fantasy Leagues
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* School-safe features */}
        {isSchoolSafe() && (
          <>
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">🏆 Tournament Creation</CardTitle>
                <CardDescription>Create professional tournaments for all youth sports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Single/double elimination, round robin, and more tournament formats</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">📊 Live Scoring</CardTitle>
                <CardDescription>Real-time score updates and bracket progression</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Keep fans and teams updated with live match results</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">🎓 Educational Focus</CardTitle>
                <CardDescription>Supporting Champions for Change mission</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Platform revenue funds educational trips for students</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Fantasy features */}
        {isFantasyDomain() && (
          <>
            <Card className="border-purple-400 bg-white/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-purple-100">🏈 NFL Survivor</CardTitle>
                <CardDescription className="text-purple-200">Pick one team each week to survive</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-100">Last person standing wins the glory!</p>
              </CardContent>
            </Card>

            <Card className="border-purple-400 bg-white/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-purple-100">🏀 NBA Daily Fantasy</CardTitle>
                <CardDescription className="text-purple-200">Draft your dream team every day</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-100">Pick players within salary cap constraints</p>
              </CardContent>
            </Card>

            <Card className="border-purple-400 bg-white/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-purple-100">🎮 Esports Leagues</CardTitle>
                <CardDescription className="text-purple-200">League of Legends and more</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-100">Fantasy leagues for professional esports</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Pro features */}
        {!isSchoolSafe() && !isFantasyDomain() && (
          <>
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-900">⚡ Advanced Analytics</CardTitle>
                <CardDescription>Deep tournament insights and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Professional-grade analytics for serious competition</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-900">🎯 Fantasy Integration</CardTitle>
                <CardDescription>Add fantasy elements to any tournament</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Engage participants with fantasy scoring</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-900">🏢 Enterprise Features</CardTitle>
                <CardDescription>White-label solutions and custom branding</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Full customization for professional organizations</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Mission statement for educational domain */}
      {isSchoolSafe() && (
        <div className="text-center mt-16 p-8 bg-blue-50 rounded-lg">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Supporting Educational Excellence</h2>
          <p className="text-blue-700 max-w-3xl mx-auto">
            Every tournament managed through our platform helps fund educational trips and opportunities 
            for underprivileged youth in Corpus Christi, Texas. Built by coaches who understand the needs 
            of educational athletics.
          </p>
        </div>
      )}

      {/* Donation call-to-action for fantasy domain */}
      {isFeatureEnabled('donationButtons') && (
        <div className="text-center mt-16 p-8 bg-white/10 backdrop-blur rounded-lg border border-purple-400">
          <h2 className="text-2xl font-bold text-white mb-4">Love Fantasy Sports? Support Education!</h2>
          <p className="text-purple-100 max-w-3xl mx-auto mb-6">
            This free fantasy platform is supported by donations. Every contribution helps fund educational 
            trips for students through Champions for Change nonprofit.
          </p>
          <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium">
            Donate Now ❤️
          </Button>
        </div>
      )}
    </div>
  );
}