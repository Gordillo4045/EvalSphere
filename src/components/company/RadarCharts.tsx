import { PolarAngleAxis, PolarGrid, Radar, RadarChart, PolarRadiusAxis } from "recharts"

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

export const description = "A radar chart"

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

type RadarChartsProps = {
    data: Record<string, Record<string, number>> | Record<string, number>;
    isDepartmentView?: boolean;
};

export function RadarCharts({ data, isDepartmentView = false }: RadarChartsProps) {
    const chartData = useMemo(() => {
        if (!data) return [];

        if (isDepartmentView) {
            // Lógica para datos de departamento
            const departmentData = Object.values(data)[0] || {};
            return Object.entries(departmentData).map(([category, average]) => ({
                categoria: category,
                Promedio: average,
            }));
        } else {
            // Lógica para datos individuales
            return Object.entries(data as Record<string, number>).map(([category, value]) => ({
                categoria: category,
                Promedio: value,
            }));
        }
    }, [data, isDepartmentView]);

    return (
        <Card id="radarChart" className="w-full h-[380px] lg:h-full flex flex-col">
            <CardHeader className="pb-4">
                <CardTitle>Radar de Categorías</CardTitle>
                <CardDescription>
                    Promedios por categoría de evaluación
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center p-1">
                {chartData.length > 0 ? (
                    <ChartContainer
                        config={chartConfig}
                        className="w-full h-[150px] lg:h-full"
                    >
                        <RadarChart data={chartData}>
                            <PolarAngleAxis
                                dataKey="categoria"
                                tick={({ x, y, payload }) => (
                                    <text
                                        x={x}
                                        y={y}
                                        textAnchor="middle"
                                        fill="currentColor"
                                        fontSize={12}
                                    >
                                        {isDepartmentView ?
                                            <span className="text-muted-foreground dark:text-muted-foreground-dark">
                                                {payload.value}
                                            </span> :
                                            payload.value
                                        }
                                    </text>
                                )}
                            />
                            <PolarGrid />
                            <PolarRadiusAxis domain={[0, 5]} axisLine={false} />
                            <Radar
                                dataKey="Promedio"
                                fill="var(--color-desktop)"
                                fillOpacity={0.6}
                                stroke="var(--color-desktop)"
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent />}
                            />
                        </RadarChart>
                    </ChartContainer>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <p className="text-muted-foreground dark:text-muted-foreground-dark select-none">No hay datos de evaluación...</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
