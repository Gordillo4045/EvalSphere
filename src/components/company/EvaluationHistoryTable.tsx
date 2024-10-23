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
} from "@nextui-org/react";
import { IoIosCloseCircleOutline, IoIosSearch } from "react-icons/io";
import { FaChartBar } from "react-icons/fa";
import { toast } from 'sonner';
import { generateChartData } from '@/utils/chartUtils';

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
    companyId: string;
    evaluationData: EmployeeEvaluation[];
    isLoading: boolean;
    selectedEmployeeId: string | null;
    clearSelectedEmployee: () => void;
    onSelectEmployee: (employeeId: string, chartData: any[]) => void;
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



export default function EvaluationHistoryTable({
    companyId,
    evaluationData,
    isLoading,
    selectedEmployeeId,
    clearSelectedEmployee,
    onSelectEmployee
}: EvaluationHistoryTableProps) {
    const [filterValue, setFilterValue] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 6;
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });


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
        </>
    );
}
