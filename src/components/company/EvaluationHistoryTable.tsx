import React, { useState, useMemo } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    Pagination,
    SortDescriptor,
    Tooltip,
    User,
    Spinner,
    useDisclosure,
    Modal,
    ModalContent,
    ModalBody,
} from "@nextui-org/react";
import { IoIosCloseCircleOutline, IoIosSearch } from "react-icons/io";
import { FaChartBar } from "react-icons/fa";
import EmployeeEvaluationChart from './EmployeeEvaluationChart';
import { toast } from 'sonner';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/config';

interface EvaluationAverage {
    [category: string]: number;
}

interface EmployeeEvaluation {
    id: string;
    name: string;
    avatar: string;
    averages: EvaluationAverage;
    globalPercentage: number;
}

interface EvaluationHistoryTableProps {
    companyId: string; // Asegúrate de pasar esta prop
    evaluationData: EmployeeEvaluation[];
    isLoading: boolean;
    selectedEmployeeId: string | null;
    clearSelectedEmployee: () => void;
}

const CATEGORIES = [
    "Organización",
    "Creatividad",
    "Liderazgo",
    "Comunicación",
    "Responsabilidad",
    "Aprendizaje",
    "Adaptación",
];

const INITIAL_VISIBLE_COLUMNS = ["name", ...CATEGORIES, "porcentaje_global", "ver_grafico"];

const COLUMN_NAMES: { [key: string]: string } = {
    name: "Nombre",
    Organización: "Organización",
    Creatividad: "Creatividad",
    Liderazgo: "Liderazgo",
    Comunicación: "Comunicación",
    Responsabilidad: "Responsabilidad",
    Aprendizaje: "Aprendizaje",
    Adaptación: "Adaptación",
    porcentaje_global: "% Global",
    ver_grafico: "Ver Gráfico"
};

const generateChartData = async (companyId: string, employeeId: string) => {
    try {
        // Realizar todas las consultas principales en paralelo
        const [
            evaluationsSnapshot,
            employeesSnapshot,
            departmentsSnapshot,
            surveyQuestionsSnapshot
        ] = await Promise.all([
            getDocs(query(
                collection(db, `companies/${companyId}/evaluations`),
                where("evaluatedId", "==", employeeId)
            )),
            getDocs(collection(db, `companies/${companyId}/employees`)),
            getDocs(collection(db, `companies/${companyId}/departments`)),
            getDocs(collection(db, `companies/${companyId}/surveyQuestions`))
        ]);

        // Procesar datos de empleados
        const employeesData = Object.fromEntries(
            employeesSnapshot.docs.map(doc => [doc.id, doc.data()])
        );

        // Procesar datos de posiciones en paralelo
        const positionsSnapshots = await Promise.all(
            departmentsSnapshot.docs.map(deptDoc =>
                getDocs(collection(deptDoc.ref, 'positions'))
            )
        );

        const positionsData = Object.fromEntries(
            positionsSnapshots.flatMap(snapshot =>
                snapshot.docs.map(doc => [doc.id, doc.data().level])
            )
        );

        // Procesar nombres de categorías
        const categoryNames = Object.fromEntries(
            surveyQuestionsSnapshot.docs.map(doc => [doc.id, doc.data().category])
        );

        // Crear un Map para los promedios
        const averages = new Map<string, Record<string, number[]>>();

        // Procesar evaluaciones
        for (const doc of evaluationsSnapshot.docs) {
            const evaluation = doc.data();
            const evaluatorPosition = employeesData[evaluation.evaluatorId]?.positionId;
            const evaluatedPosition = employeesData[employeeId]?.positionId;

            // Determinar tipo de evaluador
            const evaluatorType = evaluation.evaluatorId === employeeId
                ? "AutoEval"
                : evaluatorPosition === evaluatedPosition
                    ? "Companeros"
                    : (positionsData[evaluatorPosition] || 0) > (positionsData[evaluatedPosition] || 0)
                        ? "Jefe"
                        : "Subordinados";

            // Procesar calificaciones
            for (const [key, value] of Object.entries(evaluation)) {
                if (
                    typeof value === 'number' &&
                    key !== 'timestamp' &&
                    !['evaluatedId', 'evaluatorId', 'comments'].includes(key)
                ) {
                    const category = categoryNames[key] || key;

                    if (!averages.has(category)) {
                        averages.set(category, {
                            Jefe: [],
                            Companeros: [],
                            Subordinados: [],
                            AutoEval: []
                        });
                    }

                    averages.get(category)![evaluatorType].push(value);
                }
            }
        }

        // Calcular y retornar datos finales
        return Array.from(averages.entries())
            .map(([category, typeScores]) => ({
                category,
                ...Object.fromEntries(
                    Object.entries(typeScores)
                        .filter(([_, scores]) => scores.length > 0)
                        .map(([type, scores]) => [
                            type,
                            scores.reduce((a, b) => a + b) / scores.length
                        ])
                )
            }))
            .filter(data => Object.keys(data).length > 1);

    } catch (error) {
        toast.error("Error al generar datos del gráfico:", error);
        throw error;
    }
};

export default function EvaluationHistoryTable({
    companyId,
    evaluationData,
    isLoading,
    selectedEmployeeId,
    clearSelectedEmployee
}: EvaluationHistoryTableProps) {
    const [filterValue, setFilterValue] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 6;
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeEvaluation | null>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [chartData, setChartData] = useState<any[]>([]);

    const filteredItems = useMemo(() => {
        if (Array.isArray(evaluationData)) {
            return evaluationData.filter((item) =>
                (selectedEmployeeId ? item.id === selectedEmployeeId : true) &&
                item.name.toLowerCase().includes(filterValue.toLowerCase())
            );
        }
        return [];
    }, [evaluationData, filterValue, selectedEmployeeId]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof EmployeeEvaluation];
            const second = b[sortDescriptor.column as keyof EmployeeEvaluation];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [filteredItems, sortDescriptor]);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return sortedItems.slice(start, end);
    }, [sortedItems, page, rowsPerPage]);

    const renderCell = (item: EmployeeEvaluation, columnKey: React.Key) => {
        switch (columnKey) {
            case "name":
                return (
                    <User
                        avatarProps={{
                            src: item.avatar,
                            "aria-label": `Avatar de ${item.name}`
                        }}
                        name={item.name}
                    >
                        {item.name}
                    </User>
                );
            case "ver_grafico":
                return (
                    <Tooltip content="Ver Gráfico">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={async () => {
                                setSelectedEmployee(item);
                                try {
                                    const chartData = await generateChartData(companyId, item.id);
                                    setChartData(chartData);
                                    onOpen();
                                } catch (error) {
                                    console.error("Error al obtener datos del gráfico:", error);
                                    toast.error("Error al cargar los datos del gráfico");
                                }
                            }}
                            aria-label={`Ver gráfico de ${item.name}`}
                        >
                            <FaChartBar size={20} />
                        </Button>
                    </Tooltip>
                );
            case "porcentaje_global":
                return `${item.globalPercentage.toFixed(2)}%`;
            default:
                return item.averages[columnKey as string]?.toFixed(2) || 'N/A';
        }
    };

    const onSearchChange = (value?: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    };

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        classNames={{
                            base: "w-full sm:max-w-[44%]",
                            inputWrapper: "border-1",
                        }}
                        placeholder="Buscar por nombre"
                        size="sm"
                        startContent={<IoIosSearch className="text-default-300" />}
                        value={filterValue}
                        variant="bordered"
                        onClear={() => setFilterValue("")}
                        onValueChange={onSearchChange}
                        aria-label="Buscar empleado por nombre"
                    />
                    {selectedEmployeeId && (
                        <Button
                            color="primary"
                            variant="light"
                            size="sm"
                            startContent={<IoIosCloseCircleOutline />}
                            onPress={clearSelectedEmployee}
                            aria-label="Limpiar selección de empleado"
                        >
                            Limpiar empleado
                        </Button>
                    )}
                </div>
            </div>
        );
    }, [filterValue, onSearchChange, selectedEmployeeId, clearSelectedEmployee]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <Pagination
                    classNames={{
                        cursor: "bg-foreground text-background",
                    }}
                    color="default"
                    page={page}
                    total={Math.ceil(filteredItems.length / rowsPerPage)}
                    onChange={setPage}
                />
                <span className="text-small text-default-400">
                    {`${filteredItems.length} evaluaciones`}
                </span>
            </div>
        );
    }, [filteredItems.length, page, rowsPerPage]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner label="Cargando datos de evaluación..." />
            </div>
        );
    }

    return (
        <>
            <Table
                aria-label="Tabla de Historial de Evaluaciones"
                isHeaderSticky
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "max-h-[600px]",
                }}
                sortDescriptor={sortDescriptor}
                topContent={topContent}
                topContentPlacement="outside"
                onSortChange={setSortDescriptor}
            >
                <TableHeader columns={INITIAL_VISIBLE_COLUMNS.map(col => ({ uid: col, name: COLUMN_NAMES[col] }))}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={column.uid === "ver_grafico" ? "center" : "start"}
                            allowsSorting={column.uid !== "ver_grafico"}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={items} emptyContent="No hay datos para mostrar">
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="4xl"
                hideCloseButton
            >
                <ModalContent>
                    <ModalBody className='p-2'>
                        {selectedEmployee && chartData && (
                            <EmployeeEvaluationChart
                                data={chartData}
                                employeeName={selectedEmployee.name}
                            />
                        )}
                    </ModalBody>

                </ModalContent>
            </Modal>
        </>
    );
}
