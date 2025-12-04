export interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    userName: string;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}
