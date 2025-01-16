import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ButtonGroup,
} from "@heroui/react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  content: string;
  isDeleting: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  content,
  isDeleting,
}: DeleteConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} placement="top-center">
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <p>{content}</p>
          <span className="text-sm text-gray-500">
            Esta acción no se puede deshacer.
          </span>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button color="danger" onPress={onConfirm} isDisabled={isDeleting}>
              {isDeleting ? "Procesando..." : "Eliminar"}
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
