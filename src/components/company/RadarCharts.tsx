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

export function RadarCharts({ data }: { data: Record<string, Record<string, number>> }) {
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
            <CardHeader className=" pb-4">
                <CardTitle>Radar de Categorías</CardTitle>
                <CardDescription>
                    Promedios por categoría de evaluación
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center p-1 ">
                {chartData.length > 0 ? (
                    <ChartContainer
                        config={chartConfig}
                        className="w-full h-[150px] lg:h-full"
                    >
                        <RadarChart data={chartData} >
                            <PolarAngleAxis
                                dataKey="categoria"
                                tick={({ x, y, textAnchor, value, index, ...props }) => {
                                    return (
                                        <text
                                            className="hidden"
                                            x={x}
                                            y={index === 0 ? y - 10 : y}
                                            textAnchor={textAnchor}
                                            fontSize={1}
                                            fontWeight={500}
                                            {...props}
                                        >
                                        </text>
                                    )
                                }}
                            />
                            <PolarGrid />
                            <PolarRadiusAxis domain={[0, 5]} axisLine={false} tick={false} />
                            <Radar
                                dataKey="Promedio"
                                fill="var(--color-desktop)"
                                fillOpacity={0.6}
                            />
                            <ChartTooltip cursor={false}
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
    )
}
