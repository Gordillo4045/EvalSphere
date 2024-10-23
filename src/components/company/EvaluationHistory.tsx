import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Progress, Spinner, Select, SelectItem, Textarea, DatePicker, Button, SharedSelection, Accordion, AccordionItem, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/config/config';
import { Employee } from '@/types/applicaciontypes';
import EvaluationHistoryTable from './EvaluationHistoryTable';
import NumberTicker from '../ui/number-ticker';
import EmployeeEvaluationChart from './EmployeeEvaluationChart';
import { toast } from 'sonner';
import { generateChartData } from '@/utils/chartUtils';
import { DateValue } from "@internationalized/date";
import {
    BookOpenIcon,
    UserGroupIcon,
    BriefcaseIcon,
    StarIcon,
    BanknotesIcon,
    TrophyIcon
} from "@heroicons/react/24/outline";
import { GrActions } from "react-icons/gr";
import { GiExtractionOrb } from "react-icons/gi";

interface EvaluationAverage {
    [category: string]: number;
}

interface EmployeeEvaluation {
    [employeeId: string]: EvaluationAverage;
}

interface ProcessedEmployeeEvaluation {
    id: string;
    name: string;
    avatar: string;
    averages: EvaluationAverage;
    globalPercentage: number;
}

interface EvaluationHistoryProps {
    companyId: string;
    evaluationData: EmployeeEvaluation;
    isLoading: boolean;
    selectedEmployeeId: string | null;
    setSelectedEmployeeId: (id: string | null) => void;
}

interface ActionPlan {
    actionType: string;
    description: string;
    startDate: DateValue | null;
    status: 'pending' | 'in-progress' | 'completed';
}

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

export default function EvaluationHistory({
    companyId,
    evaluationData,
    isLoading,
    selectedEmployeeId,
    setSelectedEmployeeId,
}: EvaluationHistoryProps) {
    const [processedEvaluationData, setProcessedEvaluationData] = useState<ProcessedEmployeeEvaluation[]>([]);
    const [totalEvaluations, setTotalEvaluations] = useState<number>(0);
    const [chartData, setChartData] = useState<any[] | null>(null);
    const [newAction, setNewAction] = useState<ActionPlan>({
        actionType: '',
        description: '',
        startDate: null,
        status: 'pending'
    });
    const [actionPlans, setActionPlans] = useState<Array<{
        id: string;
        actionType: string;
        description: string;
        startDate: string;
        status: string;
    }>>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ id: string, status: string } | null>(null);

    useEffect(() => {
        const processData = async () => {
            try {
                if (!evaluationData) {
                    throw new Error("No se han recibido datos de evaluación");
                }

                const employeesRef = collection(db, `companies/${companyId}/employees`);
                const employeesSnap = await getDocs(employeesRef);
                const totalEmployeesCount = employeesSnap.size;

                const totalEvaluationsCount = totalEmployeesCount * (totalEmployeesCount - 1);
                setTotalEvaluations(totalEvaluationsCount);

                const processedData = await Promise.all(
                    Object.entries(evaluationData).map(async ([id, averages]) => {
                        const employeeRef = doc(db, `companies/${companyId}/employees/${id}`);
                        const employeeSnap = await getDoc(employeeRef);
                        const employeeData = employeeSnap.data() as Employee | undefined;

                        const globalPercentage = Object.values(averages).reduce((sum, value) => sum + value, 0) / Object.keys(averages).length;

                        return {
                            id,
                            name: employeeData?.name || `Empleado ${id}`,
                            avatar: employeeData?.avatar || '',
                            averages,
                            globalPercentage: globalPercentage * 20
                        };
                    })
                );
                setProcessedEvaluationData(processedData);
            } catch (err) {
                console.error("Error al procesar los datos de evaluación:", err);
            }
        };

        processData();
    }, [evaluationData, companyId]);

    useEffect(() => {
        const loadChartData = async () => {
            if (selectedEmployeeId) {

                try {
                    const newChartData = await generateChartData(companyId, selectedEmployeeId);
                    setChartData(newChartData);
                } catch (error) {
                    console.error("Error al obtener datos del gráfico:", error);
                    toast.error("Error al cargar los datos del gráfico");
                }
            } else {
                setChartData(null);
            }
        };

        loadChartData();
    }, [selectedEmployeeId, companyId]);

    useEffect(() => {
        const loadActionPlans = async () => {
            if (!selectedEmployeeId) return;

            try {
                const plansRef = collection(db, `companies/${companyId}/employees/${selectedEmployeeId}/actionPlans`);
                const plansSnap = await getDocs(plansRef);
                const plansData = plansSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setActionPlans(plansData as { id: string; actionType: string; description: string; startDate: string; status: string }[]);
            } catch (error) {
                console.error('Error al cargar planes:', error);
                toast.error('Error al cargar los planes de acción');
            }
        };

        loadActionPlans();
    }, [selectedEmployeeId, companyId]);

    const handleSelectEmployee = async (employeeId: string) => {
        setSelectedEmployeeId(employeeId);
        try {
            const newChartData = await generateChartData(companyId, employeeId);
            setChartData(newChartData);
        } catch (error) {
            console.error("Error al obtener datos del gráfico:", error);
            toast.error("Error al cargar los datos del gráfico");
        }
    };

    const handleSelectChange = (value: string) => {
        const actionType = typeof value === 'string' ? value : Array.from(value)[0]?.toString() || '';
        setNewAction({ ...newAction, actionType });
    };
    const handleSaveAction = async () => {
        try {
            if (newAction.actionType === '' || newAction.description === '' || newAction.startDate === null) {
                toast.error('Todos los campos son requeridos');
                return;
            }

            const actionRef = doc(collection(db, `companies/${companyId}/employees/${selectedEmployeeId}/actionPlans`));
            await setDoc(actionRef, {
                actionType: String(newAction.actionType.toString()),
                description: newAction.description,
                startDate: {
                    day: newAction.startDate.day,
                    month: newAction.startDate.month,
                    year: newAction.startDate.year
                },
                status: newAction.status
            });

            // Recargar los planes inmediatamente después de guardar
            const plansRef = collection(db, `companies/${companyId}/employees/${selectedEmployeeId}/actionPlans`);
            const plansSnap = await getDocs(plansRef);
            const plansData = plansSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Array<{ id: string; actionType: string; description: string; startDate: string; status: string }>;
            setActionPlans(plansData);

            toast.success('Plan de acción guardado exitosamente');
            setNewAction({
                actionType: '',
                description: '',
                startDate: null,
                status: 'pending'
            });
        } catch (error) {
            console.error('Error al guardar el plan:', error);
            toast.error('Error al guardar el plan de acción');
        }
    };

    const handleStatusUpdate = async (planId: string, currentStatus: string) => {
        if (currentStatus === 'completed') {
            toast.info('Esta acción ya está completada');
            return;
        }

        setSelectedPlan({ id: planId, status: currentStatus });
        setIsModalOpen(true);
    };

    const confirmStatusUpdate = async () => {
        if (!selectedPlan) return;

        try {
            const newStatus = selectedPlan.status === 'pending' ? 'in-progress' : 'completed';
            const planRef = doc(db, `companies/${companyId}/employees/${selectedEmployeeId}/actionPlans/${selectedPlan.id}`);
            await setDoc(planRef, { status: newStatus }, { merge: true });

            setActionPlans(prevPlans =>
                prevPlans.map(plan =>
                    plan.id === selectedPlan.id ? { ...plan, status: newStatus } : plan
                )
            );

            toast.success(`Status actualizado a: ${newStatus === 'completed' ? 'Completado' : 'En Progreso'}`);
        } catch (error) {
            console.error('Error al actualizar status:', error);
            toast.error('Error al actualizar el status');
        }

        setIsModalOpen(false);
        setSelectedPlan(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner label="Cargando datos de evaluación..." />
            </div>
        );
    }

    if (processedEvaluationData.length === 0) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-12rem)] text-center p-4 text-muted-foreground dark:text-muted-foreground-dark select-none" aria-live="polite">
                No hay datos de evaluación disponibles.
            </div>
        );
    }

    const averageEvaluation = processedEvaluationData.length > 0
        ? processedEvaluationData.reduce((sum, employee) => sum + employee.globalPercentage, 0) / processedEvaluationData.length
        : 0;
    const completedEvaluations = Object.keys(evaluationData).length;
    const pendingEvaluations = totalEvaluations - completedEvaluations;

    return (
        <div className="container mx-auto p-4 space-y-6" aria-label="Resumen de evaluaciones">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className='flex flex-col justify-between'>
                    <CardHeader>
                        Promedio de Evaluación
                    </CardHeader>
                    <CardBody className='flex flex-col justify-end'>
                        <div className='flex items-center gap-x-2'>
                            <NumberTicker value={averageEvaluation} decimalPlaces={2} className="text-3xl font-bold tabular-nums tracking-tighter" />
                            <span className="text-xl text-gray-500">%</span>
                        </div>
                        <Progress
                            value={averageEvaluation}
                            className="mt-2"
                            size="sm"
                            aria-label={`Barra de progreso del promedio de evaluación: ${averageEvaluation.toFixed(2)}%`}
                        />
                    </CardBody>
                </Card>
                <Card className='flex flex-col justify-between'>
                    <CardHeader>
                        Evaluaciones Completadas
                    </CardHeader>
                    <CardBody className='flex flex-col justify-end'>
                        <NumberTicker value={completedEvaluations} className="text-3xl font-bold" />
                        <div className="text-sm text-gray-500">de {totalEvaluations}</div>
                    </CardBody>
                </Card>
                <Card className='flex flex-col justify-between'>
                    <CardHeader>
                        Evaluaciones en Proceso
                    </CardHeader>
                    <CardBody className='flex flex-col justify-end'>
                        <NumberTicker value={pendingEvaluations} className="text-3xl font-bold" />
                        <div className="text-sm text-gray-500">de {totalEvaluations}</div>
                    </CardBody>
                </Card>
            </div>

            <Card>
                <CardHeader>Detalles de Evaluación</CardHeader>
                <CardBody>
                    <EvaluationHistoryTable
                        companyId={companyId}
                        evaluationData={processedEvaluationData}
                        isLoading={isLoading}
                        selectedEmployeeId={selectedEmployeeId}
                        clearSelectedEmployee={() => {
                            setSelectedEmployeeId(null);
                            setChartData(null);
                        }}
                        onSelectEmployee={handleSelectEmployee}
                    />
                </CardBody>
            </Card>

            {selectedEmployeeId && chartData && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <Card>
                        <CardHeader className='pb-0'>
                            <div className='flex flex-col gap-y-2'>
                                <p>Plan de acción para {processedEvaluationData.find(e => e.id === selectedEmployeeId)?.name || ''}</p>
                                <p className='text-sm'>Puntuación Global: {processedEvaluationData.find(e => e.id === selectedEmployeeId)?.globalPercentage.toFixed(2)}%</p>

                            </div>
                        </CardHeader>
                        <CardBody>
                            <Accordion defaultExpandedKeys={['recomendacion']} className='pt-0 mt-0'>
                                <AccordionItem
                                    key="recomendacion"
                                    aria-label="Recomendación"
                                    indicator={<GrActions />}
                                    title={<p className='text-sm'>Nuevo plan de acción</p>}
                                    subtitle={<p className='text-sm text-gray-500'>Recomendación: {
                                        processedEvaluationData.find(e => e.id === selectedEmployeeId)?.globalPercentage >= 90 ? "Considerar para promoción o bonificación" :
                                            processedEvaluationData.find(e => e.id === selectedEmployeeId)?.globalPercentage >= 75 ? "Buen desempeño, ofrecer oportunidades de desarrollo" :
                                                "Necesita mejora, considerar capacitación adicional"
                                    }</p>} >
                                    <div className='mb-2 space-y-3'>
                                        <Select
                                            required
                                            label="Tipo de Plan de Acción"
                                            variant='underlined'
                                            value={newAction.actionType}
                                            onSelectionChange={handleSelectChange as (keys: SharedSelection) => void}
                                        >
                                            <SelectItem key="capacitacion" value="capacitacion">Capacitación</SelectItem>
                                            <SelectItem key="mentoria" value="mentoria">Mentoría</SelectItem>
                                            <SelectItem key="proyecto" value="Asignacion de Proyecto">Asignación de Proyecto</SelectItem>
                                            <SelectItem key="reconocimiento" value="reconocimiento">Reconocimiento</SelectItem>
                                            <SelectItem key="bonificacion" value="bonificacion">Bonificación</SelectItem>
                                            <SelectItem key="promocion" value="Consideración para Promoción">Consideración para Promoción</SelectItem>
                                        </Select>
                                        <Textarea
                                            value={newAction.description}
                                            onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                                            placeholder="Descripción de la acción"
                                            name="description"
                                            aria-label="Descripción de la acción"
                                            maxRows={5}
                                            variant='underlined'
                                        />
                                        <DatePicker
                                            value={newAction.startDate}
                                            onChange={(date) => setNewAction({ ...newAction, startDate: date })}
                                            label="Fecha de Inicio"
                                            name="startDate"
                                            aria-label="Fecha de Inicio"
                                            variant='underlined'
                                        />
                                        <Button
                                            onClick={handleSaveAction}
                                            color="primary"
                                            variant="shadow"
                                            size='sm'
                                            aria-label="Guardar Plan de Acción">
                                            Guardar Plan de Acción
                                        </Button>
                                    </div>
                                </AccordionItem>
                                <AccordionItem key="actionPlans" aria-label="Planes de Acción" title={<p className='text-sm '>Planes de Acción</p>} indicator={<GiExtractionOrb />}>
                                    <div className="space-y-2">
                                        {actionPlans.length === 0 ? (
                                            <p className="text-sm text-gray-500">No hay planes de acción registrados</p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {actionPlans.map((plan) => (
                                                    <Card
                                                        key={plan.id}
                                                        className="mb-2"
                                                        isPressable
                                                        isHoverable
                                                        onPress={() => handleStatusUpdate(plan.id, plan.status)}
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
                                                                        size='sm'
                                                                        color={
                                                                            plan.status === 'completed' ? 'success' :
                                                                                plan.status === 'in-progress' ? 'warning' :
                                                                                    'danger'
                                                                        }
                                                                    >
                                                                        {plan.status}
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
                                </AccordionItem>
                            </Accordion>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className='flex flex-col gap-y-2'>
                                <p>Gráfico de Evaluación de {processedEvaluationData.find(e => e.id === selectedEmployeeId)?.name || ''}</p>
                                <p className='text-sm text-gray-500'>Resultados por categoría y tipo de evaluador</p>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <EmployeeEvaluationChart
                                data={chartData}
                            />
                        </CardBody>
                    </Card>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedPlan(null);
                }}
                placement='top-center'
            >
                <ModalContent >
                    <ModalHeader className='text-base font-bold '>
                        Actualizar Status
                    </ModalHeader>
                    <ModalBody className='text-sm text-gray-500'>
                        ¿Desea cambiar el status a "{selectedPlan?.status === 'pending' ? 'En Progreso' : 'Completado'}"?
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="danger"
                            variant="light"
                            onPress={() => {
                                setIsModalOpen(false);
                                setSelectedPlan(null);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            color="primary"
                            onPress={confirmStatusUpdate}
                        >
                            Confirmar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}
