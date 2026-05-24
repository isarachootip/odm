"use client";

import { useState } from "react";
import { createBankConfig, deleteBankConfig, toggleDefaultBank } from "@/actions/bank-config";
import { BankConfig } from "@prisma/client";
import { Trash2, Star, CheckCircle } from "lucide-react";

interface Props {
    initialBanks: BankConfig[];
}

export default function BankConfigPageClient({ initialBanks }: Props) {
    const [banks, setBanks] = useState(initialBanks);
    const [formData, setFormData] = useState({
        bankName: "PromptPay",
        accountName: "",
        accountNumber: "",
        isDefault: false
    });
    const [loading, setLoading] = useState(false);

    // New banks added by server action revalidation might not reflect immediately in client state 
    // without router.refresh(), but for simplicity we'll just reload or trust next fetch.
    // Ideally use useTransition or router.refresh(). 
    // Let's implement optimistic update or just simple reload for now.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await createBankConfig(formData);
        if (res.success) {
            setFormData({ ...formData, accountName: "", accountNumber: "" });
            window.location.reload(); // Simple reload to refresh data
        } else {
            alert(`Error: ${res.error || "Unknown error creating bank config"}`);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this bank config?")) return;
        await deleteBankConfig(id);
        window.location.reload();
    };

    const handleSetDefault = async (id: string) => {
        await toggleDefaultBank(id);
        window.location.reload();
    };

    return (
        <div className="space-y-8">
            {/* Create Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Add Payment Method</h2>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name / Type</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded"
                            value={formData.bankName}
                            onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                            placeholder="e.g. PromptPay, KBANK"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded"
                            value={formData.accountName}
                            onChange={e => setFormData({ ...formData, accountName: e.target.value })}
                            placeholder="Account Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account No. / PromptPay ID</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded"
                            value={formData.accountNumber}
                            onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                            placeholder="081XXXXXXX or 123-4-56789-0"
                        />
                    </div>
                    <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isDefault}
                                onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                            />
                            <span className="text-sm">Set as Default</span>
                        </label>
                    </div>

                    <div className="md:col-span-2 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-yellow-400 text-black px-4 py-2 rounded font-medium hover:bg-yellow-500 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Configuration"}
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Active Accounts</h2>
                <div className="space-y-4">
                    {banks.length === 0 && <p className="text-gray-500 text-sm">No accounts configured.</p>}

                    {banks.map(bank => (
                        <div key={bank.id} className={`flex items-center justify-between p-4 border rounded-lg ${bank.isDefault ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bank.isDefault ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-500'}`}>
                                    {bank.isDefault ? <Star size={20} fill="currentColor" /> : <div className="font-bold text-xs">{bank.bankName.substring(0, 2)}</div>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{bank.bankName} {bank.isDefault && <span className="text-xs bg-yellow-400 px-2 py-0.5 rounded-full ml-2">Default</span>}</h3>
                                    <p className="text-sm text-gray-600">{bank.accountName}</p>
                                    <p className="text-sm font-mono text-gray-500">{bank.accountNumber}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {!bank.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(bank.id)}
                                        className="p-2 text-gray-400 hover:text-yellow-500"
                                        title="Set as Default"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(bank.id)}
                                    className="p-2 text-gray-400 hover:text-red-500"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
