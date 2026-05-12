/**
 * Stripe Products & Pricing Configuration
 * 
 * These map to the plans in the database. Stripe prices are created
 * dynamically via price_data in checkout sessions, so we don't need
 * to pre-create them in Stripe Dashboard.
 */

export interface PlanConfig {
  name: string;
  description: string;
  monthlyPrice: number; // in cents
  annualPrice: number; // in cents (per year)
  features: string[];
  limits: {
    maxContracts: number; // -1 = unlimited
    maxProposals: number;
    maxOpportunities: number;
    maxTeamMembers: number;
  };
}

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  starter: {
    name: "Starter",
    description: "For individual contractors getting started with government contracting",
    monthlyPrice: 9900, // $99
    annualPrice: 99000, // $990/year (save ~$198)
    features: [
      "Up to 5 active contracts",
      "Up to 10 proposals",
      "Up to 25 opportunities",
      "2 team members",
      "AI guidance panel",
      "Basic reporting",
      "Email support",
    ],
    limits: {
      maxContracts: 5,
      maxProposals: 10,
      maxOpportunities: 25,
      maxTeamMembers: 2,
    },
  },
  growth: {
    name: "Growth",
    description: "For growing contractors managing multiple contracts",
    monthlyPrice: 24900, // $249
    annualPrice: 249000, // $2,490/year (save ~$498)
    features: [
      "Up to 25 active contracts",
      "Up to 50 proposals",
      "Up to 100 opportunities",
      "10 team members",
      "AI guidance + findings review",
      "Advanced reporting & PDF export",
      "Priority support",
      "Template library",
    ],
    limits: {
      maxContracts: 25,
      maxProposals: 50,
      maxOpportunities: 100,
      maxTeamMembers: 10,
    },
  },
  advanced: {
    name: "Advanced",
    description: "For established contractors with complex operations",
    monthlyPrice: 49900, // $499
    annualPrice: 499000, // $4,990/year (save ~$998)
    features: [
      "Unlimited contracts",
      "Unlimited proposals",
      "Unlimited opportunities",
      "Unlimited team members",
      "Full AI suite with batch actions",
      "Custom reporting & analytics",
      "Dedicated support",
      "Template library + custom templates",
      "API access",
    ],
    limits: {
      maxContracts: -1,
      maxProposals: -1,
      maxOpportunities: -1,
      maxTeamMembers: -1,
    },
  },
};
