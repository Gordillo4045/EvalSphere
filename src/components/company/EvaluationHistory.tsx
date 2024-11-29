import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Progress, Spinner, Select, SelectItem, Textarea, DatePicker, Button, SharedSelection, Accordion, AccordionItem, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/config/config';
import { Employee, Position } from '@/types/applicaciontypes';
import EvaluationHistoryTable from './EvaluationHistoryTable';
import NumberTicker from '@/components/ui/number-ticker';
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
import { RadarCharts } from './RadarCharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import { BadgePlus, Notebook } from 'lucide-react';

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
    position: string;
}

interface QuestionDetail {
    evaluatorId: string;
    evaluatorName: string;
    question: string;
    relationship: string;
    score: number;
    evaluatorPosition: string;
    evaluatedPosition: string;
}

interface QuestionDetails {
    [employeeId: string]: {
        [questionId: string]: QuestionDetail[];
    };
}

interface EvaluationHistoryProps {
    companyId: string;
    evaluationData: {
        employeeCategoryAverages: EmployeeEvaluation;
        departmentCategoryAverages: any;
        evaluationStats: {
            completed: number;
            inProgress: number;
            total: number;
        };
        questionDetails: QuestionDetails;
    };
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
                if (!evaluationData?.employeeCategoryAverages) {
                    throw new Error("No se han recibido datos de evaluación");
                }

                const processedData = await Promise.all(
                    Object.entries(evaluationData.employeeCategoryAverages).map(async ([id, averages]) => {
                        const employeeRef = doc(db, `companies/${companyId}/employees/${id}`);
                        const employeeSnap = await getDoc(employeeRef);
                        const employeeData = employeeSnap.data() as Employee | undefined;

                        const globalPercentage = Object.values(averages).reduce((sum, value) => sum + value, 0) / Object.keys(averages).length;

                        const positionRef = doc(db, `companies/${companyId}/departments/${employeeData?.departmentId}/positions/${employeeData?.positionId}`);
                        const positionSnap = await getDoc(positionRef);
                        const positionData = positionSnap.data() as Position | undefined;

                        if (!positionData) {
                            toast.error('Error al cargar los datos de la posición');
                            throw new Error(`No se encontró la posición para el empleado ${id}`);
                        }

                        return {
                            id,
                            name: employeeData?.name || `Empleado ${id}`,
                            avatar: employeeData?.avatar || '',
                            averages,
                            position: positionData.title,
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
    }, [evaluationData?.employeeCategoryAverages, companyId]);

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

    const generatePDF = async () => {
        if (!selectedEmployeeId || !chartData) return;

        try {
            const loadingToast = toast.loading('Generando PDF...');

            // Crear un contenedor temporal para el reporte
            const reportContainer = document.createElement('div');
            reportContainer.style.width = '800px';
            reportContainer.style.padding = '20px';
            reportContainer.style.backgroundColor = 'white';
            reportContainer.style.color = 'black';

            // Crear un contenedor temporal para el radar chart
            const tempRadarContainer = document.createElement('div');
            tempRadarContainer.style.width = '400px';
            tempRadarContainer.style.height = '400px';
            tempRadarContainer.style.position = 'absolute';
            tempRadarContainer.style.left = '-9999px';
            document.body.appendChild(tempRadarContainer);

            // Renderizar el radar chart en el contenedor temporal
            const radarData = processedEvaluationData.find(e => e.id === selectedEmployeeId)?.averages || {};
            const root = createRoot(tempRadarContainer);
            root.render(
                <RadarCharts
                    data={radarData}
                    forceColors={{
                        text: 'black',
                        grid: 'rgba(60,179,113,0.2)',
                        labels: 'black'
                    }}
                />
            );

            // Esperar a que el radar chart se renderice
            await new Promise(resolve => setTimeout(resolve, 500));

            // Capturar el radar chart
            const radarCanvas = await html2canvas(tempRadarContainer, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: 'white'
            });

            // Crear el contenido del reporte
            reportContainer.innerHTML = `
                <div style="font-family: Arial, sans-serif; color: black;">
                    <!-- Primera página -->
                    <div style="page-break-after: always;">
                        <h1 style="text-align: center; margin-bottom: 20px; color: black;">Reporte de Evaluación</h1>
                        <div style="margin-bottom: 10px;">
                            <p style="margin: 5px 0; color: black;">Empleado: ${processedEvaluationData.find(e => e.id === selectedEmployeeId)?.name}</p>
                            <p style="margin: 5px 0; color: black;">Puntuación Global: ${processedEvaluationData.find(e => e.id === selectedEmployeeId)?.globalPercentage.toFixed(2)}%</p>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background-color: #2980b9; color: white;">
                                        <th style="padding: 8px; text-align: left;">Categoría</th>
                                        <th style="padding: 8px; text-align: left;">Puntuación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(radarData)
                    .map(([category, score]) => `
                                            <tr style="border-bottom: 1px solid #ddd;">
                                                <td style="padding: 8px; color: black;">${category}</td>
                                                <td style="padding: 8px; color: black;">${score.toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                </tbody>
                            </table>
                            <img src="${radarCanvas.toDataURL()}" style="width: 100%; height: auto;" />
                        </div>
                        <h2 style="margin: 20px 0 10px; color: black;">Gráfico de evaluación por categoría y tipo de evaluador</h2>
                        <div id="lineChartContainer" style="margin: 20px 0;"></div>

                        <h2 style="margin-bottom: 10px; color: black;">Planes de Acción</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #2980b9; color: white;">
                                    <th style="padding: 8px; text-align: left;">Tipo</th>
                                    <th style="padding: 8px; text-align: left;">Descripción</th>
                                    <th style="padding: 8px; text-align: left;">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${actionPlans.map(plan => `
                                    <tr style="border-bottom: 1px solid #ddd;">
                                        <td style="padding: 8px; color: black;">${formatActionType(plan.actionType)}</td>
                                        <td style="padding: 8px; color: black;">${plan.description}</td>
                                        <td style="padding: 8px; color: black;">${plan.status === 'completed' ? 'Completado' :
                            plan.status === 'in-progress' ? 'En Progreso' : 'Pendiente'
                        }</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Segunda página -->
                    <div>
                        <h2 style="margin: 20px 0 10px; color: black; text-align: center;">Detalle de Calificaciones por Pregunta</h2>
                        <div style="margin-bottom: 20px;">
                            ${Object.entries(evaluationData.questionDetails[selectedEmployeeId] || {})
                    .map(([, details], index) => `
                                    <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                                        <p style="margin: 5px 0; color: black; font-weight: bold; background-color: #f8f9fa; padding: 8px;">
                                            ${index + 1}. ${details[0]?.question}
                                        </p>
                                        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                                            <thead>
                                                <tr style="background-color: #f8f9fa;">
                                                    <th style="padding: 8px; text-align: left; color: black; border: 1px solid #ddd;">Evaluador</th>
                                                    <th style="padding: 8px; text-align: left; color: black; border: 1px solid #ddd;">Posición</th>
                                                    <th style="padding: 8px; text-align: left; color: black; border: 1px solid #ddd;">Relación</th>
                                                    <th style="padding: 8px; text-align: center; color: black; border: 1px solid #ddd;">Calificación</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${details.map(detail => `
                                                    <tr>
                                                        <td style="padding: 8px; color: black; border: 1px solid #ddd;">${detail.evaluatorName}</td>
                                                        <td style="padding: 8px; color: black; border: 1px solid #ddd;">${detail.evaluatorPosition}</td>
                                                        <td style="padding: 8px; color: black; border: 1px solid #ddd;">${detail.relationship}</td>
                                                        <td style="padding: 8px; text-align: center; color: black; border: 1px solid #ddd;">${detail.score}</td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                </div>
            `;

            // Agregar el contenedor al documento
            document.body.appendChild(reportContainer);

            // Clonar y modificar el gráfico de líneas
            const originalChart = document.querySelector('#employeeChart');
            if (originalChart) {
                const chartClone = originalChart.cloneNode(true) as HTMLElement;

                // Forzar colores oscuros para el texto del gráfico
                chartClone.querySelectorAll('text').forEach(text => {
                    text.style.fill = 'black';
                });

                // Forzar colores oscuros para los ejes
                chartClone.querySelectorAll('.domain, .tick line').forEach(element => {
                    (element as SVGElement).style.stroke = 'black';
                });

                reportContainer.querySelector('#lineChartContainer')?.appendChild(chartClone);
            }

            // Esperar a que todo se renderice
            await new Promise(resolve => setTimeout(resolve, 500));

            // Capturar todo el reporte
            const canvas = await html2canvas(reportContainer, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: 'white'
            });

            // Crear el PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            // Añadir la imagen al PDF
            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                0,
                0,
                canvas.width,
                canvas.height
            );

            // Descargar el PDF directamente
            const employeeName = processedEvaluationData.find(e => e.id === selectedEmployeeId)?.name.replace(/\s+/g, '_');
            pdf.save(`evaluacion_${employeeName}.pdf`);

            // Limpiar
            document.body.removeChild(reportContainer);
            document.body.removeChild(tempRadarContainer);

            toast.dismiss(loadingToast);
            toast.success('PDF descargado correctamente');

        } catch (error) {
            console.error('Error al generar PDF:', error);
            toast.error('Error al generar el PDF');
        }
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

    return (
        <div className="container mx-auto p-0 md:p-4 space-y-6" aria-label="Resumen de evaluaciones">
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
                        <NumberTicker value={evaluationData?.evaluationStats?.completed || 0} className="text-3xl font-bold" />
                        <div className="text-sm text-gray-500">de {evaluationData?.evaluationStats?.total || 0}</div>
                    </CardBody>
                </Card>
                <Card className='flex flex-col justify-between'>
                    <CardHeader>
                        Evaluaciones en Proceso
                    </CardHeader>
                    <CardBody className='flex flex-col justify-end'>
                        <NumberTicker value={evaluationData?.evaluationStats?.inProgress || 0} className="text-3xl font-bold" />
                        <div className="text-sm text-gray-500">de {evaluationData?.evaluationStats?.total || 0}</div>
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
                        onExport={generatePDF}
                    />

                </CardBody>
            </Card>

            {selectedEmployeeId && chartData && (
                <>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <Card>
                            <CardHeader className='pb-0'>
                                <div className='flex flex-col gap-y-2'>
                                    <p>Plan de acción para {processedEvaluationData.find(e => e.id === selectedEmployeeId)?.name || ''}</p>
                                    <p className='text-sm'>Puntuación Global: {processedEvaluationData.find(e => e.id === selectedEmployeeId)?.globalPercentage.toFixed(2)}%</p>

                                </div>
                            </CardHeader>
                            <CardBody>
                                <Accordion defaultExpandedKeys={['actionPlans']} className='pt-0 mt-0'>
                                    <AccordionItem
                                        key="recomendacion"
                                        aria-label="Recomendación"
                                        indicator={<GrActions />}
                                        title={<p className='text-sm'>Nuevo plan de acción</p>}
                                        subtitle={<p className='text-sm text-gray-500'>Recomendación: {
                                            processedEvaluationData.find(e => e.id === selectedEmployeeId)?.globalPercentage >= 90 ? "Considerar para promoción o bonificación" :
                                                processedEvaluationData.find(e => e.id === selectedEmployeeId)?.globalPercentage >= 75 ? "Buen desempeño, ofrecer oportunidades de desarrollo" :
                                                    "Necesita mejora, considerar capacitación adicional"
                                        }</p>}
                                        startContent={<BadgePlus size={20} />}
                                    >
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
                                    <AccordionItem key="actionPlans" aria-label="Planes de Acción" title={<p className='text-sm '>Planes de Acción</p>} indicator={<GiExtractionOrb />} startContent={<Notebook size={20} />
                                    }>
                                        <div className="space-y-2">
                                            {actionPlans.length === 0 ? (
                                                <p className="text-sm text-gray-500">No hay planes de acción registrados </p>
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
                        <Card className='md:col-span-2'>
                            <CardHeader>
                                <div className='flex flex-col gap-y-2'>
                                    <p>Detalles de la evaluación para {processedEvaluationData.find(e => e.id === selectedEmployeeId)?.name || ''}</p>
                                    <p className='text-sm text-gray-500'>Resultados por pregunta y evaluador</p>
                                </div>
                            </CardHeader>
                            <CardBody>
                                {selectedEmployeeId && evaluationData?.questionDetails?.[selectedEmployeeId] && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Columna izquierda */}
                                        <div className="space-y-4">
                                            {Object.entries(evaluationData.questionDetails[selectedEmployeeId])
                                                .filter((_, index) => index % 2 === 0)
                                                .map(([questionId, details], index) => (
                                                    <Accordion
                                                        key={questionId}
                                                        className="w-full"
                                                        selectionMode="multiple"
                                                        variant="splitted"
                                                    >
                                                        <AccordionItem
                                                            key={questionId}
                                                            aria-label={details[0]?.question}
                                                            title={
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium text-sm text-primary">
                                                                            {index * 2 + 1}.
                                                                        </span>
                                                                        <p className="text-sm font-medium">{details[0]?.question}</p>
                                                                    </div>
                                                                    <div className="flex gap-2 ml-5">
                                                                        {Array.from(new Set(details.map(d => d.relationship))).map(rel => (
                                                                            <Chip
                                                                                key={rel}
                                                                                size="sm"
                                                                                variant="flat"
                                                                                color={
                                                                                    rel === 'Jefe' ? 'primary' :
                                                                                        rel === 'Subordinados' ? 'secondary' :
                                                                                            rel === 'Companeros' ? 'success' : 'warning'
                                                                                }
                                                                            >
                                                                                {rel}
                                                                            </Chip>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            }
                                                        >
                                                            <div className=" grid grid-cols-1 lg:grid-cols-3 gap-2">
                                                                {details.map((detail: QuestionDetail, idx: number) => (
                                                                    <Card key={`${detail.evaluatorId}-${idx}`} className="py-2">
                                                                        <div className="flex justify-evenly items-center flex-col gap-2 w-full">
                                                                            <div className="flex flex-col px-2 w-full">
                                                                                <div className="flex gap-1 items-center flex-row ">
                                                                                    <span className="text-sm font-medium">{detail.evaluatorName}</span> ·
                                                                                    <span className="text-xs text-gray-500">{detail.relationship}</span>
                                                                                </div>
                                                                                <span className="text-xs text-gray-500">{detail.evaluatorPosition}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-sm">
                                                                                <span className='text-gray-600 font-medium'>Calificación:</span> {detail.score}
                                                                            </div>
                                                                        </div>
                                                                    </Card>
                                                                ))}
                                                            </div>
                                                        </AccordionItem>
                                                    </Accordion>
                                                ))}
                                        </div>

                                        {/* Columna derecha */}
                                        <div className="space-y-4">
                                            {Object.entries(evaluationData.questionDetails[selectedEmployeeId])
                                                .filter((_, index) => index % 2 === 1)
                                                .map(([questionId, details], index) => (
                                                    <Accordion
                                                        key={questionId}
                                                        className="w-full"
                                                        selectionMode="multiple"
                                                        variant="splitted"
                                                    >
                                                        <AccordionItem
                                                            key={questionId}
                                                            aria-label={details[0]?.question}
                                                            title={
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium text-sm text-primary">
                                                                            {index * 2 + 2}.
                                                                        </span>
                                                                        <p className="text-sm font-medium">{details[0]?.question}</p>
                                                                    </div>
                                                                    <div className="flex gap-2 ml-5">
                                                                        {Array.from(new Set(details.map(d => d.relationship))).map(rel => (
                                                                            <Chip
                                                                                key={rel}
                                                                                size="sm"
                                                                                variant="flat"
                                                                                color={
                                                                                    rel === 'Jefe' ? 'primary' :
                                                                                        rel === 'Subordinados' ? 'secondary' :
                                                                                            rel === 'Companeros' ? 'success' : 'warning'
                                                                                }
                                                                            >
                                                                                {rel}
                                                                            </Chip>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            }
                                                        >
                                                            <div className=" grid grid-cols-1 lg:grid-cols-3 gap-2">
                                                                {details.map((detail: QuestionDetail, idx: number) => (
                                                                    <Card key={`${detail.evaluatorId}-${idx}`} className="py-2">
                                                                        <div className="flex justify-evenly items-center flex-col gap-2 w-full">
                                                                            <div className="flex flex-col px-2 w-full">
                                                                                <div className="flex gap-1 items-center flex-row ">
                                                                                    <span className="text-sm font-medium">{detail.evaluatorName}</span> ·
                                                                                    <span className="text-xs text-gray-500">{detail.relationship}</span>
                                                                                </div>
                                                                                <span className="text-xs text-gray-500">{detail.evaluatorPosition}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-sm">
                                                                                <span className='text-gray-600 font-medium'>Calificación:</span> {detail.score}
                                                                            </div>
                                                                        </div>
                                                                    </Card>
                                                                ))}
                                                            </div>
                                                        </AccordionItem>
                                                    </Accordion>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    {/* RadarChart oculto para el PDF */}
                    <div
                        id="radarChart"
                        style={{
                            display: 'none',
                            width: '600px',
                            height: '300px'
                        }}
                    >
                        <RadarCharts
                            data={processedEvaluationData.find(e => e.id === selectedEmployeeId)?.averages || {}}
                        />
                    </div>
                </>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedPlan(null);
                }}
                placement='top-center'
                scrollBehavior='outside'
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
