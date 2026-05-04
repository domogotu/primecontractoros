import { CheckCircle2, Clock, AlertCircle, XCircle, Eye } from 'lucide-react';

interface StatusBadgeProps {
  status: 'new' | 'in-review' | 'pursue' | 'hold' | 'no-pursue' | 'draft' | 'submitted' | 'won' | 'lost' | 'active' | 'at-risk' | 'healthy' | 'warning' | 'closed';
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  'new': { label: 'New', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  'in-review': { label: 'In Review', color: 'bg-yellow-100 text-yellow-700', icon: Eye },
  'pursue': { label: 'Pursue', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  'hold': { label: 'Hold', color: 'bg-orange-100 text-orange-700', icon: Clock },
  'no-pursue': { label: 'No Pursue', color: 'bg-red-100 text-red-700', icon: XCircle },
  'draft': { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: AlertCircle },
  'submitted': { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  'won': { label: 'Won', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  'lost': { label: 'Lost', color: 'bg-red-100 text-red-700', icon: XCircle },
  'active': { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  'at-risk': { label: 'At Risk', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  'healthy': { label: 'Healthy', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  'warning': { label: 'Warning', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  'closed': { label: 'Closed', color: 'bg-slate-100 text-slate-700', icon: CheckCircle2 },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  return (
    <div className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
      <span>{config.label}</span>
    </div>
  );
}
