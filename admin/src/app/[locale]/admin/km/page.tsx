import { auth } from "@/auth";
import { BookOpen, CheckCircle2, AlertTriangle, CreditCard, MessageSquare, ShieldCheck, HardDrive, RefreshCw, Cpu, Store, ChevronRight, HelpCircle } from "lucide-react";

export default async function KnowledgeManagementPage() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return <div>Unauthorized</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-16">
            {/* Header */}
            <div className="border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                        <BookOpen className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Knowledge Management (KM) & System Manual</h1>
                        <p className="text-sm text-slate-500 mt-1">คู่มือปฏิบัติการ, สถาปัตยกรรมระบบ, กลไกการตรวจสอบสลิป และแนวทางการแก้ปัญหาสำหรับผู้ดูแลระบบ ODM</p>
                    </div>
                </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-1">
                        <CreditCard className="h-4 w-4" /> ระบบชำระเงิน
                    </div>
                    <div className="text-xl font-bold text-slate-800">Dynamic PromptPay</div>
                    <p className="text-xs text-slate-500 mt-1">QR Code พร้อมยอดเงินรวมอัตโนมัติ</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1">
                        <Cpu className="h-4 w-4" /> AI สแกนสลิป
                    </div>
                    <div className="text-xl font-bold text-slate-800">Gemini 2.0 Flash</div>
                    <p className="text-xs text-slate-500 mt-1">ตรวจยอดเงิน + ชื่อผู้รับ + กันสลิปซ้ำ</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm mb-1">
                        <HardDrive className="h-4 w-4" /> พื้นที่จัดเก็บรูป
                    </div>
                    <div className="text-xl font-bold text-slate-800">Local Storage</div>
                    <p className="text-xs text-slate-500 mt-1">บันทึกลงดิสก์ Server ไม่ต้องพึ่งพา MinIO</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-1">
                        <Store className="h-4 w-4" /> โครงสร้างระบบ
                    </div>
                    <div className="text-xl font-bold text-slate-800">Multi-Branch</div>
                    <p className="text-xs text-slate-500 mt-1">แยก Token และคิวตามสาขาอิสระ</p>
                </div>
            </div>

            {/* Section 1: Order Lifecycle */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                    <RefreshCw className="h-5 w-5 text-emerald-600" />
                    1. ลำดับขั้นตอนการทำงานทั้ง 6 ขั้นตอน (End-to-End Order Flow)
                </h2>

                <div className="relative border-l-2 border-emerald-200 ml-4 space-y-8 pl-6">
                    <div className="relative">
                        <span className="absolute -left-[35px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">1</span>
                        <h3 className="font-bold text-slate-900 text-base">ลูกค้าสร้างคำสั่งซื้อ (Create Order)</h3>
                        <p className="text-sm text-slate-600 mt-1">ลูกค้าเลือกสินค้า ระบุตัวเลือกพิเศษ (เช่น หวานน้อย, ทานที่ร้าน/กลับบ้าน) ผ่าน LINE Chatbot หรือ LIFF Webview ระบบสร้างออเดอร์สถานะ <span className="px-2 py-0.5 bg-slate-100 font-mono text-xs rounded text-slate-700">PENDING</span></p>
                    </div>

                    <div className="relative">
                        <span className="absolute -left-[35px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">2</span>
                        <h3 className="font-bold text-slate-900 text-base">สร้าง Dynamic PromptPay QR Code</h3>
                        <p className="text-sm text-slate-600 mt-1">ระบบออกรูปภาพ QR Code พร้อมฝังยอดเงินรวม (<code className="font-mono text-xs text-emerald-700">order.total</code>) และส่งข้อความสรุปรายการสินค้าพร้อมรายละเอียดบัญชีให้ลูกค้าใน LINE</p>
                    </div>

                    <div className="relative">
                        <span className="absolute -left-[35px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">3</span>
                        <h3 className="font-bold text-slate-900 text-base">ลูกค้าส่งสลิป & AI ตรวจสอบอัตโนมัติ</h3>
                        <p className="text-sm text-slate-600 mt-1">เมื่อลูกค้าส่งรูปสลิปเข้ามา ระบบดาวน์โหลดภาพ เซฟลง Local Storage และส่งไปให้ <strong>Google Gemini 2.0 Flash Vision AI</strong> หรือ <strong>SlipOK</strong> สแกนตรวจสอบความถูกต้องทันที</p>
                    </div>

                    <div className="relative">
                        <span className="absolute -left-[35px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">4</span>
                        <h3 className="font-bold text-slate-900 text-base">ออกบัตรคิว (Queue Ticket) แจ้งเตือนลูกค้า</h3>
                        <p className="text-sm text-slate-600 mt-1">เมื่อตรวจสอบสลิปผ่าน ระบบอัปเดตสถานะเป็น <span className="px-2 py-0.5 bg-emerald-100 font-mono text-xs rounded text-emerald-800 font-semibold">PAID</span> คำนวณลำดับคิวประจำวัน และเวลาที่ต้องรอ แล้วส่ง <strong>บัตรคิว (Queue Ticket)</strong> ให้ลูกค้า <span className="text-amber-700 font-medium">(ขั้นตอนนี้ยังไม่มีปุ่มกดยืนยันรับสินค้า)</span></p>
                    </div>

                    <div className="relative">
                        <span className="absolute -left-[35px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">5</span>
                        <h3 className="font-bold text-slate-900 text-base">ครัวปรุงเสร็จ & ร้านกด "พร้อมเสิร์ฟ (SHIPPED)"</h3>
                        <p className="text-sm text-slate-600 mt-1">ร้านค้าเปลี่ยนสถานะใน Web Admin เป็น <strong>พร้อมเสิร์ฟ</strong> ระบบจะยิง Push Notification ไปยัง LINE ลูกค้าว่าอาหารพร้อมแล้ว พร้อมแนบปุ่ม <strong>"ได้รับสินค้าแล้ว"</strong></p>
                    </div>

                    <div className="relative">
                        <span className="absolute -left-[35px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">6</span>
                        <h3 className="font-bold text-slate-900 text-base">ลูกค้ายืนยันรับอาหาร & ให้คะแนนประเมิน (Rating 1-5 ดาว)</h3>
                        <p className="text-sm text-slate-600 mt-1">เมื่อลูกค้ากดปุ่ม "ได้รับสินค้าแล้ว" ระบบปรับสถานะเป็น <span className="px-2 py-0.5 bg-blue-100 font-mono text-xs rounded text-blue-800 font-semibold">COMPLETED</span> และส่งแบบฟอร์มประเมินความพึงพอใจ 1-5 ดาว ให้ลูกค้ากดให้คะแนนและพิมพ์คอมเมนต์ติชม</p>
                    </div>
                </div>
            </div>

            {/* Section 2: Slip Verification & Matching Logic */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                    2. กลไกการตรวจสอบสลิปและเกณฑ์การ Matching (Slip Verification Logic)
                </h2>
                <p className="text-sm text-slate-600 mb-6">ระบบตรวจสอบความถูกต้องของสลิปโดยเทียบกับข้อมูลที่ตั้งไว้ในฐานข้อมูล (<code className="font-mono text-xs">PaymentConfig</code> และ <code className="font-mono text-xs">Order</code>) ตาม 4 เกณฑ์หลัก:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" /> 1. ยอดเงินโอน (Amount Matching)
                        </div>
                        <p className="text-sm text-slate-600">ยอดเงินในสลิปต้องตรงกับยอดรวมของออเดอร์ (<code className="font-mono text-xs text-emerald-700">order.total</code>) หากไม่ตรง ระบบจะแจ้งเตือนและไม่ออกคิว</p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" /> 2. ชื่อผู้รับโอน (Receiver Matching)
                        </div>
                        <p className="text-sm text-slate-600">ชื่อผู้รับในสลิปต้องตรงกับชื่อบัญชีที่ตั้งไว้ในระบบ (<code className="font-mono text-xs text-indigo-700">paymentConfig.accountName</code>) เช่น <em>นาย อิศระ ชูทิพย์</em></p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" /> 3. ป้องกันสลิปซ้ำ (Duplicate Prevention)
                        </div>
                        <p className="text-sm text-slate-600">รหัสธุรกรรม (<code className="font-mono text-xs text-slate-700">transactionRef</code>) จะถูกบันทึกในฐานข้อมูล หากมีการส่งสลิปรหัสเดิมซ้ำ ระบบจะปฏิเสธทันที</p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" /> 4. เงื่อนไขเวลา (Time Limit Window)
                        </div>
                        <p className="text-sm text-slate-600">เวลาโอนในสลิปต้องไม่เกินเวลาที่กำหนด (ปกติ 30 นาที, Pre-order 360 นาที) หากเกินระบบจะส่งให้อนุมัติแบบ Manual</p>
                    </div>
                </div>
            </div>

            {/* Section 3: Domain & Infrastructure Matrix */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Store className="h-5 w-5 text-blue-600" />
                    3. การตั้งค่าโดเมนและเซิร์ฟเวอร์ (Domain & Server Topology)
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 text-slate-700 text-xs font-semibold uppercase">
                            <tr>
                                <th className="p-3">ระบบ</th>
                                <th className="p-3">โดเมน (Domain)</th>
                                <th className="p-3">Environment Variable ที่สำคัญ</th>
                                <th className="p-3">หน้าที่หลัก</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            <tr className="hover:bg-slate-50">
                                <td className="p-3 font-semibold text-slate-900">LINE Chatbot</td>
                                <td className="p-3 font-mono text-blue-600">https://chat.mamsoi8.online</td>
                                <td className="p-3 font-mono text-xs">CHATBOT_URL="https://chat.mamsoi8.online"</td>
                                <td className="p-3 text-slate-600">Webhook รับส่งข้อความ LINE, สร้าง QR Code, ตรวจสลิป, เสิร์ฟรูปภาพ</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                                <td className="p-3 font-semibold text-slate-900">Admin Console</td>
                                <td className="p-3 font-mono text-blue-600">https://mamsoi8.online</td>
                                <td className="p-3 font-mono text-xs">NEXT_PUBLIC_APP_URL="https://mamsoi8.online"</td>
                                <td className="p-3 text-slate-600">หน้าจัดการออเดอร์, คิวมอนิเตอร์, จัดการเมนู, ตั้งค่าร้านค้า และดูรีวิว</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 4: FAQ & Troubleshooting */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                    <HelpCircle className="h-5 w-5 text-amber-600" />
                    4. คำถามที่พบบ่อยและแนวทางแก้ไขปัญหา (FAQ & Troubleshooting)
                </h2>

                <div className="space-y-4">
                    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" /> ทำไม QR Code บน LINE บางครั้งแสดงเป็นรูปกรอบสี่เหลี่ยมว่างเปล่า?
                        </h3>
                        <p className="text-sm text-slate-600 mt-2">
                            <strong>สาเหตุ:</strong> เกิดจากตัวแปร <code className="font-mono text-xs">CHATBOT_URL</code> ชี้ผิดโดเมน (เช่น ไปชี้ที่เว็บ Admin ซึ่งไม่มี API QR) หรือ Header ขาด <code className="font-mono text-xs">Content-Length</code> ทำให้ LINE Image Proxy ปฏิเสธการดาวน์โหลด<br />
                            <strong>วิธีแก้:</strong> ตั้งค่าใน Coolify Dashboard ให้ <code className="font-mono text-xs">CHATBOT_URL=https://chat.mamsoi8.online</code> และใช้ API ล่าสุดที่มีการแปลงเป็น Uint8Array และใส่ Content-Length Header
                        </p>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" /> สลิปโอนเงินถูกต้อง แต่ทำไมระบบไม่ออกบัตรคิว?
                        </h3>
                        <p className="text-sm text-slate-600 mt-2">
                            <strong>สาเหตุ:</strong> ยอดเงินในสลิปอาจไม่ตรงกับยอดของออเดอร์ (เช่น สั่ง 50 บาทแต่โอน 40 บาท), สลิปเบลอจน OCR อ่านยอดไม่ได้ หรือเวลาโอนเกิน Time Limit 30 นาที<br />
                            <strong>วิธีแก้:</strong> ให้ลูกค้าส่งภาพสลิปที่ชัดเจนเต็มใบเข้ามาใหม่ หรือผู้ดูแลระบบสามารถเข้าไปตรวจดูภาพสลิปและกดยืนยันออเดอร์แบบ Manual ในหน้า Admin Orders ได้ทันที
                        </p>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" /> ทำไมกด "พร้อมเสิร์ฟ" ใน Admin แล้ว LINE ลูกค้าไม่ได้รับการแจ้งเตือน?
                        </h3>
                        <p className="text-sm text-slate-600 mt-2">
                            <strong>สาเหตุ:</strong> สาขาที่ออเดอร์นั้นสังกัดอยู่ไม่ได้ใส่ <code className="font-mono text-xs">lineChannelAccessToken</code> หรือ Token หมดอายุ<br />
                            <strong>วิธีแก้:</strong> เข้าไปที่เมนู <strong>Branches</strong> ใน Admin Panel แล้วตรวจสอบว่าได้กรอก LINE Channel Access Token ของสาขานั้นๆ ถูกต้องสมบูรณ์
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
