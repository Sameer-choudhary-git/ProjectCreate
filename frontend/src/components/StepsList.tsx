import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
interface Step {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
}

interface StepsListProps {
  steps: Step[];
}

export function StepsList({ steps }: StepsListProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-sm font-semibold mb-4">Generation Steps</h2>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-3">
            {step.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
            ) : step.status === 'in-progress' ? (
              <Circle className="w-5 h-5 text-blue-500 mt-0.5 animate-pulse" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300 mt-0.5" />
            )}
            <div>
              <h3 className="text-sm font-medium">{step.title}</h3>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}