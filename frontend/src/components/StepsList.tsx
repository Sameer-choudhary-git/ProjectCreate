import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Step } from '../types/files';

interface StepsListProps {
  steps: Step[];
}

export function StepsList({ steps }: StepsListProps) {
  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50/50">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
        Build Steps
      </h2>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3">
            {step.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : step.status === 'in-progress' ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
            )}
            
            <div className="min-w-0">
              <h3 className={`text-sm font-medium ${
                step.status === 'pending' ? 'text-gray-500' : 'text-gray-900'
              }`}>
                {step.title}
              </h3>
              {step.description && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {steps.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No steps yet
          </div>
        )}
      </div>
    </div>
  );
}