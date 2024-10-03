import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Rectangle } from "recharts";
const data = [
    {
        "name": "Page A",
        "uv": 4000,
        "pv": 2400
    },
    {
        "name": "Page B",
        "uv": 3000,
        "pv": 1398
    },
    {
        "name": "Page C",
        "uv": 2000,
        "pv": 9800
    },
    {
        "name": "Page D",
        "uv": 2780,
        "pv": 3908
    },
    {
        "name": "Page E",
        "uv": 1890,
        "pv": 4800
    },
    {
        "name": "Page F",
        "uv": 2390,
        "pv": 3800
    },
    {
        "name": "Page G",
        "uv": 3490,
        "pv": 4300
    }
]

export default function BarCharts() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="pv" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
                <Bar dataKey="uv" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />
            </BarChart>
        </ResponsiveContainer>
    )
}