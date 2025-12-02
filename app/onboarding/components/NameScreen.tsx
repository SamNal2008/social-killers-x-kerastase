import type { FC } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { FormHeader } from './FormHeader';
import { Input } from '~/shared/components/Input/Input';
import { Button } from '~/shared/components/Button/Button';
import { Title } from '~/shared/components/Typography/Title';
import { Body } from '~/shared/components/Typography/Body';
import type { NameScreenProps } from '../types';
import { staggerContainerVariants, staggerItemVariants } from '~/shared/animations/transitions';

export const NameScreen: FC<NameScreenProps> = ({ onBack, onContinue, isLoading }) => {
  const [name, setName] = useState('');

  const isNameValid = name.trim().length > 0;

  const handleContinue = () => {
    if (isNameValid) {
      onContinue(name);
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
          <FormHeader currentStep={1} totalSteps={4} onBack={onBack} />
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
                First, what should we call you?
              </Title>
            </motion.div>

            <motion.div
              variants={staggerItemVariants}
              className="flex items-center justify-center w-full"
            >
              <Body variant="1" className="text-neutral-gray text-center">
                Let's make this journey personal.
              </Body>
            </motion.div>
          </div>

          {/* Input Field */}
          <motion.div variants={staggerItemVariants}>
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              aria-label="Your name"
            />
          </motion.div>

          {/* Continue Button */}
          <motion.div variants={staggerItemVariants}>
            <Button
              variant={isNameValid ? 'primary' : 'disabled'}
              disabled={!isNameValid || isLoading}
              onClick={handleContinue}
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
