import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
    Chip,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Selection,
    ModalBody,
    Modal,
    useDisclosure,
    ModalContent,
} from "@nextui-org/react";
import { BiSearch } from "react-icons/bi";
import { FiChevronDown } from "react-icons/fi";
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from "@/config/config";
import { Employee, Department, Position } from "@/types/applicaciontypes";
import EmployeeEvaluationChart from './EmployeeEvaluationChart';

const INITIAL_VISIBLE_COLUMNS = ["name", "average", "department", "position", "status", "actions"];

const COLUMN_NAMES = {
    name: "Nombre",
    average: "Promedio",
    department: "Departamento",
    position: "Posición",
    status: "Estado",
    actions: "Acciones"
};

const statusOptions = [
    { name: "Completado", uid: "Completado" },
    { name: "Pendiente", uid: "Pendiente" },
];

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ResultTable({ data, companyId }: { data: Record<string, Record<string, number>>, companyId: string }) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [filterValue, setFilterValue] = useState("");
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });
    const [page, setPage] = useState(1);
    const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
    const [statusFilter, setStatusFilter] = useState<Selection>("all");
    const rowsPerPage = 3;
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    useEffect(() => {
        const unsubscribeEmployees = onSnapshot(
            collection(db, `companies/${companyId}/employees`),
            (snapshot) => {
                const employeesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
                setEmployees(employeesData);
            },
            (error) => console.error("Error al obtener empleados:", error)
        );

        const unsubscribeDepartments = onSnapshot(
            collection(db, `companies/${companyId}/departments`),
            (snapshot) => {
                const departmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
                setDepartments(departmentsData);

                departmentsData.forEach(department => {
                    const unsubscribePositions = onSnapshot(
                        collection(db, `companies/${companyId}/departments/${department.id}/positions`),
                        (positionsSnapshot) => {
                            const positionsData = positionsSnapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data(),
                                departmentId: department.id
                            } as Position));
                            setPositions(prevPositions => {
                                const filteredPositions = prevPositions.filter(p => p.departmentId !== department.id);
                                return [...filteredPositions, ...positionsData];
                            });
                        },
                        (error) => console.error(`Error al obtener posiciones para el departamento ${department.id}:`, error)
                    );

                    return () => unsubscribePositions();
                });
            },
            (error) => console.error("Error al obtener departamentos:", error)
        );

        return () => {
            unsubscribeEmployees();
            unsubscribeDepartments();
        };
    }, [companyId]);

    const items = useMemo(() => {
        if (!data || !employees.length) return [];
        return employees.map(employee => {
            const employeeData = data[employee.id] || {};
            const average = Object.values(employeeData).reduce((sum, value) => sum + value, 0) / Object.values(employeeData).length;
            return {
                ...employee,
                average: average ? average.toFixed(2) : 'N/A',
                status: Object.keys(employeeData).length > 0 ? 'Completado' : 'Pendiente'
            };
        });
    }, [data, employees]);

    const headerColumns = useMemo(() => {
        if (visibleColumns === "all") return INITIAL_VISIBLE_COLUMNS.map(col => ({ uid: col, name: COLUMN_NAMES[col as keyof typeof COLUMN_NAMES] }));
        return INITIAL_VISIBLE_COLUMNS.filter((column) => Array.from(visibleColumns).includes(column)).map(col => ({ uid: col, name: COLUMN_NAMES[col as keyof typeof COLUMN_NAMES] }));
    }, [visibleColumns]);

    const filteredItems = useMemo(() => {
        let filtered = items;
        if (filterValue) {
            filtered = filtered.filter((item) =>
                item.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
                item.email?.toLowerCase().includes(filterValue.toLowerCase()) ||
                departments.find(d => d.id === item.departmentId)?.name?.toLowerCase().includes(filterValue.toLowerCase())
            );
        }
        if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
            filtered = filtered.filter((item) =>
                Array.from(statusFilter).includes(item.status),
            );
        }
        return filtered;
    }, [items, filterValue, departments, statusFilter]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof typeof a];
            const second = b[sortDescriptor.column as keyof typeof b];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [filteredItems, sortDescriptor]);

    const paginatedItems = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return sortedItems.slice(start, end);
    }, [sortedItems, page, rowsPerPage]);

    const renderCell = useCallback((item: any, columnKey: React.Key) => {
        switch (columnKey) {
            case "name":
                return (
                    <User
                        avatarProps={{ src: item.avatar }}
                        description={item.email}
                        name={item.name}
                    >
                        {item.name}
                    </User>
                );
            case "average":
                return <span>{item.average}</span>;
            case "department":
                return <span>{departments.find(d => d.id === item.departmentId)?.name || 'N/A'}</span>;
            case "position":
                return <span>{positions.find(p => p.id === item.positionId)?.title || 'N/A'}</span>;
            case "status":
                return (
                    <Chip color={item.status === 'Completado' ? 'success' : 'warning'} variant="flat">
                        {item.status}
                    </Chip>
                );
            case "actions":
                return (
                    <Button
                        size="sm"
                        variant="shadow"
                        color="primary"
                        onPress={() => {
                            setSelectedEmployee(item);
                            onOpen()
                        }}
                    >
                        Ver evaluación
                    </Button>
                );
            default:
                return null;
        }
    }, [departments, positions, setSelectedEmployee]);

    const onSearchChange = useCallback((value?: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    }, []);

    const onClear = useCallback(() => {
        setFilterValue("")
        setPage(1)
    }, [])

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Buscar por nombre, email o departamento"
                        startContent={<BiSearch />}
                        value={filterValue}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button endContent={<FiChevronDown className="text-small" />} variant="flat">
                                    Estado
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Filtro de Estado"
                                closeOnSelect={false}
                                selectedKeys={statusFilter}
                                selectionMode="multiple"
                                onSelectionChange={setStatusFilter}
                            >
                                {statusOptions.map((status) => (
                                    <DropdownItem key={status.uid} className="capitalize">
                                        {capitalize(status.name)}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button endContent={<FiChevronDown className="text-small" />} variant="flat">
                                    Columnas
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Columnas de la Tabla"
                                closeOnSelect={false}
                                selectedKeys={visibleColumns}
                                selectionMode="multiple"
                                onSelectionChange={setVisibleColumns}
                            >
                                {INITIAL_VISIBLE_COLUMNS.map((column) => (
                                    <DropdownItem key={column} className="capitalize">
                                        {capitalize(COLUMN_NAMES[column as keyof typeof COLUMN_NAMES])}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
            </div>
        );
    }, [filterValue, statusFilter, visibleColumns, onSearchChange]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <Pagination
                    isCompact
                    color="primary"
                    page={page}
                    total={employees.length > 0 ? pages : 1}
                    onChange={setPage}
                    size="sm"
                    classNames={{
                        cursor: "bg-foreground text-background",
                    }}
                />
                <span className="text-default-400 text-xs sm:text-small text-end">
                    {`${filteredItems.length} empleados`}
                </span>
            </div>
        );
    }, [filteredItems.length, page, rowsPerPage]);

    const generateChartData = () => {
        const categories = [
            "Organización",
            "Liderazgo",
            "Comunicación",
            "Responsabilidad",
            "Aprendizaje",
            "Adaptación"];
        return categories.map(category => ({
            category,
            Jefe: Math.floor(Math.random() * 5) + 1,
            Companeros: Math.floor(Math.random() * 5) + 1,
            Subordinados: Math.floor(Math.random() * 5) + 1,
            AutoEvaluacion: Math.floor(Math.random() * 5) + 1,
        }));
    };

    return (
        <>
            <Table
                aria-label="Tabla de Resultados de Evaluación"
                isHeaderSticky
                isCompact
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "min-h-[237px]",
                }}
                sortDescriptor={sortDescriptor}
                topContent={topContent}
                topContentPlacement="outside"
                onSortChange={setSortDescriptor}
            >
                <TableHeader columns={headerColumns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                            allowsSorting={column.uid !== "actions"}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={paginatedItems} emptyContent="No hay datos para mostrar">
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Modal isOpen={isOpen} onClose={onOpenChange} size="5xl" scrollBehavior="outside">
                <ModalContent>
                    <ModalBody>
                        {selectedEmployee && (
                            <EmployeeEvaluationChart
                                data={generateChartData()}
                                employeeName={selectedEmployee.name}
                            />
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}
