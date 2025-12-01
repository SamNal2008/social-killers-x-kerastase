import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
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
          <Button
            variant="tertiary"
            onClick={handleBack}
            type="button"
            aria-label="Back"
          >
            <ArrowLeft size={14} />
            Back
          </Button>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col gap-12 w-full">
          {/* Header Section */}
          <div className="flex flex-col gap-4 w-full">
            <motion.div variants={staggerItemVariants} className="w-full">
              <Caption
                variant="1"
                className="text-neutral-gray text-center uppercase tracking-[2px] w-full"
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
            <div className="h-[1px] w-[180px] bg-gradient-to-r from-transparent via-[#c9a961] to-transparent" />
          </motion.div>

          {/* Content Section: Subtitle, Description, Do's & Don'ts */}
          <div className="flex flex-col gap-6 w-full">
            {/* Subtitle */}
            <motion.div
              variants={staggerItemVariants}
              className="flex items-center justify-center w-full"
            >
              <Title
                variant="h2"
                className="text-neutral-dark text-center max-w-[322px]"
              >
                {subcultureData.subtitle}
              </Title>
            </motion.div>

            {/* Description */}
            <motion.div
              variants={staggerItemVariants}
              className="flex items-center justify-center w-full"
            >
              <Body
                variant="1"
                className="text-neutral-dark text-center max-w-[322px]"
              >
                {subcultureData.description}
              </Body>
            </motion.div>
          </div>

          {/* Do's and Don'ts Section */}
          <motion.div
            variants={staggerItemVariants}
            className="flex gap-12 w-full"
          >
            {/* DO Column */}
            <div className="flex-1 flex flex-col gap-4 items-center">
              <Title
                variant="h3"
                className="text-neutral-dark text-center max-w-[322px] font-semibold"
              >
                DO
              </Title>
              <div className="flex flex-col gap-2">
                {subcultureData.dos.map((doItem, index) => (
                  <Body
                    key={`do-${index}`}
                    variant="2"
                    className="text-neutral-dark text-center"
                  >
                    {doItem}
                  </Body>
                ))}
              </div>
            </div>

            {/* DON'T Column */}
            <div className="flex-1 flex flex-col gap-4 items-center">
              <Title
                variant="h3"
                className="text-neutral-dark text-center font-bold"
              >
                DON'T
              </Title>
              <div className="flex flex-col gap-2">
                {subcultureData.donts.map((dontItem, index) => (
                  <Body
                    key={`dont-${index}`}
                    variant="2"
                    className="text-neutral-dark text-center"
                  >
                    {dontItem}
                  </Body>
                ))}
              </div>
            </div>
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
