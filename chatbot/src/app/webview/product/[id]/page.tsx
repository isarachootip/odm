
import { prisma } from "../../../../lib/db";
import ProductForm from "../../../../components/webview/ProductForm";
import { notFound } from "next/navigation";

// Next.js 15+ Page Props (Promises)
interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ userId?: string; branch?: string }>;
}

export default async function ProductPage(props: PageProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { id } = params;
    const userId = searchParams.userId || "";
    const branchCode = searchParams.branch || "odm";

    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) {
        notFound();
    }

    return <ProductForm product={product} userId={userId} branchCode={branchCode} />;
}
