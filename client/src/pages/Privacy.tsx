import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-blue-900 text-white px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <nav className="mb-8">
            <Link href="/">
              <span className="text-blue-200 hover:text-white text-sm cursor-pointer">&larr; Back to Home</span>
            </Link>
          </nav>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-blue-100">Last updated: May 1, 2026</p>
        </div>
      </div>

      <div className="flex-1 px-8 py-12">
        <div className="max-w-4xl mx-auto prose prose-gray">
          <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-3">When you use PrimeContractorOS, we collect information you provide directly, including:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Account information (name, email address, company name)</li>
                <li>Business profile data (NAICS codes, certifications, CAGE code, UEI)</li>
                <li>Workspace data (opportunities, proposals, contracts, and related records)</li>
                <li>Files you upload to the platform</li>
                <li>Communications with our support team</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">We use your information to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Provide and maintain the PrimeContractorOS platform</li>
                <li>Process your account registration and manage your workspace</li>
                <li>Generate AI-powered suggestions and guidance for your contracting operations</li>
                <li>Send service-related notifications and alerts</li>
                <li>Improve our platform and develop new features</li>
                <li>Respond to your support requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures to protect your data, including encryption in transit (TLS/SSL), encrypted storage, access controls, and regular security audits. Your workspace data is isolated from other users and accessible only to authorized members of your workspace.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We do not sell your personal information or workspace data. We may share information only in these limited circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>With service providers who help us operate the platform (hosting, database services)</li>
                <li>When required by law or to respond to legal process</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>With your consent or at your direction</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide services. If you close your account, we will delete your workspace data within 90 days, except where retention is required by law or for legitimate business purposes (such as resolving disputes).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your workspace data</li>
                <li>Opt out of non-essential communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Government Contracting Data</h2>
              <p className="text-gray-700 leading-relaxed">
                We understand that government contracting data may include sensitive business information, including proprietary pricing, technical approaches, and competitive intelligence. We treat all workspace data as confidential business information and apply appropriate protections. We do not use your contracting data to benefit other users or competitors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                For privacy-related questions or requests, contact us at{" "}
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
