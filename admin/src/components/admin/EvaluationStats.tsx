"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
import { Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface EvaluationStatsProps {
    averageRating: number;
    totalReviews: number;
    fiveStarPercentage: number;
    ratingDistribution: { rating: number; count: number }[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']; // Red to Green

export function EvaluationStats({
    averageRating,
    totalReviews,
    fiveStarPercentage,
    ratingDistribution,
}: EvaluationStatsProps) {
    // Prepare pie chart data (filter out zero counts for cleaner display)
    const pieData = ratingDistribution
        .filter(item => item.count > 0)
        .map(item => ({
            name: `${item.rating} ดาว`,
            value: item.count,
            rating: item.rating
        }));

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">out of 5.0</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalReviews}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{fiveStarPercentage.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">of total reviews</p>
                    </CardContent>
                </Card>
                <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[80px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ratingDistribution}>
                                <XAxis dataKey="rating" hide />
                                <Tooltip
                                    contentStyle={{ background: '#333', border: 'none', borderRadius: '4px', color: '#fff' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Pie Chart */}
            {totalReviews > 0 && (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Rating Distribution Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.rating - 1]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
