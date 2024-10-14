import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
import { useMemo } from "react"

export const description = "A multiple bar chart"

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function BarCharts({ data }: { data: Record<string, Record<string, number>> }) {
    const chartData = useMemo(() => {
        if (!data) return [];
        const departmentData = Object.values(data)[0] || {};
        return Object.entries(departmentData).map(([category, average]) => ({
            categoria: category,
            Promedio: average,
        }));
    }, [data]);

    return (
        <Card className="w-full h-[380px] lg:h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-primary dark:text-primary-dark">Promedios por Categoría</CardTitle>
                <CardDescription className="text-muted-foreground dark:text-muted-foreground-dark">Resultados de evaluación</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center p-1">
                {chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="w-full h-[150px] lg:h-full">
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="categoria"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                hide={true}
                            />
                            <ChartTooltip
                                cursor={true}
                                content={<ChartTooltipContent indicator="dashed" />}
                            />
                            <Bar dataKey="Promedio" fill="var(--color-desktop)" radius={4} />
                        </BarChart>
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
