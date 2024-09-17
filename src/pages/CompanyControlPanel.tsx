import { useState, useEffect } from 'react';
import { Tabs, Tab, Card, CardBody, Spinner } from "@nextui-org/react";
import DepartmentTable from "../components/company/DepartmentTable";
import PositionTable from "../components/company/PositionTable";
import EmployeeTable from "../components/company/EmployeeTable";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/config';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Company } from '../types/applicaciontypes';
import SurveyQuestionsTab from '../components/company/SurveyQuestionsTab';

function CompanyControlPanel() {
    const [company, setCompany] = useState<Company | null>(null);
    const { user, isCompany, loading } = useAuth();
    const navigate = useNavigate();

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

    if (loading) {
        return <div className='flex justify-center items-center min-h-dvh'>
            <Spinner color="primary" label="Cargando..." />
        </div>;
    }

    if (!company) {
        return <div className='flex justify-center items-center min-h-dvh'>
            <Spinner color="primary" label="Cargando datos..." />
        </div>;
    }

    return (
        <div className="w-full min-h-dvh px-4 md:px-0 md:mx-auto">
            <h1 className="text-xl font-semibold mb-4 text-center">Panel de Control de {company.name}</h1>
            <div className="flex flex-col p-4 max-w-5xl mx-auto shadow-inner rounded-xl overflow-x-auto">
                <Tabs aria-label="Opciones" className='pl-1' >
                    <Tab key="departments" title="Departamentos">
                        <Card >
                            <CardBody>
                                <DepartmentTable companyId={company.id} />
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="positions" title="Posiciones">
                        <Card>
                            <CardBody>
                                <PositionTable companyId={company.id} />
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="employees" title="Empleados">
                        <Card>
                            <CardBody>
                                <EmployeeTable companyId={company.id} companyName={company.name} />
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="surveyQuestions" title="Preguntas de Encuesta">
                        <SurveyQuestionsTab companyId={company.id} />
                    </Tab>
                </Tabs>

            </div>
        </div>
    );
}

export default CompanyControlPanel;