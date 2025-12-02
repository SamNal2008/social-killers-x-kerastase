import type { FC } from 'react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
}

export const ZoomModal: FC<ZoomModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  altText,
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="zoom-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {/* Backdrop */}
          <motion.div
            data-testid="zoom-modal-backdrop"
            className="absolute inset-0 bg-black/85"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content Container */}
          <div className="relative z-10 flex items-center justify-center w-full h-full p-4 md:p-6 lg:p-8">
            {/* Close Button */}
            <motion.button
              type="button"
              onClick={onClose}
              aria-label="Close zoom view"
              className="
                absolute
                top-4 right-4
                md:top-6 md:right-6
                lg:top-8 lg:right-8
                z-20
                w-11 h-11
                md:w-12 md:h-12
                flex items-center justify-center
                bg-black/50 hover:bg-black/70
                backdrop-blur-sm
                rounded-full
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent
                active:scale-95
              "
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {/* Image */}
            <motion.img
              src={imageUrl}
              alt={altText}
              className="
                max-w-full max-h-[90vh]
                md:max-h-[85vh]
                lg:max-h-[80vh]
                object-contain
                rounded-lg
                shadow-2xl
              "
              style={{ touchAction: 'pinch-zoom' }}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />

            {/* Hint Text (mobile only) */}
            <motion.div
              className="
                absolute bottom-4 left-0 right-0
                flex justify-center
                md:hidden
              "
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <div className="px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full">
                <p className="text-white/80 text-xs font-medium">
                  Pinch to zoom • Tap to close
                </p>
              </div>
            </motion.div>
          </div>

          {/* Hidden title for accessibility */}
          <h2 id="zoom-modal-title" className="sr-only">
            Zoomed view of {altText}
          </h2>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
