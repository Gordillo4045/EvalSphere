import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useMemo, useState } from "react"
import { Employee } from "@/types/applicaciontypes"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/config/config"

export const description = "A line chart"

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export function LineCharts({ data, companyId }: { data: Record<string, Record<string, number>>, companyId: string }) {

    const [employees, setEmployees] = useState<Employee[]>([]);
    useEffect(() => {
        const fetchEmployees = async () => {
            const employeesRef = collection(db, `companies/${companyId}/employees`);
            const employeesSnapshot = await getDocs(employeesRef);
            const employeesData = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
            setEmployees(employeesData);
        }
        fetchEmployees();
    }, [companyId]);

    const chartData = useMemo(() => {
        if (!data) return [];
        return Object.entries(data).map(([employeeId, categories]) => ({
            empleado: employees.find(employee => employee.id === employeeId)?.name || employeeId,
            Promedio: Object.values(categories).reduce((sum, value) => sum + value, 0) / Object.values(categories).length,
        }));
    }, [data, employees]);

    return (
        <Card className="w-full h-[380px] lg:h-full flex flex-col">
            <CardHeader>
                <CardTitle>Promedios por Empleado</CardTitle>
                <CardDescription>Resultados de evaluación</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center p-1">
                {chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="w-full h-[150px] lg:h-full">
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="empleado"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                hide={true}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent />}
                            />
                            <Line
                                dataKey="Promedio"
                                type="natural"
                                stroke="var(--color-desktop)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <p className="text-muted-foreground dark:text-muted-foreground-dark select-none">No hay datos de evaluación...</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
