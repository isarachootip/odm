# สรุปภาพรวมและ Logic ของระบบ ODM (Odm Vidwa)

ระบบ ODM เป็นระบบสั่งอาหารและเครื่องดื่มผ่าน LINE Chatbot ซึ่งมีโครงสร้างรองรับการทำงานแบบ Multi-branch (หลายสาขา) และมีระบบหลังบ้าน (Admin Panel) สำหรับจัดการข้อมูลร้านค้า สินค้า และออเดอร์ต่างๆ

## 1. โครงสร้างของระบบ (System Architecture)
ระบบถูกแบ่งออกเป็น 2 ส่วนหลักๆ (โปรเจกต์) ได้แก่:
1. **Chatbot (LINE bot & Webview/LIFF)**
   - ทำหน้าที่รับส่งข้อความและรับคำสั่งจากลูกค้าผ่าน LINE (Webhook endpoint แบบรองรับหลายสาขา `/api/line/[branch]`)
   - มีหน้าจอแบบ **Hybrid UI (Webview / LIFF)** สำหรับให้ลูกค้าเลือกสินค้า ดูรายละเอียด เลือกตัวเลือก (เช่น จาน, กล่อง, เดลิเวอรี่) และระบุจำนวน เพื่อเพิ่มความยืดหยุ่นกว่าการใช้ Flex Message เพียงอย่างเดียว
   - เมื่อลูกค้าสั่งซื้อสำเร็จ ข้อมูลจะถูกบันทึกลงฐานข้อมูลเป็น "ออเดอร์" (Order)

2. **Admin Panel (ระบบหลังบ้าน 관리자 화면)**
   - พัฒนาด้วย Next.js และเชื่อมต่อฐานข้อมูลผ่าน Prisma ORM
   - ใช้ NextAuth สำหรับระบบ Login ของ Admin และ Staff
   - มีหน้าจัดการและมอนิเตอร์ออเดอร์ (เช่น **Queue Monitor**) แบบแบ่งตามสาขา
   - มีระบบจัดการสินค้า หมวดหมู่ (Categories) การตั้งค่าร้านค้า (เช่น เวลาเปิดปิด, โหมดยุ่ง)
   - จัดการการชำระเงิน (PromptPay, โอนเงินผ่านธนาคาร) 

## 2. โครงสร้างข้อมูล (Database Schema / Prisma Models)
ฐานข้อมูลหลัก (PostgreSQL) ประกอบด้วย Entity ที่สำคัญดังนี้:

* **User (ลูกค้า/พนักงาน)**: ลูกค้าที่ลงทะเบียนผ่าน LINE จะถูกผูกกับระบบ มีการเก็บที่อยู่สำหรับจัดส่ง
* **Branch (สาขา)**: รองรับข้อมูลหลายสาขา (มี `code`, `lineChannelAccessToken` แยกตามสาขา) ทำให้ระบบยืดหยุ่นและผูกออเดอร์และตั้งค่าร้านค้าแยกสาขาได้อย่างเป็นอิสระ
* **Product & Category (สินค้าและหมวดหมู่)**: เก็บข้อมูลราคา รูปภาพ สต๊อก และมี `ProductVariant` เพื่อให้สามารถทำตัวเลือกย่อยของสินค้าได้
* **Order & OrderItem (คำสั่งซื้อ)**: เป็นหัวใจสำคัญของระบบ มีสถานะ `OrderStatus` (PENDING, PAID, PROCESSING, SHIPPED, COMPLETED, CANCELLED) รองรับการตั้งค่ารูปแบบการจัดส่งและการชำระเงิน
* **ShopConfig & PaymentConfig**: ระบบอนุญาตให้สาขาตั้งค่าโหมด "ร้านยุ่ง" (Busy Mode) ตัดการรับออเดอร์ออนไลน์ชั่วคราว, กำหนดเวลาเปิด-ปิดร้าน และกำหนดข้อมูลช่องทางการรับชำระเงินได้ (PromptPay / โอนธนาคาร)
* **Cart & CartSession**: การเก็บสถานะตะกร้าสินค้าในระหว่างที่ User สั่งซื้อ (ก่อนที่จะสร้างเป็น Order)

## 3. Workflow และ Logic การทำงานหลัก (Business Logic)

### 3.1 Flow การสั่งอาหาร (Customer Ordering Flow)
1. ลูกค้าทัก LINE สมัครสมาชิก และพิมพ์คำสั่ง (เช่น "ดูเมนู", "สั่งอาหาร")
2. Bot อ่านหมวดหมู่และสินค้าจากฐานข้อมูล (แยกตามสินค้าของสาขานั้นๆ) และส่ง **Flex Message** จัดรูปแบบแสดงรายการ
3. ลูกค้ากดเลือกสินค้า ระบบจะเปิด **Webview (LIFF)** ของสินค้าตัวนั้น (`webview/product/[id]`) 
4. ใน Webview ระบบดึง Token/LINE User ID ของลูกค้า เพื่อรักษาสเตท ลูกค้าเลือก Options และกด Add to Cart
5. เมื่อลูกค้ากดยืนยันออเดอร์ ระบบ API จะเปลี่ยนของใน Cart เป็น `Order` (สถานะ `PENDING`)

### 3.2 Flow การชำระเงินและการตรวจสอบสลิป (Payment & Slip Verification Flow)
1. **สร้าง QR Code**: ระบบส่ง Dynamic PromptPay QR Code พร้อมยอดเงินรวม (`order.total`) ผ่าน API Endpoint `/api/v1/qr/[orderId].png` (พร้อม `Content-Length` และ `Uint8Array` สำหรับ LINE Proxy)
2. **ลูกค้าส่งสลิป**: ลูกค้าส่งรูปภาพสลิปการโอนเงินเข้ามาในแชท LINE
3. **จัดเก็บภาพสลิป**: ระบบบันทึกภาพสลิปลงใน **Local Storage บน Server** ที่ `public/uploads/slips/` เพื่อความรวดเร็วและไม่พึ่งพา MinIO ภายนอก
4. **AI & API Verification**:
   - **Google Gemini 2.0 Flash Vision AI / SlipOK API**: อ่านข้อมูลสลิปเพื่อสกัด ยอดเงิน (`amount`), ชื่อผู้รับ (`receiver`), วันเวลา (`date/time`), และรหัสอ้างอิง (`transRef`)
   - **Matching Criteria**:
     - ยอดเงินต้องตรงกับ `order.total`
     - ชื่อผู้รับต้องตรงกับ `paymentConfig.accountName`
     - เวลาทำรายการต้องอยู่ภายในระยะเวลาที่กำหนด (Time Limit)
     - รหัสธุรกรรมต้องไม่ซ้ำกับออเดอร์เดิม (ป้องกันสลิปซ้ำ)
5. **ออกบัตรคิว (Queue Ticket)**: เมื่อสลิปผ่าน ระบบอัปเดตสถานะเป็น `PAID` และส่ง Flex Message **"บัตรคิว"** แจ้งเตือนลูกค้า โดยมีข้อความแนะนำให้ลูกค้ารอแจ้งเตือนเมื่ออาหารพร้อมเสิร์ฟ *(ไม่มีปุ่มยืนยันรับสินค้าในขั้นตอนนี้)*

### 3.3 Flow ของระบบครัวและการแจ้งเตือนพร้อมเสิร์ฟ (Kitchen Tracker & Completion Flow)
1. **Admin / Kitchen Tracker**: ครัวรับออเดอร์สถานะ `PAID` ไปปรุงอาหาร
2. **ร้านค้าแจ้ง "พร้อมเสิร์ฟ"**: เมื่อปรุงเสร็จ ร้านค้ากดเปลี่ยนสถานะเป็น **พร้อมเสิร์ฟ (`SHIPPED`)** ในหน้า Web Admin (`mamsoi8.online`)
3. **LINE Push Notification**: ระบบดึง Token ประจำสาขา (`branch.lineChannelAccessToken`) แล้วส่ง Push Message แจ้งเตือนไปยัง LINE ลูกค้าว่าอาหารพร้อมแล้ว พร้อมแนบปุ่ม **"ได้รับสินค้าแล้ว"**
4. **ลูกค้ายืนยันรับอาหาร**: ลูกค้ากดปุ่ม "ได้รับสินค้าแล้ว" ใน LINE ระบบอัปเดตสถานะเป็น `COMPLETED`
5. **ประเมินความพึงพอใจ**: ระบบส่งแบบประเมินความพึงพอใจ (🌟 ให้คะแนน 1-5 ดาว) และเปิดให้ลูกค้าพิมพ์ความคิดเห็นติชมบันทึกลง Database (`Review` model) ทันที

## 4. เทคโนโลยีที่ใช้เบื้องหลัง (Tech Stack)
- **Frontend / Backend**: Next.js (App Router สำหรับ Admin และ Chatbot API Routes ในรูปแบบ Standalone Node.js)
- **Database**: PostgreSQL (เชื่อมต่อและ Query ข้อมูลด้วย Prisma ORM)
- **Authentication**: NextAuth มอบหมาย Role สำหรับ Admin/Staff 
- **AI & Slip Verification**: Google Gemini 2.0 Flash Vision API, SlipOK API
- **Image Storage**: Local Storage (`public/uploads/slips/`)
- **Integrations**: LINE Messaging API (webhook แบบ Multi-branch), LINE Frontend Framework (LIFF/Webview)
- **Deployment**: Coolify / Docker Container (Self-hosted บน Linux Server พร้อมระบบ Automated SSL)

## สรุป (Conclusion)
ระบบ ODM เป็นระบบ O2O (Online-to-Offline) หรือระบบ Food Delivery/Pickup ขนาดย่อม ที่ตอบโจทย์การแยกการจัดการระดับสาขา มีโครงสร้าง Webview ที่ช่วยให้ UI ของ LINE ลื่นไหลและรับคำสั่งซับซ้อนขึ้น มีระบบตรวจสอบสลิปอัตโนมัติด้วย AI และมี Tracking แดชบอร์ดให้พนักงานทำงานหลังร้านได้อย่างสมบูรณ์แบบ

