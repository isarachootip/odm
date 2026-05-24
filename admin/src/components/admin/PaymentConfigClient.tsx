"use client";

import { useState, useEffect } from "react";
import {
    createPaymentConfig,
    deletePaymentConfig,
    toggleDefaultPayment,
    updatePaymentConfig,
    getPaymentLogs
} from "@/actions/payment-config";
import { PaymentConfig } from "@prisma/client";
import { Trash2, Star, CheckCircle, Edit, History, Save, X } from "lucide-react";

interface Props {
    initialConfigs: PaymentConfig[];
}

interface PaymentLog {
    id: string;
    action: string;
    details: string;
    createdAt: Date;
    User: { name: string | null; email: string | null } | null;
}

export default function PaymentConfigClient({ initialConfigs }: Props) {
    const [configs, setConfigs] = useState(initialConfigs);
    const [logs, setLogs] = useState<PaymentLog[]>([]);

    // Form State
    const [isEditing, setIsEditing] = useState<string | null>(null); // ID being edited, or null
    const [formData, setFormData] = useState({
        paymentType: "PROMPTPAY",
        bankName: "",
        accountName: "",
        accountNumber: "",
        promptpayNumber: "",
        isDefault: false
    });

    const [loading, setLoading] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

    useEffect(() => {
        if (showLogs) {
            fetchLogs();
        }
    }, [showLogs]);

    const fetchLogs = async () => {
        const data = await getPaymentLogs();
        setLogs(data as any);
    };

    const resetForm = () => {
        setFormData({
            paymentType: "PROMPTPAY",
            bankName: "",
            accountName: "",
            accountNumber: "",
            promptpayNumber: "",
            isDefault: false
        });
        setIsEditing(null);
    };

    const handleEdit = (config: PaymentConfig) => {
        setIsEditing(config.id);
        setFormData({
            paymentType: config.paymentType,
            bankName: config.bankName || "",
            accountName: config.accountName,
            accountNumber: config.accountNumber || "",
            promptpayNumber: config.promptpayNumber || "",
            isDefault: config.isDefault
        });
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            bankName: formData.paymentType === "BANK_TRANSFER" ? formData.bankName : "PromptPay",
        };

        let res;
        if (isEditing) {
            res = await updatePaymentConfig(isEditing, payload);
        } else {
            res = await createPaymentConfig(payload);
        }

        if (res.success) {
            resetForm();
            window.location.reload();
        } else {
            alert(`Error: ${res.error}`);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this method? Log will be recorded.")) return;
        await deletePaymentConfig(id);
        window.location.reload();
    };

    const handleSetDefault = async (id: string) => {
        await toggleDefaultPayment(id);
        window.location.reload();
    };

    return (
        <div className="space-y-8">
            {/* Form Section */}
            <div className={`bg-white p-6 rounded-lg shadow-sm border ${isEditing ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        {isEditing ? <><Edit size={20} /> Edit Payment Method</> : "Add Payment Method"}
                    </h2>
                    {isEditing && (
                        <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-sm">
                            Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                                <input
                                    type="radio"
                                    name="type"
                                    value="PROMPTPAY"
                                    checked={formData.paymentType === "PROMPTPAY"}
                                    onChange={e => setFormData({ ...formData, paymentType: e.target.value })}
                                />
                                <span className="font-medium">PromptPay</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                                <input
                                    type="radio"
                                    name="type"
                                    value="BANK_TRANSFER"
                                    checked={formData.paymentType === "BANK_TRANSFER"}
                                    onChange={e => setFormData({ ...formData, paymentType: e.target.value })}
                                />
                                <span className="font-medium">Bank Transfer</span>
                            </label>
                        </div>
                    </div>

                    {formData.paymentType === "BANK_TRANSFER" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={formData.bankName}
                                onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                                placeholder="e.g. KBANK, SCB"
                            />
                        </div>
                    )}

                    {formData.paymentType === "PROMPTPAY" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">PromptPay Number</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={formData.promptpayNumber}
                                onChange={e => setFormData({ ...formData, promptpayNumber: e.target.value })}
                                placeholder="081xxxxxxx"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded"
                            value={formData.accountName}
                            onChange={e => setFormData({ ...formData, accountName: e.target.value })}
                            placeholder="Account Owner Name"
                        />
                    </div>

                    {formData.paymentType === "BANK_TRANSFER" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={formData.accountNumber}
                                onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                                placeholder="xxx-x-xxxxx-x"
                            />
                        </div>
                    )}

                    <div className="flex items-center pt-6 md:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formData.isDefault}
                                onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="w-4 h-4 text-yellow-500"
                            />
                            <span className="text-sm font-medium">Set as Default Method</span>
                        </label>
                    </div>

                    <div className="md:col-span-2 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 rounded font-medium text-white flex items-center gap-2 ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                        >
                            {loading ? "Processing..." : (isEditing ? <><Save size={18} /> Update Changes</> : "Save Configuration")}
                        </button>
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Active Methods</h2>
                <div className="space-y-4">
                    {configs.length === 0 && <p className="text-gray-500 text-center py-4">No payment methods configured.</p>}

                    {configs.map(config => (
                        <div key={config.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg ${config.isDefault ? 'border-yellow-400 bg-yellow-50/50' : 'border-gray-100'}`}>
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${config.isDefault ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-500'}`}>
                                    {config.isDefault ? <Star size={20} fill="currentColor" /> : <div className="font-bold text-xs">{(config.bankName || "PP").substring(0, 2)}</div>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        {config.bankName || "PromptPay"}
                                        {config.isDefault && <span className="text-[10px] bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>}
                                    </h3>
                                    <p className="text-sm text-gray-600">{config.accountName}</p>
                                    <p className="text-sm font-mono text-gray-500">{config.accountNumber || config.promptpayNumber}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-center">
                                {!config.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(config.id)}
                                        className="p-2 text-gray-400 hover:text-yellow-500 border rounded hover:border-yellow-500 transition-colors"
                                        title="Set as Default"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleEdit(config)}
                                    className="p-2 text-gray-400 hover:text-blue-500 border rounded hover:border-blue-500 transition-colors"
                                    title="Edit"
                                    disabled={loading}
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(config.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 border rounded hover:border-red-500 transition-colors"
                                    title="Delete"
                                    disabled={loading}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Logs Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2"><History size={20} /> Audit Logs</h2>
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        {showLogs ? "Refresh Logs" : "Show History"}
                    </button>
                </div>

                {showLogs && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3">Time</th>
                                    <th className="px-4 py-3">Action</th>
                                    <th className="px-4 py-3">Details</th>
                                    <th className="px-4 py-3">User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-3 text-center text-gray-500">No logs found</td></tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                {new Date(log.createdAt).toLocaleString('th-TH', {
                                                    year: 'numeric', month: '2-digit', day: '2-digit',
                                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                <span className={`px-2 py-1 rounded text-xs ${log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                                                    log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                                        log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                                                            'bg-purple-100 text-purple-800'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{log.details}</td>
                                            <td className="px-4 py-3 text-gray-900 font-medium">
                                                {log.User?.name || log.User?.email || "System"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
