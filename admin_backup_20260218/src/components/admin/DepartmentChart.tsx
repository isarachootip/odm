"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface DepartmentChartProps {
    data: {
        name: string
        value: number
    }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function DepartmentChart({ data }: DepartmentChartProps) {
    // Handle empty data
    if (!data || data.length === 0) {
        return <div className="flex h-[350px] items-center justify-center text-muted-foreground">No data available</div>
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, 'Orders']} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}
