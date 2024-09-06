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
} from "@nextui-org/react";
import { IoIosSearch } from "react-icons/io";
import { IoReload } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { AiOutlineEdit } from "react-icons/ai";
import { BiSolidTrashAlt } from "react-icons/bi";

interface Usuario {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    puestoTrabajo?: string;
    avatar?: string;
}

interface UsersTableProps {
    usuarios: Usuario[];
    onAddNew: () => void;
    onEdit: (item: Usuario) => void;
    onDelete: (item: Usuario) => void;
    onRefresh: () => void;
}

const INITIAL_VISIBLE_COLUMNS = ["name", "email", "role", "details", "actions"];

export default function UsersTable({ usuarios, onAddNew, onEdit, onDelete, onRefresh }: UsersTableProps) {
    const [filterValue, setFilterValue] = useState("");
    const [visibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
    visibleColumns;
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = useMemo(() => [
        { uid: "name", name: "Nombre" },
        { uid: "role", name: "Rol" },
        { uid: "details", name: "Detalles" },
        { uid: "actions", name: "Acciones" },
    ], []);

    const filteredItems = useMemo(() => {
        let filteredUsers = [...usuarios];

        if (hasSearchFilter) {
            filteredUsers = filteredUsers.filter((item) => {
                return (
                    item.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
                    item.email?.toLowerCase().includes(filterValue.toLowerCase()) ||
                    item.puestoTrabajo?.toLowerCase().includes(filterValue.toLowerCase())
                );
            });
        }
        return filteredUsers;
    }, [usuarios, filterValue]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof Usuario] || '';
            const second = b[sortDescriptor.column as keyof Usuario] || '';
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [filteredItems, sortDescriptor]);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return sortedItems.slice(start, end);
    }, [sortedItems, page, rowsPerPage]);

    const renderCell = (item: Usuario, columnKey: React.Key) => {
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

            case "role":
                return <span>{item.role === 'company' ? 'Compañía' : 'Administrador'}</span>;
            case "details":
                return <span>{item.puestoTrabajo}</span>;
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
                        placeholder="Buscar por nombre, email o detalles"
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
                                onPress={onRefresh}
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
    }, [filterValue, onSearchChange, onRefresh, onAddNew]);

    const bottomContent = useMemo(() => {
        return (
            <div className="md:py-2 md:px-2 flex justify-between items-center">
                <Pagination
                    classNames={{
                        cursor: "bg-foreground text-background",
                    }}
                    color="default"
                    page={page}
                    total={usuarios.length > 0 ? Math.ceil(filteredItems.length / rowsPerPage) : 1}
                    variant="light"
                    onChange={setPage}
                />
                <span className="text-small text-default-400">
                    {`${filteredItems.length} usuarios`}
                </span>
            </div>
        );
    }, [filteredItems.length, page, rowsPerPage]);

    return (
        <Table
            aria-label="Tabla de usuarios"
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
            <TableBody items={items} emptyContent={"No se encontraron usuarios o compañías"}>
                {(item) => (
                    <TableRow key={item.id}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}