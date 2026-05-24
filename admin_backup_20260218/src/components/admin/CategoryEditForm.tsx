"use client";

import { Button } from "@/components/ui/button";
import { updateCategory } from "@/actions/admin-category";
import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Category } from "@prisma/client";

interface EditCategoryPageProps {
    category: Category;
}

export default function EditCategoryClient({ category }: EditCategoryPageProps) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(category.image);
    const [imageUrl, setImageUrl] = useState<string>(category.image || "");

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("❌ File size exceeds 2MB limit.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result as string);
        reader.readAsDataURL(file);

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
                setPreviewImage(category.image);
            } else {
                setImageUrl(data.url);
                setPreviewImage(data.url);
            }
        } catch (error) {
            alert("❌ Upload failed.");
            setPreviewImage(category.image);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        formData.set("image", imageUrl);

        try {
            await updateCategory(category.id, formData);
        } catch (e) {
            console.error(e);
            alert("Failed to update category.");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-lg mx-auto bg-white p-6 rounded-lg shadow-sm border">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Category</h1>
                <p className="text-sm text-gray-500">Update category information and image for chatbot menu.</p>
            </div>

            <form action={handleSubmit} className="space-y-6">

                {/* Image Upload */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Category Image</label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group h-40 overflow-hidden">
                        {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
                                <span className="text-xs text-gray-500">Uploading...</span>
                            </div>
                        ) : previewImage ? (
                            <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                            <>
                                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                                    <Camera className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                                </div>
                                <span className="text-blue-500 font-medium text-xs">Upload Image</span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            onChange={handleImageChange}
                            disabled={uploading}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Category Name</label>
                    <input
                        name="name"
                        required
                        defaultValue={category.name}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                        placeholder="e.g. Hot Coffee"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Slug</label>
                    <input
                        name="slug"
                        required
                        defaultValue={category.slug}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                        placeholder="e.g. hot-coffee"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading || uploading} className="bg-[#EAB308] hover:bg-[#CA8A04] text-white">
                        {loading ? "Updating..." : "Update Category"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
