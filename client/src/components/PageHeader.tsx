import { type ReactNode } from "react";

interface PageHeaderProps {
  label: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

/**
 * Consistent blue gradient header banner used across all workspace pages.
 * Matches the Dashboard pattern: navy background, uppercase label, bold title, description text.
 */
export default function PageHeader({ label, title, description, actions }: PageHeaderProps) {
  return (
    <div className="bg-blue-900 text-white px-4 sm:px-6 md:px-8 py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-blue-200 text-xs sm:text-sm font-semibold uppercase mb-2">{label}</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{title}</h1>
            <p className="text-blue-100 text-sm sm:text-base">{description}</p>
          </div>
          {actions && <div className="flex flex-wrap gap-2 flex-shrink-0">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
