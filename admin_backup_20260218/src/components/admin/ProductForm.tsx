
"use client";

import { Button } from "@/components/ui/button";
import { Category, Product, ProductVariant } from "@prisma/client";
import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";

interface ProductWithVariants extends Product {
    variants: ProductVariant[];
}

interface ProductFormProps {
    categories: Category[];
    product?: ProductWithVariants | null;
    action: (formData: FormData) => Promise<any>;
}

export function ProductForm({ categories, product, action }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(product?.images?.[0] || null);
    const [imageUrl, setImageUrl] = useState<string>(product?.images?.[0] || "");

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            await action(formData);
        } catch (error: any) {
            console.error(error);
            alert("Failed to save product: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. Validation: Check if file > 2MB
        if (file.size > 2 * 1024 * 1024) {
            alert("❌ File size exceeds 2MB limit. Please upload a smaller image.");
            e.target.value = "";
            return;
        }

        // 2. Show local preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        // 3. Upload to Vercel Blob
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.error) {
                alert("❌ Upload failed: " + data.error);
                setPreviewImage(null);
            } else {
                setImageUrl(data.url);
                setPreviewImage(data.url);
            }
        } catch (error) {
            alert("❌ Upload failed. Please try again.");
            setPreviewImage(null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <form action={handleSubmit} className="bg-white p-6 rounded-md shadow-sm border max-w-2xl mx-auto">
            <h1 className="text-lg font-bold text-gray-900 mb-4">{product ? "Edit Product" : "New Product"}</h1>

            <div className="space-y-4">

                {/* 1. Product Image Uploader */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Product Image (Max 2MB)</label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group h-32 overflow-hidden">
                        {uploading ? (
                            <div className="flex flex-col items-center gap-1">
                                <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
                                <span className="text-xs text-gray-500">Uploading...</span>
                            </div>
                        ) : previewImage ? (
                            <img src={previewImage} alt="Preview" className="h-full object-contain" />
                        ) : (
                            <>
                                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                                    <Camera className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                                </div>
                                <span className="text-blue-500 font-medium text-xs">Click to Upload</span>
                            </>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            onChange={handleImageChange}
                            disabled={uploading}
                        />

                        <input
                            type="hidden"
                            name="image"
                            value={imageUrl}
                        />
                    </div>

                    {/* Manual URL Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Or paste image URL here..."
                            value={imageUrl}
                            onChange={(e) => {
                                setImageUrl(e.target.value);
                                setPreviewImage(e.target.value);
                            }}
                            className="flex-1 h-9 rounded-md border border-gray-300 px-3 py-2 text-xs"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setImageUrl("");
                                setPreviewImage(null);
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                    <p className="text-xs text-center text-gray-400">JPG, PNG, GIF. Max 2MB</p>
                </div>

                {/* Name */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Name</label>
                    <input
                        name="name"
                        defaultValue={product?.name}
                        required
                        className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400"
                        placeholder="Product Name"
                    />
                </div>

                {/* Price */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Price</label>
                    <input
                        name="price"
                        type="number"
                        defaultValue={Number(product?.price) || 0}
                        required
                        className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400"
                    />
                </div>

                {/* Category */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Category</label>
                    <div className="relative">
                        <select
                            name="categoryId"
                            defaultValue={product?.categoryId || ""}
                            required
                            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400"
                        >
                            <option value="" disabled>Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-2.5 pointer-events-none">
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L5 5L9 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full bg-[#EAB308] hover:bg-[#CA8A04] text-white font-bold h-10 rounded-md transition-colors shadow-sm disabled:opacity-70 mt-2"
                >
                    {loading ? "Processing..." : (product ? "Update Product" : "Create Product")}
                </button>

            </div>
        </form>
    );
}
