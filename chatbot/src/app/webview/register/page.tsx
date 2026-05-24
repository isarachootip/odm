"use client";

import { useState, useEffect } from "react";

export default function RegisterPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [liffReady, setLiffReady] = useState(false);
    const [liffInstance, setLiffInstance] = useState<any>(null);

    useEffect(() => {
        // Get userId from URL params first (fallback / debug mode)
        const urlParams = new URLSearchParams(window.location.search);
        const urlUserId = urlParams.get("userId");
        if (urlUserId) setUserId(urlUserId);

        // Try to init LIFF if LIFF_ID is configured
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (liffId) {
            import("@line/liff").then((liffModule) => {
                const liff = liffModule.default;
                liff.init({ liffId })
                    .then(() => {
                        setLiffInstance(liff);
                        setLiffReady(true);
                        if (liff.isLoggedIn()) {
                            liff.getProfile().then((profile) => {
                                setUserId(profile.userId);
                            });
                        } else {
                            liff.login();
                        }
                    })
                    .catch((err) => {
                        console.error("LIFF Init Error:", err);
                        setLiffReady(false);
                    });
            });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!userId) {
            setError("ไม่พบข้อมูลผู้ใช้งาน LINE กรุณาเปิดผ่านแอพ LINE");
            return;
        }
        if (name.trim().length < 2) {
            setError("กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร");
            return;
        }
        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length < 9) {
            setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9-10 หลัก)");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/cart/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    name: name.trim(),
                    department: department.trim(),
                    phone: cleanPhone,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }

            // Show success screen
            setSuccess(true);

            // Close LIFF window after short delay (if in LIFF)
            setTimeout(() => {
                if (liffInstance && liffReady && liffInstance.isInClient()) {
                    liffInstance.closeWindow();
                }
            }, 2000);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
            setIsSubmitting(false);
        }
    };

    // ─── SUCCESS SCREEN ───────────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6"
                style={{ background: "linear-gradient(135deg, #fef9c3 0%, #fef3c7 100%)" }}>
                <div style={{
                    background: "white",
                    borderRadius: "24px",
                    padding: "48px 32px",
                    textAlign: "center",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    maxWidth: "360px",
                    width: "100%",
                }}>
                    <div style={{ fontSize: "64px", marginBottom: "16px" }}>✅</div>
                    <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#92400e", marginBottom: "8px" }}>
                        บันทึกข้อมูลแล้ว!
                    </h2>
                    <p style={{ color: "#78716c", fontSize: "15px", lineHeight: "1.6" }}>
                        สวัสดี คุณ <strong style={{ color: "#92400e" }}>{name}</strong> 👋
                        <br />
                        กลับไปที่แชท LINE เพื่อไปขั้นตอนถัดไปได้เลยค่ะ
                    </p>
                    <p style={{ color: "#a8a29e", fontSize: "12px", marginTop: "24px" }}>
                        หน้านี้จะปิดอัตโนมัติ...
                    </p>
                </div>
            </div>
        );
    }

    // ─── REGISTER FORM ────────────────────────────────────────────
    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #fef9c3 0%, #fef3c7 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            fontFamily: "'Noto Sans Thai', 'Sarabun', sans-serif",
        }}>
            <div style={{
                background: "white",
                borderRadius: "24px",
                width: "100%",
                maxWidth: "400px",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
            }}>
                {/* Header */}
                <div style={{
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    padding: "28px 24px",
                    textAlign: "center",
                }}>
                    <div style={{ fontSize: "36px", marginBottom: "6px" }}>👋</div>
                    <h1 style={{ color: "white", fontSize: "22px", fontWeight: "800", margin: 0 }}>ลงทะเบียนลูกค้า</h1>
                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", margin: "6px 0 0" }}>
                        กรอกข้อมูลครั้งแรกครั้งเดียว → ครั้งต่อไปสะดวกกว่า!
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>

                    {error && (
                        <div style={{
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            color: "#b91c1c",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#44403c", marginBottom: "6px" }}>
                            👤 ชื่อ-นามสกุล <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            autoComplete="name"
                            onChange={(e) => setName(e.target.value)}
                            placeholder="เช่น สมชาย ใจดี"
                            style={inputStyle}
                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                        />
                    </div>

                    {/* Department */}
                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#44403c", marginBottom: "6px" }}>
                            🏢 คณะ / ฝ่าย
                            <span style={{ fontSize: "12px", color: "#a8a29e", fontWeight: "400", marginLeft: "6px" }}>(ไม่บังคับ)</span>
                        </label>
                        <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="เช่น วิทยาศาสตร์, IT"
                            style={inputStyle}
                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#44403c", marginBottom: "6px" }}>
                            📱 เบอร์โทรศัพท์ <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                            type="tel"
                            required
                            maxLength={10}
                            inputMode="numeric"
                            value={phone}
                            autoComplete="tel"
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            placeholder="0812345678"
                            style={inputStyle}
                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !name || !phone}
                        style={{
                            width: "100%",
                            padding: "16px",
                            borderRadius: "14px",
                            border: "none",
                            background: isSubmitting || !name || !phone
                                ? "#e5e7eb"
                                : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            color: isSubmitting || !name || !phone ? "#9ca3af" : "#fef3c7",
                            fontSize: "16px",
                            fontWeight: "800",
                            cursor: isSubmitting || !name || !phone ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            boxShadow: isSubmitting || !name || !phone ? "none" : "0 4px 15px rgba(245, 158, 11, 0.4)",
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⏳</span>
                                กำลังบันทึก...
                            </>
                        ) : (
                            "✅ บันทึกข้อมูล"
                        )}
                    </button>

                    <p style={{ textAlign: "center", fontSize: "12px", color: "#a8a29e", margin: 0 }}>
                        🔒 ข้อมูลของคุณจะถูกเก็บเป็นความลับ
                    </p>
                </form>
            </div>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1.5px solid #e5e7eb",
    fontSize: "16px",
    color: "#1c1917",
    background: "#fafaf9",
    outline: "none",
    transition: "all 0.2s",
    boxSizing: "border-box",
};

const inputFocusStyle: React.CSSProperties = {
    ...inputStyle,
    border: "1.5px solid #f59e0b",
    background: "white",
    boxShadow: "0 0 0 3px rgba(245, 158, 11, 0.15)",
};
