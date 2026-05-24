
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, X, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface ProductOptionChoice {
    value: string;
    label: string;
    price: number;
}

export interface ProductOptionGroup {
    id: string;
    label: string;
    type: "select" | "multiselect";
    required: boolean;
    choices: ProductOptionChoice[];
}

interface ProductOptionsEditorProps {
    initialOptions?: ProductOptionGroup[];
    onChange: (options: ProductOptionGroup[]) => void;
}

interface ProductWithOptions {
    id: string;
    name: string;
    categoryName: string;
    options: ProductOptionGroup[];
}

export function ProductOptionsEditor({ initialOptions = [], onChange }: ProductOptionsEditorProps) {
    const [groups, setGroups] = useState<ProductOptionGroup[]>(initialOptions);
    const [isCopying, setIsCopying] = useState(false);
    const [productsWithOptions, setProductsWithOptions] = useState<ProductWithOptions[]>([]);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        onChange(groups);
    }, [groups, onChange]);

    const handleOpenCopyModal = async () => {
        setShowCopyModal(true);
        if (productsWithOptions.length === 0) {
            setIsLoadingProducts(true);
            try {
                const res = await fetch('/api/admin/products/options');
                if (!res.ok) throw new Error("Failed to fetch products");
                const data = await res.json();
                setProductsWithOptions(data);
            } catch (error) {
                console.error(error);
                toast.error("ไม่สามารถโหลดข้อมูลสินค้าได้");
            } finally {
                setIsLoadingProducts(false);
            }
        }
    };

    const handleCopyOptions = (productToCopy: ProductWithOptions) => {
        if (!window.confirm(`คัดลอกตัวเลือกทั้งหมดจาก "${productToCopy.name}" มาทับตัวเลือกปัจจุบัน?`)) {
            return;
        }

        // Generate new IDs for the copied groups and choices to avoid React key conflicts
        const copiedGroups = productToCopy.options.map(g => ({
            ...g,
            id: crypto.randomUUID(),
            choices: g.choices.map(c => ({
                ...c,
                value: crypto.randomUUID()
            }))
        }));

        setGroups(copiedGroups);
        setShowCopyModal(false);
        toast.success(`คัดลอกตัวเลือกจาก "${productToCopy.name}" สำเร็จ`);
    };

    const filteredProducts = productsWithOptions.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addGroup = () => {
        const newGroup: ProductOptionGroup = {
            id: crypto.randomUUID(),
            label: "New Option Group",
            type: "select",
            required: true,
            choices: []
        };
        setGroups([...groups, newGroup]);
    };

    const removeGroup = (id: string) => {
        setGroups(groups.filter(g => g.id !== id));
    };

    const updateGroup = (id: string, updates: Partial<ProductOptionGroup>) => {
        setGroups(groups.map(g => (g.id === id ? { ...g, ...updates } : g)));
    };

    const addChoice = (groupId: string) => {
        setGroups(groups.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    choices: [...g.choices, { value: crypto.randomUUID(), label: "New Choice", price: 0 }]
                };
            }
            return g;
        }));
    };

    const removeChoice = (groupId: string, choiceValue: string) => {
        setGroups(groups.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    choices: g.choices.filter(c => c.value !== choiceValue)
                };
            }
            return g;
        }));
    };

    const updateChoice = (groupId: string, choiceValue: string, updates: Partial<ProductOptionChoice>) => {
        setGroups(groups.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    choices: g.choices.map(c => (c.value === choiceValue ? { ...c, ...updates } : c))
                };
            }
            return g;
        }));
    };

    return (
        <div className="space-y-6 border rounded-lg p-4 bg-gray-50 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-800">Product Options</h3>
                <div className="flex gap-2">
                    <Button type="button" onClick={handleOpenCopyModal} size="sm" variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100">
                        <Copy className="w-4 h-4 mr-1" /> Copy Options
                    </Button>
                    <Button type="button" onClick={addGroup} size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                        <Plus className="w-4 h-4 mr-1" /> Add Group
                    </Button>
                </div>
            </div>

            {/* Copy Options Modal */}
            {showCopyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold text-lg text-gray-800">คัดลอกตัวเลือกจากสินค้าอื่น</h3>
                            <button onClick={() => setShowCopyModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-4 border-b">
                            <input 
                                type="text" 
                                placeholder="ค้นหาชื่อสินค้า หรือ หมวดหมู่..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                autoFocus
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {isLoadingProducts ? (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                    <p className="text-sm">กำลังโหลดข้อมูล...</p>
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <p className="text-center text-sm text-gray-500 py-4">
                                    {searchTerm ? "ไม่พบสินค้าที่ค้นหา" : "ไม่มีสินค้าที่มีการตั้งค่า Option ไว้เปิดให้คัดลอก"}
                                </p>
                            ) : (
                                filteredProducts.map(product => (
                                    <div 
                                        key={product.id}
                                        className="flex items-center justify-between p-3 border rounded-md hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group"
                                        onClick={() => handleCopyOptions(product)}
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900 group-hover:text-blue-700">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.categoryName} • {product.options.length} กลุ่มตัวเลือก</p>
                                        </div>
                                        <Button size="sm" variant="ghost" className="text-blue-600 group-hover:bg-blue-100 h-8 px-2">
                                            เลือก
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {groups.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4 italic">No options defined. Add a group to start (e.g., Size, Topping).</p>
            )}

            <div className="space-y-4">
                {groups.map((group, index) => (
                    <div key={group.id} className="bg-white border rounded-md p-4 shadow-sm">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Group Label</label>
                                    <input
                                        type="text"
                                        value={group.label}
                                        onChange={(e) => updateGroup(group.id, { label: e.target.value })}
                                        className="w-full text-sm border rounded px-2 py-1.5 font-medium"
                                        placeholder="e.g. Size, Noodle Type"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                                        <select
                                            value={group.type}
                                            onChange={(e) => updateGroup(group.id, { type: e.target.value as any })}
                                            className="w-full text-sm border rounded px-2 py-1.5"
                                        >
                                            <option value="select">Single Select (Radio)</option>
                                            <option value="multiselect">Multi Select (Checkbox)</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={group.required}
                                                onChange={(e) => updateGroup(group.id, { required: e.target.checked })}
                                                className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                                            />
                                            <span className="text-sm text-gray-600">Required</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeGroup(group.id)}
                                className="text-red-400 hover:text-red-600 p-1"
                                title="Remove Group"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Choices */}
                        <div className="pl-4 ml-2 border-l-2 border-gray-100 space-y-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Choices</span>
                                <button
                                    type="button"
                                    onClick={() => addChoice(group.id)}
                                    className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add Choice
                                </button>
                            </div>

                            {group.choices.length === 0 && (
                                <p className="text-xs text-gray-400 italic">No choices added yet.</p>
                            )}

                            {group.choices.map((choice) => (
                                <div key={choice.value} className="flex items-center gap-2">
                                    <GripVertical className="w-4 h-4 text-gray-300 cursor-move" />
                                    <input
                                        type="text"
                                        value={choice.label}
                                        onChange={(e) => updateChoice(group.id, choice.value, { label: e.target.value })}
                                        className="flex-1 text-sm border rounded px-2 py-1"
                                        placeholder="Label (e.g. Normal)"
                                    />
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-400">+฿</span>
                                        <input
                                            type="number"
                                            value={choice.price}
                                            onChange={(e) => updateChoice(group.id, choice.value, { price: Number(e.target.value) })}
                                            className="w-20 text-sm border rounded px-2 py-1 text-right"
                                            placeholder="0"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeChoice(group.id, choice.value)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
