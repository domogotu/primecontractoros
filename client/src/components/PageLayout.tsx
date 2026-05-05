import { ReactNode } from "react";


interface PageLayoutProps {
  title: string;
  subtitle: string;
  label?: string;
  actions?: ReactNode;
  summaryCards?: { label: string; value: string | number; color?: string }[];
  children: ReactNode;
}

export default function PageLayout({ title, subtitle, label, actions, summaryCards, children }: PageLayoutProps) {
  return (
    <div className="min-h-full bg-gray-100 flex flex-col">
      {/* Navy Header */}
      <div className="bg-blue-900 text-white px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {label && <p className="text-blue-200 text-sm font-semibold uppercase mb-2">{label}</p>}
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-blue-100 mb-6">{subtitle}</p>
          {actions && <div className="flex gap-3 flex-wrap">{actions}</div>}
        </div>
      </div>

      {/* Summary Strip */}
      {summaryCards && summaryCards.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {summaryCards.map((card, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold uppercase">{card.label}</p>
                  <p className={`text-lg font-bold mt-1 ${card.color || "text-gray-900"}`}>{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </div>

    </div>
  );
}
