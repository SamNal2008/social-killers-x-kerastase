import type { FC } from 'react';
import { motion } from 'framer-motion';
import type { CapturedPhoto } from '../types';
import { Button } from '~/shared/components/Button/Button';
import { Title } from '~/shared/components/Typography/Title';
import { staggerContainerVariants, staggerItemVariants } from '~/shared/animations/transitions';
import { CameraBackButton } from './CameraBackButton';

interface CameraResultSelfieProps {
    photo: CapturedPhoto;
    onBack: () => void;
    onRetake: () => void;
    onContinue: () => void;
}

export const CameraResultSelfie: FC<CameraResultSelfieProps> = ({
    photo,
    onBack,
    onRetake,
    onContinue,
}) => {
    return (
        <div className="bg-surface-light min-h-screen p-6 md:p-8">
            <motion.div
                className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-4xl mx-auto"
                variants={staggerContainerVariants}
                initial="hidden"
                animate="show"
            >
                <CameraBackButton onClick={onBack} />

                <div className="flex flex-col gap-6 w-full">
                    <motion.div variants={staggerItemVariants}>
                        <Title variant="h2" className="text-neutral-dark text-center">
                            Your selfie
                        </Title>
                    </motion.div>

                    <motion.div variants={staggerItemVariants} className="w-full">
                        <img
                            src={photo.dataUrl}
                            alt="Captured selfie"
                            className="w-full h-auto rounded-lg"
                        />
                    </motion.div>

                    <motion.div variants={staggerItemVariants} className="flex flex-col gap-3 w-full">
                        <Button
                            variant="primary"
                            onClick={onContinue}
                            className="w-full h-[52px]"
                        >
                            Continue
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={onRetake}
                            className="w-full h-[52px]"
                        >
                            Retake photo
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
