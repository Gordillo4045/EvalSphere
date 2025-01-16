import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Spinner, Select, SelectItem, Textarea, DatePicker, Button, SharedSelection, Accordion, AccordionItem, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ScrollShadow } from "@heroui/react";
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
import QuestionDetailsTable from './QuestionDetailsTable';
import { TrendingUp, TrendingDown, ArrowRight, Clock, Users, CheckCircle2, AlertCircle } from "lucide-react";

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
    category: string;
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
        commentsByEmployee: Record<string, Comment[]>;
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

interface Comment {
    evaluatorName: string;
    comment: string;
    relationship?: string;
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



            // Crear un contenedor temporal para el reporte con mejor formato
            const reportContainer = document.createElement('div');
            reportContainer.style.width = '800px';
            reportContainer.style.padding = '40px';
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

            reportContainer.innerHTML = `
                <div style="font-family: Arial, sans-serif; color: black;">
                    <!-- Portada -->
                    <div style="page-break-after: always; text-align: center; padding: 40px 20px;">
                        <h1 style="font-size: 28px; color: #2980b9; margin-bottom: 30px;">Reporte de Evaluación de Desempeño</h1>
                        <div style="margin: 40px 0; padding: 20px; border: 2px solid #2980b9; border-radius: 8px;">
                            <p style="font-size: 20px; margin: 10px 0;">Empleado: ${processedEvaluationData.find(e => e.id === selectedEmployeeId)?.name}</p>
                            <p style="font-size: 18px; color: #666;">Posición: ${processedEvaluationData.find(e => e.id === selectedEmployeeId)?.position}</p>
                            <p style="font-size: 24px; margin-top: 20px; color: #2980b9;">
                                Puntuación Global: ${processedEvaluationData.find(e => e.id === selectedEmployeeId)?.globalPercentage.toFixed(2)}%
                            </p>
                        </div>
                        <p style="color: #666; font-style: italic; margin-top: 40px;">
                            Fecha de generación: ${new Date().toLocaleDateString()}
                        </p>
                    </div>

                    <!-- Resumen de Evaluación -->
                    <div style="page-break-after: always;">
                        <h2 style="color: #2980b9; border-bottom: 2px solid #2980b9; padding-bottom: 10px; margin-bottom: 20px;">
                            Resumen de Evaluación
                        </h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start;">
                            <div>
                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                    <thead>
                                        <tr style="background-color: #2980b9;">
                                            <th style="padding: 12px; text-align: left; color: white; font-size: 14px;">Categoría</th>
                                            <th style="padding: 12px; text-align: center; color: white; font-size: 14px;">Puntuación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${Object.entries(radarData)
                    .map(([category, score]) => `
                                                <tr style="border-bottom: 1px solid #eee;">
                                                    <td style="padding: 12px; color: #444; font-size: 14px;">${category}</td>
                                                    <td style="padding: 12px; text-align: center; color: #444; font-size: 14px;">
                                                        <span style="
                                                            color: #1e293b;
                                                            border-radius: 4px;
                                                            display: inline-flex;
                                                            align-items: center;
                                                            justify-content: center;
                                                            min-width: 45px;
                                                            text-align: center;
                                                        ">
                                                            ${score.toFixed(2)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            <img src="${radarCanvas.toDataURL()}" style="width: 100%; height: auto;" />
                        </div>
                    </div>

                    <!-- Planes de Acción -->
                    <div style="page-break-after: always;">
                        <h2 style="color: #2980b9; border-bottom: 2px solid #2980b9; padding-bottom: 10px; margin-bottom: 20px;">
                            Planes de Acción
                        </h2>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                                <tr style="background-color: #2980b9;">
                                    <th style="padding: 12px; text-align: left; color: white; width: 20%;">Tipo</th>
                                    <th style="padding: 12px; text-align: left; color: white;">Descripción</th>
                                    <th style="padding: 12px; text-align: center; color: white; width: 15%;">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${actionPlans.map(plan => `
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 12px; color: #444;">${formatActionType(plan.actionType)}</td>
                                        <td style="padding: 12px; color: #444;">${plan.description}</td>
                                        <td style="padding: 12px; text-align: center;">
                                            <span style="
                                                color: #1e293b;
                                                border-radius: 4px;
                                                font-size: 12px;
                                                display: inline-flex;
                                                align-items: center;
                                                justify-content: center;
                                                min-width: 45px;
                                                text-align: center;
                                            ">
                                                ${plan.status === 'completed' ? 'Completado' :
                            plan.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
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

            // Crear el PDF con orientación vertical y tamaño A4
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            // Configurar fuentes y estilos base
            pdf.setFont('helvetica');
            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);

            const addQuestionDetailsPages = async () => {
                const questionDetails = evaluationData.questionDetails[selectedEmployeeId] || {};
                const questionsPerPage = 3;
                const questions = Object.entries(questionDetails);
                const totalPages = Math.ceil(questions.length / questionsPerPage);

                // Definir márgenes de página
                const margin = {
                    top: 80,
                    right: 80,
                    bottom: 80,
                    left: 80
                };

                // Calcular el ancho útil de la página
                const pageWidth = pdf.internal.pageSize.width;
                const pageHeight = pdf.internal.pageSize.height;
                const contentWidth = pageWidth - margin.left - margin.right;

                for (let pageNum = 0; pageNum < totalPages; pageNum++) {
                    pdf.addPage();

                    // Título principal (ajustado con margen)
                    pdf.setFontSize(45);
                    pdf.setTextColor(0, 136, 204);
                    pdf.text('Detalle de Evaluación por Pregunta', margin.left, margin.top);

                    // Información de página
                    pdf.setFontSize(25);
                    pdf.setTextColor(102, 102, 102);
                    pdf.text(`Página ${pageNum + 1} de ${totalPages}`, margin.left, margin.top + 20);

                    const pageQuestions = questions.slice(
                        pageNum * questionsPerPage,
                        (pageNum + 1) * questionsPerPage
                    );

                    let yPosition = margin.top + 35;

                    for (const [, details] of pageQuestions) {
                        // Contenedor de la pregunta con fondo (ajustado con márgenes)
                        pdf.setFillColor(247, 248, 249);
                        pdf.roundedRect(
                            margin.left,
                            yPosition - 5,
                            contentWidth,
                            35,
                            3,
                            3,
                            'F'
                        );

                        // Número de pregunta con círculo (ajustado con margen)
                        pdf.setFillColor(0, 136, 204);
                        pdf.circle(margin.left + 15, yPosition + 12, 12, 'F');
                        pdf.setTextColor(255, 255, 255);
                        pdf.setFontSize(16);
                        pdf.text('P', margin.left + 11, yPosition + 17);

                        // Texto de la pregunta (ajustado con margen)
                        pdf.setTextColor(68, 68, 68);
                        pdf.setFontSize(40);
                        pdf.setFont('helvetica', 'bold');

                        const questionText = details[0]?.question || '';
                        const maxWidth = contentWidth - 60; // Ancho máximo ajustado
                        const lines = pdf.splitTextToSize(questionText, maxWidth);
                        pdf.text(lines, margin.left + 35, yPosition + 15);

                        const lineHeight = 10;
                        yPosition += Math.max(40, lines.length * lineHeight);

                        // Tabla ajustada con márgenes
                        const headers = ['Evaluador', 'Posición', 'Relación', 'Calificación'];
                        const tableWidth = contentWidth - 100; // Ancho total de la tabla
                        const columnWidths = [
                            tableWidth * 0.25, // 25% para Evaluador
                            tableWidth * 0.35, // 35% para Posición
                            tableWidth * 0.25, // 25% para Relación
                            tableWidth * 0.15  // 15% para Calificación
                        ];
                        const startX = margin.left + 50; // Inicio de la tabla con margen
                        const rowHeight = 70;

                        // Encabezados
                        headers.forEach((header, index) => {
                            let x = startX;
                            for (let i = 0; i < index; i++) {
                                x += columnWidths[i];
                            }
                            pdf.setFillColor(0, 136, 204);
                            pdf.setTextColor(255, 255, 255);
                            pdf.rect(x, yPosition, columnWidths[index], rowHeight, 'F');

                            pdf.setFontSize(31);
                            pdf.setFont('helvetica', 'bold');
                            const textWidth = pdf.getStringUnitWidth(header) * 26 / pdf.internal.scaleFactor;
                            const xOffset = (columnWidths[index] - textWidth) / 2;
                            pdf.text(header, x + xOffset, yPosition + (rowHeight / 2) + 3);
                        });
                        yPosition += rowHeight;

                        // Filas de datos
                        details.forEach((detail, idx) => {
                            pdf.setTextColor(68, 68, 68);
                            let x = startX;

                            if (idx % 2 === 0) {
                                pdf.setFillColor(245, 245, 245);
                                pdf.rect(x, yPosition, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
                            }

                            pdf.setFontSize(35);
                            pdf.setFont('helvetica', 'normal');

                            const centerTextInCell = (text: string, cellX: number, cellWidth: number) => {
                                const textWidth = pdf.getStringUnitWidth(text) * 30 / pdf.internal.scaleFactor;
                                const xOffset = (cellWidth - textWidth) / 2;
                                return cellX + xOffset;
                            };

                            const evaluatorName = detail.evaluatorName.substring(0, 30);
                            pdf.text(evaluatorName, centerTextInCell(evaluatorName, x, columnWidths[0]), yPosition + (rowHeight / 2) + 3);
                            x += columnWidths[0];

                            const position = detail.evaluatorPosition.substring(0, 30);
                            pdf.text(position, centerTextInCell(position, x, columnWidths[1]), yPosition + (rowHeight / 2) + 3);
                            x += columnWidths[1];

                            pdf.text(detail.relationship, centerTextInCell(detail.relationship, x, columnWidths[2]), yPosition + (rowHeight / 2) + 3);
                            x += columnWidths[2];

                            pdf.text(detail.score.toString(), centerTextInCell(detail.score.toString(), x, columnWidths[3]), yPosition + (rowHeight / 2) + 3);

                            yPosition += rowHeight;
                        });

                        // Verificar si queda espacio suficiente para la siguiente pregunta
                        if (yPosition + 200 > pageHeight - margin.bottom) {
                            pdf.addPage();
                            yPosition = margin.top;
                        } else {
                            yPosition += 50;
                        }
                    }
                }
            };

            // Añadir la imagen al PDF
            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                0,
                0,
                canvas.width,
                canvas.height
            );

            await addQuestionDetailsPages();
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
        <div className="container mx-auto p-0 md:p-4 space-y-2" aria-label="Resumen de evaluaciones">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ">
                <Card className="border border-transparent dark:border-default-100">
                    <div className="flex p-4">
                        <div className="flex flex-col gap-y-2">
                            <dt className="font-medium">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>Promedio General</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Calificación promedio de {evaluationData?.evaluationStats?.total || 0} empleados evaluados
                                </p>
                            </dt>
                            <dd className="flex flex-col gap-2">
                                <div className="flex items-baseline gap-2">
                                    <NumberTicker
                                        value={averageEvaluation}
                                        decimalPlaces={2}
                                        className="text-2xl font-semibold text-default-700"
                                    />
                                    <span className="text-xl text-default-500">puntos</span>
                                </div>
                                <p className="text-xs text-pretty text-gray-500">
                                    {averageEvaluation >= 80 ? "Desempeño sobresaliente del equipo" :
                                        averageEvaluation >= 60 ? "Desempeño dentro del promedio" :
                                            "Se requiere atención y mejora"}
                                </p>
                            </dd>
                        </div>
                        <Chip
                            className="absolute right-4 bottom-4"
                            classNames={{
                                content: "font-medium text-[0.65rem]",
                                base: "h-6"
                            }}
                            color={averageEvaluation >= 80 ? "success" : averageEvaluation >= 60 ? "warning" : "danger"}
                            radius="sm"
                            size="sm"
                            startContent={
                                averageEvaluation >= 80 ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : averageEvaluation >= 60 ? (
                                    <ArrowRight className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )
                            }
                            variant="flat"
                        >
                            {averageEvaluation >= 80 ? "Excelente" : averageEvaluation >= 60 ? "Regular" : "Bajo"}
                        </Chip>
                    </div>
                </Card>

                <Card className="border border-transparent dark:border-default-100">
                    <div className="flex p-4">
                        <div className="flex flex-col gap-y-2">
                            <dt className="font-medium">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Evaluaciones Finalizadas</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Proceso de evaluación completado
                                </p>
                            </dt>
                            <dd className="flex flex-col gap-2">
                                <div className="flex items-baseline gap-2">
                                    <NumberTicker
                                        value={evaluationData?.evaluationStats?.completed || 0}
                                        className="text-2xl font-semibold text-default-700"
                                    />
                                    <span className="text-sm text-default-500">
                                        de {evaluationData?.evaluationStats?.total || 0} totales
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {((evaluationData?.evaluationStats?.completed || 0) / (evaluationData?.evaluationStats?.total || 1) * 100).toFixed(0)}% del proceso completado
                                </p>
                            </dd>
                        </div>

                    </div>
                </Card>

                <Card className="border border-transparent dark:border-default-100">
                    <div className="flex p-4">
                        <div className="flex flex-col gap-y-2">
                            <dt className="font-medium">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Evaluaciones Pendientes</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    En proceso de evaluación
                                </p>
                            </dt>
                            <dd className="flex flex-col gap-2">
                                <div className="flex items-baseline gap-2">
                                    <NumberTicker
                                        value={evaluationData?.evaluationStats?.inProgress || 0}
                                        className="text-2xl font-semibold text-default-700"
                                    />
                                    <span className="text-sm text-default-500">
                                        de {evaluationData?.evaluationStats?.total || 0} totales
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {((evaluationData?.evaluationStats?.inProgress || 0) / (evaluationData?.evaluationStats?.total || 1) * 100).toFixed(0)}% aún en proceso
                                </p>
                            </dd>
                        </div>
                        <Chip
                            className="absolute right-4 bottom-4"
                            classNames={{
                                content: "font-medium text-[0.65rem]",
                                base: "h-6"
                            }}
                            color="warning"
                            radius="sm"
                            size="sm"
                            startContent={<Clock className="w-3 h-3" />}
                            variant="flat"
                        >
                            En Proceso
                        </Chip>
                    </div>
                </Card>
            </div>

            <Card className='my-0'>
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
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-2'>
                        <Card className='md:col-span-2 col-span-4'>
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
                                                                    <div className="flex flex-col xl:flex-row justify-between items-center text-sm">
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
                                    </AccordionItem>
                                </Accordion>
                            </CardBody>
                        </Card>
                        <Card className='md:col-span-2 col-span-4'>
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
                        <Card className='md:col-span-3 col-span-4'>
                            <CardHeader>
                                <div className='flex flex-col gap-y-2'>
                                    <p>Detalles de la evaluación de {processedEvaluationData.find(e => e.id === selectedEmployeeId)?.name || ''}</p>
                                    <p className='text-sm text-gray-500'>Resultados por pregunta y evaluador</p>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <QuestionDetailsTable
                                    questionDetails={evaluationData.questionDetails[selectedEmployeeId]}
                                />
                            </CardBody>
                        </Card>
                        <Card className='md:col-span-1 col-span-4'>
                            <CardHeader>
                                <div className='flex flex-col gap-y-2'>
                                    <p>Comentarios para {processedEvaluationData.find(e => e.id === selectedEmployeeId)?.name || ''}</p>
                                    <p className='text-sm text-gray-500'>Comentarios de evaluadores</p>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <ScrollShadow className='w-full max-h-[400px] space-y-4 p-2'>
                                    {selectedEmployeeId && evaluationData.commentsByEmployee[selectedEmployeeId]?.length > 0 ? (
                                        evaluationData.commentsByEmployee[selectedEmployeeId].map((comment, index) => (
                                            <Card key={index} className="w-full">
                                                <CardBody className="p-3">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-shrink-0">
                                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                        <span className="text-sm font-medium text-primary">
                                                                            {comment.evaluatorName.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className='flex items-center w-full gap-1'>
                                                                    <p className="text-sm font-medium">{comment.evaluatorName}</p> ·
                                                                    <span className="text-xs text-gray-500">{comment.relationship}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                            {comment.comment}
                                                        </p>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                                            No hay comentarios disponibles para este empleado
                                        </div>
                                    )}
                                </ScrollShadow>
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
            )
            }

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
        </div >
    )
}


