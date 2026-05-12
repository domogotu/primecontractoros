import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Mail, Send, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

export default function PlatformOnboardingPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sendLink = trpc.platformAdmin.onboarding.sendLink.useMutation({
    onSuccess: () => {
      setSuccessEmail(email);
      setEmail("");
      setName("");
      setErrorMsg(null);
    },
    onError: (err: { message: string }) => {
      setErrorMsg(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSuccessEmail(null);
    setErrorMsg(null);
    sendLink.mutate({ recipientEmail: email.trim(), recipientName: name.trim() || undefined });
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Send Onboarding Link</h1>
        <p className="text-gray-500 text-sm">
          Send a welcome email to a new team member with a link to the employee onboarding guide and the PrimeContractorOS login page.
        </p>
      </div>

      {/* Onboarding page preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start gap-3">
        <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Onboarding Guide URL</p>
          <a
            href="https://reedssolutionsllc.org/onboarding"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            https://reedssolutionsllc.org/onboarding
          </a>
          <p className="text-xs text-blue-700 mt-1">
            This page is not linked from the main navigation — only accessible via direct URL or this email.
          </p>
        </div>
      </div>

      {/* Success message */}
      {successEmail && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-900">Email sent successfully</p>
            <p className="text-sm text-green-700">
              Onboarding link sent to <strong>{successEmail}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Failed to send email</p>
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Send form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jane Smith"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="employee@example.com"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={sendLink.isPending || !email.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          {sendLink.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Onboarding Email
            </>
          )}
        </button>
      </form>

      {/* What the email contains */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">What the email includes</h2>
        <ul className="space-y-2">
          {[
            "Welcome message addressed to the recipient by name",
            "Button linking to the onboarding guide (reedssolutionsllc.org/onboarding)",
            "Button linking to the PrimeContractorOS login page",
            "Support contact information",
            "Reed's Solutions LLC branding and footer",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
