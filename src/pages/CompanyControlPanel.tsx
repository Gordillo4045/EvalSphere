import { useState, useEffect, useCallback } from 'react';
import { Button, Card, CardBody, CardHeader, Select, SelectItem, Spinner, Input, ButtonGroup, Snippet, Badge, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { collection, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '@/config/config';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Company, Department, Notification } from '@/types/applicaciontypes';
import Sidebar from '@/components/Sidebar';
import { toast } from 'sonner';
import { MdEdit, MdGroupWork } from 'react-icons/md';
import { FaFileLines, FaUsers } from 'react-icons/fa6';
import { BsPersonBadgeFill } from 'react-icons/bs';
import { FaQuestionCircle } from 'react-icons/fa';
import React, { Suspense } from 'react';
import { RadarCharts } from '@/components/company/RadarCharts';
import { BarCharts } from '@/components/company/BarCharts';
import { LineCharts } from '@/components/company/LineCharts';
import { getFunctions, httpsCallable } from 'firebase/functions';
import EvaluationHistory from '@/components/company/EvaluationHistory';
import Support from '@/components/company/Support';
import { IoReturnUpBack } from 'react-icons/io5';
import { BellIcon } from '@heroicons/react/24/outline';
import BlurIn from '@/components/ui/blur-in';

const DepartmentTable = React.lazy(() => import("@/components/company/DepartmentTable"));
const PositionTable = React.lazy(() => import("@/components/company/PositionTable"));
const EmployeeTable = React.lazy(() => import("@/components/company/EmployeeTable"));
const SurveyQuestionsTab = React.lazy(() => import("@/components/company/SurveyQuestionsTab"));
const ResultTable = React.lazy(() => import("@/components/company/ResultTable"));


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
    const [evaluationResults, setEvaluationResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filteredResults, setFilteredResults] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const isMobile = document.documentElement.clientWidth <= 768;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

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
            if (departmentsData.length > 0 && !selectedDepartment) {
                setSelectedDepartment(departmentsData[0]);
            }
        });

        return () => unsubscribe();
    }, [company?.id, selectedDepartment]);

    const fetchEvaluationResults = useCallback(async () => {
        if (!company?.id) return;

        setIsLoading(true);
        try {
            const functions = getFunctions();
            const calculateAverages = httpsCallable(functions, 'calculateEvaluationAverages');
            const result = await calculateAverages({ companyId: company.id });
            const newResults = result.data;
            setEvaluationResults(newResults);
        } catch (error) {
            console.error('Error al obtener los resultados de evaluación:', error);
            toast.error('Error al cargar los resultados de evaluación');
        } finally {
            setIsLoading(false);
        }
    }, [company?.id]);

    useEffect(() => {
        if (company?.id) {
            fetchEvaluationResults();
        }
    }, [company?.id, fetchEvaluationResults]);

    useEffect(() => {
        if (evaluationResults && selectedDepartment) {
            const departmentEntries = Object.entries(evaluationResults.departmentCategoryAverages || {});
            const filteredDepartmentResults = departmentEntries.find(
                ([key]) => key === selectedDepartment.id
            );

            const employeeEntries = Object.entries(evaluationResults.employeeCategoryAverages || {});
            const filteredEmployeeResults = employeeEntries.filter(
                async ([key]) => {
                    const employeeId = key;
                    const employeeRef = doc(db, `companies/${company?.id}/employees/${employeeId}`);
                    const employeeDoc = await getDoc(employeeRef);
                    const employeeData = employeeDoc.data();
                    return employeeData?.departmentId === selectedDepartment.id;
                }
            );
            setFilteredResults({
                departmentCategoryAverages: filteredDepartmentResults ? {
                    [filteredDepartmentResults[0]]: {
                        Adaptación: (filteredDepartmentResults[1] as any).Adaptación,
                        Aprendizaje: (filteredDepartmentResults[1] as any).Aprendizaje,
                        Comunicación: (filteredDepartmentResults[1] as any).Comunicación,
                        Organización: (filteredDepartmentResults[1] as any).Organización,
                        Responsabilidad: (filteredDepartmentResults[1] as any).Responsabilidad,
                        Liderazgo: (filteredDepartmentResults[1] as any).Liderazgo,
                        Creatividad: (filteredDepartmentResults[1] as any).Creatividad
                    }
                } : {},
                employeeCategoryAverages: filteredEmployeeResults.reduce((acc, [key, value]) => {
                    acc[key] = {
                        Adaptación: (value as any).Adaptación,
                        Aprendizaje: (value as any).Aprendizaje,
                        Comunicación: (value as any).Comunicación,
                        Organización: (value as any).Organización,
                        Responsabilidad: (value as any).Responsabilidad,
                        Liderazgo: (value as any).Liderazgo,
                        Creatividad: (value as any).Creatividad
                    };
                    return acc;
                }, {} as Record<string, any>)
            });
        }
    }, [evaluationResults, selectedDepartment]);

    useEffect(() => {
        if (!company?.id) return;

        const notificationsRef = collection(db, `companies/${company.id}/notifications`);
        const q = query(
            notificationsRef,
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notificationsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Notification[];

            setNotifications(notificationsData);
            setUnreadCount(notificationsData.filter(n => !n.read).length);
        });

        return () => unsubscribe();
    }, [company?.id]);

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

    const handleSetActiveTab = (tab: string) => {
        setActiveTab(tab);
        if (tab === 'evaluationHistory') {
            setSelectedEmployeeId(null);
        }
    };

    const markAsRead = async (notificationId: string) => {
        if (!company?.id) return;

        try {
            await updateDoc(
                doc(db, `companies/${company.id}/notifications`, notificationId),
                { read: true }
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'departments':
                return (
                    <Card className="w-full">
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Departamentos</h2>
                        </CardHeader>
                        <CardBody>
                            <Suspense fallback={<div>Cargando...</div>}>
                                <DepartmentTable companyId={company.id} />
                            </Suspense>
                        </CardBody>
                    </Card>
                );
            case 'positions':
                return (
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Puestos</h2>
                        </CardHeader>
                        <CardBody>
                            <Suspense fallback={<div>Cargando...</div>}>
                                <PositionTable companyId={company.id} />
                            </Suspense>
                        </CardBody>
                    </Card>
                );
            case 'evaluationHistory':
                return (
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Historial de Evaluaciones</h2>
                        </CardHeader>
                        <CardBody>
                            <Suspense fallback={<div>Cargando...</div>}>
                                <EvaluationHistory
                                    selectedEmployeeId={selectedEmployeeId}
                                    setSelectedEmployeeId={setSelectedEmployeeId}
                                    companyId={company.id}
                                    evaluationData={evaluationResults?.employeeCategoryAverages}
                                    isLoading={isLoading}
                                />
                            </Suspense>
                        </CardBody>
                    </Card>
                );
            case 'employees':
                return (
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Empleados</h2>
                        </CardHeader>
                        <CardBody>
                            <Suspense fallback={<div>Cargando...</div>}>
                                <EmployeeTable companyId={company.id} companyName={company.name} />
                            </Suspense>
                        </CardBody>
                    </Card>
                );
            case 'surveyQuestions':
                return (
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Preguntas</h2>
                        </CardHeader>
                        <CardBody>
                            <Suspense fallback={<div>Cargando...</div>}>
                                <SurveyQuestionsTab companyId={company.id} />
                            </Suspense>
                        </CardBody>
                    </Card>
                );
            case 'support':
                return (
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Soporte</h2>
                        </CardHeader>
                        <CardBody>
                            <Suspense fallback={<div>Cargando...</div>}>
                                <Support companyId={company.id} />
                            </Suspense>
                        </CardBody>
                    </Card>
                );
            case 'home':
                return (
                    <div className="grid grid-cols-12 grid-rows-6 gap-2">
                        <Card className="w-full col-span-12 row-span-6 md:col-span-4 md:row-span-1 " >
                            <CardHeader>
                                <h2 className="text-lg font-semibold">Selecciona un departamento</h2>
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

                        {isLoading ? (
                            <Card className="w-full col-span-12 row-span-6 md:col-span-8 md:row-span-3" >
                                <CardHeader>
                                    <h2 className="text-lg font-semibold">Informe de {selectedDepartment?.name || 'Departamento'}</h2>
                                </CardHeader>
                                <CardBody className="overflow-auto h-full flex flex-col md:flex-row gap-2 justify-center items-center">
                                    <Spinner label="Cargando resultados de evaluación..." />
                                </CardBody>
                            </Card>

                        ) : (
                            <Card className="w-full col-span-12 row-span-6 md:col-span-8 md:row-span-3" >
                                <CardHeader>
                                    <h2 className="text-lg font-semibold">Informe de {selectedDepartment?.name || 'Departamento'}</h2>
                                </CardHeader>
                                <CardBody className="overflow-auto h-full flex flex-col md:flex-row gap-2">
                                    <Suspense fallback={<div>Cargando...</div>}>
                                        <RadarCharts data={filteredResults?.departmentCategoryAverages} />
                                        <BarCharts data={filteredResults?.departmentCategoryAverages} />
                                        <LineCharts data={filteredResults?.employeeCategoryAverages} companyId={company.id} />
                                    </Suspense>
                                </CardBody>
                            </Card>
                        )}

                        <Card className="w-full col-span-12 row-span-6 order-4 md:order-none md:col-span-4 md:row-span-4">
                            <CardHeader>
                                <h2 className="text-lg font-semibold">Opciones de Edición</h2>
                            </CardHeader>
                            <CardBody >
                                <div className="flex flex-col gap-4">
                                    <Card
                                        isPressable
                                        shadow="sm"
                                        onPress={() => { setActiveTab('evaluationHistory'); }}
                                    >
                                        <CardBody className="flex flex-row gap-2 items-center">
                                            <div className="flex items-center justify-center h-fit rounded-medium border p-2 bg-default-50 border-default-100">
                                                <FaFileLines size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-medium">Ver Historial de Resultados</p>
                                                <p className="text-small text-default-400">Ver el historial de resultados de la encuesta.</p>
                                            </div>
                                        </CardBody>
                                    </Card>
                                    <Card
                                        isPressable
                                        shadow="sm"
                                        onPress={() => { setActiveTab('employees'); }}
                                    >
                                        <CardBody className="flex flex-row gap-2 items-center">
                                            <div className="flex items-center justify-center h-fit rounded-medium border p-2 bg-default-50 border-default-100">
                                                <FaUsers size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-medium">Editar Empleados</p>
                                                <p className="text-small text-default-400">Editar los datos de los empleados.</p>
                                            </div>
                                        </CardBody>
                                    </Card>
                                    <Card
                                        isPressable
                                        shadow="sm"
                                        onPress={() => { setActiveTab('departments'); }}
                                    >
                                        <CardBody className="flex flex-row gap-2 items-center">
                                            <div className="flex items-center justify-center h-fit rounded-medium border p-2 bg-default-50 border-default-100 ">
                                                <MdGroupWork size={22} />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-medium">Editar Departamentos</p>
                                                <p className="text-small text-default-400">Editar los datos de los departamentos.</p>
                                            </div>
                                        </CardBody>
                                    </Card>
                                    <Card
                                        isPressable
                                        shadow="sm"
                                        onPress={() => { setActiveTab('positions'); }}
                                    >
                                        <CardBody className="flex flex-row gap-2 items-center">
                                            <div className="flex items-center justify-center h-fit rounded-medium border p-2 bg-default-50 border-default-100">
                                                <BsPersonBadgeFill size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-medium">Editar Puestos</p>
                                                <p className="text-small text-default-400">Editar los datos de los puestos.</p>
                                            </div>
                                        </CardBody>
                                    </Card>
                                    <Card
                                        isPressable
                                        shadow="sm"
                                        onPress={() => { setActiveTab('surveyQuestions'); }}
                                    >
                                        <CardBody className="flex flex-row gap-2 items-center">
                                            <div className="flex items-center justify-center h-fit rounded-medium border p-2 bg-default-50 border-default-100">
                                                <FaQuestionCircle size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-medium">Editar Preguntas</p>
                                                <p className="text-small text-default-400">Editar las preguntas de la encuesta.</p>
                                            </div>
                                        </CardBody>
                                    </Card>

                                </div>
                            </CardBody>
                        </Card>

                        <Card className="w-full col-span-12 row-span-6 md:col-span-8 md:row-span-3">
                            <CardHeader>
                                <h2 className="text-lg font-semibold p-0">Tabla de Resultados</h2>
                            </CardHeader>
                            <CardBody className="overflow-auto h-full">
                                <Suspense fallback={<div>Cargando...</div>}>
                                    <ResultTable data={evaluationResults?.employeeCategoryAverages} companyId={company.id} setActiveTab={setActiveTab} setSelectedEmployeeId={setSelectedEmployeeId} />
                                </Suspense>
                            </CardBody>
                        </Card>

                        <Card className="w-full col-span-12 row-span-6 md:col-span-4 md:row-span-1">
                            <CardHeader>
                                <h2 className="text-lg font-semibold">Código de Invitación</h2>
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
                                        <Snippet symbol="" size='md' className='min-w-[80%] md:min-w-[83%] lg:min-w-[90%]' >
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
                );
            default:
                return null;
        }
    };

    if (!company) {
        return <div className='flex justify-center items-center min-h-dvh'>
            <Spinner color="primary" label="Cargando datos..." />
        </div>;
    }
    return (
        <div className="flex min-h-dvh">
            <Sidebar setActiveTab={handleSetActiveTab} />
            <main className="flex-1 flex flex-col overflow-hidden ml-[3.5rem] md:ml-20 p-2 md:p-3">
                <div className="flex flex-col items-center pb-4">
                    <div className="w-full flex justify-between items-center">
                        {activeTab !== 'home' && (
                            <Button
                                color="primary"
                                variant="light"
                                startContent={<IoReturnUpBack size={20} />}
                                isIconOnly={isMobile ? true : false}
                                onPress={() => setActiveTab('home')}
                                size='sm'

                            >
                                <span className="hidden md:block">Volver</span>
                            </Button>
                        )}
                        <BlurIn word={`Panel de Control de ${company.name}`} className="text-lg md:text-xl font-semibold text-center flex-grow" />
                        <Dropdown
                            classNames={{
                                base: "min-h-80 rounded-xl bg-background/95 p-2 shadow-medium backdrop-blur-xl backdrop-saturate-150 dark:bg-default-100/95",
                            }}
                        >
                            <DropdownTrigger>
                                <Button isIconOnly variant="light" size='md'>
                                    <Badge
                                        content={unreadCount}
                                        color="danger"
                                        variant="shadow"
                                        aria-label="Notificaciones"
                                        isInvisible={unreadCount === 0}
                                    >
                                        <BellIcon className='size-6' />
                                    </Badge>
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                variant="light"
                                aria-label="Notificaciones"
                                className="max-h-[400px] overflow-auto"
                            >
                                {notifications.length === 0 ? (
                                    <DropdownItem>No hay notificaciones</DropdownItem>
                                ) : (
                                    notifications.map((notification) => (
                                        <DropdownItem
                                            key={notification.id}
                                            onClick={() => markAsRead(notification.id)}
                                            className={`${!notification.read ? 'bg-default-100' : ''} border-b last:border-b-0 border-default-100 mb-2`}
                                            description={notification.createdAt instanceof Date
                                                ? notification.createdAt.toLocaleString()
                                                : notification.createdAt?.toDate().toLocaleString()
                                            }
                                        >
                                            <div className="flex flex-col gap-1">
                                                <p className="font-semibold">{notification.title}</p>
                                                <p className="text-sm text-default-500">
                                                    {notification.type === 'new_employee' ? (
                                                        notification.message
                                                    ) : notification.type === 'new_evaluation' ? (
                                                        <>
                                                            <span className="font-medium">{notification.evaluatorName}</span>
                                                            {' ha completado una evaluación para '}
                                                            <span className="font-medium">{notification.evaluatedName}</span>
                                                        </>
                                                    ) : notification.message}
                                                </p>
                                            </div>
                                        </DropdownItem>
                                    ))
                                )}
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
                <div className={`w-full ${activeTab === 'home' || activeTab === 'evaluationHistory' || activeTab === 'support' ? 'h-fit' : 'max-w-5xl mx-auto'} flex flex-col shadow-inner rounded-xl dark:shadow-slate-300/20 overflow-x-auto p-3`}>
                    {renderContent()}
                </div>
            </main >
        </div >
    );
}

export default CompanyControlPanel;
