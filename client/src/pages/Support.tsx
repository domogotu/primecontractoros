import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Mail, Globe, Clock, BookOpen } from "lucide-react";
import Footer from "@/components/Footer";

export default function Support() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container flex items-center justify-between py-4">
          <button onClick={() => navigate("/")} className="text-2xl font-bold text-primary">
            PrimeContractorOS
          </button>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>Home</Button>
            <Button variant="ghost" onClick={() => navigate("/help")}>Help</Button>
            <Button variant="outline" onClick={() => navigate("/login")}>Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-12 md:py-16 border-b border-border">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Support</h1>
          <p className="text-lg text-muted-foreground">
            Get help with PrimeContractorOS. Our team is here to support your government contracting operations.
          </p>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-12 flex-1">
        <div className="container max-w-4xl space-y-8">
          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-card border border-border">
              <Mail className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send us an email for account questions, technical issues, or general inquiries.
              </p>
              <a href="mailto:support@reedssolutionsllc.org" className="text-primary hover:underline text-sm font-medium">
                support@reedssolutionsllc.org
              </a>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <Globe className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Reed Solutions LLC</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Visit our company website for more information about our services and capabilities.
              </p>
              <a href="https://reedssolutionsllc.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium">
                reedssolutionsllc.org
              </a>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <Clock className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Response Times</h3>
              <p className="text-sm text-muted-foreground mb-2">
                We respond to all inquiries within 1-2 business days.
              </p>
              <p className="text-sm text-muted-foreground">
                Business hours: Monday - Friday, 8:00 AM - 5:00 PM Pacific Time
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <BookOpen className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Self-Service Resources</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Browse our help center, documentation, and glossary for immediate answers.
              </p>
              <div className="flex gap-3">
                <Link href="/help">
                  <Button variant="outline" size="sm">Help Center</Button>
                </Link>
                <Link href="/documentation">
                  <Button variant="outline" size="sm">Docs</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="p-8 rounded-lg bg-card border border-border">
            <h2 className="text-xl font-semibold mb-6">Common Support Topics</h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-1">How do I reset my password?</h4>
                <p className="text-sm text-muted-foreground">Use the login page and click Forgot Password to receive a reset link via email.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">How do I invite team members?</h4>
                <p className="text-sm text-muted-foreground">Navigate to your workspace Users page and click Invite User. Enter their email and assign a role.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">How do I upgrade my plan?</h4>
                <p className="text-sm text-muted-foreground">Go to your Subscription page in the workspace settings to view and change your current plan.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Can I export my data?</h4>
                <p className="text-sm text-muted-foreground">Yes. Use the Reports section to export data in CSV format. Contact support for bulk exports.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">What happens to my data if I cancel?</h4>
                <p className="text-sm text-muted-foreground">Your data is retained for 90 days after cancellation. You can reactivate anytime during that period.</p>
              </div>
            </div>
          </div>

          {/* Urgent */}
          <div className="p-6 rounded-lg bg-amber-50 border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">Urgent Issues</h3>
            <p className="text-sm text-amber-800">
              For urgent platform issues that prevent you from accessing your workspace or managing active contracts, include URGENT in your email subject line and we will prioritize your request.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
