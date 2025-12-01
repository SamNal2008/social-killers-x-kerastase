import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FormHeader } from './FormHeader';
import { MoodboardCard } from './MoodboardCard';
import { Button } from '~/shared/components/Button/Button';
import { Title } from '~/shared/components/Typography/Title';
import { Body } from '~/shared/components/Typography/Body';
import type { MoodboardScreenProps } from '../types';
import { moodboardService, type Moodboard } from '~/shared/services/moodboardService';
import { staggerContainerVariants, staggerItemVariants } from '~/shared/animations/transitions';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export const MoodboardScreen: FC<MoodboardScreenProps> = ({ onBack, onContinue }) => {
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
  const [selectedMoodboardId, setSelectedMoodboardId] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMoodboards = async () => {
      try {
        setLoadingState('loading');
        const data = await moodboardService.getAll();
        setMoodboards(data);
        setLoadingState('success');
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load moodboards'));
        setLoadingState('error');
      }
    };

    fetchMoodboards();
  }, []);

  const handleMoodboardClick = (id: string) => {
    setSelectedMoodboardId(id);
  };

  const handleContinue = () => {
    if (selectedMoodboardId) {
      onContinue(selectedMoodboardId);
    }
  };

  if (loadingState === 'loading') {
    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8 flex items-center justify-center">
        <Body variant="1" className="text-neutral-gray">
          Loading moodboards...
        </Body>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8 flex items-center justify-center">
        <div className="flex flex-col gap-4 items-center">
          <Body variant="1" className="text-red-600">
            Error loading moodboards
          </Body>
          {error && (
            <Body variant="2" className="text-neutral-gray">
              {error.message}
            </Body>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-light min-h-screen p-6 md:p-8">
      <motion.div
        className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-4xl mx-auto"
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
              grid-cols-2
              gap-4
              md:grid-cols-3 md:gap-5
              lg:grid-cols-4 lg:gap-6
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

          {/* Continue Button */}
          <motion.div
            variants={staggerItemVariants}
            className="flex justify-center w-full pt-4"
          >
            <Button
              variant="primary"
              onClick={handleContinue}
              disabled={!selectedMoodboardId}
              type="button"
              className="w-full h-[52px] flex items-center justify-center"
              aria-label="Continue"
            >
              Continue
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
