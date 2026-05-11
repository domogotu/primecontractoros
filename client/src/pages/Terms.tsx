import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-blue-900 text-white px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <nav className="mb-8">
            <Link href="/">
              <span className="text-blue-200 hover:text-white text-sm cursor-pointer">&larr; Back to Home</span>
            </Link>
          </nav>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-blue-100">Last updated: May 1, 2026</p>
        </div>
      </div>

      <div className="flex-1 px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using PrimeContractorOS ("the Service"), operated by Reed's Solutions LLC, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users, including workspace owners, team members, and visitors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed">
                PrimeContractorOS is a web-based platform designed to help government contractors manage their contracting lifecycle, including opportunity tracking, proposal development, contract management, compliance monitoring, and financial operations. The Service includes AI-powered features that provide guidance and analysis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Account Registration</h2>
              <p className="text-gray-700 leading-relaxed">
                You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Workspace and Data Ownership</h2>
              <p className="text-gray-700 leading-relaxed">
                You retain ownership of all data you enter into your workspace. Reed's Solutions LLC does not claim ownership of your business data, proposals, contracts, or other content. We provide the platform as a service and maintain the infrastructure necessary to store and process your data securely.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Acceptable Use</h2>
              <p className="text-gray-700 leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Use the Service for any unlawful purpose</li>
                <li>Upload malicious software or content</li>
                <li>Attempt to gain unauthorized access to other workspaces</li>
                <li>Interfere with or disrupt the Service infrastructure</li>
                <li>Resell or redistribute the Service without authorization</li>
                <li>Use the Service to store classified government information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Subscription and Payment</h2>
              <p className="text-gray-700 leading-relaxed">
                Access to certain features requires a paid subscription. Pricing is available on our Pricing page. Subscriptions are billed monthly or annually as selected. You may cancel at any time, with access continuing through the end of your current billing period. Refunds are handled on a case-by-case basis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. AI Features Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                PrimeContractorOS includes AI-powered features that provide suggestions, analysis, and guidance. These features are provided as decision-support tools only. AI-generated content should be reviewed by qualified professionals before being used in official government contracting activities. Reed's Solutions LLC is not responsible for decisions made based on AI-generated suggestions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                The Service is provided "as is" without warranties of any kind. Reed's Solutions LLC shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may suspend or terminate your access if you violate these terms. Upon termination, you may request export of your workspace data within 30 days. After 30 days, your data may be permanently deleted.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                Questions about these terms should be directed to{" "}
                <a href="mailto:support@reedssolutionsllc.org" className="text-blue-600 hover:underline">support@reedssolutionsllc.org</a>.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
