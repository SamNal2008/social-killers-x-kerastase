import type { FC } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn } from 'lucide-react';
import { cn } from '~/shared/utils/cn';
import type { Moodboard } from '~/shared/services/moodboardService';
import { ZoomModal } from '~/shared/components/ZoomModal';

interface MoodboardCardProps {
    moodboard: Pick<Moodboard, 'id' | 'name' | 'description' | 'image_url'>;
    isSelected: boolean;
    onClick: (id: string) => void;
}

export const MoodboardCard: FC<MoodboardCardProps> = ({
    moodboard,
    isSelected,
    onClick,
}) => {
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

    const handleZoomClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsZoomModalOpen(true);
    };

    return (
        <>
            <motion.div
                role="button"
                tabIndex={0}
                onClick={() => onClick(moodboard.id)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onClick(moodboard.id);
                    }
                }}
                className={cn(
                    // Layout
                    'relative w-full aspect-[165/100]',
                    'overflow-hidden cursor-pointer',
                    // Borders & Effects
                    'border-2 transition-all duration-200',
                    // Selected State
                    isSelected
                        ? 'border-[#C9A961] ring-2 ring-[#C9A961] scale-[0.98]'
                        : 'border-transparent hover:border-white/20',
                    // Background
                    'bg-stone-800'
                )}
                aria-pressed={isSelected}
                aria-label={`Select ${moodboard.name} moodboard`}
                whileTap={{ scale: 0.95 }}
            >
                {/* Background Image */}
                {moodboard.image_url && (
                    <img
                        src={moodboard.image_url}
                        alt={moodboard.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}

                {/* Magnifier Button */}
                <motion.button
                    type="button"
                    onClick={handleZoomClick}
                    aria-label="Zoom into moodboard"
                    className="
                        absolute
                        top-2 right-2
                        md:top-3 md:right-3
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                >
                    <ZoomIn className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </motion.button>
            </motion.div>

            {/* Zoom Modal */}
            <ZoomModal
                isOpen={isZoomModalOpen}
                onClose={() => setIsZoomModalOpen(false)}
                imageUrl={moodboard.image_url || ''}
                altText={moodboard.name}
            />
        </>
    );
};
