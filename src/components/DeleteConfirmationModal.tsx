import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, ButtonGroup } from "@nextui-org/react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    content: string;
}

export default function DeleteConfirmationModal({ isOpen, onConfirm, onCancel, title, content }: DeleteConfirmationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onCancel} placement="center">
            <ModalContent>
                <ModalHeader>{title}</ModalHeader>
                <ModalBody>
                    <p>{content}</p>
                    <span className="text-sm text-gray-500">Esta acción no se puede deshacer.</span>
                </ModalBody>
                <ModalFooter>
                    <ButtonGroup>
                        <Button color="danger" onPress={onConfirm}>
                            Eliminar
                        </Button>
                        <Button color="default" onPress={onCancel}>
                            Cancelar
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}