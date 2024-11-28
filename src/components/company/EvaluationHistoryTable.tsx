import { useState, useMemo, useEffect } from 'react';
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
    User,
    Spinner,
} from "@nextui-org/react";
import { IoIosCloseCircleOutline, IoIosSearch } from "react-icons/io";
import { toast } from 'sonner';
import { generateChartData } from '@/utils/chartUtils';
import { CiCircleMore } from "react-icons/ci";
import { FaFileExport } from 'react-icons/fa6';

interface EvaluationAverage {
    [category: string]: number;
}

interface EmployeeEvaluation {
    id: string;
    name: string;
    avatar: string;
    averages: EvaluationAverage;
    globalPercentage: number;
    position: string;
}

interface EvaluationHistoryTableProps {
    companyId: string;
    evaluationData: EmployeeEvaluation[];
    isLoading: boolean;
    selectedEmployeeId: string | null;
    clearSelectedEmployee: () => void;
    onSelectEmployee: (employeeId: string, chartData: any[]) => void;
    onExport: () => void;
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

const INITIAL_VISIBLE_COLUMNS = ["name", ...CATEGORIES, "porcentaje_global", "Ver_Mas"];

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
    Ver_Mas: "Ver Más"
};

export default function EvaluationHistoryTable({
    companyId,
    evaluationData,
    isLoading,
    selectedEmployeeId,
    clearSelectedEmployee,
    onSelectEmployee,
    onExport,
}: EvaluationHistoryTableProps) {
    const [filterValue, setFilterValue] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 5;
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });

    useEffect(() => {
        setPage(1);
    }, [selectedEmployeeId]);

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
                            "aria-label": `Avatar de ${item.name}`,
                            className: "!rounded-full aspect-square",
                            size: "sm"
                        }}
                        description={item.position}
                        name={item.name}
                    >
                        {item.name}
                    </User>
                );
            case "Ver_Mas":
                return (
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={async () => {
                            try {
                                const chartData = await generateChartData(companyId, item.id);
                                onSelectEmployee(item.id, chartData);
                            } catch (error) {
                                console.error("Error al obtener datos del gráfico:", error);
                                toast.error("Error al cargar los datos del gráfico");
                            }
                        }}
                        aria-label={`Ver gráfico de ${item.name}`}
                    >
                        <CiCircleMore size={20} />
                    </Button>
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
            <div className="flex flex-col gap-4 overflow-auto">
                <div className="flex justify-between gap-3 items-end ">
                    <Input
                        isClearable
                        classNames={{
                            base: "min-w-[200px] sm:max-w-[40%]",
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
                        <div className="flex gap-2">
                            <Button
                                color='secondary'
                                variant="light"
                                size="sm"
                                startContent={<FaFileExport size={20} />}
                                aria-label="Exportar resultados de la encuesta"
                                onPress={onExport}
                            >
                                Exportar Resultados
                            </Button>
                            <Button
                                color="danger"
                                variant="bordered"
                                size="sm"
                                startContent={<IoIosCloseCircleOutline size={20} />}
                                onPress={clearSelectedEmployee}
                                aria-label="Limpiar selección de empleado"
                            >
                                Limpiar selección
                            </Button>
                        </div>
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
                id="evaluation-scores-table"
            >
                <TableHeader columns={INITIAL_VISIBLE_COLUMNS.map(col => ({ uid: col, name: COLUMN_NAMES[col] }))}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={column.uid === "Ver_Mas" ? "center" : "start"}
                            allowsSorting={column.uid !== "Ver_Mas"}

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
        </>
    );
}
