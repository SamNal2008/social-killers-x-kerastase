import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Title } from '~/shared/components/Typography/Title';
import { Body } from '~/shared/components/Typography/Body';
import { Caption } from '~/shared/components/Typography/Caption';
import { Button } from '~/shared/components/Button/Button';
import { subcultureService } from '../services/subcultureService';
import type { DetailsScreenProps, SubcultureDetails } from '../types';
import { staggerContainerVariants, staggerItemVariants } from '~/shared/animations/transitions';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export const DetailsScreen: FC<DetailsScreenProps> = ({ userResultId }) => {
  const navigate = useNavigate();
  const [subcultureData, setSubcultureData] = useState<SubcultureDetails | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSubculture = async () => {
      try {
        setLoadingState('loading');
        const data = await subcultureService.fetchSubcultureByUserResultId(userResultId);
        setSubcultureData(data);
        setLoadingState('success');
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load subculture'));
        setLoadingState('error');
      }
    };

    fetchSubculture();
  }, [userResultId]);

  const handleBack = () => {
    navigate(`/results?userResultId=${userResultId}`);
  };

  if (loadingState === 'loading') {
    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8 flex items-center justify-center">
        <Body variant="1" className="text-neutral-gray">
          Loading your subculture...
        </Body>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8 flex items-center justify-center">
        <div className="flex flex-col gap-4 items-center">
          <Body variant="1" className="text-red-600">
            Error loading subculture
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

  if (!subcultureData) {
    return null;
  }

  return (
    <div className="bg-surface-light min-h-screen p-6 md:p-8">
      <motion.div
        className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-4xl mx-auto"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Back Button */}
        <motion.div variants={staggerItemVariants}>
          <button
            onClick={handleBack}
            className="flex items-center gap-1 px-0 py-1 text-neutral-dark hover:opacity-70 transition-opacity"
            aria-label="Back"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M12.8332 6.99996H1.1665M1.1665 6.99996L6.99984 12.8333M1.1665 6.99996L6.99984 1.16663"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <Caption variant="2" className="text-neutral-dark">
              Back
            </Caption>
          </button>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col gap-12 w-full">
          {/* Header Section */}
          <div className="flex flex-col gap-4 w-full">
            <motion.div variants={staggerItemVariants}>
              <Caption
                variant="1"
                className="text-neutral-gray text-center uppercase tracking-[2px]"
              >
                Your Kérastase Subculture
              </Caption>
            </motion.div>

            <motion.div
              variants={staggerItemVariants}
              className="flex items-center justify-center w-full"
            >
              <Title variant="h0" className="text-neutral-dark text-center">
                {subcultureData.name}
              </Title>
            </motion.div>
          </div>

          {/* Decorative Line */}
          <motion.div
            variants={staggerItemVariants}
            className="flex items-center justify-center w-full"
          >
            <div className="h-[1px] w-[128px] bg-gradient-to-r from-transparent via-[#c9a961] to-transparent" />
          </motion.div>

          {/* Description */}
          <motion.div
            variants={staggerItemVariants}
            className="flex items-center justify-center w-full"
          >
            <Body
              variant="1"
              className="text-neutral-gray text-center italic leading-[32.5px] max-w-[322px]"
            >
              {`"${subcultureData.description}"`}
            </Body>
          </motion.div>

          {/* Generate AI Moodboard Button */}
          <motion.div variants={staggerItemVariants} className="w-full">
            <Button
              variant="primary"
              className="w-full h-[52px] flex items-center justify-center"
            >
              Generate my AI moodboard
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
