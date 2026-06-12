import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Check, ArrowRight } from "lucide-react";

/**
 * Pricing Page
 *
 * Design: Professional Minimalism
 * - Clear plan comparison
 * - Access model explanation
 * - Trial and discount information
 *
 * Phase 2: Plan selection is now persisted to localStorage so the
 * signup / checkout flow can carry the selected plan forward.
 */
export default function Pricing() {
  const [, navigate] = useLocation();

  const plans = [
    {
      name: "Starter",
      slug: "starter",
      description: "Perfect for new contractors",
      price: "$99",
      annualPrice: "$84",
      period: "/month",
      features: [
        "Up to 5 team members",
        "Opportunity tracking",
        "Basic proposal templates",
        "Contract management",
        "File storage (5GB)",
        "Email support",
      ],
      cta: "Start Free Trial",
      highlight: false,
    },
    {
      name: "Growth",
      slug: "growth",
      description: "For growing contractors",
      price: "$299",
      annualPrice: "$254",
      period: "/month",
      features: [
        "Up to 20 team members",
        "Advanced proposal framework",
        "AI-powered recommendations",
        "Financial reporting",
        "File storage (50GB)",
        "Priority support",
        "Custom templates",
        "Lessons learned library",
      ],
      cta: "Start Free Trial",
      highlight: true,
    },
    {
      name: "Advanced",
      slug: "advanced",
      description: "For established contractors",
      price: "$799",
      annualPrice: "$679",
      period: "/month",
      features: [
        "Unlimited team members",
        "Full AI workspace intelligence",
        "Advanced compliance tracking",
        "Custom reporting",
        "File storage (500GB)",
        "24/7 phone support",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
      ],
      cta: "Start Free Trial",
      highlight: false,
    },
  ];

  /**
   * Store the selected plan in localStorage so GetStarted and the
   * post-auth checkout flow can read it without losing it across the
   * OAuth redirect.
   */
  const handleSelectPlan = (plan: typeof plans[0]) => {
    localStorage.setItem(
      "pcos_selected_plan",
      JSON.stringify({
        name: plan.name,
        slug: plan.slug,
        billingInterval: "month",
        selectedAt: new Date().toISOString(),
      })
    );
    navigate(`/get-started?plan=${plan.slug}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="container flex items-center justify-between py-4">
          <button onClick={() => navigate("/")} className="text-2xl font-bold text-primary">
            PrimeContractorOS
          </button>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => navigate("/features")}>
              Features
            </Button>
            <Button variant="ghost" onClick={() => navigate("/help")}>
              Help
            </Button>
            <Button variant="outline" onClick={() => navigate("/login")}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-gray-200">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-500">
            Choose the plan that fits your business. All plans include a 7-day free trial.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 md:py-24 border-b border-gray-200">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-lg border transition-all ${
                  plan.highlight
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 relative md:scale-105"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  </div>

                  <div>
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                    <p className="text-xs text-gray-400 mt-1">
                      {plan.annualPrice}/mo billed annually (save 15%)
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => handleSelectPlan(plan)}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="space-y-3 pt-6 border-t border-gray-200">
                    {plan.features.map((feature, fidx) => (
                      <div key={fidx} className="flex gap-3 items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-900">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access Model */}
      <section className="py-16 md:py-24 border-b border-gray-200">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold mb-12">Understanding Access Levels</h2>
          <div className="space-y-8">
            <div className="p-8 rounded-lg bg-white border border-gray-200">
              <h3 className="text-xl font-semibold mb-3">7-Day Trial</h3>
              <p className="text-gray-500 mb-4">
                Get full access to any plan for 7 days at no cost. One trial per workspace. After the trial ends, you can activate a paid plan or switch to limited access.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Full feature access during trial period</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Trial discount available for 30 days after trial start</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>No credit card required during trial</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-lg bg-white border border-gray-200">
              <h3 className="text-xl font-semibold mb-3">Limited Access</h3>
              <p className="text-gray-500 mb-4">
                Decline the trial and continue with core features at no cost. Limited access is permanent—no time limit, but fewer features than paid plans.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Core opportunity and contract tracking</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Basic templates and guidance</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Limited team members (up to 3)</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-lg bg-white border border-gray-200">
              <h3 className="text-xl font-semibold mb-3">Paid Plans</h3>
              <p className="text-gray-500 mb-4">
                Activate a paid plan immediately for full access. Includes a 7-day trial period, after which you're billed monthly or annually.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Full feature access from day one</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Monthly billing with annual discount available</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Promo codes and discounts accepted</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 border-b border-gray-200">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
              },
              {
                q: "Do you offer discounts for annual billing?",
                a: "Yes. Annual plans are available at a 15% discount. Contact support for details.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, American Express) and bank transfers for annual plans.",
              },
              {
                q: "Is there a contract or commitment?",
                a: "No. All plans are month-to-month with no long-term commitment. Cancel anytime.",
              },
              {
                q: "Can I use a promo code?",
                a: "Yes. Promo codes can be applied during checkout or at any time in your billing settings.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="p-6 rounded-lg bg-white border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center space-y-8">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="text-lg opacity-90">
            Start your 7-day free trial today. No credit card required.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/get-started")}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-sm opacity-70">
            By starting a trial, you agree to our{" "}
            <a href="/terms" target="_blank" className="underline hover:opacity-100">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" target="_blank" className="underline hover:opacity-100">Privacy Policy</a>.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-sm text-gray-500">
            © 2026 PrimeContractorOS. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <button onClick={() => navigate("/")} className="text-gray-500 hover:text-gray-900">
              Home
            </button>
            <button onClick={() => navigate("/help")} className="text-gray-500 hover:text-gray-900">
              Help
            </button>
            <button onClick={() => navigate("/terms")} className="text-gray-500 hover:text-gray-900">
              Terms
            </button>
            <button onClick={() => navigate("/privacy")} className="text-gray-500 hover:text-gray-900">
              Privacy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
