"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
    images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    if (!images || images.length === 0) return null;

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-gray-100">
                <Image
                    src={images[selectedImage]}
                    alt="Product Main Image"
                    fill
                    className="object-cover transition-all duration-300"
                    priority
                />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={cn(
                                "relative h-20 w-20 flex-none overflow-hidden rounded-lg border-2 bg-gray-50 transition-all hover:opacity-100",
                                selectedImage === index
                                    ? "border-primary opacity-100"
                                    : "border-transparent opacity-70 hover:border-gray-300"
                            )}
                        >
                            <Image
                                src={image}
                                alt={`Product thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
