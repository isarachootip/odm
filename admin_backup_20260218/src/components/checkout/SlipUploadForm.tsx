"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import { uploadSlip } from "@/actions/payment";

export function SlipUploadForm({ orderId }: { orderId: string }) {
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUploading(true);
        const formData = new FormData(e.currentTarget);
        await uploadSlip(orderId, formData);
        setIsUploading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col items-center gap-4 p-6 border rounded-lg bg-gray-50 border-dashed">
            <div className="space-y-2 text-center">
                <h3 className="font-semibold">แนบหลักฐานการโอนเงิน (Slip)</h3>
                <p className="text-xs text-muted-foreground">อัปโหลดสลิปเพื่อยืนยันและรับบัตรคิว</p>
            </div>

            <input
                type="file"
                name="slip"
                accept="image/*"
                required
                className="w-full max-w-xs text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />

            <Button type="submit" disabled={isUploading} className="w-full max-w-xs">
                {isUploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังตรวจสอบ...
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" /> ยืนยันการโอนเงิน
                    </>
                )}
            </Button>
        </form>
    );
}
