import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "primecontractoros_consent_accepted";
const CONSENT_VERSION = "1.0"; // bump this to re-show the banner after policy updates

interface ConsentRecord {
  version: string;
  acceptedAt: string;
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const record: ConsentRecord = JSON.parse(stored);
        // Hide if already accepted the current version
        if (record.version === CONSENT_VERSION) {
          setVisible(false);
          return;
        }
      }
      // Show banner after a short delay so it doesn't flash immediately
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    } catch {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      const record: ConsentRecord = {
        version: CONSENT_VERSION,
        acceptedAt: new Date().toISOString(),
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    } catch {
      // localStorage unavailable — still dismiss visually
    }
    setVisible(false);
  };

  const handleDismiss = () => {
    // Dismiss without recording — banner will reappear next visit
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and privacy consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
    >
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl shadow-2xl p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Cookie className="h-5 w-5 text-blue-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              We use cookies and respect your privacy
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              PrimeContractorOS uses cookies to keep you signed in and improve your experience. By continuing to use this site, you agree to our{" "}
              <Link href="/terms">
                <span className="text-blue-600 hover:underline font-medium cursor-pointer">
                  Terms of Service
                </span>
              </Link>{" "}
              and{" "}
              <Link href="/privacy">
                <span className="text-blue-600 hover:underline font-medium cursor-pointer">
                  Privacy Policy
                </span>
              </Link>
              .
            </p>
          </div>

          {/* Dismiss (X) */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-600"
          >
            Decline optional cookies
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Accept &amp; Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
