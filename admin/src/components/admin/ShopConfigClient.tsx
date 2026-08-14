'use client';

import { useState, useTransition, useRef } from 'react';
import { updateShopConfig } from '@/actions/shop-config';
import Image from 'next/image';

interface ShopConfigProps {
    initialConfig: {
        isBusyMode: boolean;
        busyMessage: string | null;
        isScheduleEnabled: boolean;
        openTime: string | null;
        closeTime: string | null;
        logoUrl: string | null;
    };
}

export default function ShopConfigClient({ initialConfig }: ShopConfigProps) {
    const [isBusyMode, setIsBusyMode] = useState(initialConfig.isBusyMode);
    const [busyMessage, setBusyMessage] = useState(initialConfig.busyMessage || "ขออภัย ขณะนี้ร้านมีออเดอร์จำนวนมาก ของดรับออเดอร์ออนไลน์ชั่วคราวครับ");

    // Schedule States
    const [isScheduleEnabled, setIsScheduleEnabled] = useState(initialConfig.isScheduleEnabled || false);
    const [openTime, setOpenTime] = useState(initialConfig.openTime || "08:00");
    const [closeTime, setCloseTime] = useState(initialConfig.closeTime || "17:00");

    // Logo state
    const [logoUrl, setLogoUrl] = useState(initialConfig.logoUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isPending, startTransition] = useTransition();

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload/logo', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                throw new Error('Upload failed');
            }

            const data = await res.json();
            if (data.url) {
                setLogoUrl(data.url);
            }
        } catch (error) {
            console.error('Logo upload error:', error);
            alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateShopConfig({
                    isBusyMode,
                    busyMessage,
                    isScheduleEnabled,
                    openTime,
                    closeTime,
                    logoUrl
                });
                alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
            } catch (error) {
                console.error(error);
                alert('เกิดข้อผิดพลาดในการบันทึก');
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                📢 ตั้งค่าร้านค้า (Shop Settings)
            </h2>

            <div className="space-y-8">
                {/* Logo Section */}
                <div className="space-y-4">
                    <div className="font-medium text-gray-900">🖼️ โลโก้ร้านค้า (Shop Logo)</div>
                    <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24 border border-gray-200 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                            {logoUrl ? (
                                <Image src={logoUrl} alt="Shop Logo" fill className="object-cover" />
                            ) : (
                                <span className="text-gray-400 text-sm">No Logo</span>
                            )}
                        </div>
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleLogoUpload}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                            >
                                {isUploading ? 'กำลังอัปโหลด...' : 'เปลี่ยนโลโก้ (Change Logo)'}
                            </button>
                            <p className="text-xs text-gray-500 mt-2">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB</p>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section 1: Opening Hours */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                        <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                🕒 เวลาเปิด-ปิดอัตโนมัติ (Auto Schedule)
                            </div>
                            <div className="text-sm text-gray-500">
                                ระบบจะแจ้งเตือนลูกค้าอัตโนมัติหากทักมานอกเวลาทำการ
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isScheduleEnabled}
                                onChange={(e) => setIsScheduleEnabled(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className={`grid grid-cols-2 gap-4 transition-all duration-200 ${isScheduleEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเปิด (Open)</label>
                            <input
                                type="time"
                                value={openTime}
                                onChange={(e) => setOpenTime(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เวลาปิด (Close)</label>
                            <input
                                type="time"
                                value={closeTime}
                                onChange={(e) => setCloseTime(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section 2: Busy Mode */}
                <div className="space-y-4">
                    <div>
                        <div className="font-medium text-gray-900">Busy Mode (ปิดรับออเดอร์)</div>
                        <div className="text-sm text-gray-500">
                            เมื่อเปิดระบบจะตอบกลับอัตโนมัติและไม่รับออเดอร์เพิ่ม
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isBusyMode}
                            onChange={(e) => setIsBusyMode(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                </div>

                {/* Message Input */}
                <div className={`transition-all duration-200 ${isBusyMode ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ข้อความตอบกลับอัตโนมัติ (Announcement Message)
                    </label>
                    <textarea
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={busyMessage}
                        onChange={(e) => setBusyMessage(e.target.value)}
                        placeholder="กรอกข้อความที่ต้องการแจ้งลูกค้า..."
                    />
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50"
                    >
                        {isPending ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                    </button>
                </div>
            </div>
        </div>
    );
}
