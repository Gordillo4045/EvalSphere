import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Input,
    Button,
    ButtonGroup,
    Image,
    Tooltip,
    Select,
    SelectItem
} from "@nextui-org/react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage, httpsCallable } from "../config/config";
import { toast } from 'sonner';

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    editUser?: Usuario | null;
    onUpdate: () => void;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    role: string;
    puestoTrabajo: string;
    avatar: File | null;
}

interface Usuario {
    id: string;
    name: string;
    email: string;
    role: string;
    puestoTrabajo: string;
    avatar: string;
}

export default function UserForm({ isOpen, onClose, editUser, onUpdate }: UserFormProps) {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        password: "",
        role: "",
        puestoTrabajo: "",
        avatar: null,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (editUser) {
            setFormData({
                name: editUser.name,
                email: editUser.email,
                password: "",
                role: editUser.role,
                puestoTrabajo: editUser.puestoTrabajo,
                avatar: null,
            });
            setPreviewUrl(editUser.avatar);
        } else {
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "",
                puestoTrabajo: "",
                avatar: null,
            });
            setPreviewUrl(null);
        }
    }, [editUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, avatar: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, avatar: null }));
        setPreviewUrl(null);
    };

    const processUser = async () => {
        try {
            let avatarUrl = editUser?.avatar || "";

            if (formData.avatar) {
                const storageRef = ref(storage, `avatares/${formData.avatar.name}`);
                await uploadBytes(storageRef, formData.avatar);
                avatarUrl = await getDownloadURL(storageRef);
            }

            if (editUser) {
                // Actualizar usuario existente
                const updateUserFunction = httpsCallable('updateUser');
                await updateUserFunction({
                    uid: editUser.id,
                    email: formData.email,
                    displayName: formData.name,
                    photoURL: avatarUrl || null,
                    role: formData.role,
                    puestoTrabajo: formData.puestoTrabajo,
                });
            } else {
                // Crear nuevo usuario
                const createUserFunction = httpsCallable('createUser');
                await createUserFunction({
                    email: formData.email,
                    password: formData.password,
                    displayName: formData.name,
                    photoURL: avatarUrl || null,
                    role: formData.role,
                    puestoTrabajo: formData.puestoTrabajo,
                });
            }

            onUpdate();
            onClose();
        } catch (error) {
            console.error("Error en processUser:", error);
            if (error instanceof Error) {
                const errorMessage = error.message.includes('permission-denied')
                    ? "No tienes permisos para realizar esta acción."
                    : `Error al procesar el usuario: ${error.message}`;
                throw new Error(errorMessage);
            } else {
                throw new Error("Error desconocido al procesar el usuario");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("El nombre es obligatorio.");
            return;
        }
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error("Por favor, ingrese un correo electrónico válido.");
            return;
        }
        if (!editUser && formData.password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (!formData.role) {
            toast.error("Por favor, seleccione un rol.");
            return;
        }
        if (!formData.puestoTrabajo.trim()) {
            toast.error("El puesto de trabajo es obligatorio.");
            return;
        }

        try {
            await toast.promise(
                processUser(),
                {
                    loading: 'Procesando usuario...',
                    success: () => {
                        const successMessage = editUser ? 'Usuario actualizado correctamente' : 'Usuario agregado correctamente';
                        return successMessage;
                    },
                    error: (error: Error) => {
                        console.error("Error al procesar el usuario:", error);
                        return error.message;
                    },
                }
            );
        } catch (error) {
            console.error("Error inesperado:", error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} placement="top-center" scrollBehavior='inside'>
            <ModalContent>
                <ModalHeader>
                    <h2 className="text-2xl font-bold">
                        {editUser ? "Editar Usuario" : "Agregar Usuario"}
                    </h2>
                </ModalHeader>
                <ModalBody>
                    <form onSubmit={handleSubmit} className="w-full items-center space-y-11 px-6">
                        <Input
                            label="Nombre"
                            labelPlacement="outside"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            variant='underlined'
                            autoFocus
                        />
                        <Input
                            label="Email"
                            labelPlacement="outside"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            variant='underlined'
                        />
                        {!editUser && (
                            <Input
                                label="Contraseña"
                                labelPlacement="outside"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                variant='underlined'
                            />
                        )}
                        <Select
                            label="Rol"
                            labelPlacement="outside"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            variant='underlined'
                            defaultSelectedKeys={[`${editUser?.role}`]}
                        >
                            <SelectItem key="admin" value="admin">Administrador</SelectItem>
                            <SelectItem key="user" value="user">Usuario</SelectItem>
                        </Select>
                        <Input
                            label="Puesto de trabajo"
                            labelPlacement="outside"
                            name="puestoTrabajo"
                            value={formData.puestoTrabajo}
                            onChange={handleInputChange}
                            variant='underlined'
                        />
                        {!previewUrl && (
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-38 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 ">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click para subir.</span> </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 600x400px)</p>
                                    </div>
                                    <Input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleImageChange} errorMessage="SUbe una imagen" />
                                </label>
                            </div>
                        )}
                        {previewUrl && (
                            <div className="relative flex justify-center items-center">
                                <Image src={previewUrl} isBlurred isZoomed alt="Vista previa" className="rounded-md max-w-full max-h-36 bg-white" />
                                <Tooltip content="Eliminar imagen" color='danger' showArrow={true}>
                                    <Button
                                        type="button"
                                        color='danger'
                                        isIconOnly
                                        radius='full'
                                        size='sm'
                                        variant='shadow'
                                        className="absolute z-10 top-0 right-0 "
                                        onClick={handleRemoveImage}
                                    >
                                        X
                                    </Button>
                                </Tooltip>
                            </div>
                        )}

                        <div className='flex justify-end pt-0 pr-0'>
                            <ButtonGroup>
                                <Button color="primary" type='submit'>
                                    {editUser ? "Guardar Cambios" : "Agregar Usuario"}
                                </Button>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                            </ButtonGroup>
                        </div>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}


