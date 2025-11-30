import type { FC } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ProgressIndicator } from '~/shared/components/ProgressIndicator/ProgressIndicator';
import { Button } from '~/shared/components/Button/Button';
import type { FormHeaderProps } from '../types';

export const FormHeader: FC<FormHeaderProps> = ({
  currentStep,
  totalSteps,
  onBack,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        label="Kérastase Experience"
      />

      <Button
        variant="tertiary"
        onClick={onBack}
        type="button"
        aria-label="Back"
        className="self-start"
      >
        <ArrowLeft size={14} />
        Back
      </Button>
    </div>
  );
};
