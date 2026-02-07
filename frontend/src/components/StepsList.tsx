import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Step } from '../types/files';

interface StepsListProps {
  steps: Step[];
}

export function StepsList({ steps }: StepsListProps) {
  return (
    <div className="p-4 bg-[#0d1117]">
      <h2 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-4">
        Build Steps
      </h2>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3 relative">
            {/* Connector Line */}
            {index !== steps.length - 1 && (
                <div className="absolute left-[9px] top-6 bottom-[-10px] w-px bg-[#30363d]" />
            )}

            {step.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-[#238636] flex-shrink-0 bg-[#0d1117] relative z-10" />
            ) : step.status === 'in-progress' ? (
              <Loader2 className="w-5 h-5 text-[#1f6feb] animate-spin flex-shrink-0 bg-[#0d1117] relative z-10" />
            ) : (
              <Circle className="w-5 h-5 text-[#30363d] flex-shrink-0 bg-[#0d1117] relative z-10" />
            )}
            
            <div className="min-w-0 pt-0.5">
              <h3 className={`text-sm font-medium ${
                step.status === 'pending' ? 'text-[#8b949e]' : 'text-[#c9d1d9]'
              }`}>
                {step.title}
              </h3>
              {step.description && (
                <p className="text-xs text-[#8b949e] mt-1 break-words">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {steps.length === 0 && (
          <div className="text-center py-8 text-[#8b949e] text-sm">
            No steps yet
          </div>
        )}
      </div>
    </div>
  );
}