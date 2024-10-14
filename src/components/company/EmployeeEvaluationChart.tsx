import { LineChart, Line, XAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';

interface EvaluationData {
    category: string;
    Jefe: number;
    Companeros: number;
    Subordinados: number;
    AutoEvaluacion: number;
}

interface EmployeeEvaluationChartProps {
    data: EvaluationData[];
    employeeName: string;
}

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

const EmployeeEvaluationChart: React.FC<EmployeeEvaluationChartProps> = ({ data, employeeName }) => {
    return (
        <Card className="w-full ">
            <CardHeader>
                <CardTitle>Evaluación de {employeeName}</CardTitle>
                <CardDescription>Resultados por categoría y tipo de evaluador</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="category" />
                            <Legend />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="Jefe" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Companeros" stroke="#82ca9d" />
                            <Line type="monotone" dataKey="Subordinados" stroke="#ffc658" />
                            <Line type="monotone" dataKey="AutoEvaluacion" stroke="#ff7300" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default EmployeeEvaluationChart;

