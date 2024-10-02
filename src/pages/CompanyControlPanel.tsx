import { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Select, SelectItem, Spinner, Input, ButtonGroup, Snippet } from "@nextui-org/react";
import DepartmentTable from "../components/company/DepartmentTable";
import PositionTable from "../components/company/PositionTable";
import EmployeeTable from "../components/company/EmployeeTable";
import { collection, doc, getDoc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { db } from '../config/config';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Company, Department } from '../types/applicaciontypes';
import SurveyQuestionsTab from '../components/company/SurveyQuestionsTab';
import RadarCharts from '../components/company/RadarCharts';
import Sidebar from '../components/Sidebar';
import BarCharts from '../components/company/BarCharts';
import { toast } from 'sonner';
import { MdEdit } from 'react-icons/md';
import ResultTable from '../components/company/ResultTable';

function CompanyControlPanel() {
    const [company, setCompany] = useState<Company | null>(null);
    const { user, isCompany, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string>('home');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [invitationCode, setInvitationCode] = useState<string>('');
    const [isEditingCode, setIsEditingCode] = useState<boolean>(false);
    const [newInvitationCode, setNewInvitationCode] = useState<string>('');

    useEffect(() => {
        const fetchCompanyData = async () => {
            if (user && isCompany) {
                try {
                    const companyRef = doc(db, 'companies', user.uid);
                    const companySnap = await getDoc(companyRef);
                    if (companySnap.exists()) {
                        const companyData = { id: companySnap.id, ...companySnap.data() } as Company;
                        setCompany(companyData);
                        setInvitationCode(companyData.invitationCode || '');
                    } else {
                        console.error("No se encontró la compañía");
                    }
                } catch (error) {
                    console.error("Error al obtener los datos de la compañía:", error);
                }
            }
        };

        if (!loading) {
            if (!user || !isCompany) {
                navigate('/');
            } else {
                fetchCompanyData();
            }
        }
    }, [user, isCompany, loading, navigate]);

    useEffect(() => {
        const departmentsRef = collection(db, `companies/${company?.id}/departments`);
        const q = query(departmentsRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const departmentsData: Department[] = [];
            querySnapshot.forEach((doc) => {
                departmentsData.push({ id: doc.id, ...doc.data() } as Department);
            });
            setDepartments(departmentsData);
            // Establecer el primer departamento como seleccionado por defecto
            if (departmentsData.length > 0 && !selectedDepartment) {
                setSelectedDepartment(departmentsData[0]);
            }
        });

        return () => unsubscribe();
    }, [company?.id, selectedDepartment]);

    const handleChangeInvitationCode = async () => {
        if (!newInvitationCode) {
            toast.error("Por favor, ingrese un nuevo código de invitación.");
            return;
        }

        try {
            const companyRef = doc(db, 'companies', company!.id);
            await updateDoc(companyRef, {
                invitationCode: newInvitationCode
            });
            setInvitationCode(newInvitationCode);
            setNewInvitationCode('');
            setIsEditingCode(false);
            toast.success("Código de invitación actualizado exitosamente.");
        } catch (error) {
            console.error("Error al actualizar el código de invitación:", error);
            toast.error("Error al actualizar el código de invitación.");
        }
    };

    if (!company) {
        return <div className='flex justify-center items-center min-h-dvh'>
            <Spinner color="primary" label="Cargando datos..." />
        </div>;
    }

    return (
        <div className="flex min-h-dvh">
            <Sidebar setActiveTab={setActiveTab} />
            <main className="flex-1 flex flex-col overflow-hidden ml-20 p-5">
                <h1 className="text-xl font-semibold pb-4 text-center">Panel de Control de {company.name}</h1>
                <div className={`w-full ${activeTab === 'home' ? 'h-fit' : 'max-w-5xl mx-auto'} flex flex-col shadow-inner rounded-xl overflow-x-auto p-3`}>
                    {activeTab === 'departments' && (
                        <Card className="w-full">
                            <CardHeader>
                                <h2 className="text-xl font-semibold">Departamentos</h2>
                            </CardHeader>
                            <CardBody>
                                <DepartmentTable companyId={company.id} />
                            </CardBody>
                        </Card>
                    )}
                    {activeTab === 'positions' && (
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold">Puestos</h2>
                            </CardHeader>
                            <CardBody>
                                <PositionTable companyId={company.id} />
                            </CardBody>
                        </Card>
                    )}
                    {activeTab === 'employees' && (
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold">Empleados</h2>
                            </CardHeader>
                            <CardBody>
                                <EmployeeTable companyId={company.id} companyName={company.name} />
                            </CardBody>
                        </Card>
                    )}
                    {activeTab === 'surveyQuestions' && (
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold">Preguntas</h2>
                            </CardHeader>
                            <CardBody>
                                <SurveyQuestionsTab companyId={company.id} />
                            </CardBody>
                        </Card>
                    )}
                    {activeTab === 'home' && (
                        <div className="grid grid-cols-12 grid-rows-6 gap-2">
                            <Card className="w-full col-span-12 row-span-6 md:col-span-4 md:row-span-1 " >
                                <CardHeader>
                                    <h2 className="text-xl font-semibold">Selecciona un departamento</h2>
                                </CardHeader>
                                <CardBody className="overflow-auto h-full">
                                    <Select size='lg'
                                        variant='underlined'
                                        defaultSelectedKeys={[selectedDepartment?.id || '']}
                                        aria-label='Departamentos'
                                        placeholder='Selecciona un departamento'
                                        selectedKeys={[selectedDepartment?.id || '']}
                                        onSelectionChange={(e) => {
                                            const selectedId = e.currentKey as string;
                                            setSelectedDepartment(departments.find(department => department.id === selectedId) || null);
                                        }}
                                    >
                                        {departments.map((department) => (
                                            <SelectItem key={department.id} value={department.id}>
                                                {department.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </CardBody>
                            </Card>

                            <Card className="w-full col-span-12 row-span-6 md:col-span-8 md:row-span-3" >
                                <CardHeader>
                                    <h2 className="text-xl font-semibold">Informe de {selectedDepartment?.name || 'Departamento'}</h2>
                                </CardHeader>
                                <CardBody className="overflow-auto h-full flex flex-col md:flex-row gap-2">
                                    <RadarCharts />
                                    <BarCharts />
                                </CardBody>
                            </Card>

                            <Card className="w-full col-span-12 row-span-6 order-4 md:order-none md:col-span-4 md:row-span-4">
                                <CardHeader>
                                    <h2 className="text-xl font-semibold">Opciones de Edición</h2>
                                </CardHeader>
                                <CardBody >
                                    <div className="flex flex-col gap-4">
                                        <Card
                                            isPressable
                                            shadow="sm"
                                        >
                                            <CardBody className="flex flex-row gap-2 items-center">
                                                <div className="flex items-center justify-center h-fit rounded-medium border p-2 bg-default-50 border-default-100">
                                                    <MdEdit size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-medium">Create a new agreement</p>
                                                    <p className="text-small text-default-400">Create a new Direct Employee Agreement template.</p>
                                                </div>
                                            </CardBody>
                                        </Card>

                                    </div>
                                </CardBody>
                            </Card>

                            <Card className="w-full col-span-12 row-span-6 md:col-span-8 md:row-span-3">
                                <CardHeader>
                                    <h2 className="text-xl font-semibold p-0">Tabla de Resultados</h2>
                                </CardHeader>
                                <CardBody className="overflow-auto h-full">
                                    <ResultTable />
                                </CardBody>
                            </Card>

                            <Card className="w-full col-span-12 row-span-6 md:col-span-4 md:row-span-1">
                                <CardHeader>
                                    <h2 className="text-xl font-semibold">Código de Invitación</h2>
                                </CardHeader>
                                <CardBody className="overflow-auto h-full flex flex-col justify-between">
                                    {isEditingCode ? (
                                        <div className="flex flex-col gap-2">
                                            <Input
                                                placeholder="Nuevo código de invitación"
                                                value={newInvitationCode}
                                                onChange={(e) => setNewInvitationCode(e.target.value)}
                                                variant='bordered'
                                            />
                                            <div className="flex justify-end gap-2">
                                                <ButtonGroup>
                                                    <Button color="primary" onClick={handleChangeInvitationCode}>
                                                        Guardar
                                                    </Button>
                                                    <Button color="danger" variant="light" onClick={() => setIsEditingCode(false)}>
                                                        Cancelar
                                                    </Button>
                                                </ButtonGroup>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Snippet symbol="" size='md' className='min-w-[90%]' >
                                                {invitationCode}
                                            </Snippet>
                                            <Button isIconOnly color="default" variant="light" size='md' onClick={() => setIsEditingCode(true)}>
                                                <MdEdit size={20} />
                                            </Button>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default CompanyControlPanel;