import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mail, MessageCircle, Building, User } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const contactData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      organization: formData.get("organization") as string,
      inquiryType: formData.get("inquiryType") as string,
      hearAboutUs: formData.get("hearAboutUs") as string,
      message: formData.get("message") as string,
    };

    try {
      // Here you would typically send to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });

      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/signup')}
            className="text-white hover:bg-white/10"
            data-testid="button-back-signup"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Signup
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-300 max-w-lg mx-auto">
            Have questions about our tournament platform? We're here to help you find the right solution for your organization.
          </p>
        </div>

        {/* Contact Form */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-slate-200">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    className="bg-slate-900 border-slate-600 text-white"
                    data-testid="input-contact-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-slate-200">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="bg-slate-900 border-slate-600 text-white"
                    data-testid="input-contact-email"
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <Label htmlFor="organization" className="text-slate-200">Organization</Label>
                <Input
                  id="organization"
                  name="organization"
                  placeholder="School district, sports club, business, etc."
                  className="bg-slate-900 border-slate-600 text-white"
                  data-testid="input-contact-organization"
                />
              </div>

              {/* Inquiry Type and How They Heard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inquiryType" className="text-slate-200">Inquiry Type *</Label>
                  <Select name="inquiryType" required>
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white" data-testid="select-inquiry-type">
                      <SelectValue placeholder="Select inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pricing">Pricing & Plans</SelectItem>
                      <SelectItem value="features">Platform Features</SelectItem>
                      <SelectItem value="demo">Request Demo</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                      <SelectItem value="general">General Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hearAboutUs" className="text-slate-200">How did you hear about us?</Label>
                  <Select name="hearAboutUs">
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white" data-testid="select-hear-about">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="search">Search Engine</SelectItem>
                      <SelectItem value="referral">Colleague Referral</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="event">Sports Event/Conference</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message" className="text-slate-200">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  maxLength={1000}
                  placeholder="Please describe your needs, questions, or how we can help you..."
                  className="bg-slate-900 border-slate-600 text-white resize-none"
                  data-testid="textarea-contact-message"
                />
                <p className="text-xs text-slate-400 mt-1">Maximum 1,000 characters</p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  data-testid="button-send-message"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Quick Response Promise</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
              <div className="flex items-center justify-center">
                <User className="h-5 w-5 mr-2 text-blue-400" />
                <span>Personal Response</span>
              </div>
              <div className="flex items-center justify-center">
                <MessageCircle className="h-5 w-5 mr-2 text-green-400" />
                <span>24 Hour Reply</span>
              </div>
              <div className="flex items-center justify-center">
                <Building className="h-5 w-5 mr-2 text-purple-400" />
                <span>Tailored Solutions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}