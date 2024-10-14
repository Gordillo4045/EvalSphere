import { useState, useEffect, useMemo } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Image, Tooltip, Select, SelectItem } from "@nextui-org/react";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, httpsCallable, db } from '@/config/config';
import { toast } from 'sonner';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Company, Department, Position } from '@/types/applicaciontypes';

interface EmployeeSignUpFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const validateEmail = (value: string) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

export default function EmployeeSignUpForm({ isOpen, onClose }: EmployeeSignUpFormProps) {
    const [step, setStep] = useState<'code' | 'form'>('code');
    const [invitationCode, setInvitationCode] = useState('');
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '', // Nuevo campo para confirmar contraseña
        companyId: '',
        departmentId: '',
        positionId: '',
    });
    const [avatar, setAvatar] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            const companiesRef = collection(db, 'companies');
            const companiesSnapshot = await getDocs(companiesRef);
            const companiesData = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
            setCompanies(companiesData);
        };
        fetchCompanies();
    }, []);

    const verifyInvitationCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            for (const company of companies) {
                const companyRef = doc(db, 'companies', company.id);
                const companySnap = await getDoc(companyRef);
                const companyData = companySnap.data();
                if (companyData && companyData.invitationCode === invitationCode) {
                    setNewEmployee(prev => ({ ...prev, companyId: company.id }));
                    await handleCompanyChange(company.id);
                    setStep('form');
                    return;
                }
            }
            toast.error("Código de invitación inválido.");
        } catch (error) {
            console.error("Error al verificar el código de invitación:", error);
            toast.error("Error al verificar el código de invitación.");
        }
    };

    const handleCompanyChange = async (companyId: string) => {
        setNewEmployee(prev => ({ ...prev, companyId, departmentId: '', positionId: '' }));
        const departmentsRef = collection(db, `companies/${companyId}/departments`);
        const departmentsSnapshot = await getDocs(departmentsRef);
        const departmentsData = departmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
        setDepartments(departmentsData);
    };

    const handleDepartmentChange = async (departmentId: string) => {
        setNewEmployee(prev => ({ ...prev, departmentId, positionId: '' }));
        const positionsRef = collection(db, `companies/${newEmployee.companyId}/departments/${departmentId}/positions`);
        const positionsSnapshot = await getDocs(positionsRef);
        const positionsData = positionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Position));
        setPositions(positionsData);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newEmployee.name || !newEmployee.email || !newEmployee.password || !newEmployee.companyId || !newEmployee.departmentId || !newEmployee.positionId) {
            toast.error("Por favor, complete todos los campos obligatorios.");
            return;
        }

        if (!validateEmail(newEmployee.email)) {
            toast.error("Por favor, ingrese un correo electrónico válido.");
            return;
        }

        try {
            await toast.promise(
                async () => {
                    let avatarUrl = '';
                    if (avatar) {
                        const storageRef = ref(storage, `avatars/${newEmployee.email}`);
                        await uploadBytes(storageRef, avatar);
                        avatarUrl = await getDownloadURL(storageRef);
                    }

                    const createEmployeeFunction = httpsCallable('createEmployee');
                    await createEmployeeFunction({
                        ...newEmployee,
                        avatar: avatarUrl,
                        addedByCompany: false,
                        companyName: companies.find(c => c.id === newEmployee.companyId)?.name || '',
                        invitationCode,
                    });

                    onClose();
                    setNewEmployee({
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        companyId: '',
                        departmentId: '',
                        positionId: '',
                    });
                    setAvatar(null);
                    setPreviewUrl(null);
                    setStep('code');
                    setInvitationCode('');
                },
                {
                    loading: 'Procesando registro...',
                    success: 'Registro exitoso. Bienvenido!',
                    error: (error) => `Error: ${error.message}`,
                }
            );
        } catch (error) {
            console.error("Error al registrar empleado: ", error);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setAvatar(null);
        setPreviewUrl(null);
    };

    const isInvalid = useMemo(() => {
        if (newEmployee.email === "") return false;
        return validateEmail(newEmployee.email) ? false : true;
    }, [newEmployee.email]);

    const isPasswordInvalid = useMemo(() => {
        if (newEmployee.password === "" && newEmployee.confirmPassword === "") return false;
        return newEmployee.password !== newEmployee.confirmPassword;
    }, [newEmployee.password, newEmployee.confirmPassword]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='outside'>
            <ModalContent>
                <ModalHeader>Registro de Empleado</ModalHeader>
                <ModalBody>
                    {step === 'code' ? (
                        <div className="flex flex-col gap-4">
                            <form onSubmit={verifyInvitationCode} className="flex flex-col gap-4">
                                <Input
                                    label="Código de Invitación"
                                    variant='underlined'
                                    value={invitationCode}
                                    onChange={(e) => setInvitationCode(e.target.value)}
                                    autoFocus
                                />
                                <Button color="primary" type="submit" variant="flat" className="mb-2">
                                    Verificar Código
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <Input
                                label="Nombre"
                                autoFocus
                                variant='underlined'
                                value={newEmployee.name}
                                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                isRequired
                            />
                            <Input
                                label="Email"
                                variant='underlined'
                                value={newEmployee.email}
                                type="email"
                                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                isRequired
                                isInvalid={isInvalid}
                                errorMessage={isInvalid ? "Por favor, ingrese un correo electrónico válido" : ""}
                            />
                            <Input
                                label="Contraseña"
                                variant='underlined'
                                type="password"
                                value={newEmployee.password}
                                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                                isRequired
                            />
                            <Input
                                label="Confirmar Contraseña"
                                variant='underlined'
                                type="password"
                                value={newEmployee.confirmPassword}
                                onChange={(e) => setNewEmployee({ ...newEmployee, confirmPassword: e.target.value })}
                                isRequired
                                isInvalid={isPasswordInvalid}
                                errorMessage={isPasswordInvalid ? "Las contraseñas no coinciden" : ""}
                            />
                            <Select
                                label="Departamento"
                                variant='underlined'
                                selectedKeys={newEmployee.departmentId ? [newEmployee.departmentId] : []}
                                onChange={(e) => handleDepartmentChange(e.target.value)}
                                isRequired
                            >
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Select
                                label="Posición"
                                variant='underlined'
                                selectedKeys={newEmployee.positionId ? [newEmployee.positionId] : []}
                                onChange={(e) => setNewEmployee({ ...newEmployee, positionId: e.target.value })}
                                isDisabled={!newEmployee.departmentId}
                                isRequired
                            >
                                {positions.map((pos) => (
                                    <SelectItem key={pos.id} value={pos.id}>
                                        {pos.title}
                                    </SelectItem>
                                ))}
                            </Select>
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
                                        <Input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
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
                            <ModalFooter>
                                <Button color="primary" type="submit">
                                    Registrarse
                                </Button>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}