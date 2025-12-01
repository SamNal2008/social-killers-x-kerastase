import type { FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '~/shared/utils/cn';
import type { Moodboard } from '~/shared/services/moodboardService';

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
    return (
        <motion.button
            type="button"
            onClick={() => onClick(moodboard.id)}
            className={cn(
                // Layout
                'relative w-full aspect-[3/4] flex flex-col justify-end',
                'text-left overflow-hidden',
                // Spacing
                'p-4',
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
            aria-label={`Select ${moodboard.name}`}
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

            {/* Gradient Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                <h3 className="text-white font-serif text-lg leading-tight mb-1">
                    {moodboard.name}
                </h3>
                <p className="text-white/80 text-xs line-clamp-2">
                    {moodboard.description}
                </p>
            </div>
        </motion.button>
    );
};
