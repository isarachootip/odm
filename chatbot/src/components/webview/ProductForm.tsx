
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, Minus, Plus, ShoppingBag, Utensils, Package, Truck, Check } from "lucide-react";
import { Product } from "@prisma/client";
import { useRouter } from "next/navigation";

// Define option types manually to match the DB json
type ProductOption = {
    id: string;
    label: string;
    type: "single" | "multiple";
    required: boolean;
    choices: {
        label: string;
        value: string;
        price?: number;
    }[];
};

type ProductSpecs = {
    options: ProductOption[];
};

type OrderType = "PLATE" | "BOX" | "DELIVERY";

interface ProductFormProps {
    product: Product;
    userId: string;
    branchCode: string;
}

export default function ProductForm({ product, userId, branchCode }: ProductFormProps) {
    const router = useRouter();

    // States
    const [quantity, setQuantity] = useState(1);
    const [orderType, setOrderType] = useState<OrderType>("PLATE");
    const [note, setNote] = useState("");
    const [selections, setSelections] = useState<Record<string, string | string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Parse specifications
    let parsedSpecs: ProductSpecs = { options: [] };
    if (product.specifications) {
        try {
            if (typeof product.specifications === 'string') {
                parsedSpecs = JSON.parse(product.specifications);
            } else if (typeof product.specifications === 'object') {
                parsedSpecs = product.specifications as unknown as ProductSpecs;
            }
        } catch (e) {
            console.error("Failed to parse specifications", e);
        }
    }
    const specs = { options: parsedSpecs?.options || [] };

    // Calculate Total Price
    const calculateTotal = () => {
        let total = Number(product.price) * quantity;

        // Add option prices
        specs.options.forEach(opt => {
            const selectedValue = selections[opt.id];
            if (!selectedValue) return;

            if (Array.isArray(selectedValue)) {
                // Multiple selection
                selectedValue.forEach(val => {
                    const choice = opt.choices.find(c => c.value === val);
                    if (choice && choice.price) {
                        total += choice.price * quantity;
                    }
                });
            } else {
                // Single selection
                const choice = opt.choices.find(c => c.value === selectedValue);
                if (choice && choice.price) {
                    total += choice.price * quantity;
                }
            }
        });

        return total;
    };

    // Handle Option Selection
    const handleSelect = (optionId: string, value: string, type: "single" | "multiple") => {
        if (type === "single") {
            setSelections(prev => ({ ...prev, [optionId]: value }));
        } else {
            setSelections(prev => {
                const current = (prev[optionId] as string[]) || [];
                if (current.includes(value)) {
                    return { ...prev, [optionId]: current.filter(v => v !== value) };
                } else {
                    return { ...prev, [optionId]: [...current, value] };
                }
            });
        }
    };

    // Submit to API
    const handleSubmit = async () => {
        // Validate required fields
        for (const opt of specs.options) {
            if (opt.required && !selections[opt.id]) {
                alert(`กรุณาเลือก ${opt.label}`);
                return;
            }
        }

        if (!userId) {
            alert("ไม่พบ User ID (กรุณาเปิดผ่าน LINE)");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    productId: product.id,
                    quantity,
                    selections,
                    orderType,
                    note,
                    branchCode
                })
            });

            if (!res.ok) throw new Error("Failed to add to cart");

            alert("✅ เพิ่มลงตะกร้าเรียบร้อย!\n(กรุณากดกากบาท ❌ มุมขวาบนเพื่อกลับสู่แชท)");

            // Try to close window (works in LIFF and some mobile browsers)
            try {
                if (typeof window !== 'undefined') {
                    // Try liff if available
                    if ((window as any).liff) {
                        (window as any).liff.closeWindow();
                    } else {
                        // Try standard close
                        window.close();
                    }
                }
            } catch (e) {
                console.log("Could not auto-close window:", e);
            }
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการสั่งซื้อ");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans">
            {/* Header Image */}
            <div className="relative h-64 w-full bg-gray-200">
                {product.images && product.images[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                )}
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 bg-white/80 p-2 rounded-full shadow-sm backdrop-blur-sm"
                >
                    <ChevronLeft size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="bg-white -mt-6 rounded-t-3xl relative p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-xl font-semibold text-yellow-600 mt-1">฿{Number(product.price)}</p>
                <p className="text-sm text-gray-500 mt-2">{product.description}</p>
            </div>

            <div className="p-4 space-y-6">

                {/* Order Type Selector */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-semibold mb-3 text-gray-800">รับประทานแบบไหน?</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setOrderType("PLATE")}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${orderType === "PLATE" ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600"
                                }`}
                        >
                            <Utensils size={24} className="mb-1" />
                            <span className="text-xs font-medium">ใส่จาน</span>
                        </button>
                        <button
                            onClick={() => setOrderType("BOX")}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${orderType === "BOX" ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600"
                                }`}
                        >
                            <Package size={24} className="mb-1" />
                            <span className="text-xs font-medium">ใส่กล่อง</span>
                        </button>
                        <button
                            onClick={() => setOrderType("DELIVERY")}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${orderType === "DELIVERY" ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600"
                                }`}
                        >
                            <Truck size={24} className="mb-1" />
                            <span className="text-xs font-medium">เดลิเวอรี่</span>
                        </button>
                    </div>
                </div>

                {/* Dynamic Options */}
                {specs.options.map((opt) => (
                    <div key={opt.id} className="bg-white p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-gray-800">
                                {opt.label}
                                {opt.required && <span className="text-red-500 ml-1">*</span>}
                            </h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {opt.type === "single" ? "เลือก 1 อย่าง" : "เลือกได้หลายอย่าง"}
                            </span>
                        </div>

                        {/* Chips / Pills UI */}
                        <div className="flex flex-wrap gap-2">
                            {opt.choices.map((choice) => {
                                const isSelected = opt.type === "single"
                                    ? selections[opt.id] === choice.value
                                    : (selections[opt.id] as string[] || []).includes(choice.value);

                                return (
                                    <button
                                        key={choice.value}
                                        onClick={() => handleSelect(opt.id, choice.value, opt.type)}
                                        className={`
                      relative px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2
                      ${isSelected
                                                ? "bg-yellow-500 border-yellow-500 text-white shadow-md"
                                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}
                    `}
                                    >
                                        {isSelected && <Check size={14} />}
                                        {choice.label}
                                        {choice.price ? <span className="opacity-80 text-xs ml-1">(+{choice.price})</span> : null}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Special Instructions (Text Box) */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-semibold mb-3 text-gray-800">ข้อความเพิ่มเติม (ถ้ามี)</h3>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={100}
                        placeholder="เช่น ไม่ใส่ผักชี, แยกน้ำ..."
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-yellow-400 outline-none resize-none transition-shadow"
                        rows={3}
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">{note.length}/100</div>
                </div>

                {/* Quantity Counter */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                    <span className="font-semibold text-gray-800">จำนวน</span>
                    <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-yellow-600 active:scale-95 transition-all"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="text-lg font-bold w-6 text-center">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-yellow-600 active:scale-95 transition-all"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-yellow-500 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-between px-6 hover:bg-yellow-600 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <span className="text-sm font-medium bg-white/20 px-2 py-0.5 rounded">{quantity} รายการ</span>
                    <span>เพิ่มลงตะกร้า</span>
                    <span className="text-sm font-medium">฿{calculateTotal().toLocaleString()}</span>
                </button>
            </div>
        </div>
    );
}
