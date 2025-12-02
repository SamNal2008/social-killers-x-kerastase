import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, type PanInfo, type MotionValue } from 'framer-motion';
import { FormHeader } from './FormHeader';
import { Polaroid } from '~/shared/components/Polaroid/Polaroid';
import { CircleButton } from '~/shared/components/CircleButton/CircleButton';
import { Title } from '~/shared/components/Typography/Title';
import { Body } from '~/shared/components/Typography/Body';
import { CameraLoadingScreen } from '~/features/camera-selfie/components/CameraLoadingScreen';
import type { TinderScreenProps, Brand } from '../types';
import {
    swipeCardVariants,
    swipeDragConfig,
    calculateDragRotation,
    staggerContainerVariants,
    staggerItemVariants,
} from '~/shared/animations/transitions';

import { brandService } from '../services/brandService';
import type { Tables } from '~/shared/types/database.types';

const SWIPE_THRESHOLD = 100;

interface SwipeableCardProps {
    brand: string;
    index: number;
    total: number;
    onSwipe: (direction: 'left' | 'right') => void;
    isCurrent: boolean;
}

const SwipeableCard: FC<SwipeableCardProps> = ({ brand, index, total, onSwipe, isCurrent }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, (value) => calculateDragRotation(value));
    const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const swipeDistance = info.offset.x;

        if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
            const direction = swipeDistance > 0 ? 'right' : 'left';
            setExitDirection(direction);
            onSwipe(direction);
        }
    };

    // Expose swipe method to parent via ref or context if needed, 
    // but for now we'll handle button clicks by passing a prop or using a shared state?
    // Actually, for button clicks to animate the card, we need to drive the animation from outside 
    // or expose a method. Since we're keeping it simple, let's use a prop `forceSwipeDirection`.
    // But purely declarative is better. 

    // Let's stick to the pattern where the parent controls the "active" card index,
    // but the CARD ITSELF handles its own exit animation.
    // However, the button is outside.

    // Alternative: The parent passes a "swipeTrigger" prop.

    return (
        <motion.div
            data-testid="swipe-card"
            className="absolute top-0 left-0 w-full h-full"
            variants={swipeCardVariants}
            initial="enter"
            animate={exitDirection === 'right' ? 'exitRight' : exitDirection === 'left' ? 'exitLeft' : 'enter'}
            style={{ x, rotate, zIndex: isCurrent ? 10 : 0 }}
            drag={isCurrent ? swipeDragConfig.drag : false}
            dragConstraints={swipeDragConfig.dragConstraints}
            dragElastic={swipeDragConfig.dragElastic}
            dragTransition={swipeDragConfig.dragTransition}
            onDragEnd={handleDragEnd}
        >
            <Polaroid
                imageSrc=""
                imageAlt={brand}
                title={brand}
                subtitle="Swipe to decide"
                currentItem={index + 1}
                totalItems={total}
                className={`w-full h-full ${isCurrent ? 'cursor-grab active:cursor-grabbing' : ''}`}
            />
        </motion.div>
    );
};

// Separated component to handle its own motion values and lifecycle
const ActiveCard: FC<{
    brand: string;
    index: number;
    total: number;
    onSwipe: (direction: 'left' | 'right') => void;
    onDrag: (x: number) => void;
    externalSwipeTrigger: 'left' | 'right' | null;
}> = ({ brand, index, total, onSwipe, onDrag, externalSwipeTrigger }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, (value: number) => calculateDragRotation(value));
    const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

    // Report drag position to parent
    useEffect(() => {
        const unsubscribe = x.on('change', (latest) => {
            onDrag(latest);
        });
        return () => unsubscribe();
    }, [x, onDrag]);

    // Handle external trigger (buttons)
    useEffect(() => {
        if (externalSwipeTrigger && !exitDirection) {
            setExitDirection(externalSwipeTrigger);
            onSwipe(externalSwipeTrigger);
        }
    }, [externalSwipeTrigger, exitDirection, onSwipe]);

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const swipeDistance = info.offset.x;

        if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
            const direction = swipeDistance > 0 ? 'right' : 'left';
            setExitDirection(direction);
            onSwipe(direction);
        }
    };

    return (
        <motion.div
            data-testid="swipe-card"
            className="absolute top-0 left-0 w-full h-full"
            variants={swipeCardVariants}
            initial="enter"
            animate={exitDirection === 'right' ? 'exitRight' : exitDirection === 'left' ? 'exitLeft' : 'enter'}
            style={{ x, rotate, zIndex: 10 }}
            drag="x"
            dragConstraints={swipeDragConfig.dragConstraints}
            dragElastic={swipeDragConfig.dragElastic}
            dragTransition={swipeDragConfig.dragTransition}
            onDragEnd={handleDragEnd}
        >
            <Polaroid
                imageSrc=""
                imageAlt={brand}
                title={brand}
                subtitle="Swipe to decide"
                currentItem={index + 1}
                totalItems={total}
                className="w-full h-full cursor-grab active:cursor-grabbing"
            />
        </motion.div>
    );
};

export const TinderScreen: FC<TinderScreenProps> = ({ onBack, onContinue }) => {
    const [brands, setBrands] = useState<Tables<'brands'>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const data = await brandService.getAll();
                setBrands(data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to load brands'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchBrands();
    }, []);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [likedBrands, setLikedBrands] = useState<string[]>([]);
    const [passedBrands, setPassedBrands] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Motion value for background card animation only
    const bgX = useMotionValue(0);

    // Transform next card properties based on swipe distance
    const nextCardScale = useTransform(bgX, [-300, 0, 300], [1, 0.95, 1]);
    const nextCardOpacity = useTransform(bgX, [-300, 0, 300], [1, 0.5, 1]);

    const [swipeTrigger, setSwipeTrigger] = useState<'left' | 'right' | null>(null);

    const hasMoreCards = currentIndex < brands.length;

    const handleSwipeComplete = (direction: 'left' | 'right') => {
        const brand = brands[currentIndex];

        if (direction === 'right') {
            setLikedBrands((prev) => [...prev, brand.id]);
        } else {
            setPassedBrands((prev) => [...prev, brand.id]);
        }

        // Animate background card to full scale/opacity
        animate(bgX, direction === 'right' ? 300 : -300, { duration: 0.4, ease: "easeOut" });

        // Wait for animation to finish before switching index
        setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
            setSwipeTrigger(null);
            bgX.set(0); // Reset background animation
        }, 400);
    };

    const handleLike = () => {
        if (!swipeTrigger) setSwipeTrigger('right');
    };

    const handlePass = () => {
        if (!swipeTrigger) setSwipeTrigger('left');
    };

    // Auto-advance when all cards are swiped
    useEffect(() => {
        // Only call onContinue once when all cards are swiped
        // isSubmitting prevents infinite loop if onContinue causes a re-render (e.g., on error)
        if (brands.length > 0 && currentIndex === brands.length && !isSubmitting) {
            setIsSubmitting(true);
            onContinue(likedBrands, passedBrands);
        }
    }, [currentIndex, brands.length, isSubmitting]); // Removed onContinue, likedBrands, passedBrands from deps to prevent re-triggers

    if (isLoading) {
        return (
            <div className="bg-surface-light min-h-screen p-6 md:p-8 flex items-center justify-center">
                <Body variant="1" className="text-neutral-gray">
                    Loading brands...
                </Body>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-surface-light min-h-screen p-6 md:p-8 flex items-center justify-center">
                <Body variant="1" className="text-red-600">
                    Error loading brands
                </Body>
            </div>
        );
    }

    return (
        <div className="bg-surface-light min-h-screen p-6 md:p-8">
            <motion.div
                className="flex flex-col gap-8 md:gap-10 w-full max-w-[345px] md:max-w-md mx-auto"
                variants={staggerContainerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Header with Progress and Back Button */}
                <motion.div variants={staggerItemVariants}>
                    <FormHeader currentStep={4} totalSteps={4} onBack={onBack} />
                </motion.div>

                {/* Main Content */}
                <div className="flex flex-col gap-8 w-full items-center">

                    {/* Title Section */}
                    <div className="flex flex-col gap-2 w-full text-center">
                        <Title variant="h1" className="text-neutral-dark">
                            Brand affinity
                        </Title>
                        <Body variant="2" className="text-neutral-gray">
                            Swipe right if you like, left if you pass.
                        </Body>
                    </div>

                    {/* Card Stack Container - Fixed Dimensions from Figma */}
                    <div className="relative w-[345px] h-[372px] flex items-center justify-center">
                        {hasMoreCards ? (
                            <>
                                {/* Next Card (Bottom) */}
                                {currentIndex + 1 < brands.length && (
                                    <motion.div
                                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                        style={{
                                            scale: nextCardScale,
                                            opacity: nextCardOpacity
                                        }}
                                    >
                                        <Polaroid
                                            imageSrc={brands[currentIndex + 1].logo_url}
                                            imageAlt={brands[currentIndex + 1].name}
                                            title={brands[currentIndex + 1].name}
                                            subtitle="Swipe to decide"
                                            currentItem={currentIndex + 2}
                                            totalItems={brands.length}
                                            className="w-full h-full"
                                        />
                                    </motion.div>
                                )}

                                {/* Current Card (Top) */}
                                <ActiveCard
                                    key={currentIndex}
                                    brand={brands[currentIndex].name}
                                    index={currentIndex}
                                    total={brands.length}
                                    onSwipe={handleSwipeComplete}
                                    onDrag={(x) => bgX.set(x)}
                                    externalSwipeTrigger={swipeTrigger}
                                />
                            </>
                        ) : (
                            <CameraLoadingScreen
                                title=""
                                subtitle="Analyzing your results"
                                compact={true}
                            />
                        )}
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        variants={staggerItemVariants}
                        className="flex gap-6 items-center justify-center mt-4"
                    >
                        <CircleButton
                            variant="default"
                            ariaLabel="Pass"
                            onClick={handlePass}
                            disabled={!hasMoreCards || !!swipeTrigger}
                        />
                        <CircleButton
                            variant="heart"
                            ariaLabel="Like"
                            onClick={handleLike}
                            disabled={!hasMoreCards || !!swipeTrigger}
                        />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};
