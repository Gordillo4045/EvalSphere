import { useState, useEffect } from 'react';
import { ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Modal, Image, Tooltip, ButtonGroup } from "@nextui-org/react";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, httpsCallable } from '../../config/config';
import { Employee, Department, Position } from '../../types/applicaciontypes';
import { toast } from 'sonner';
import { collection, getDocs } from 'firebase/firestore';

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    mode: 'add' | 'edit';
    companyId: string;
    companyName: string;
    currentEmployee: Employee | null;
    isCompanyAdding?: boolean;
}

const validateEmail = (value: string) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

export default function EmployeeModal({ isOpen, onClose, onUpdate, mode, companyId, companyName, currentEmployee, isCompanyAdding = false }: EmployeeModalProps) {
    const [newEmployee, setNewEmployee] = useState<Partial<Employee>>(currentEmployee || {});
    const [password, setPassword] = useState("");
    const [departments, setDepartments] = useState<Department[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [avatar, setAvatar] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [invitationCode, setInvitationCode] = useState("");

    useEffect(() => {
        if (mode === 'edit' && currentEmployee) {
            setNewEmployee(currentEmployee);
            setPreviewUrl(currentEmployee.avatar || null);
        } else {
            setNewEmployee({});
            setPreviewUrl(null);
        }
    }, [currentEmployee, mode]);

    useEffect(() => {
        const fetchDepartmentsAndPositions = async () => {
            const departmentsRef = collection(db, `companies/${companyId}/departments`);
            const departmentsSnapshot = await getDocs(departmentsRef);
            const departmentsData: Department[] = [];
            const positionsData: Position[] = [];

            for (const departmentDoc of departmentsSnapshot.docs) {
                const department = { id: departmentDoc.id, ...departmentDoc.data() } as Department;
                departmentsData.push(department);

                const positionsRef = collection(db, `companies/${companyId}/departments/${department.id}/positions`);
                const positionsSnapshot = await getDocs(positionsRef);
                positionsSnapshot.forEach(positionDoc => {
                    const position = { id: positionDoc.id, ...positionDoc.data(), departmentId: department.id } as Position;
                    positionsData.push(position);
                });
            }

            setDepartments(departmentsData);
            setPositions(positionsData);
        };

        fetchDepartmentsAndPositions();
    }, [companyId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newEmployee.name || !newEmployee.email) {
            toast.error("Por favor, complete los campos obligatorios.");
            return;
        }

        if (!validateEmail(newEmployee.email)) {
            toast.error("Por favor, ingrese un correo electrónico válido.");
            return;
        }

        if (newEmployee.companyEmail && !validateEmail(newEmployee.companyEmail)) {
            toast.error("Por favor, ingrese un correo electrónico de compañía válido.");
            return;
        }

        if (mode === 'add' && !isCompanyAdding && !invitationCode) {
            toast.error("Por favor, ingrese el código de invitación.");
            return;
        }

        try {
            await toast.promise(
                async () => {
                    let avatarUrl = newEmployee.avatar || '';
                    if (avatar) {
                        const storageRef = ref(storage, `avatars/${companyId}/${newEmployee.email}`);
                        await uploadBytes(storageRef, avatar);
                        avatarUrl = await getDownloadURL(storageRef);
                    }

                    const employeeData = {
                        ...newEmployee,
                        companyId,
                        companyName: mode === 'add' ? companyName : newEmployee.companyName,
                        avatar: avatarUrl,
                    };

                    if (mode === 'add') {
                        const createEmployeeFunction = httpsCallable('createEmployee');
                        await createEmployeeFunction({
                            ...employeeData,
                            password,
                            invitationCode: isCompanyAdding ? null : invitationCode,
                            addedByCompany: isCompanyAdding,
                        });
                    } else if (mode === 'edit' && currentEmployee) {
                        const updateEmployeeFunction = httpsCallable('updateEmployee');
                        await updateEmployeeFunction({
                            ...employeeData,
                            id: currentEmployee.id,
                        });
                    }

                    onUpdate();
                    onClose();
                    setNewEmployee({});
                    setPassword("");
                    setAvatar(null);
                    setPreviewUrl(null);
                },
                {
                    loading: 'Procesando...',
                    success: () => mode === 'add' ? 'Empleado agregado exitosamente.' : 'Empleado actualizado exitosamente.',
                    error: (error) => `Error: ${error.message}`,
                }
            );
        } catch (error) {
            console.error("Error al guardar empleado: ", error);
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

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>{mode === 'add' ? 'Agregar Empleado' : 'Editar Empleado'}</ModalHeader>
                <ModalBody>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Nombre"
                            autoFocus
                            variant='underlined'
                            value={newEmployee.name || ''}
                            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        />
                        <Input
                            label="Email"
                            variant='underlined'
                            value={newEmployee.email || ''}
                            type="email"
                            isInvalid={newEmployee.email && !validateEmail(newEmployee.email)}
                            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                            errorMessage={newEmployee.email && !validateEmail(newEmployee.email) ? "Email inválido" : ""}
                        />
                        <Select
                            label="Departamento"
                            variant='underlined'
                            selectedKeys={newEmployee.departmentId ? [newEmployee.departmentId] : []}
                            onChange={(e) => setNewEmployee({ ...newEmployee, departmentId: e.target.value, positionId: '' })}
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
                        >
                            {positions
                                .filter(pos => pos.departmentId === newEmployee.departmentId)
                                .map((pos) => (
                                    <SelectItem key={pos.id} value={pos.id}>
                                        {pos.title}
                                    </SelectItem>
                                ))}
                        </Select>

                        {mode === 'add' && !isCompanyAdding && (
                            <Input
                                label="Código de Invitación"
                                variant='underlined'
                                value={invitationCode}
                                onChange={(e) => setInvitationCode(e.target.value)}
                                required
                            />
                        )}

                        {mode === 'add' && (
                            <Input
                                label="Contraseña"
                                variant='underlined'
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                            <ButtonGroup>
                                <Button color="primary" type="submit">
                                    {mode === 'add' ? 'Agregar' : 'Guardar'}
                                </Button>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                            </ButtonGroup>
                        </ModalFooter>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}