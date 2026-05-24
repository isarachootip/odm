export interface Product {
    id: string;
    name: string;
    nameTh?: string | null;
    description?: string;
    price: number;
    salePrice?: number; // Optional promotion price
    images: string[];
    category: string;
    isNew?: boolean;
    inStock: boolean;
    rating?: number;
    reviews?: number;
}
