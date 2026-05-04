import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
  onClick?: () => void;
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
  cyan: 'bg-cyan-50 text-cyan-600',
};

export default function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  color = 'blue',
  onClick,
}: MetricCardProps) {
  return (
    <div
      className={`metric-card ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`icon-lg rounded-lg flex items-center justify-center ${colorClasses[color]} mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="metric-card-label">{label}</div>
      <div className="metric-card-value">{value}</div>
      {subtext && <div className="metric-card-subtext">{subtext}</div>}
    </div>
  );
}
