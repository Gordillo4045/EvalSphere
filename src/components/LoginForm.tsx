import React, { useState, useMemo, useEffect } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Button,
    ButtonGroup
} from "@heroui/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/config";
import { toast } from 'sonner';
import { IoMail as MailIcon } from "react-icons/io5";
import { IoLockClosed as LockIcon } from "react-icons/io5";

interface LoginFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginForm({ isOpen, onClose }: LoginFormProps) {
    const [formState, setFormState] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setFormState({
                email: '',
                password: '',
            });
            setIsLoading(false);
        }
    }, [isOpen]);

    const validateEmail = (value: string) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

    const isInvalid = useMemo(() => {
        if (formState.email === "") return false;
        return validateEmail(formState.email) ? false : true;
    }, [formState.email]);

    const handleInputChange = (name: string, value: string) => {
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { email, password } = formState;

        if (!email || !password) {
            toast.error("Por favor, complete todos los campos");
            return;
        }

        if (isInvalid) {
            toast.error("Por favor, ingrese un correo electrónico válido.");
            return;
        }

        try {
            setIsLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            setFormState({
                email: '',
                password: '',
            });
            toast.success("Inicio de sesión exitoso");
            onClose();
        } catch (error) {
            toast.error("Error en el inicio de sesión. Verifica tus credenciales.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSubmit(e as any);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="top-center"
            hideCloseButton
        >
            <ModalContent>
                <form onSubmit={handleSubmit} className="space-y-2">
                    <ModalHeader className="flex flex-col gap-1">Inicio de sesión</ModalHeader>
                    <ModalBody>
                        <Input
                            isRequired
                            autoFocus
                            onKeyDown={handleKeyDown}
                            endContent={
                                <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                            }
                            label="Correo"
                            placeholder="Ingresa tu correo"
                            variant="bordered"
                            type="email"
                            value={formState.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            isInvalid={isInvalid}
                            errorMessage={isInvalid ? "Por favor, ingrese un correo electrónico válido" : ""}
                        />
                        <Input
                            isRequired
                            onKeyDown={handleKeyDown}
                            endContent={
                                <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                            }
                            label="Contraseña"
                            placeholder="Ingresa tu contraseña"
                            type="password"
                            variant="bordered"
                            value={formState.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                        />
                    </ModalBody>

                    <ModalFooter>
                        <ButtonGroup>
                            <Button
                                color="danger"
                                variant="light"
                                onPress={onClose}
                            >
                                Cancelar
                            </Button>
                            <Button color="primary" type="submit" isLoading={isLoading}>
                                Iniciar sesión
                            </Button>
                        </ButtonGroup>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}