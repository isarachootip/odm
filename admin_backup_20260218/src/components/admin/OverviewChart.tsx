"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface OverviewChartProps {
    data: {
        name: string;
        total: number;
    }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#6366f1'];

export function OverviewChart({ data }: OverviewChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                No data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="total"
                    label={({ name, percent }: { name?: string | number; percent?: number }) => `${name || ''} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: number) => [`฿${(value || 0).toLocaleString()}`, "ยอดขาย"] as [string, string]}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}
