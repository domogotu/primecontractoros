import { Link } from "wouter";
import { Shield, Lock, Server, Eye, Key, RefreshCw } from "lucide-react";
import Footer from "@/components/Footer";

export default function Security() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-blue-900 text-white px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <nav className="mb-8">
            <Link href="/">
              <span className="text-blue-200 hover:text-white text-sm cursor-pointer">&larr; Back to Home</span>
            </Link>
          </nav>
          <h1 className="text-4xl font-bold mb-4">Security</h1>
          <p className="text-blue-100 text-lg">How we protect your government contracting data.</p>
        </div>
      </div>

      <div className="flex-1 px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-8">
            <section>
              <p className="text-gray-700 leading-relaxed">
                We understand that government contracting data includes sensitive business information — proprietary pricing, technical approaches, competitive intelligence, and compliance records. Security is foundational to everything we build.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Security Measures</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Encryption in Transit</h3>
                    <p className="text-sm text-gray-600">All data transmitted between your browser and our servers is encrypted using TLS 1.3.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Server className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Encrypted Storage</h3>
                    <p className="text-sm text-gray-600">Data at rest is encrypted using AES-256 encryption on all storage systems.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Workspace Isolation</h3>
                    <p className="text-sm text-gray-600">Each workspace is logically isolated. Users can only access data within their authorized workspace.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Key className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Authentication</h3>
                    <p className="text-sm text-gray-600">Secure OAuth-based authentication with session management and automatic timeout.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Role-Based Access</h3>
                    <p className="text-sm text-gray-600">Granular role-based permissions control who can view, edit, or manage workspace data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Regular Backups</h3>
                    <p className="text-sm text-gray-600">Automated database backups ensure your data can be recovered in case of system failure.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Infrastructure</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hosting</span>
                  <span className="text-sm font-medium text-gray-900">Cloud-based (US data centers)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="text-sm font-medium text-gray-900">Managed MySQL with SSL connections</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">File Storage</span>
                  <span className="text-sm font-medium text-gray-900">Encrypted object storage (S3-compatible)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CDN</span>
                  <span className="text-sm font-medium text-gray-900">Global content delivery with DDoS protection</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Reporting Security Issues</h2>
              <p className="text-gray-700 leading-relaxed">
                If you discover a security vulnerability, please report it responsibly to{" "}
                <a href="mailto:support@reedssolutionsllc.org" className="text-blue-600 hover:underline">support@reedssolutionsllc.org</a>{" "}
                with "SECURITY" in the subject line. We take all reports seriously and will respond within 24 hours.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
