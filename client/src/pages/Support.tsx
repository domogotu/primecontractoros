import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, Phone } from "lucide-react";

export default function Support() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Support Center</h1>
          <p className="text-gray-600">Get help with PrimeContractorOS</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <MessageSquare className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chat Support</h3>
            <p className="text-gray-600 mb-4">Get instant help from our support team</p>
            <Button className="w-full bg-blue-500 hover:bg-blue-600">Start Chat</Button>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <Mail className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">Email us at support@primecontractoros.com</p>
            <Button className="w-full bg-blue-500 hover:bg-blue-600">Send Email</Button>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
            <Phone className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-4">Call us at 1-800-PRIME-OS</p>
            <Button className="w-full bg-blue-500 hover:bg-blue-600">Call Now</Button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">How do I create a workspace?</h4>
              <p className="text-gray-600">Go to Get Started and follow the 4-step setup process.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">How do I invite team members?</h4>
              <p className="text-gray-600">Go to Settings &gt; Users and click Add User.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">How do I upgrade my plan?</h4>
              <p className="text-gray-600">Go to Subscription and select your desired plan.</p>
            </div>
          </div>
        </div>

        <Link href="/">
          <Button variant="outline" className="border-white text-white hover:bg-white/10">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
