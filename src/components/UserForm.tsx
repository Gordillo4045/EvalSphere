import { useState, useEffect } from 'react';
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
import { storage, httpsCallable } from "@/config/config";
import { toast } from 'sonner';
import { Company } from '@/types/applicaciontypes';

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    editItem?: Usuario | Company | null;
    onUpdate: () => void;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    type: 'admin' | 'company';
    puestoTrabajo?: string;
    avatar: File | null;
    location?: string;
    description?: string;
    industry?: string;
}

interface Usuario {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    puestoTrabajo?: string;
    avatar?: string;
}

const validateEmail = (value: string) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

export default function UserForm({ isOpen, onClose, editItem, onUpdate }: UserFormProps) {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        password: "",
        type: "admin",
        puestoTrabajo: "",
        avatar: null,
        location: "",
        description: "",
        industry: "",
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editItem) {
            if ('industry' in editItem) {
                setFormData({
                    name: editItem.name || "",
                    email: editItem.email || "",
                    password: "",
                    type: "company",
                    puestoTrabajo: "",
                    avatar: null,
                    location: editItem.location || "",
                    description: editItem.description || "",
                    industry: editItem.industry || "",
                });
                setPreviewUrl(editItem.avatar);
            } else {
                setFormData({
                    name: editItem.name || "",
                    email: editItem.email || "",
                    password: "",
                    type: "admin",
                    puestoTrabajo: editItem.puestoTrabajo || "",
                    avatar: null,
                    location: "",
                    description: "",
                    industry: "",
                });
                setPreviewUrl(editItem.avatar || null);
            }
        } else {
            setFormData({
                name: "",
                email: "",
                password: "",
                type: "admin",
                puestoTrabajo: "",
                avatar: null,
                location: "",
                description: "",
                industry: "",
            });
            setPreviewUrl(null);
        }
    }, [editItem, isOpen]);

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
        setIsSubmitting(true);
        try {
            let avatarUrl = previewUrl || "";

            if (formData.avatar) {
                const storageRef = ref(storage, `avatars/${formData.avatar.name}`);
                await uploadBytes(storageRef, formData.avatar);
                avatarUrl = await getDownloadURL(storageRef);
            }

            if (editItem) {
                if (formData.type === "company") {
                    const updateCompanyFunction = httpsCallable('updateCompany');
                    await updateCompanyFunction({
                        id: editItem.id,
                        name: formData.name,
                        email: formData.email,
                        location: formData.location,
                        avatar: avatarUrl,
                        description: formData.description || null,
                        industry: formData.industry,
                        photoURL: avatarUrl || null,
                    });
                } else {
                    const updateAdminFunction = httpsCallable('updateAdmin');
                    await updateAdminFunction({
                        uid: editItem.id,
                        email: formData.email,
                        displayName: formData.name,
                        photoURL: avatarUrl || null,
                        role: 'admin',
                        puestoTrabajo: formData.puestoTrabajo,
                    });
                }
            } else {
                if (formData.type === "company") {
                    const createCompanyFunction = httpsCallable('createCompany');
                    await createCompanyFunction({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                        location: formData.location,
                        avatar: avatarUrl,
                        description: formData.description || null,
                        industry: formData.industry,
                        photoURL: avatarUrl || null,
                    });
                } else {
                    const createAdminFunction = httpsCallable('createAdmin');
                    await createAdminFunction({
                        email: formData.email,
                        password: formData.password,
                        displayName: formData.name,
                        photoURL: avatarUrl || null,
                        role: 'admin',
                        puestoTrabajo: formData.puestoTrabajo,
                    });
                }
            }

            onUpdate();
            onClose();
        } catch (error) {
            console.error("Error en processUser:", error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email.trim() || !validateEmail(formData.email)) {
            toast.error("Por favor, ingrese un correo electrónico válido.");
            return;
        }

        if (!editItem && formData.password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (formData.type === "admin") {
            if (!formData.name.trim()) {
                toast.error("El nombre es obligatorio.");
                return;
            }
            if (!formData.puestoTrabajo?.trim()) {
                toast.error("El puesto de trabajo es obligatorio.");
                return;
            }
        } else {
            if (!formData.name.trim()) {
                toast.error("El nombre de la compañía es obligatorio.");
                return;
            }
            if (!formData.location.trim()) {
                toast.error("La ubicación es obligatoria.");
                return;
            }
            if (!formData.industry.trim()) {
                toast.error("La industria es obligatoria.");
                return;
            }
        }

        try {
            setIsSubmitting(true);
            await toast.promise(
                processUser(),
                {
                    loading: 'Procesando...',
                    success: () => {
                        const successMessage = editItem ? 'Actualizado correctamente' : 'Agregado correctamente';
                        return successMessage;
                    },
                    error: (error: Error) => {
                        console.error("Error al procesar:", error);
                        return error.message;
                    },
                }
            );
        } catch (error) {
            console.error("Error inesperado:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} placement="top-center" scrollBehavior='inside'>
            <ModalContent>
                <ModalHeader>
                    <h2 className="text-2xl font-bold">
                        {editItem ? "Editar" : "Agregar"} {formData.type === "company" ? "Compañía" : "Administrador"}
                    </h2>
                </ModalHeader>
                <ModalBody>
                    <form onSubmit={handleSubmit} className="w-full items-center space-y-11 px-6">
                        {!editItem && (
                            <Select
                                label="Tipo"
                                labelPlacement="outside"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                variant='underlined'
                                autoFocus
                            >
                                <SelectItem key="admin" value="admin">Administrador</SelectItem>
                                <SelectItem key="company" value="company">Compañía</SelectItem>
                            </Select>
                        )}

                        {formData.type === "company" ? (
                            <>
                                <Input
                                    label="Nombre de la compañía"
                                    labelPlacement="outside"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    variant='underlined'
                                />
                                <Input
                                    label="Ubicación"
                                    labelPlacement="outside"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    variant='underlined'
                                />
                                <Input
                                    label="Descripción"
                                    labelPlacement="outside"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    variant='underlined'
                                />
                                <Input
                                    label="Industria"
                                    labelPlacement="outside"
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleInputChange}
                                    variant='underlined'
                                />
                            </>
                        ) : (
                            <>
                                <Input
                                    label="Nombre"
                                    labelPlacement="outside"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    variant='underlined'
                                />
                                <Input
                                    label="Puesto de trabajo"
                                    labelPlacement="outside"
                                    name="puestoTrabajo"
                                    value={formData.puestoTrabajo}
                                    onChange={handleInputChange}
                                    variant='underlined'
                                />
                            </>
                        )}

                        <Input
                            label="Email"
                            labelPlacement="outside"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            variant='underlined'
                            isInvalid={formData.email.trim() !== "" && !validateEmail(formData.email)}
                            errorMessage={formData.email.trim() !== "" && !validateEmail(formData.email) ? "Por favor, ingrese un correo electrónico válido." : ""}
                        />
                        {!editItem && (
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
                                <Button
                                    color="primary"
                                    type='submit'
                                    isDisabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Procesando...' : (editItem ? "Guardar Cambios" : "Agregar")}
                                </Button>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                    isDisabled={isSubmitting}
                                >
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