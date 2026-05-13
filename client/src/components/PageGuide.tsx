import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, ChevronUp, Info, ArrowRight, AlertTriangle, Link2 } from "lucide-react";

interface PageGuideProps {
  title: string;
  description: string;
  whenToUse: string;
  whatToDoNext: string | string[];
  relatedRecords?: { label: string; path: string }[];
  alerts?: { message: string; type: "warning" | "info" | "action" }[];
}

export default function PageGuide({
  title,
  description,
  whenToUse,
  whatToDoNext,
  relatedRecords = [],
  alerts = [],
}: PageGuideProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Normalize whatToDoNext to always be an array
  const nextItems: string[] = Array.isArray(whatToDoNext)
    ? whatToDoNext
    : typeof whatToDoNext === "string"
    ? [whatToDoNext]
    : [];

  // Normalize relatedRecords to always be array of {label, path}
  const records = (relatedRecords || []).filter(
    (r): r is { label: string; path: string } =>
      typeof r === "object" && r !== null && "label" in r && "path" in r
  );

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
            <p className="text-xs text-slate-600 mt-0.5">{description}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-blue-100 pt-3 space-y-4">
          {/* When to use */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              When to Use This Page
            </h4>
            <p className="text-sm text-slate-600">{whenToUse}</p>
          </div>

          {/* What to do next */}
          {nextItems.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                What to Do Next
              </h4>
              <ul className="space-y-1">
                {nextItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                    <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related records */}
          {records.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Related Records
              </h4>
              <div className="flex flex-wrap gap-2">
                {records.map((record, idx) => (
                  <Link
                    key={idx}
                    href={record.path}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700 hover:bg-blue-50"
                  >
                    <Link2 className="w-3 h-3" />
                    {record.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          {alerts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Alerts & Tasks
              </h4>
              <div className="space-y-1">
                {alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 text-sm px-2 py-1 rounded ${
                      alert.type === "warning"
                        ? "bg-amber-50 text-amber-800"
                        : alert.type === "action"
                        ? "bg-green-50 text-green-800"
                        : "bg-blue-50 text-blue-800"
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    {alert.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
