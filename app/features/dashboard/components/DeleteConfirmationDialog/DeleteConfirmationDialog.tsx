import type { FC } from 'react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Trash2 } from 'lucide-react';
import { Title, Body } from '~/shared/components/Typography';
import { Button } from '~/shared/components/Button';
import type { DeleteConfirmationDialogProps } from './types';

export const DeleteConfirmationDialog: FC<DeleteConfirmationDialogProps> = ({
    isOpen,
    userName,
    isDeleting,
    onConfirm,
    onCancel,
}) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isDeleting) {
                onCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onCancel, isDeleting]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-dialog-title"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        data-testid="dialog-backdrop"
                        className="absolute inset-0 bg-black/50"
                        onClick={isDeleting ? undefined : onCancel}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    <motion.div
                        className="
              relative z-10
              w-full max-w-md
              bg-surface-light
              rounded-2xl
              shadow-2xl
              p-6
              flex flex-col gap-6
            "
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-feedback-error/10 rounded-full">
                                <Trash2 className="w-6 h-6 text-feedback-error" />
                            </div>
                            <Title variant="h2" as="h2" className="text-neutral-dark">
                                <span id="delete-dialog-title">Delete Result</span>
                            </Title>
                        </div>

                        <Body variant="1" className="text-neutral-dark">
                            Are you sure you want to delete the result for{' '}
                            <span className="font-semibold">{userName}</span>? This action cannot be undone.
                        </Body>

                        <div className="flex items-center justify-end gap-4">
                            <Button variant="secondary" onClick={onCancel} disabled={isDeleting}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="bg-feedback-error hover:bg-feedback-error/90"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
