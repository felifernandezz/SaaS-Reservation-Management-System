import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    title?: string;
    body?: string;
    confirmVariant?: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    show,
    onHide,
    onConfirm,
    title,
    body,
    confirmVariant = "danger",
    confirmText,
    cancelText
}) => {
    const { t } = useTranslation();

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>{title || t('common.confirm') || 'Confirm'}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="fs-5 text-secondary">
                {body || "¿Estás seguro de realizar esta acción?"}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>
                    {cancelText || t('common.cancel') || 'Cancel'}
                </Button>
                <Button variant={confirmVariant} onClick={() => { onConfirm(); onHide(); }}>
                    {confirmText || t('common.confirm') || 'Confirm'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;
