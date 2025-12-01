import type { FC } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '~/shared/components/Button/Button';
import { staggerItemVariants } from '~/shared/animations/transitions';

interface CameraBackButtonProps {
    onClick: () => void;
}

export const CameraBackButton: FC<CameraBackButtonProps> = ({ onClick }) => {
    return (
        <motion.div variants={staggerItemVariants}>
            <Button
                variant="tertiary"
                onClick={onClick}
                type="button"
                aria-label="Back"
            >
                <ArrowLeft size={14} />
                Back
            </Button>
        </motion.div>
    );
}
