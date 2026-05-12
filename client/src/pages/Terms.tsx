import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-900 text-white px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <nav className="mb-8">
            <Link href="/">
              <span className="text-blue-200 hover:text-white text-sm cursor-pointer">&larr; Back to Home</span>
            </Link>
          </nav>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-blue-100">Last Updated: May 12, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-8">

            {/* Intro */}
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Welcome to PrimeContractorOS. These Terms of Service ("Terms") govern your access to and use of the PrimeContractorOS software-as-a-service platform, website (including https://www.primecontractoros.com), and related services (collectively, the "Service"), provided by Reed's Solutions, LLC ("Company", "we", "us", or "our").
              </p>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service. If you are accessing or using the Service on behalf of a business, government entity, or other legal entity, you represent and warrant that you have the authority to bind that entity to these Terms.
              </p>
            </div>

            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Description of the Service</h2>
              <p className="text-gray-700 leading-relaxed">
                PrimeContractorOS is a comprehensive SaaS platform designed to assist small businesses in managing government contracting workflows. The Service provides features including, but not limited to, opportunity tracking, proposal management, contract administration, document management, financial tracking, compliance monitoring, subcontractor management, and AI-assisted contract analysis.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Eligibility and Account Registration</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                To use the Service, you must be at least 18 years old and capable of forming a binding contract. You must register for an account to access most features of the Service. When registering, you agree to provide accurate, current, and complete information about yourself and your business, and to update this information promptly if it changes.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Subscription Plans, Billing, and Cancellation</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>3.1 Subscriptions and Trials:</strong> The Service is offered on a subscription basis. We may offer a free trial period. At the end of any trial period, you must select a paid subscription plan to continue using the Service.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>3.2 Billing:</strong> By providing a payment method, you authorize us (through our third-party payment processor, Stripe) to charge your payment method for all subscription fees, taxes, and other charges incurred in connection with your account. Subscription fees are billed in advance on a recurring basis (e.g., monthly or annually) depending on your selected plan.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>3.3 Cancellation and Refunds:</strong> You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing cycle. You will continue to have access to the Service until the end of the billing cycle. Subscription fees are non-refundable, except where required by law. We do not provide refunds or credits for partial subscription periods.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. User Responsibilities and Acceptable Use</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Use the Service in any way that violates any applicable federal, state, local, or international law or regulation.</li>
                <li>Use the Service to transmit, store, or process classified national security information unless explicitly authorized and operating within a specifically designated, accredited environment (which the standard Service does not provide).</li>
                <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service, the server on which the Service is stored, or any server, computer, or database connected to the Service.</li>
                <li>Reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code or underlying ideas or algorithms of the Service.</li>
                <li>Resell, sublicense, or otherwise make the Service available to any third party without our prior written consent.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Intellectual Property</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>5.1 Your Data:</strong> You retain all right, title, and interest in and to all data, documents, information, and other content you upload, submit, or store within the Service ("User Data"). You grant us a worldwide, non-exclusive, royalty-free license to host, copy, transmit, display, and process User Data solely for the purpose of providing, maintaining, and improving the Service.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>5.2 Our Platform:</strong> Reed's Solutions, LLC retains all right, title, and interest in and to the Service, including all software, design, text, graphics, logos, and other intellectual property rights associated with the Service. The PrimeContractorOS name and logo are trademarks of Reed's Solutions, LLC.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. AI Features Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                The Service includes AI-assisted features (powered by OpenAI and other providers) designed to analyze contracts, generate proposals, and provide insights.
              </p>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>6.1 No Legal or Financial Advice:</strong> AI-generated outputs, suggestions, summaries, and analyses are provided for informational purposes only. They do not constitute legal, financial, accounting, or professional advice.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>6.2 User Review Required:</strong> You acknowledge that AI technology is evolving and may occasionally produce inaccurate, incomplete, or misleading information (often referred to as "hallucinations"). You are solely responsible for independently reviewing, verifying, and validating all AI-generated outputs before relying on them for any business, legal, or financial decisions, or before submitting them to any government agency.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Data Handling and Government Contractor Sensitivity</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>7.1 Sensitive Data:</strong> As a platform serving government contractors, we understand that you may process sensitive information. However, unless explicitly agreed upon in a separate written agreement, the standard Service is not authorized for the storage or processing of Classified Information.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>7.2 CUI and ITAR:</strong> If you use the Service to process Controlled Unclassified Information (CUI), export-controlled data (such as ITAR or EAR restricted data), or other regulated information, you are solely responsible for ensuring that your use of the Service complies with all applicable regulations (e.g., NIST SP 800-171, DFARS 252.204-7012). You must configure your account and manage your User Data in a manner compliant with your specific contractual and regulatory obligations.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                The Service integrates with various third-party service providers to deliver its functionality, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Stripe:</strong> For payment processing.</li>
                <li><strong>OpenAI:</strong> For AI-assisted features and contract analysis.</li>
                <li><strong>Resend:</strong> For email communications.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Your use of the Service may involve the transmission of data to these third-party providers. We are not responsible for the performance, availability, or security of these third-party services.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Export Compliance</h2>
              <p className="text-gray-700 leading-relaxed">
                The Service, its software, and its underlying technology may be subject to United States export controls. You agree to comply with all applicable export and re-export control laws and regulations, including the Export Administration Regulations (EAR) and regulations maintained by the Office of Foreign Assets Control (OFAC). You represent and warrant that you are not located in a comprehensively embargoed country or listed on any U.S. Government list of prohibited or restricted parties.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Limitation of Liability</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL REED'S SOLUTIONS, LLC, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THE SERVICE.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  UNDER NO CIRCUMSTANCES WILL REED'S SOLUTIONS, LLC BE RESPONSIBLE FOR ANY DAMAGE, LOSS, OR INJURY RESULTING FROM HACKING, TAMPERING, OR OTHER UNAUTHORIZED ACCESS OR USE OF THE SERVICE OR YOUR ACCOUNT OR THE INFORMATION CONTAINED THEREIN.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE TOTAL AGGREGATE LIABILITY OF REED'S SOLUTIONS, LLC TO YOU FOR ANY CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US FOR THE SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to defend, indemnify, and hold harmless Reed's Solutions, LLC and its officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees) arising from: (a) your use of and access to the Service; (b) your violation of any term of these Terms; (c) your violation of any third-party right, including without limitation any right of privacy or intellectual property rights; (d) your violation of any applicable law, rule, or regulation; or (e) any claim or damages that arise as a result of any of your User Data.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">12. Disclaimer of Warranties</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. REED'S SOLUTIONS, LLC EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, OR THAT ANY DEFECTS WILL BE CORRECTED.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">13. Termination and Suspension</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service and cancel your subscription.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">14. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed">
                Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach thereof, shall be settled by arbitration administered by the American Arbitration Association in accordance with its Commercial Arbitration Rules. The place of arbitration shall be determined based on the principal place of business of Reed's Solutions, LLC. Judgment on the award rendered by the arbitrator(s) may be entered in any court having jurisdiction thereof. You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">15. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State in which Reed's Solutions, LLC is organized, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Section 16 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">16. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            {/* Section 17 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">17. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-md p-4 space-y-1">
                <p className="font-semibold text-gray-900">Reed's Solutions, LLC</p>
                <p className="text-gray-700 text-sm">Email: <a href="mailto:support@primecontractoros.com" className="text-blue-600 hover:underline">support@primecontractoros.com</a></p>
                <p className="text-gray-700 text-sm">Website: <a href="https://www.primecontractoros.com" className="text-blue-600 hover:underline">https://www.primecontractoros.com</a></p>
              </div>
            </section>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
