import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Progress, Spinner } from "@nextui-org/react";
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/config';
import { Employee } from '@/types/applicaciontypes';
import EvaluationHistoryTable from './EvaluationHistoryTable';
import NumberTicker from '../ui/number-ticker';

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

export default function EvaluationHistory({
    companyId,
    evaluationData,
    isLoading,
    selectedEmployeeId,
    setSelectedEmployeeId
}: EvaluationHistoryProps) {
    const [processedEvaluationData, setProcessedEvaluationData] = useState<ProcessedEmployeeEvaluation[]>([]);
    const [totalEvaluations, setTotalEvaluations] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

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
                setError(null);
            } catch (err) {
                console.error("Error al procesar los datos de evaluación:", err);
                setError("Hubo un problema al cargar los datos de evaluación. Por favor, intente de nuevo más tarde.");
            }
        };

        processData();
    }, [evaluationData, companyId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner label="Cargando datos de evaluación..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4" aria-live="assertive">
                {error}
            </div>
        );
    }

    if (processedEvaluationData.length === 0) {
        return (
            <div className="flex justify-center items-center h-96 text-center p-4 text-muted-foreground dark:text-muted-foreground-dark" aria-live="polite">
                No hay datos de evaluación disponibles en este momento.
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
                        evaluationData={processedEvaluationData}
                        isLoading={isLoading}
                        selectedEmployeeId={selectedEmployeeId}
                        clearSelectedEmployee={() => setSelectedEmployeeId(null)}
                    />
                </CardBody>
            </Card>
        </div>
    )
}
