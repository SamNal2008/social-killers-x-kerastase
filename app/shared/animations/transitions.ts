/**
 * Reusable animation constants for consistent transitions across the app
 * Based on Kérastase's playful yet professional and high-end brand DNA
 */

// Custom easing curve for premium feel
export const PREMIUM_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/**
 * Page transition animations
 * Use with framer-motion for route changes
 */
export const pageTransitionVariants = {
  initial: (direction: 'forward' | 'backward') => ({
    opacity: 0,
    x: direction === 'forward' ? 30 : -30,
  }),
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: 'forward' | 'backward') => ({
    opacity: 0,
    x: direction === 'forward' ? -30 : 30,
  }),
};

export const pageTransitionConfig = {
  duration: 0.35,
  ease: PREMIUM_EASE,
};

/**
 * Staggered content entrance animations
 * Creates progressive reveal effect for content blocks
 */
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
    },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: PREMIUM_EASE,
    },
  },
};

/**
 * Fade-in animation for simple entrances
 */
export const fadeInVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: PREMIUM_EASE,
    },
  },
};

/**
 * Swipe card animations for Tinder-style interactions
 * Cards exit with rotation based on swipe direction
 */
export const swipeCardVariants = {
  enter: {
    x: 0,
    y: 0,
    opacity: 1,
    rotate: 0,
    scale: 1,
  },
  exitRight: {
    x: 500,
    opacity: 0,
    rotate: 20,
    transition: {
      duration: 0.4,
      ease: PREMIUM_EASE,
    },
  },
  exitLeft: {
    x: -500,
    opacity: 0,
    rotate: -20,
    transition: {
      duration: 0.4,
      ease: PREMIUM_EASE,
    },
  },
};

/**
 * Drag constraints and spring configuration for swipe cards
 */
export const swipeDragConfig = {
  drag: 'x' as const,
  dragConstraints: { left: 0, right: 0 },
  dragElastic: 0.7,
  dragTransition: { bounceStiffness: 600, bounceDamping: 20 },
};

/**
 * Calculate rotation based on drag position
 * @param x - Current x position of drag
 * @param maxRotation - Maximum rotation in degrees
 */
export const calculateDragRotation = (x: number, maxRotation: number = 15): number => {
  const rotation = (x / 100) * maxRotation;
  return Math.max(-maxRotation, Math.min(maxRotation, rotation));
};
