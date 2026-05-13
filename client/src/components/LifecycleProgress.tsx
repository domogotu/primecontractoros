import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export type LifecyclePhase = 'opportunity' | 'proposal' | 'contract' | 'performance' | 'closeout';

interface LifecycleProgressProps {
  currentPhase: LifecyclePhase;
  phases?: {
    opportunity: { label: string; description: string };
    proposal: { label: string; description: string };
    contract: { label: string; description: string };
    performance: { label: string; description: string };
    closeout: { label: string; description: string };
  };
}

const defaultPhases = {
  opportunity: { label: 'Opportunity', description: 'Find and evaluate opportunities' },
  proposal: { label: 'Proposal', description: 'Develop and submit proposal' },
  contract: { label: 'Contract', description: 'Award and setup' },
  performance: { label: 'Performance', description: 'Manage execution' },
  closeout: { label: 'Closeout', description: 'Complete and lessons learned' },
};

const phaseOrder: LifecyclePhase[] = ['opportunity', 'proposal', 'contract', 'performance', 'closeout'];

export default function LifecycleProgress({ currentPhase, phases = defaultPhases }: LifecycleProgressProps) {
  const currentIndex = phaseOrder.indexOf(currentPhase);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">WHERE YOU ARE</h3>
      
      {/* Horizontal Progress Bar */}
      <div className="flex items-center justify-between mb-6">
        {phaseOrder.map((phase, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const phaseInfo = phases[phase];

          return (
            <React.Fragment key={phase}>
              {/* Phase Indicator */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                    isCompleted
                      ? 'bg-green-100 text-green-600'
                      : isCurrent
                      ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-300'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </div>
                <p className={`text-xs font-semibold text-center ${isCurrent ? 'text-blue-600' : 'text-gray-600'}`}>
                  {phaseInfo.label}
                </p>
              </div>

              {/* Connector Line */}
              {index < phaseOrder.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-1 transition-all ${
                    isCompleted ? 'bg-green-200' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current Phase Description */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-blue-900 mb-1">
          {phases[currentPhase].label}
        </p>
        <p className="text-sm text-blue-700">
          {phases[currentPhase].description}
        </p>
      </div>
    </div>
  );
}
