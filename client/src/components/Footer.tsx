import { Heart, GraduationCap, MapPin, Mail, Phone, Award } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mission Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-400" />
              Our Mission
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Champions for Change is dedicated to funding educational opportunities and student trips for underprivileged student competitors. Every tournament managed on our platform directly supports these vital educational experiences.
            </p>
            <div className="flex items-center text-sm text-green-400">
              <GraduationCap className="h-4 w-4 mr-2" />
              <span>100% of revenue supports student education</span>
            </div>
          </div>

          {/* Leadership Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-blue-400" />
              Leadership
            </h3>
            <div className="text-gray-300 text-sm space-y-2">
              <p>
                <span className="font-medium text-white">Daniel Thornton</span><br />
                <span className="text-blue-400">Executive Director</span><br />
                Champions for Change
              </p>
              <p className="text-xs text-gray-400">
                21 years military service (Marines & Army)<br />
                10 years secondary athletic coaching<br />
                Educational leadership experience
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-green-400" />
                <a 
                  href="mailto:Champions4change361@gmail.com" 
                  className="text-sm text-gray-300 hover:text-green-400 transition-colors"
                  data-testid="link-email"
                >
                  Champions4change361@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-blue-400" />
                <a 
                  href="tel:361-300-1552" 
                  className="text-sm text-gray-300 hover:text-blue-400 transition-colors"
                  data-testid="link-phone"
                >
                  (361) 300-1552
                </a>
              </div>
            </div>
            <div className="mt-6 text-xs text-gray-500">
              <p>Platform built by coaches who understand tournament management needs</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              <p>&copy; 2025 Champions for Change. Supporting education through sports management.</p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/refund-policy" className="text-gray-400 hover:text-white transition-colors">
                Refund Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <div className="text-center mt-4">
            <div className="flex justify-center items-center text-sm text-gray-400">
              <Heart className="h-4 w-4 mr-2 text-red-400" />
              <span>Built with dedication for student success</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}