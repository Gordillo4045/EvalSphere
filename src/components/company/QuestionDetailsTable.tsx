import { useState, useMemo } from 'react';
import {
    Input,
    Pagination,
    Chip,
    Accordion,
    AccordionItem,
    Card,
} from "@nextui-org/react";
import { IoIosSearch } from "react-icons/io";
import { Layers2 } from 'lucide-react';

interface QuestionDetail {
    evaluatorId: string;
    evaluatorName: string;
    question: string;
    category: string;
    relationship: string;
    score: number;
    evaluatorPosition: string;
}

interface QuestionDetailsTableProps {
    questionDetails: {
        [questionId: string]: QuestionDetail[];
    };
}

export default function QuestionDetailsTable({
    questionDetails
}: QuestionDetailsTableProps) {
    const [filterValue, setFilterValue] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 5;

    const groupedQuestions = useMemo(() => {
        const grouped: { [key: string]: QuestionDetail[] } = {};
        Object.values(questionDetails).forEach(details => {
            details.forEach(detail => {
                const key = `${detail.question}-${detail.category}`;
                if (!grouped[key]) {
                    grouped[key] = [];
                }
                grouped[key].push(detail);
            });
        });
        return grouped;
    }, [questionDetails]);

    const filteredQuestions = useMemo(() => {
        return Object.entries(groupedQuestions)
            .filter(([key, details]) =>
                key.toLowerCase().includes(filterValue.toLowerCase()) ||
                details.some(detail =>
                    detail.evaluatorName.toLowerCase().includes(filterValue.toLowerCase())
                )
            )
            .sort((a, b) => {
                const categoryA = a[0].split('-')[1];
                const categoryB = b[0].split('-')[1];
                return categoryA.localeCompare(categoryB);
            });
    }, [groupedQuestions, filterValue]);

    const paginatedQuestions = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredQuestions.slice(start, end);
    }, [filteredQuestions, page, rowsPerPage]);

    const calculateAverageScore = (details: QuestionDetail[]) => {
        const sum = details.reduce((acc, detail) => acc + detail.score, 0);
        return (sum / details.length).toFixed(2);
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
                        placeholder="Buscar por pregunta"
                        size="sm"
                        startContent={<IoIosSearch className="text-default-300" />}
                        value={filterValue}
                        variant="bordered"
                        onClear={() => setFilterValue("")}
                        onValueChange={(value) => setFilterValue(value)}
                    />
                </div>
            </div>
        );
    }, [filterValue]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <Pagination
                    classNames={{
                        cursor: "bg-foreground text-background",
                    }}
                    color="default"
                    page={page}
                    total={Math.ceil(filteredQuestions.length / rowsPerPage)}
                    onChange={setPage}
                />
                <span className="text-small text-default-400">
                    {`${filteredQuestions.length} preguntas`}
                </span>
            </div>
        );
    }, [filteredQuestions.length, page]);

    return (
        <div className="space-y-4">
            {topContent}
            {paginatedQuestions.length > 0 ? (
                <Accordion
                    variant="shadow"
                    selectionMode="multiple"
                >
                    {paginatedQuestions.map(([key, details], index) => {
                        const [question, category] = key.split('-');
                        return (
                            <AccordionItem
                                key={index}
                                aria-label={question}
                                title={
                                    <div className="flex flex-col md:flex-row justify-between items-center md:pr-4 gap-2">
                                        <span className="text-small text-balance">
                                            {`${question}`}
                                            <Chip size='sm' variant='flat' startContent={<Layers2 size={10} />} isDisabled className='ml-2'>
                                                {category}
                                            </Chip>
                                        </span>
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            color={
                                                Number(calculateAverageScore(details)) >= 4 ? 'success' :
                                                    Number(calculateAverageScore(details)) >= 3 ? 'warning' : 'danger'
                                            }
                                        >
                                            Promedio: {calculateAverageScore(details)}
                                        </Chip>
                                    </div>
                                }
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-2">
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
                                                    <span className='text-gray-600 font-medium'>Calificación:</span>
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color={
                                                            detail.score >= 4 ? 'success' :
                                                                detail.score >= 3 ? 'warning' : 'danger'
                                                        }
                                                    >
                                                        {detail.score}
                                                    </Chip>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            ) : (
                <div className="flex justify-center items-center p-8">
                    <p className="text-gray-500">
                        No se encontraron resultados para tu búsqueda.
                    </p>
                </div>
            )}
            {bottomContent}
        </div>
    );
} 