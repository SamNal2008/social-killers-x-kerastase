import type { FC } from "react";
import { Caption } from "~/shared/components/Typography";

export interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
  className?: string;
}

export const ProgressIndicator: FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  label = "Kérastase Experience",
  className = "",
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      <div className="flex items-end justify-between">
        <Caption variant="1" className="text-primary">
          {label}
        </Caption>
        <Caption variant="2" className="text-neutral-gray">
          Step {currentStep} / {totalSteps}
        </Caption>
      </div>

      <div className="w-full bg-neutral-gray-200 h-0.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};
