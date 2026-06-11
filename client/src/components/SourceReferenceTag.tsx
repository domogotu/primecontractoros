import { FileText, ExternalLink, Brain } from "lucide-react";

interface SourceReferenceTagProps {
  sourceType: string;
  sourceLocation?: string;
  excerpt?: string;
  onClick?: () => void;
}

export default function SourceReferenceTag({ sourceType, sourceLocation, excerpt, onClick }: SourceReferenceTagProps) {
  const getIcon = () => {
    switch (sourceType) {
      case "governing_file": return <FileText className="w-3 h-3" />;
      case "ai_finding": return <Brain className="w-3 h-3" />;
      case "sam_import": return <ExternalLink className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getLabel = () => {
    switch (sourceType) {
      case "governing_file": return "From Contract File";
      case "ai_finding": return "From AI Analysis";
      case "sam_import": return "From SAM.gov";
      case "opportunity": return "From Opportunity";
      case "proposal": return "From Proposal";
      default: return `Source: ${sourceType}`;
    }
  };

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-[10px] text-gray-600 hover:bg-gray-100 transition-colors"
      title={excerpt ? `"${excerpt.slice(0, 100)}..."` : sourceLocation || "View source"}
    >
      {getIcon()}
      <span>{getLabel()}</span>
      {sourceLocation && <span className="text-gray-400">({sourceLocation})</span>}
    </button>
  );
}
