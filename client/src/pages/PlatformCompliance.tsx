import { Link } from "wouter";
import { Shield, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";

export default function PlatformCompliance() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="bg-blue-900 text-white px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <nav className="mb-8">
            <Link href="/">
              <span className="text-blue-200 hover:text-white text-sm cursor-pointer">&larr; Back to Home</span>
            </Link>
          </nav>
          <h1 className="text-4xl font-bold mb-4 text-white">Platform Compliance</h1>
          <p className="text-blue-100 text-lg">How PrimeContractorOS supports your government contracting compliance requirements.</p>
        </div>
      </div>

      <div className="flex-1 px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-white">Compliance Framework</h2>
              </div>
              <p className="text-slate-200 leading-relaxed">
                PrimeContractorOS is designed to support contractors in meeting their compliance obligations under the Federal Acquisition Regulation (FAR) and Defense Federal Acquisition Regulation Supplement (DFARS). While the platform provides tools and guidance, ultimate compliance responsibility rests with the contractor.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">What We Help You Track</h2>
              <div className="space-y-3">
                {[
                  "FAR Part 4 — Administrative matters, record retention, SAM registration",
                  "FAR Part 9 — Contractor qualifications and responsibility",
                  "FAR Part 15 — Contracting by negotiation, proposal requirements",
                  "FAR Part 42 — Contract administration and modification",
                  "FAR Part 49 — Termination of contracts",
                  "FAR 4.804 — Closeout of contract files",
                  "FAR 52.204-7 — System for Award Management (SAM)",
                  "DFARS 252.204-7012 — Safeguarding covered defense information",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-200 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Platform Compliance Features</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Compliance Tracking</h3>
                  <p className="text-sm text-slate-300">Track compliance items per contract with status, due dates, and responsible parties.</p>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Deadline Alerts</h3>
                  <p className="text-sm text-slate-300">Automated alerts for upcoming compliance deadlines and reporting requirements.</p>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Document Management</h3>
                  <p className="text-sm text-slate-300">Organize compliance-related documents linked to specific contracts and requirements.</p>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Closeout Workflow</h3>
                  <p className="text-sm text-slate-300">Guided closeout process following FAR 4.804 requirements with checklist tracking.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Important Disclaimer</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-slate-200 text-sm leading-relaxed">
                  PrimeContractorOS provides compliance tracking tools and guidance references. It is not a substitute for legal counsel or compliance expertise. Contractors are responsible for ensuring their own compliance with all applicable regulations. Consult with qualified legal and compliance professionals for specific regulatory questions.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
