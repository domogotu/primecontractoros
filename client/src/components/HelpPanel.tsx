// @ts-nocheck
import { useState } from "react";
import { HelpCircle, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpPanel({ context = "default" }) {
  const [isOpen, setIsOpen] = useState(false);

  const helpContent = {
    opportunities: { title: "Working with Opportunities", tips: ["Track government contract opportunities from SAM.gov (System for Award Management)", "Use status workflow: New > In Review > Pursue/Hold/No Pursue", "Link related contacts and files"] },
    contracts: { title: "Managing Contracts", tips: ["Track contract performance and compliance", "Use the Contract Hub for comprehensive view", "Monitor health status: Green/Yellow/Red"] },
    proposals: { title: "Building Proposals", tips: ["Start with a proposal framework", "Track status: Draft > In Progress > Submitted > Won/Lost", "Use AI suggestions to improve content"] },
    default: { title: "Getting Help", tips: ["Use sidebar navigation to access modules", "Check the Glossary for terminology", "Visit Help Center for guides"] },
  };

  const current = helpContent[context] || helpContent["default"];

  if (!isOpen) {
    return (
      <Button variant="ghost" size="sm" className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white hover:bg-blue-700 rounded-full h-10 w-10 p-0 shadow-lg" onClick={() => setIsOpen(true)}>
        <HelpCircle className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-xl border overflow-hidden">
      <div className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2"><BookOpen className="h-4 w-4" />{current.title}</h3>
        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
      </div>
      <div className="p-4 max-h-80 overflow-y-auto">
        <ul className="space-y-2">
          {current.tips.map((tip, i) => (
            <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-blue-500">*</span><span>{tip}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
