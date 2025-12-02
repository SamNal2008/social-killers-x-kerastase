import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Title } from '~/shared/components/Typography/Title';
import { Body } from '~/shared/components/Typography/Body';
import { Caption } from '~/shared/components/Typography/Caption';
import { Button } from '~/shared/components/Button/Button';
import { useTribeDetails } from '../hooks/useTribeDetails';
import type { DetailsScreenProps } from '../types';
import { staggerContainerVariants, staggerItemVariants } from '~/shared/animations/transitions';

export const DetailsScreen: FC<DetailsScreenProps> = ({ userResultId }) => {
  const navigate = useNavigate();
  const { tribeData, loadingState, error } = useTribeDetails(userResultId);

  const handleBack = () => {
    navigate(`/results?userResultId=${userResultId}`);
  };

  const handleGenerateMoodboard = () => {
    navigate('/camera');
  };

  if (loadingState === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-surface-light md:p-8">
        <div className="flex flex-col items-center gap-4">
          <Body variant="1" className="text-red-600">
            Error loading tribe
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

  if (!tribeData) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 bg-surface-light md:p-8 lg:p-12">
      <motion.div
        className="flex flex-col w-full max-w-[345px] gap-12 mx-auto md:max-w-2xl md:gap-16 lg:max-w-4xl"
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
        <div className="flex w-full flex-col gap-12 md:gap-16">
          {/* Header Section */}
          <div className="flex w-full flex-col gap-6 items-center">
            <motion.div variants={staggerItemVariants}>
              <Caption
                variant="1"
                className="text-center uppercase tracking-[2px] text-neutral-gray"
              >
                Your Kérastase subculture
              </Caption>
            </motion.div>

            <motion.div
              variants={staggerItemVariants}
              className="flex w-full items-center justify-center px-4"
            >
              <Title variant="h0" className="text-center text-neutral-dark">
                {tribeData.subcultureName || tribeData.name}
              </Title>
            </motion.div>
          </div>

          {/* Decorative Line */}
          <motion.div
            variants={staggerItemVariants}
            className="flex w-full items-center justify-center"
          >
            <div className="h-[1px] w-[128px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
          </motion.div>

          {/* Content Section: Subtitle, Description */}
          <div className="flex w-full flex-col gap-8 items-center">
            {/* Subtitle */}
            <motion.div
              variants={staggerItemVariants}
              className="flex w-full items-center justify-center"
            >
              <Title
                variant="h2"
                className="max-w-[322px] text-center text-neutral-dark md:max-w-md"
              >
                {tribeData.subtitle}
              </Title>
            </motion.div>

            {/* Description */}
            <motion.div
              variants={staggerItemVariants}
              className="flex w-full items-center justify-center"
            >
              <Body
                variant="1"
                className="max-w-[322px] text-center text-neutral-dark leading-[150%] md:max-w-lg md:leading-[160%]"
              >
                {tribeData.description}
              </Body>
            </motion.div>
          </div>

          {/* Do's and Don'ts Section */}
          <motion.div
            variants={staggerItemVariants}
            className="flex w-full flex-col gap-10 md:flex-row md:gap-12 lg:gap-16"
          >
            {/* DO Column */}
            <div className="flex-1 flex flex-col gap-6 items-center md:items-start">
              <Title
                variant="h3"
                className="text-neutral-dark text-center font-semibold md:text-left"
              >
                DO
              </Title>
              <div className="flex flex-col gap-3 w-full">
                {tribeData.dos.map((doItem, index) => (
                  <Body
                    key={`do-${index}`}
                    variant="2"
                    className="text-center text-neutral-dark leading-[150%] md:text-left"
                  >
                    {doItem}
                  </Body>
                ))}
              </div>
            </div>

            {/* DON'T Column */}
            <div className="flex-1 flex flex-col gap-6 items-center md:items-start">
              <Title
                variant="h3"
                className="text-neutral-dark text-center font-semibold md:text-left"
              >
                DON'T
              </Title>
              <div className="flex flex-col gap-3 w-full">
                {tribeData.donts.map((dontItem, index) => (
                  <Body
                    key={`dont-${index}`}
                    variant="2"
                    className="text-center text-neutral-dark leading-[150%] md:text-left"
                  >
                    {dontItem}
                  </Body>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Generate AI Moodboard Button */}
          <motion.div variants={staggerItemVariants} className="w-full mt-4">
            <Button
              variant="primary"
              className="w-full h-[52px] flex items-center justify-center md:h-[56px]"
              onClick={handleGenerateMoodboard}
            >
              Generate my AI moodboard
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
