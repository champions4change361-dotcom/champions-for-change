import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, FileText, Heart, Lock, Users, Scale, Phone, Mail } from 'lucide-react';

export default function Compliance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-6 bg-green-500/20 text-green-400 border-green-500/30">
            <Shield className="h-4 w-4 mr-2" />
            Champions for Change Compliance Center
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-6">
            Privacy, Security & Compliance
          </h1>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto">
            Champions for Change is committed to protecting your privacy and maintaining the highest standards 
            of data security. We comply with all relevant educational, healthcare, and privacy regulations.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <a href="#privacy" className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-green-500/50 transition-all">
            <Eye className="h-6 w-6 text-green-400 mb-2" />
            <h3 className="text-white font-semibold">Privacy Policy</h3>
          </a>
          <a href="#ferpa" className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-all">
            <FileText className="h-6 w-6 text-blue-400 mb-2" />
            <h3 className="text-white font-semibold">FERPA Compliance</h3>
          </a>
          <a href="#hipaa" className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-purple-500/50 transition-all">
            <Heart className="h-6 w-6 text-purple-400 mb-2" />
            <h3 className="text-white font-semibold">HIPAA Compliance</h3>
          </a>
          <a href="#safety" className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-orange-500/50 transition-all">
            <Shield className="h-6 w-6 text-orange-400 mb-2" />
            <h3 className="text-white font-semibold">Safety Protocols</h3>
          </a>
        </div>

        {/* Privacy Policy */}
        <Card id="privacy" className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-green-400">
              <Eye className="h-6 w-6 mr-3" />
              Privacy Policy
            </CardTitle>
            <CardDescription className="text-slate-300">
              Last Updated: August 19, 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <h3 className="text-lg font-semibold text-white">Information We Collect</h3>
            <ul className="space-y-2 ml-4 list-disc">
              <li><strong>Account Information:</strong> Name, email address, school/organization affiliation, role</li>
              <li><strong>Tournament Data:</strong> Team names, participant information, tournament results, scheduling</li>
              <li><strong>Usage Information:</strong> Platform activity, feature usage, performance analytics</li>
              <li><strong>Communication:</strong> Support requests, feedback, correspondence</li>
            </ul>

            <h3 className="text-lg font-semibold text-white">How We Use Your Information</h3>
            <ul className="space-y-2 ml-4 list-disc">
              <li>Provide tournament management services and platform functionality</li>
              <li>Support Champions for Change educational mission and student programs</li>
              <li>Improve platform features and user experience</li>
              <li>Comply with legal obligations and educational regulations</li>
              <li>Communicate platform updates and support</li>
            </ul>

            <h3 className="text-lg font-semibold text-white">Information Sharing</h3>
            <p>We do not sell, rent, or share personal information with third parties except:</p>
            <ul className="space-y-2 ml-4 list-disc">
              <li>With your explicit consent</li>
              <li>As required by law or legal process</li>
              <li>To protect platform security and prevent fraud</li>
              <li>With service providers under strict confidentiality agreements</li>
            </ul>

            <h3 className="text-lg font-semibold text-white">Data Security</h3>
            <p>We implement industry-standard security measures including encryption, access controls, audit logging, and regular security assessments to protect your information.</p>

            <h3 className="text-lg font-semibold text-white">Your Rights</h3>
            <ul className="space-y-2 ml-4 list-disc">
              <li>Access and review your personal information</li>
              <li>Request corrections or updates</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of non-essential communications</li>
              <li>Request data portability</li>
            </ul>
          </CardContent>
        </Card>

        {/* FERPA Compliance */}
        <Card id="ferpa" className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-400">
              <FileText className="h-6 w-6 mr-3" />
              FERPA Compliance
            </CardTitle>
            <CardDescription className="text-slate-300">
              Family Educational Rights and Privacy Act Protection
            </CardDescription>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <p>Champions for Change is committed to protecting student educational records in accordance with the Family Educational Rights and Privacy Act (FERPA).</p>

            <h3 className="text-lg font-semibold text-white">Educational Records Protection</h3>
            <ul className="space-y-2 ml-4 list-disc">
              <li>Student athletic participation records are treated as educational records</li>
              <li>Access is restricted to authorized school officials with legitimate educational interests</li>
              <li>Parent/guardian consent required for disclosure to external parties</li>
              <li>Students 18+ have direct rights to their records</li>
            </ul>

            <h3 className="text-lg font-semibold text-white">Role-Based Access Controls</h3>
            <ul className="space-y-2 ml-4 list-disc">
              <li><strong>District Level:</strong> Athletic Directors, Coordinators, Trainers</li>
              <li><strong>School Level:</strong> School-specific athletic staff</li>
              <li><strong>Coaching Level:</strong> Head Coaches, Assistant Coaches</li>
              <li><strong>Student Level:</strong> Self-access only (18+)</li>
            </ul>

            <h3 className="text-lg font-semibold text-white">Data Handling</h3>
            <ul className="space-y-2 ml-4 list-disc">
              <li>Comprehensive audit trails for all access and modifications</li>
              <li>Automatic data retention and disposal policies</li>
              <li>Secure data transmission and storage</li>
              <li>Regular compliance audits and assessments</li>
            </ul>
          </CardContent>
        </Card>

        {/* HIPAA Compliance */}
        <Card id="hipaa" className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-400">
              <Heart className="h-6 w-6 mr-3" />
              HIPAA Compliance
            </CardTitle>
            <CardDescription className="text-slate-300">
              Health Insurance Portability and Accountability Act Protection
            </CardDescription>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <p>Champions for Change maintains HIPAA compliance for all health-related information collected through our platform.</p>

            <h3 className="text-lg font-semibold text-white">Protected Health Information (PHI)</h3>
            <ul className="space-y-2 ml-4 list-disc">
              <li>Medical clearance records and health forms</li>
              <li>Injury reports and treatment documentation</li>
              <li>Athletic trainer assessments and care plans</li>
              <li>Emergency contact and medical alert information</li>
            </ul>

            <h3 className="text-lg font-semibold text-white">Access Controls</h3>
            <ul className="space-y-2 ml-4 list-disc">
              <li>Minimum necessary standard applied to all PHI access</li>
              <li>Role-based permissions for medical data</li>
              <li>Athletic trainers and authorized medical personnel only</li>
              <li>Emergency access procedures for critical situations</li>
            </ul>

            <h3 className="text-lg font-semibold text-white">Security Measures</h3>
            <ul className="space-y-2 ml-4 list-disc">
              <li>End-to-end encryption for all medical data</li>
              <li>Secure transmission protocols</li>
              <li>Regular security risk assessments</li>
              <li>Incident response and breach notification procedures</li>
            </ul>
          </CardContent>
        </Card>

        {/* Safety Protocols */}
        <Card id="safety" className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-400">
              <Shield className="h-6 w-6 mr-3" />
              Safety Protocols
            </CardTitle>
            <CardDescription className="text-slate-300">
              Comprehensive Athletic Safety and Risk Management
            </CardDescription>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <h3 className="text-lg font-semibold text-white">Pre-Participation Safety</h3>
            <ul className="space-y-2 ml-4 list-disc">
              <li>Medical clearance verification systems</li>
              <li>Emergency contact and medical information collection</li>
              <li>Athletic trainer communication and alert systems</li>
              <li>Equipment safety checklists and inspections</li>
            </ul>

            <h3 className="text-lg font-semibold text-white">Emergency Response</h3>
            <ul className="space-y-2 ml-4 list-disc">
              <li>Real-time injury reporting and documentation</li>
              <li>Automated emergency contact notification</li>
              <li>Athletic trainer immediate alert systems</li>
              <li>Emergency action plan integration</li>
            </ul>

            <h3 className="text-lg font-semibold text-white">Specialized Safety Protocols</h3>
            <ul className="space-y-2 ml-4 list-disc">
              <li><strong>Cheerleading:</strong> USA Cheer/USASF safety guidelines compliance</li>
              <li><strong>Track & Field:</strong> Equipment safety and weather monitoring</li>
              <li><strong>Team Sports:</strong> Concussion protocols and injury prevention</li>
              <li><strong>Aquatics:</strong> Water safety and lifeguard coordination</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Scale className="h-6 w-6 mr-3" />
              Compliance Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <p>For questions about our compliance policies or to report concerns:</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Privacy & Data Protection</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-green-400" />
                    <a href="mailto:privacy@championsforchange.net" className="text-green-400 hover:text-green-300">
                      privacy@championsforchange.net
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-green-400" />
                    <a href="tel:361-300-1552" className="text-green-400 hover:text-green-300">
                      (361) 300-1552
                    </a>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Safety & Medical Concerns</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-orange-400" />
                    <a href="mailto:safety@championsforchange.net" className="text-orange-400 hover:text-orange-300">
                      safety@championsforchange.net
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-orange-400" />
                    <span className="text-orange-400">Emergency: 911</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-slate-700/50 rounded-lg">
              <p className="text-sm">
                <strong>Champions for Change</strong> • 501(c)(3) Nonprofit Organization • EIN: 33-2548199
              </p>
              <p className="text-sm mt-1">
                Daniel Thornton, Executive Director • 21 years military service • 10 years coaching • Educator since 2016
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}