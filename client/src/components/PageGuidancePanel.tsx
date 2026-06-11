import { useState } from "react";
import { Link } from "wouter";
import { HelpCircle, X, BookOpen, Lightbulb, ArrowRight, ExternalLink, AlertTriangle, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PageGuidancePanelProps {
  pageKey: string;
  title: string;
  description: string;
  whatToDoNext: string[];
  helpArticleSlug?: string;
  glossaryTerms?: string[];
  warnings?: string[];
  relatedRecords?: { label: string; path: string }[];
}

export default function PageGuidancePanel({
  pageKey,
  title,
  description,
  whatToDoNext,
  helpArticleSlug,
  glossaryTerms = [],
  warnings = [],
  relatedRecords = [],
}: PageGuidancePanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating help button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
          title="Show Guidance"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      )}

      {/* Guidance panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-h-[70vh] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-4 space-y-4 flex-1">
            {/* Description */}
            <div>
              <p className="text-sm text-gray-600">{description}</p>
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="space-y-2">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* What to do next */}
            {whatToDoNext.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">What to Do Next</h4>
                <ul className="space-y-1.5">
                  {whatToDoNext.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <ArrowRight className="w-3 h-3 mt-1 text-blue-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Records */}
            {relatedRecords.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Related</h4>
                <div className="flex flex-wrap gap-1.5">
                  {relatedRecords.map((r, i) => (
                    <Link key={i} href={r.path} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 hover:bg-gray-100">
                      {r.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Help & Glossary Links */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              {helpArticleSlug && (
                <Link href={`/help/${helpArticleSlug}`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800">
                  <BookOpen className="w-3 h-3" />
                  <span>View Help Article</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
              {glossaryTerms.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {glossaryTerms.map((term, i) => (
                    <Link key={i} href={`/glossary#${term}`} className="text-xs text-indigo-600 hover:text-indigo-800 underline">
                      {term}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-3 bg-gray-50 flex gap-2">
            <Link href="/help" className="flex-1 text-center text-xs py-1.5 px-3 bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-700">
              Help Center
            </Link>
            <Link href="/support" className="flex-1 text-center text-xs py-1.5 px-3 bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-700">
              Support
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
