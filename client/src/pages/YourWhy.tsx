import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  GraduationCap, 
  Users, 
  MapPin, 
  DollarSign,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  Compass
} from 'lucide-react';

export default function YourWhy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-green-700 hover:text-green-800">
              ← Back to Home
            </Button>
          </Link>
          <Badge variant="outline" className="text-green-700 border-green-300">
            Champions for Change
          </Badge>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Compass className="h-12 w-12 text-green-600 mr-4" />
            <h1 className="text-5xl font-bold text-gray-900">Your Why</h1>
          </div>
          
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            We know. Central office says it again. "Don't forget your why." You roll your eyes. 
            But deep down, through all the madness of demands and barely decent wages, 
            you still have that why. That intrinsic desire to do good.
          </p>
          
          <p className="text-2xl font-semibold text-green-700 mb-12">
            This is ours.
          </p>
        </div>
      </div>

      {/* The Story */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-12 border-green-200 shadow-lg">
            <CardHeader className="bg-green-50 border-b border-green-200">
              <CardTitle className="text-2xl text-green-800 flex items-center">
                <Heart className="h-6 w-6 mr-3 text-red-500" />
                The Why Behind Champions for Change
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>39+ years of coaching experience.</strong> We've seen the look in a student's eyes 
                  when they realize they can't afford the educational trip that could change their perspective. 
                  We've watched talented kids miss opportunities because of circumstances beyond their control.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>We're not venture capitalists.</strong> We're not tech entrepreneurs chasing the next exit. 
                  We're educators who built a nonprofit because we saw a problem we could solve while funding 
                  something that matters.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>Every tournament you run</strong> on our platform doesn't just organize your event - 
                  it funds a <span className="font-semibold text-green-700">$2,600+ educational trip</span> for 
                  an underprivileged middle school student in Corpus Christi, Texas.
                </p>
                
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400 mt-8">
                  <p className="text-blue-800 italic text-lg">
                    "Your tournament chaos becomes their life-changing opportunity."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* The Numbers That Matter */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center border-green-200">
              <CardContent className="p-6">
                <GraduationCap className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-gray-900 mb-2">$2,600+</h3>
                <p className="text-gray-600">Cost per student educational trip we fund</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-blue-200">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-gray-900 mb-2">100%</h3>
                <p className="text-gray-600">Of platform revenue funds student opportunities</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-purple-200">
              <CardContent className="p-6">
                <MapPin className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Corpus Christi</h3>
                <p className="text-gray-600">Middle schools where we focus our impact</p>
              </CardContent>
            </Card>
          </div>

          {/* What This Means For You */}
          <Card className="mb-12 border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50 border-b border-blue-200">
              <CardTitle className="text-2xl text-blue-800 flex items-center">
                <BookOpen className="h-6 w-6 mr-3" />
                What This Means For Your District
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    The Practical Impact
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Save $31,010-$65,510 annually on tournament management costs</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Professional-grade tournament system for every school in your district</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Real-time scoring, team management, and parent communication</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>White-label mobile apps for your entire athletic program</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Heart className="h-5 w-5 text-red-500 mr-2" />
                    The Mission Impact
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Your athletic fees directly fund student educational opportunities</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Tax advantages for supporting a verified 501(c)(3) nonprofit</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Community pride in supporting educational equity nationwide</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Transparent reporting on exactly which students benefit</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* The Real Talk */}
          <Card className="mb-12 border-gray-200 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">The Real Talk</h3>
              </div>
              
              <div className="prose prose-lg max-w-none text-center">
                <p className="text-gray-700 leading-relaxed mb-6">
                  We know you're tired of being told about your why by people in suits who haven't 
                  been in a classroom in decades. We know you're frustrated with systems that 
                  promise the world and deliver complicated nonsense.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>We're different because we're you.</strong> We're coaches. We've run 
                  tournaments with clipboards and chaos. We've dealt with angry parents and 
                  missing referees and scoreboards that don't work.
                </p>
                
                <p className="text-xl font-semibold text-green-700 mb-6">
                  We built this because we needed it. We made it fund education because that's our why.
                </p>
                
                <p className="text-gray-700 leading-relaxed">
                  Your why might be seeing kids succeed. Or giving them opportunities they wouldn't 
                  have otherwise. Or just making sure your tournaments don't drive you completely insane.
                </p>
                
                <p className="text-lg text-blue-700 font-medium mt-6">
                  Whatever your why is, this platform serves it while funding ours.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="border-green-300 shadow-xl">
            <CardContent className="p-8 text-center">
              <Award className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Turn Your Tournaments Into Educational Opportunities?
              </h3>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Join the districts that are saving money, improving their athletic programs, 
                and funding student trips - all with one decision.
              </p>
              
              <div className="space-y-4">
                <div className="text-lg text-green-700 font-semibold mb-4">
                  Champions District: $2,490/year (locked through 2027)
                </div>
                <div className="text-sm text-gray-600 mb-6">
                  Early adopter pricing - increases to $4,990-6,990/year when competitors arrive
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Link href="/">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                      Get Started Today
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3">
                      See All Options
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 italic">
                  "Every tournament should fund a student's future."
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  - Champions for Change Mission Statement
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}