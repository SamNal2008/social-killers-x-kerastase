import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Button } from '~/shared/components/Button/Button';
import { Title } from '~/shared/components/Typography/Title';
import { Body } from '~/shared/components/Typography/Body';
import { staggerContainerVariants, staggerItemVariants } from '~/shared/animations/transitions';
import { CameraBackButton } from './CameraBackButton';

interface CameraErrorScreenProps {
    variant: 'unsupported' | 'denied' | 'error';
    message?: string;
    onBack: () => void;
    onRetry?: () => void;
}

export const CameraErrorScreen: FC<CameraErrorScreenProps> = ({
    variant,
    message,
    onBack,
    onRetry,
}) => {
    const isRetryVisible = variant === 'denied' || variant === 'error';
    const title =
        variant === 'unsupported'
            ? 'Camera not supported'
            : variant === 'denied'
                ? 'Camera access denied'
                : 'Camera error';

    const bodyText =
        variant === 'unsupported'
            ? 'Your browser does not support camera access. Please try using a different browser like Chrome, Safari, or Firefox.'
            : variant === 'denied'
                ? 'We need camera access to take your selfie. Please enable camera permissions in your browser settings and try again.'
                : message ?? '';

    return (
        <div className="bg-surface-light min-h-screen p-6 md:p-8">
            <motion.div
                className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-4xl mx-auto"
                variants={staggerContainerVariants}
                initial="hidden"
                animate="show"
            >
                <CameraBackButton onClick={onBack} />

                <div className="flex flex-col gap-6 items-center justify-center min-h-[400px]">
                    <motion.div variants={staggerItemVariants}>
                        <Title variant="h2" className="text-neutral-dark text-center">
                            {title}
                        </Title>
                    </motion.div>
                    <motion.div variants={staggerItemVariants}>
                        <Body variant="1" className="text-neutral-gray text-center max-w-[322px]">
                            {bodyText}
                        </Body>
                    </motion.div>
                    {isRetryVisible && onRetry && (
                        <motion.div variants={staggerItemVariants} className="w-full">
                            <Button
                                variant="primary"
                                onClick={onRetry}
                                className="w-full h-[52px]"
                            >
                                Try again
                            </Button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
