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
