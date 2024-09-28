import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Select, SelectItem, Spinner } from "@nextui-org/react";
import DepartmentTable from "../components/company/DepartmentTable";
import PositionTable from "../components/company/PositionTable";
import EmployeeTable from "../components/company/EmployeeTable";
import { collection, doc, getDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../config/config';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Company, Department } from '../types/applicaciontypes';
import SurveyQuestionsTab from '../components/company/SurveyQuestionsTab';
import RadarCharts from '../components/company/RadarCharts';
import Sidebar from '../components/Sidebar';
import BarCharts from '../components/company/BarCharts';

function CompanyControlPanel() {
    const [company, setCompany] = useState<Company | null>(null);
    const { user, isCompany, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string>('home');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

    useEffect(() => {
        const fetchCompanyData = async () => {
            if (user && isCompany) {
                try {
                    const companyRef = doc(db, 'companies', user.uid);
                    const companySnap = await getDoc(companyRef);
                    if (companySnap.exists()) {
                        setCompany({ id: companySnap.id, ...companySnap.data() } as Company);
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

    if (!company) {
        return <div className='flex justify-center items-center min-h-dvh'>
            <Spinner color="primary" label="Cargando datos..." />
        </div>;
    }

    return (
        <div className="flex min-h-dvh">
            <Sidebar setActiveTab={setActiveTab} />
            <main className="flex-1 flex flex-col overflow-hidden ml-20 p-5">
                <h1 className="text-xl font-semibold p-4 text-center">Panel de Control de {company.name}</h1>
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
                            <Card className="w-full col-span-12 row-span-6 md:col-span-4 md:row-span-5">
                                <CardHeader>
                                    <h2 className="text-xl font-semibold">Aqui k</h2>
                                </CardHeader>
                                <CardBody className="overflow-auto h-full">
                                </CardBody>
                            </Card>

                            <Card className="w-full col-span-12 row-span-6 md:col-span-8 md:row-span-3">
                                <CardHeader>
                                    <h2 className="text-xl font-semibold">Tabla de Resultados</h2>
                                </CardHeader>
                                <CardBody className="overflow-auto h-full">
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