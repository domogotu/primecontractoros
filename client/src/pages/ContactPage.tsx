import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Mail, Globe, MapPin } from "lucide-react";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navy Header */}
      <div className="bg-blue-900 text-white px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <nav className="mb-8">
            <Link href="/">
              <span className="text-blue-200 hover:text-white text-sm cursor-pointer">&larr; Back to Home</span>
            </Link>
          </nav>
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-blue-100 text-lg">Get in touch with the PrimeContractorOS team.</p>
        </div>
      </div>

      <div className="flex-1 px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Contact Methods */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Reach Us</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <Mail className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-sm text-gray-600 mb-3">For general inquiries and support</p>
                <a href="mailto:support@reedssolutionsllc.org" className="text-blue-600 hover:underline text-sm">
                  support@reedssolutionsllc.org
                </a>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <Globe className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Website</h3>
                <p className="text-sm text-gray-600 mb-3">Learn more about Reed's Solutions LLC</p>
                <a href="https://reedssolutionsllc.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                  reedssolutionsllc.org
                </a>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-sm text-gray-600 mb-3">Based in California</p>
                <p className="text-sm text-gray-700">United States</p>
              </div>
            </div>
          </section>

          {/* Support Topics */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What Can We Help With?</h2>
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-1">Account & Billing Questions</h3>
                <p className="text-sm text-gray-600">Questions about your subscription, workspace access, or billing. Email us at support@reedssolutionsllc.org.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-1">Technical Support</h3>
                <p className="text-sm text-gray-600">Issues with the platform, bugs, or feature requests. Use the in-app support page or email us directly.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-1">Partnership & Integration Inquiries</h3>
                <p className="text-sm text-gray-600">Interested in partnering with us or integrating with PrimeContractorOS? Reach out via email.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-1">Government Contracting Guidance</h3>
                <p className="text-sm text-gray-600">Need help understanding FAR/DFARS requirements or navigating the contracting lifecycle? Our team can point you in the right direction.</p>
              </div>
            </div>
          </section>

          {/* Response Time */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Response Times</h2>
            <p className="text-gray-700 mb-4">We aim to respond to all inquiries within 1-2 business days. For urgent platform issues, please include "URGENT" in your email subject line.</p>
            <p className="text-sm text-gray-600">Business hours: Monday through Friday, 8:00 AM - 5:00 PM Pacific Time</p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
