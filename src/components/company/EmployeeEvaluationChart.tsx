import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EvaluationData {
    category: string;
    jefe: number;
    companeros: number;
    subordinados: number;
    autoEvaluacion: number;
}

interface EmployeeEvaluationChartProps {
    data: EvaluationData[];
    employeeName: string;
}

const EmployeeEvaluationChart: React.FC<EmployeeEvaluationChartProps> = ({ data, employeeName }) => {
    return (
        <Card className="w-full h-[500px]">
            <CardHeader>
                <CardTitle>Evaluación de {employeeName}</CardTitle>
                <CardDescription>Resultados por categoría y tipo de evaluador</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="jefe" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="companeros" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="subordinados" stroke="#ffc658" />
                        <Line type="monotone" dataKey="autoEvaluacion" stroke="#ff7300" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default EmployeeEvaluationChart;

