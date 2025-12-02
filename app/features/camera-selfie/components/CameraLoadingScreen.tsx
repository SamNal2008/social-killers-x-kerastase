import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Title } from '~/shared/components/Typography/Title';
import { Body } from '~/shared/components/Typography/Body';
import { staggerContainerVariants, staggerItemVariants } from '~/shared/animations/transitions';

interface CameraLoadingScreenProps {
    title?: string;
    subtitle?: string;
    compact?: boolean;
}

export const CameraLoadingScreen: FC<CameraLoadingScreenProps> = ({
    title = "Creating your moodboard",
    subtitle = "We're generating a personalized visual experience based on your tribe...",
    compact = false
}) => {
    return (
        <div className={compact ? "flex items-center justify-center h-full" : "bg-surface-light min-h-screen p-6 md:p-8 flex items-center justify-center"}>
            <motion.div
                className={compact ? "flex flex-col gap-6 w-full items-center" : "flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-4xl mx-auto items-center"}
                variants={staggerContainerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Loading Animation */}
                <motion.div
                    variants={staggerItemVariants}
                    className={compact ? "relative w-24 h-24" : "relative w-32 h-32 md:w-40 md:h-40"}
                >
                    {/* Outer rotating circle */}
                    <motion.div
                        className="absolute inset-0 border-4 border-primary/20 rounded-full"
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full" />
                    </motion.div>

                    {/* Inner pulsing circle */}
                    <motion.div
                        className="absolute inset-4 bg-primary/10 rounded-full flex items-center justify-center"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <div className={compact ? "w-8 h-8 bg-primary rounded-full" : "w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full"} />
                    </motion.div>
                </motion.div>

                {/* Text Content */}
                <div className="flex flex-col gap-4 w-full text-center">
                    {title && (
                        <motion.div variants={staggerItemVariants}>
                            <Title variant="h2" className="text-neutral-dark">
                                {title}
                            </Title>
                        </motion.div>
                    )}

                    {subtitle && (
                        <motion.div variants={staggerItemVariants}>
                            <Body variant="1" className="text-neutral-gray">
                                {subtitle}
                            </Body>
                        </motion.div>
                    )}
                </div>

                {/* Progress dots */}
                <motion.div
                    variants={staggerItemVariants}
                    className="flex gap-2"
                >
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            className="w-2 h-2 bg-primary rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: index * 0.2,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
};
