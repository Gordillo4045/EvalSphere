import React, { useState, useMemo, useEffect } from 'react';
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
    useDisclosure,
    User,
    Spinner
} from "@nextui-org/react";
import { IoIosSearch } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { AiOutlineEdit } from "react-icons/ai";
import { BiSolidTrashAlt } from "react-icons/bi";
import { collection, getDocs } from 'firebase/firestore';
import { db, httpsCallable } from '../../config/config';
import { Employee, Department, Position } from '../../types/applicaciontypes';
import EmployeeModal from './EmployeeModal';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import { IoReload } from 'react-icons/io5';

interface EmployeeTableProps {
    companyId: string;
    companyName: string;
}

const INITIAL_VISIBLE_COLUMNS = ["name", "companyEmail", "department", "position", "role", "actions"];

const COLUMN_NAMES = {
    name: "Nombre",
    department: "Departamento",
    position: "Posición",
    actions: "Acciones"
};

export default function EmployeeTable({ companyId, companyName }: EmployeeTableProps) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [filterValue, setFilterValue] = useState("");
    const [visibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
    visibleColumns;
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;
    const [isLoading, setIsLoading] = useState(true);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        const employeesRef = collection(db, `companies/${companyId}/employees`);
        const employeesSnapshot = await getDocs(employeesRef);
        const employeesData = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        setEmployees(employeesData);

        const departmentsRef = collection(db, `companies/${companyId}/departments`);
        const departmentsSnapshot = await getDocs(departmentsRef);
        const departmentsData: Department[] = [];
        const positionsData: Position[] = [];

        for (const departmentDoc of departmentsSnapshot.docs) {
            const department = { id: departmentDoc.id, ...departmentDoc.data() } as Department;
            departmentsData.push(department);

            const positionsRef = collection(db, `companies/${companyId}/departments/${department.id}/positions`);
            const positionsSnapshot = await getDocs(positionsRef);
            positionsSnapshot.forEach(positionDoc => {
                const position = { id: positionDoc.id, ...positionDoc.data(), departmentId: department.id } as Position;
                positionsData.push(position);
            });
        }

        setDepartments(departmentsData);
        setPositions(positionsData);
        setIsLoading(false);
    };
    useEffect(() => {
        fetchData();
    }, [companyId]);

    const onAddNew = () => {
        setModalMode('add');
        setCurrentEmployee(null);
        onOpen();
    };

    const onEdit = async (item: Employee) => {
        setModalMode('edit');
        setCurrentEmployee(item);
        onOpen();
    };

    const onDelete = async (item: Employee) => {
        setDeleteConfirmationOpen(true);
        setEmployeeToDelete(item);
    };

    const handleDeleteConfirmation = async () => {
        if (employeeToDelete) {
            const deleteEmployeeFunction = httpsCallable('deleteEmployee');
            deleteEmployeeFunction(employeeToDelete);
            setDeleteConfirmationOpen(false);
            fetchData();
        }
    };

    const filteredItems = useMemo(() => {
        let filteredEmployees = [...employees];

        if (filterValue) {
            filteredEmployees = filteredEmployees.filter((item) =>
                item.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
                item.email?.toLowerCase().includes(filterValue.toLowerCase()) ||
                item.role?.toLowerCase().includes(filterValue.toLowerCase())
            );
        }
        return filteredEmployees;
    }, [employees, filterValue]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof Employee];
            const second = b[sortDescriptor.column as keyof Employee];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [filteredItems, sortDescriptor]);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return sortedItems.slice(start, end);
    }, [sortedItems, page, rowsPerPage]);

    const renderCell = (item: Employee, columnKey: React.Key) => {
        switch (columnKey) {
            case "name":
                return (
                    <User
                        avatarProps={{ src: item.avatar }}
                        name={item.name}
                        description={item.email}
                    >
                        {item.email}
                    </User>
                );
            case "department":
                return <span>{departments.find(d => d.id === item.departmentId)?.name || 'N/A'}</span>;
            case "position":
                return <span>{positions.find(p => p.id === item.positionId)?.title || 'N/A'}</span>;
            case "actions":
                return (
                    <div className="flex justify-start gap-2">
                        <Tooltip content="Editar">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => onEdit(item)}
                            >
                                <AiOutlineEdit size={20} />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Eliminar" color='danger'>
                            <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                onPress={() => onDelete(item)}
                            >
                                <BiSolidTrashAlt size={20} />
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return null;
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
                        placeholder="Buscar por nombre, email o rol"
                        size="sm"
                        startContent={<IoIosSearch className="text-default-300" />}
                        value={filterValue}
                        variant="bordered"
                        onClear={() => setFilterValue("")}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
                        <Tooltip content="Actualizar">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                onPress={fetchData}
                            >
                                <IoReload size={20} />
                            </Button>
                        </Tooltip>
                        <Button
                            size="sm"
                            color="primary"
                            endContent={<FaPlus />}
                            onPress={onAddNew}
                        >
                            Agregar
                        </Button>
                    </div>
                </div>
            </div>
        );
    }, [filterValue, onSearchChange]);

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
                    {`${filteredItems.length} empleados`}
                </span>
            </div>
        );
    }, [filteredItems.length, page, rowsPerPage]);

    return (
        <>
            {isLoading ? (
                <div className='flex justify-center items-center min-h-[300px]'>
                    <Spinner color="primary" label="Cargando datos..." />
                </div>
            ) : (
                <Table
                    aria-label="Tabla de Empleados"
                    isHeaderSticky
                    bottomContent={bottomContent}
                    bottomContentPlacement="outside"
                    classNames={{
                        wrapper: "max-h-[582px]",
                    }}
                    sortDescriptor={sortDescriptor}
                    topContent={topContent}
                    topContentPlacement="outside"
                    onSortChange={setSortDescriptor}
                >
                    <TableHeader columns={INITIAL_VISIBLE_COLUMNS.map(col => ({ uid: col, name: COLUMN_NAMES[col as keyof typeof COLUMN_NAMES] }))}>
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
                    <TableBody items={items} emptyContent="Cargando datos...">
                        {(item) => (
                            <TableRow key={item.id}>
                                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}

            <EmployeeModal
                isOpen={isOpen}
                onClose={onClose}
                onUpdate={fetchData}
                mode={modalMode}
                companyId={companyId}
                companyName={companyName}
                currentEmployee={currentEmployee}
            />

            <DeleteConfirmationModal
                isOpen={deleteConfirmationOpen}
                onConfirm={handleDeleteConfirmation}
                onCancel={() => setDeleteConfirmationOpen(false)}
            />
        </>
    );
}