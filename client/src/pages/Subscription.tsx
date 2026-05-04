import { useState } from 'react';
import { useLocation } from 'wouter';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Zap,
  HelpCircle,
} from 'lucide-react';

export default function Subscription() {
  const [, navigate] = useLocation();

  const currentPlan = {
    name: 'Growth Plan',
    price: 299,
    status: 'active',
    startDate: '2026-03-01',
    renewalDate: '2026-06-01',
    trialUsed: true,
    discountApplied: false,
    features: [
      'Unlimited opportunities',
      'Unlimited proposals',
      'Unlimited contracts',
      'Team collaboration (up to 10 users)',
      'AI-powered insights',
      'Advanced reporting',
      'Priority support',
    ],
  };

  const plans = [
    {
      name: 'Starter',
      price: 99,
      description: 'Perfect for small teams',
      features: [
        'Up to 50 opportunities',
        'Up to 50 proposals',
        'Up to 10 contracts',
        'Team collaboration (up to 3 users)',
        'Basic reporting',
        'Email support',
      ],
    },
    {
      name: 'Growth',
      price: 299,
      description: 'For growing contractors',
      features: [
        'Unlimited opportunities',
        'Unlimited proposals',
        'Unlimited contracts',
        'Team collaboration (up to 10 users)',
        'AI-powered insights',
        'Advanced reporting',
        'Priority support',
      ],
      current: true,
    },
    {
      name: 'Enterprise',
      price: null,
      description: 'Custom for large organizations',
      features: [
        'Everything in Growth',
        'Custom integrations',
        'Dedicated account manager',
        'Custom workflows',
        'On-premise deployment',
        'SLA guarantee',
      ],
    },
  ];

  const daysUntilRenewal = Math.ceil(
    (new Date(currentPlan.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <WorkspaceLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-4 text-sm"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Subscription & Billing</h1>
          <p className="text-slate-600">Manage your subscription plan and billing information.</p>
        </div>

        {/* Current Plan Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Plan Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{currentPlan.name}</h2>
                <p className="text-slate-600 mt-1">Your current subscription</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Active
              </span>
            </div>

            <div className="mb-6">
              <p className="text-4xl font-bold text-slate-900">
                ${currentPlan.price}
                <span className="text-lg text-slate-600 font-normal">/month</span>
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Next Renewal</p>
                  <p className="text-slate-900">{currentPlan.renewalDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Payment Method</p>
                  <p className="text-slate-900">Visa ending in 4242</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <Button variant="outline" className="w-full">
                Update Payment Method
              </Button>
              <Button variant="outline" className="w-full">
                Change Plan
              </Button>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-700 mb-3">
                <strong>Renews in {daysUntilRenewal} days</strong> on {currentPlan.renewalDate}
              </p>
              <Button variant="outline" className="w-full text-red-600">
                Cancel Subscription
              </Button>
            </div>
          </div>

          {/* Status & Benefits */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Subscription Status</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Active Subscription</p>
                    <p className="text-sm text-slate-600">Your subscription is active and in good standing</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {currentPlan.trialUsed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">Trial Status</p>
                    <p className="text-sm text-slate-600">
                      {currentPlan.trialUsed ? 'Trial period used' : 'Trial period available'}
                    </p>
                  </div>
                </div>

                {currentPlan.discountApplied && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Discount Applied</p>
                      <p className="text-sm text-slate-600">20% early adopter discount</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Included Features */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Included Features</h3>

              <ul className="space-y-2">
                {currentPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Compare Plans</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-6 transition-all ${
                  plan.current
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.price ? (
                    <p className="text-3xl font-bold text-slate-900">
                      ${plan.price}
                      <span className="text-sm text-slate-600 font-normal">/month</span>
                    </p>
                  ) : (
                    <p className="text-3xl font-bold text-slate-900">Custom</p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.current ? (
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {plan.price ? 'Upgrade' : 'Contact Sales'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Billing Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            Billing Help
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Frequently Asked Questions</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>
                  <button className="text-blue-600 hover:underline">How do I change my plan?</button>
                </li>
                <li>
                  <button className="text-blue-600 hover:underline">Can I cancel anytime?</button>
                </li>
                <li>
                  <button className="text-blue-600 hover:underline">What payment methods do you accept?</button>
                </li>
                <li>
                  <button className="text-blue-600 hover:underline">Do you offer refunds?</button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2">Need Help?</h4>
              <p className="text-sm text-slate-700 mb-4">
                Our billing team is here to help. Contact us for any questions about your subscription.
              </p>
              <Button variant="outline">Contact Support</Button>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
