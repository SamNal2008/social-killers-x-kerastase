import type { FC } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { FormHeader } from './FormHeader';
import { Badge } from '~/shared/components/Badge/Badge';
import { Button } from '~/shared/components/Button/Button';
import { Title } from '~/shared/components/Typography/Title';
import { Body } from '~/shared/components/Typography/Body';
import type { KeywordsScreenProps } from '../types';
import { staggerContainerVariants, staggerItemVariants } from '~/shared/animations/transitions';

const MIN_KEYWORDS = 3;
const MAX_KEYWORDS = 10;

export const KeywordsScreen: FC<KeywordsScreenProps> = ({ onBack, onContinue, keywords }) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const isValidSelection = selectedKeywords.length >= MIN_KEYWORDS && selectedKeywords.length <= MAX_KEYWORDS;

  const handleKeywordToggle = (keywordId: string) => {
    setSelectedKeywords((prev) => {
      const isSelected = prev.includes(keywordId);

      if (isSelected) {
        // Deselect
        return prev.filter((k) => k !== keywordId);
      } else {
        // Select only if under max limit
        if (prev.length < MAX_KEYWORDS) {
          return [...prev, keywordId];
        }
        return prev;
      }
    });
  };

  const handleContinue = () => {
    if (isValidSelection) {
      onContinue(selectedKeywords);
    }
  };

  return (
    <div className="bg-surface-light min-h-screen p-6 md:p-8">
      <motion.div
        className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-md mx-auto"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header with Progress and Back Button */}
        <motion.div variants={staggerItemVariants}>
          <FormHeader currentStep={3} totalSteps={4} onBack={onBack} />
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
                Select the words that define you
              </Title>
            </motion.div>

            <motion.div
              variants={staggerItemVariants}
              className="flex items-center justify-center w-full"
            >
              <Body variant="1" className="text-neutral-gray text-center">
                Choose between 3 and 10 words.
              </Body>
            </motion.div>
          </div>

          {/* Keywords Badge Grid */}
          <motion.div
            variants={staggerItemVariants}
            className="flex flex-wrap gap-3 items-center justify-center w-full"
          >
            {keywords.map((keyword) => {
              const isSelected = selectedKeywords.includes(keyword.id);
              return (
                <Badge
                  key={keyword.id}
                  selected={isSelected}
                  onClick={() => handleKeywordToggle(keyword.id)}
                  icon={<Check data-testid="badge-check-icon" size={16} />}
                >
                  {keyword.name}
                </Badge>
              );
            })}
          </motion.div>

          {/* Continue Button */}
          <motion.div variants={staggerItemVariants}>
            <Button
              variant={isValidSelection ? 'primary' : 'disabled'}
              disabled={!isValidSelection}
              onClick={handleContinue}
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
