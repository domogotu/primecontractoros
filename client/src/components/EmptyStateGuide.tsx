import { Link } from "wouter";
import { Plus, ArrowRight, BookOpen } from "lucide-react";

interface EmptyStateGuideProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  createLabel?: string;
  onCreateClick?: () => void;
  createPath?: string;
  helpArticleSlug?: string;
  tips?: string[];
}

export default function EmptyStateGuide({
  icon,
  title,
  description,
  createLabel,
  onCreateClick,
  createPath,
  helpArticleSlug,
  tips = [],
}: EmptyStateGuideProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 max-w-md mb-6">{description}</p>

      {/* Action button */}
      {(createLabel && (onCreateClick || createPath)) && (
        <div className="mb-6">
          {createPath ? (
            <Link href={createPath} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" />
              {createLabel}
            </Link>
          ) : (
            <button
              onClick={onCreateClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              {createLabel}
            </button>
          )}
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md w-full text-left">
          <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-2">Getting Started</h4>
          <ul className="space-y-1.5">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-blue-700">
                <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Help link */}
      {helpArticleSlug && (
        <Link href={`/help/${helpArticleSlug}`} className="mt-4 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600">
          <BookOpen className="w-3 h-3" />
          Learn more
        </Link>
      )}
    </div>
  );
}
