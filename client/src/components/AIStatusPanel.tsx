import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, AlertCircle, Zap, Eye } from 'lucide-react';

export interface AICheck {
  id: string;
  name: string;
  status: 'verified' | 'flagged' | 'pending';
  message: string;
  severity?: 'info' | 'warning' | 'error';
}

interface AIStatusPanelProps {
  checks: AICheck[];
  isLoading?: boolean;
  title?: string;
}

export default function AIStatusPanel({
  checks,
  isLoading = false,
  title = 'AI MONITORING',
}: AIStatusPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const verified = checks.filter((c) => c.status === 'verified').length;
  const flagged = checks.filter((c) => c.status === 'flagged').length;
  const pending = checks.filter((c) => c.status === 'pending').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'flagged':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'pending':
        return <Zap className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-50 border-green-200';
      case 'flagged':
        return 'bg-amber-50 border-amber-200';
      case 'pending':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {verified} verified • {flagged} flagged • {pending} pending
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 px-6 py-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500 mt-2">AI is checking...</p>
            </div>
          ) : checks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No checks available</p>
          ) : (
            checks.map((check) => (
              <div
                key={check.id}
                className={`border rounded-lg p-3 flex items-start gap-3 ${getStatusColor(
                  check.status
                )}`}
              >
                <div className="mt-0.5 flex-shrink-0">{getStatusIcon(check.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{check.name}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{check.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
