import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navy Header */}
      <div className="bg-blue-900 text-white px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <nav className="mb-8">
            <Link href="/">
              <span className="text-blue-200 hover:text-white text-sm cursor-pointer">&larr; Back to Home</span>
            </Link>
          </nav>
          <h1 className="text-4xl font-bold mb-4">About PrimeContractorOS</h1>
          <p className="text-blue-100 text-lg">A product of Reed's Solutions LLC — built by government contractors, for government contractors.</p>
        </div>
      </div>

      <div className="flex-1 px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Mission */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              PrimeContractorOS was created to solve a fundamental problem in government contracting: the lack of a unified, guided system that helps contractors navigate the full lifecycle from opportunity identification through contract closeout.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Whether you are a new small business entering the federal marketplace or an established prime contractor managing multiple awards, PrimeContractorOS provides the structure, guidance, and tools to keep your operations organized and compliant.
            </p>
          </section>

          {/* About Reed's Solutions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About Reed's Solutions LLC</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Reed's Solutions LLC is a California-based small business specializing in federal IT and facilities contracting. We help government agencies and partners deliver mission-critical services through technology, operations support, and strategic consulting.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              With direct experience navigating FAR (Federal Acquisition Regulation) / DFARS (Defense Federal Acquisition Regulation Supplement) regulations, SAM.gov (System for Award Management) registrations, proposal development, and contract performance, we built PrimeContractorOS from the ground up to address the real challenges contractors face every day.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Learn more about our company at{" "}
              <a href="https://reedssolutionsllc.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                reedssolutionsllc.org
              </a>
            </p>
          </section>

          {/* What We Believe */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Believe</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Guidance Over Complexity</h3>
                <p className="text-sm text-gray-600">Government contracting is complex enough. Your tools should simplify the process, not add to it.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Compliance Built In</h3>
                <p className="text-sm text-gray-600">FAR, DFARS, and agency-specific requirements should be woven into your workflow, not an afterthought.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Connected Data</h3>
                <p className="text-sm text-gray-600">Files, contacts, tasks, and alerts should be linked to the records that matter — not scattered across tools.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Built for Real Contractors</h3>
                <p className="text-sm text-gray-600">Every feature is designed by people who have actually managed government contracts and know the pain points.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-6">Create your workspace and start managing your government contracting operations today.</p>
            <Link href="/get-started">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Create Your Workspace</Button>
            </Link>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
