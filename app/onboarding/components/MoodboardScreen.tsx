import type { FC } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { FormHeader } from './FormHeader';
import { MoodboardCard } from './MoodboardCard';
import { Button } from '~/shared/components/Button/Button';
import { Title } from '~/shared/components/Typography/Title';
import { Body } from '~/shared/components/Typography/Body';
import { useScrollToTop } from '~/shared/hooks/useScrollToTop';
import type { MoodboardScreenProps } from '../types';
import { staggerContainerVariants, staggerItemVariants } from '~/shared/animations/transitions';

export const MoodboardScreen: FC<MoodboardScreenProps> = ({ onBack, onContinue, moodboards, isLoading, isError, error }) => {
  useScrollToTop();
  const [selectedMoodboardId, setSelectedMoodboardId] = useState<string | null>(null);

  const handleMoodboardClick = (id: string) => {
    setSelectedMoodboardId(id);
  };

  const handleContinue = () => {
    if (selectedMoodboardId) {
      onContinue(selectedMoodboardId);
    }
  };

  return (
    <div className="bg-surface-light min-h-screen p-6 md:p-8">
      <motion.div
        className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-3xl lg:max-w-5xl mx-auto"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header with Progress and Back Button */}
        <motion.div variants={staggerItemVariants}>
          <FormHeader currentStep={2} totalSteps={4} onBack={onBack} />
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col gap-12 w-full">
          {/* Heading Section */}
          <div className="flex flex-col gap-4 w-full">
            <motion.div
              variants={staggerItemVariants}
              className="flex flex-col items-center justify-center w-full px-0.5"
            >
              <Title
                variant="h1"
                className="text-neutral-dark text-center whitespace-pre-wrap"
              >
                Select the mood that speaks to you
              </Title>
            </motion.div>

            <motion.div
              variants={staggerItemVariants}
              className="flex items-center justify-center w-full"
            >
              <Body variant="1" className="text-neutral-gray text-center">
                Let your intuition guide you. There's no wrong choice.
              </Body>
            </motion.div>
          </div>

          {/* Moodboard Grid */}
          <motion.div
            variants={staggerItemVariants}
            className="
              grid
              grid-cols-1
              gap-4
              lg:grid-cols-2 lg:gap-6
              w-full
            "
          >
            {moodboards.map((moodboard) => (
              <MoodboardCard
                key={moodboard.id}
                moodboard={moodboard}
                isSelected={selectedMoodboardId === moodboard.id}
                onClick={handleMoodboardClick}
              />
            ))}
          </motion.div>

          {/* Error Message (if any) */}
          {isError && (
            <motion.div variants={staggerItemVariants}>
              <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
                <p className="text-red-800 text-sm text-center">
                  {error?.message}
                </p>
              </div>
            </motion.div>
          )}

          {/* Continue Button */}
          <motion.div
            variants={staggerItemVariants}
            className="flex justify-center w-full pt-4"
          >
            <Button
              variant="primary"
              onClick={handleContinue}
              disabled={!selectedMoodboardId || isLoading}
              type="button"
              className="w-full h-[52px] flex items-center justify-center gap-2"
              aria-label="Continue"
            >
              {isLoading && <LoaderCircle className="w-5 h-5 animate-spin" />}
              Continue
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
