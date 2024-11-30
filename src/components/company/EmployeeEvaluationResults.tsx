import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Spinner, Chip } from "@nextui-org/react";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '@/config/config';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { RadarCharts } from '@/components/company/RadarCharts';
import EmployeeEvaluationChart from '@/components/company/EmployeeEvaluationChart';
import { generateChartData } from '@/utils/chartUtils';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, ArrowRight, Notebook, BriefcaseIcon, StarIcon, TrophyIcon, BookOpenIcon } from "lucide-react";
import { BanknotesIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Employee } from '@/types/applicaciontypes';
import { MdFeedback } from 'react-icons/md';
import { FaChartLine } from 'react-icons/fa';
import { GrScorecard } from 'react-icons/gr';
import NumberTicker from '../ui/number-ticker';
import { BarCharts } from './BarCharts';
import BlurIn from '../ui/blur-in';

interface EvaluationResultsProps {
    employeeId: string;
}

interface ActionPlan {
    id: string;
    actionType: string;
    description: string;
    startDate: any;
    status: 'pending' | 'in-progress' | 'completed';
}

export default function EmployeeEvaluationResults({ employeeId }: EvaluationResultsProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [evaluationData, setEvaluationData] = useState<any>(null);
    const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
    const [chartData, setChartData] = useState<any[] | null>(null);
    const [employee, setEmployee] = useState<Employee>(null)
    const [remainingEvaluations, setRemainingEvaluations] = useState<number>(0);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const employeeRef = doc(db, `employees/${employeeId}`);
                const employeeSnap = await getDoc(employeeRef);
                if (employeeSnap.exists()) {
                    const employeeData = employeeSnap.data() as Employee;
                    setEmployee(employeeData)
                    return employeeData.companyId;
                } else {
                    throw new Error('No se encontró el empleado');
                }
            } catch (error) {
                console.error('Error al obtener datos del empleado:', error);
                toast.error('Error al cargar la información del empleado');
                return null;
            }
        };

        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const fetchedCompanyId = await fetchEmployeeData();

                if (!fetchedCompanyId) return;

                const functions = getFunctions();
                const calculateAverages = httpsCallable(functions, 'calculateEvaluationAverages');
                const result = await calculateAverages({ companyId: fetchedCompanyId });

                const data = result.data as any;
                setEvaluationData(data);

                const plansSnapshot = await getDocs(
                    collection(db, `companies/${fetchedCompanyId}/employees/${employeeId}/actionPlans`)
                );
                const plansData = plansSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as ActionPlan[];
                setActionPlans(plansData);

                const chartData = await generateChartData(fetchedCompanyId, employeeId);
                setChartData(chartData);

                const employeeRef = doc(db, 'employees', employeeId);
                const employeeSnap = await getDoc(employeeRef);
                const employeeData = employeeSnap.data();
                const departmentId = employeeData?.departmentId;

                const employeesSnapshot = await getDocs(
                    collection(db, `companies/${fetchedCompanyId}/employees`)
                );
                const departmentEmployees = employeesSnapshot.docs
                    .filter(doc => doc.data().departmentId === departmentId)
                    .length;

                const evaluationsRef = collection(db, `companies/${fetchedCompanyId}/evaluations`);
                const evaluationsQuery = query(evaluationsRef, where("evaluatorId", "==", employeeId));
                const evaluationsSnapshot = await getDocs(evaluationsQuery);
                const evaluationsCompleted = evaluationsSnapshot.docs.length;

                const remaining = departmentEmployees - evaluationsCompleted;
                setRemainingEvaluations(remaining > 0 ? remaining : 0);

            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error('Error al cargar los resultados de la evaluación');
            } finally {
                setIsLoading(false);
            }
        };

        if (employeeId) {
            fetchAllData();
        }
    }, [employeeId]);

    const getActionIcon = (actionType: string) => {
        const iconClass = "w-5 h-5";
        switch (actionType.toLowerCase()) {
            case 'capacitacion':
                return <BookOpenIcon className={iconClass} />;
            case 'mentoria':
                return <UserGroupIcon className={iconClass} />;
            case 'asignacion de proyecto':
                return <BriefcaseIcon className={iconClass} />;
            case 'reconocimiento':
                return <StarIcon className={iconClass} />;
            case 'bonificacion':
                return <BanknotesIcon className={iconClass} />;
            case 'promocion':
                return <TrophyIcon className={iconClass} />;
            default:
                return <BookOpenIcon className={iconClass} />;
        }
    };

    const formatActionType = (actionType: string) => {
        const typeMap: { [key: string]: string } = {
            'capacitacion': 'Capacitación',
            'mentoria': 'Mentoría',
            'asignacion de proyecto': 'Asignación de Proyecto',
            'reconocimiento': 'Reconocimiento',
            'bonificacion': 'Bonificación',
            'promocion': 'Consideración para Promoción'
        };

        return typeMap[actionType.toLowerCase()] || actionType;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner label="Cargando resultados..." />
            </div>
        );
    }

    if (!evaluationData?.employeeCategoryAverages?.[employeeId]) {
        return (
            <div className="text-center p-4">
                No hay resultados de evaluación disponibles.
            </div>
        );
    }

    const employeeAverages = evaluationData.employeeCategoryAverages[employeeId];
    const globalScore = Object.values(employeeAverages)
        .reduce((sum: number, val: any) => sum + Number(val), 0) /
        Object.keys(employeeAverages).length * 20;

    return (
        <div className="container max-w-5xl mx-auto p-4 space-y-2 shadow-inner rounded-xl dark:shadow-slate-300/20">
            <BlurIn word={`Resultados de ${employee.name}`} className="text-lg md:text-2xl font-semibold text-center" />
            <div className="grid grid-cols-2 gap-2">
                <Card className="col-span-1 ">
                    <CardHeader className='flex items-center gap-2'>
                        <GrScorecard size={20} />
                        Puntuación Global
                    </CardHeader>
                    <CardBody>
                        <div className="flex flex-col md:flex-row gap-2 items-center ">
                            <div className="w-30 flex items-center ">
                                <NumberTicker
                                    value={globalScore}
                                    decimalPlaces={2}
                                    className="text-3xl font-bold text-default-700 w-24"
                                />
                                %</div>
                            <Chip
                                size='sm'
                                variant='shadow'
                                color={globalScore >= 80 ? "success" : globalScore >= 60 ? "warning" : "danger"}
                                startContent={
                                    globalScore >= 80 ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : globalScore >= 60 ? (
                                        <ArrowRight className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )
                                }
                                className='md:bottom-4 md:right-4 md:absolute'
                            >
                                {globalScore >= 80 ? "Excelente" : globalScore >= 60 ? "Regular" : "Necesita Mejora"}
                            </Chip>
                        </div>
                    </CardBody>
                </Card>

                <Card className="col-span-1">
                    <CardHeader className='flex items-start md:items-center gap-2'>
                        <UserGroupIcon className="w-5 h-5" />
                        <p className='text-balance'>Evaluaciones <br className='block md:hidden' /> Pendientes</p>

                    </CardHeader>
                    <CardBody>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold">{remainingEvaluations}</span>
                            <span className="text-sm text-gray-500">por evaluar</span>
                        </div>
                    </CardBody>
                </Card>

                <Card className="col-span-2">
                    <CardBody className='flex flex-col md:flex-row gap-2'>
                        <div className='w-full md:w-1/2'>
                            <RadarCharts data={employeeAverages} />
                        </div>
                        <div className='w-full md:w-1/2'>
                            <BarCharts data={employeeAverages} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {chartData && (
                <Card>
                    <CardHeader>
                        <div className='flex flex-col gap-y-2'>
                            <p className='flex items-center gap-2'><FaChartLine size={20} />Gráfico de Evaluación de {employee?.name || ''}</p>
                            <p className='text-sm text-gray-500'>Resultados por categoría y tipo de evaluador</p>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <EmployeeEvaluationChart data={chartData} />
                    </CardBody>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Card>
                    <CardHeader className="flex gap-2 items-center">
                        <Notebook className="w-5 h-5" />
                        Planes de Acción Asignados
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-2">
                            {actionPlans.length === 0 ? (
                                <p className="text-sm text-gray-500">No hay planes de acción registrados </p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {actionPlans.map((plan) => (
                                        <Card
                                            key={plan.id}
                                            className="mb-1"
                                            isHoverable
                                        >
                                            <CardBody className="p-3">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-2">
                                                            {getActionIcon(plan.actionType)}
                                                            <p className="font-medium">{formatActionType(plan.actionType)}</p>
                                                        </div>
                                                        <Chip
                                                            className="capitalize"
                                                            variant='dot'
                                                            size='sm'
                                                            color={
                                                                plan.status === 'completed' ? 'success' :
                                                                    plan.status === 'in-progress' ? 'warning' :
                                                                        'danger'
                                                            }
                                                        >
                                                            {plan.status === 'completed' ? 'Completado' : plan.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                                                        </Chip>
                                                    </div>
                                                    <p className="text-xs">{plan.description}</p>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                <Card className='overflow-y-auto h-80'>
                    <CardHeader>
                        <div className='flex flex-col gap-y-2'>
                            <p className='flex items-center gap-2'><MdFeedback size={20} />Comentarios para {employee?.name || ''}</p>
                            <p className='text-sm text-gray-500'>Comentarios de evaluadores</p>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {evaluationData.commentsByEmployee[employeeId]?.map((comment: any, index: number) => (
                            <Card key={index} className="mb-4" isHoverable>
                                <CardBody className="p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-sm font-medium text-primary">
                                                {comment.evaluatorName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className='flex items-center gap-1 w-full'>
                                            <p className="text-sm font-medium">{comment.evaluatorName}</p> ·
                                            <p className="text-xs text-gray-500">{comment.relationship}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {comment.comment}
                                    </p>
                                </CardBody>
                            </Card>
                        ))}
                        {(!evaluationData.commentsByEmployee[employeeId] ||
                            evaluationData.commentsByEmployee[employeeId].length === 0) && (
                                <p className="text-center text-gray-500">
                                    No hay comentarios disponibles
                                </p>
                            )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
