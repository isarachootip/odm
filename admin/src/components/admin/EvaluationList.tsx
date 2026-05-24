"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Review {
    id: string;
    orderId: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    order: {
        orderNumber: string | null;
        customerName: string | null;
    };
}

interface EvaluationListProps {
    reviews: Review[];
}

export function EvaluationList({ reviews }: EvaluationListProps) {
    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Recent Evaluations</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Order #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Comment</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                    No reviews found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reviews.map((review) => (
                                <TableRow key={review.id}>
                                    <TableCell>
                                        {format(new Date(review.createdAt), "dd MMM yyyy HH:mm", { locale: th })}
                                    </TableCell>
                                    <TableCell>{review.order.orderNumber || review.orderId}</TableCell>
                                    <TableCell>{review.order.customerName || "N/A"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            {review.rating}
                                            <Star className="ml-1 h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={review.comment || ""}>
                                        {review.comment || "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
