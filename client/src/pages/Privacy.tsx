import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function Privacy() {
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
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
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
                Reed's Solutions, LLC ("Company", "we", "us", or "our") respects your privacy and is committed to protecting it through our compliance with this Privacy Policy. This policy describes the types of information we may collect from you or that you may provide when you visit the PrimeContractorOS website (https://www.primecontractoros.com) and use our software-as-a-service platform (collectively, our "Service"), and our practices for collecting, using, maintaining, protecting, and disclosing that information.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Please read this policy carefully to understand our policies and practices regarding your information and how we will treat it. If you do not agree with our policies and practices, your choice is not to use our Service. By accessing or using this Service, you agree to this Privacy Policy.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We collect several types of information from and about users of our Service, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Account Information:</strong> When you register for an account, we collect personal information such as your name, email address, phone number, and password.</li>
                <li><strong>Business Profile Data:</strong> Information about your business, including company name, address, tax identification number, DUNS number, Commercial and Government Entity (CAGE) code, and socioeconomic certifications.</li>
                <li><strong>Contract and Proposal Data:</strong> Documents, contracts, proposals, solicitations, and related information you upload or create within the Service.</li>
                <li><strong>Financial Records:</strong> Billing information, payment history, invoices, and financial data related to your contracts and subcontractors.</li>
                <li><strong>Usage Data:</strong> Details of your visits to our Service, including traffic data, location data, logs, and other communication data and the resources that you access and use on the Service.</li>
                <li><strong>Device Information:</strong> Information about your computer and internet connection, including your IP address, operating system, and browser type.</li>
                <li><strong>Cookies and Tracking Technologies:</strong> We use cookies, web beacons, and similar tracking technologies to track activity on our Service and hold certain information.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use information that we collect about you or that you provide to us, including any personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>To present our Service and its contents to you.</li>
                <li>To provide you with information, products, or services that you request from us.</li>
                <li>To manage your account, including billing and payment processing.</li>
                <li>To provide customer support and respond to your inquiries.</li>
                <li>To power the core functionality of the Service, including contract management, proposal generation, and financial tracking.</li>
                <li>To analyze and improve the Service, develop new features, and enhance user experience.</li>
                <li>To send you technical notices, updates, security alerts, and support and administrative messages.</li>
                <li>To fulfill any other purpose for which you provide it.</li>
                <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us, including for billing and collection.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. AI Data Handling</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                PrimeContractorOS utilizes artificial intelligence (AI) to provide features such as contract analysis, proposal generation, and compliance monitoring.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Data Sent to AI Providers:</strong> To enable these features, certain data you upload or input (such as contract text or proposal drafts) may be transmitted to our third-party AI service providers (e.g., OpenAI) via API.</li>
                <li><strong>Processing and Retention:</strong> We configure our integrations with AI providers to ensure that your data is used solely to generate the requested output for your account. We do not permit our AI providers to use your data to train their foundational models. The AI providers may retain data temporarily (e.g., for up to 30 days) for abuse monitoring purposes before it is permanently deleted.</li>
                <li><strong>Your Control:</strong> You choose which documents or text to process using the AI features. If you do not wish for specific data to be processed by AI, do not use the AI-assisted features on that data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Third-Party Service Providers</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work. These include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Payment Processors:</strong> We use Stripe to process payments. Your payment information is provided directly to Stripe, and their use of your personal information is governed by their Privacy Policy.</li>
                <li><strong>AI Providers:</strong> As detailed above, we use OpenAI and potentially other AI providers to power specific features.</li>
                <li><strong>Communication Services:</strong> We use Resend to manage and send email communications.</li>
                <li><strong>Hosting Providers:</strong> Our Service is hosted on secure cloud infrastructure providers.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                These third parties have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security Measures</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on our secure servers behind firewalls. Any payment transactions will be encrypted using SSL technology.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The safety and security of your information also depends on you. Where we have given you (or where you have chosen) a password for access to certain parts of our Service, you are responsible for keeping this password confidential. We ask you not to share your password with anyone.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Government Contractor Data Sensitivity Acknowledgment</h2>
              <p className="text-gray-700 leading-relaxed">
                We acknowledge that as a government contractor, you may handle sensitive information. While we implement robust security measures, the standard PrimeContractorOS platform is a commercial SaaS product and is <strong>not</strong> certified for the storage or processing of Classified Information. If you upload Controlled Unclassified Information (CUI) or export-controlled data, you are responsible for ensuring that your use of the Service aligns with your specific regulatory and contractual obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Data Retention and Deletion</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may request the deletion of your account and associated data at any time. Upon your request, we will delete or anonymize your data, except where we are required to retain it for legal or regulatory reasons.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Your Data Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You have the right to access, correct, or delete your personal information.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Access and Correction:</strong> You can review and change your personal information by logging into the Service and visiting your account profile page.</li>
                <li><strong>Data Export:</strong> The Service includes an "Export My Data" feature that allows you to download a copy of your data in a structured, commonly used format.</li>
                <li><strong>Deletion:</strong> You may request deletion of your data by contacting us.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. California Privacy Rights (CCPA)</h2>
              <p className="text-gray-700 leading-relaxed">
                If you are a California resident, the California Consumer Privacy Act (CCPA) may provide you with additional rights regarding our use of your personal information. You have the right to request access to the specific pieces of personal information we have collected about you, the right to request deletion of your personal information, and the right to opt-out of the sale of your personal information. <strong>Reed's Solutions, LLC does not sell your personal information.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service is not intended for children under 13 years of age. No one under age 13 may provide any information to or on the Service. We do not knowingly collect personal information from children under 13. If you are under 13, do not use or provide any information on this Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information, including personal data, is processed at our operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those from your jurisdiction. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">12. Cookie Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar tracking technologies to track the activity on our Service and store certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">13. Changes to Our Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                It is our policy to post any changes we make to our Privacy Policy on this page. If we make material changes to how we treat our users' personal information, we will notify you by email to the primary email address specified in your account or through a notice on the Service home page. The date the Privacy Policy was last revised is identified at the top of the page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">14. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To ask questions or comment about this Privacy Policy and our privacy practices, contact us at:
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-md p-4 space-y-1">
                <p className="font-semibold text-gray-900">Reed's Solutions, LLC</p>
                <p className="text-gray-700 text-sm">Email: <a href="mailto:privacy@primecontractoros.com" className="text-blue-600 hover:underline">privacy@primecontractoros.com</a></p>
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
