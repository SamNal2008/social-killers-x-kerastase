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
    <div className="min-h-screen p-6 bg-surface-light md:p-8">
      <motion.div
        className="flex flex-col w-full max-w-[345px] gap-10 mx-auto md:max-w-4xl md:gap-12"
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
        <div className="flex w-full flex-col gap-16">
          {/* Header Section */}
          <div className="flex w-full flex-col gap-4 items-center">
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
              className="flex w-full items-center justify-center"
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
            <div className="h-[1px] w-[128px] bg-gradient-to-r from-transparent via-[#c9a961] to-transparent" />
          </motion.div>

          {/* Content Section: Subtitle, Description, Do's & Don'ts */}
          <div className="flex w-full flex-col gap-6 items-center">
            {/* Subtitle */}
            <motion.div
              variants={staggerItemVariants}
              className="flex w-full items-center justify-center"
            >
              <Title
                variant="h2"
                className="max-w-[322px] text-center text-neutral-dark"
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
                className="max-w-[322px] text-center text-neutral-dark"
              >
                {tribeData.description}
              </Body>
            </motion.div>
          </div>

          {/* Do's and Don'ts Section */}
          <motion.div
            variants={staggerItemVariants}
            className="flex w-full gap-12"
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
                {tribeData.dos.map((doItem, index) => (
                  <Body
                    key={`do-${index}`}
                    variant="2"
                    className="text-center text-neutral-dark"
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
                {tribeData.donts.map((dontItem, index) => (
                  <Body
                    key={`dont-${index}`}
                    variant="2"
                    className="text-center text-neutral-dark"
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
