import { EvaluationStats } from "@/components/admin/EvaluationStats";
import { EvaluationList } from "@/components/admin/EvaluationList";
import { prisma as db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EvaluationPage() {
    const reviews = await db.review.findMany({
        include: {
            order: {
                select: {
                    orderNumber: true,
                    customerName: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const totalReviews = reviews.length;
    const averageRating =
        totalReviews > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
            : 0;

    const fiveStarReviews = reviews.filter((r) => r.rating === 5).length;
    const fiveStarPercentage =
        totalReviews > 0 ? (fiveStarReviews / totalReviews) * 100 : 0;

    const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
        rating: star,
        count: reviews.filter((r) => r.rating === star).length,
    }));

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Evaluations</h2>
            </div>
            <EvaluationStats
                averageRating={averageRating}
                totalReviews={totalReviews}
                fiveStarPercentage={fiveStarPercentage}
                ratingDistribution={ratingDistribution}
            />
            <EvaluationList reviews={reviews} />
        </div>
    );
}
