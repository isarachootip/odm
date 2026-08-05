# คู่มือการติดตั้งระบบ ODM บน Coolify (Coolify Deployment Guide)

เอกสารนี้รวบรวมขั้นตอนทั้งหมดที่ต้องทำในการย้ายระบบ ODM (Order Management) ไปรันบน Coolify

---

## 📋 ข้อกำหนดเบื้องต้น (Prerequisites)
1. **Coolify Server**: คุณต้องมีอินสแตนซ์ Coolify ที่ตั้งค่าเรียบร้อยแล้วและเชื่อมต่อกับเซิร์ฟเวอร์ (VPS)
2. **Git Repository**: ตรวจสอบว่าโค้ดล่าสุดถูก push ไปยัง GitHub เรียบร้อยแล้ว:
   ```bash
   git add .
   git commit -m "chore: update docker-compose for coolify externalized envs"
   git push origin main
   ```
3. **Database**: ฐานข้อมูลยังคงใช้ Neon PostgreSQL ตามเดิม ไม่จำเป็นต้องติดตั้ง DB ใหม่บน Coolify

---

## 📦 1. วิธีติดตั้ง PostgreSQL Database บน Coolify (Docker)

สำหรับการรันฐานข้อมูลเองบน VPS ด้วย Docker ผ่าน Coolify ให้ทำตามขั้นตอนต่อไปนี้ก่อนที่จะติดตั้ง Admin และ Chatbot:

1. ที่หน้า Dashboard ของ Coolify เลือก **+ New Resource** -> **Databases**
2. เลือก **PostgreSQL**
3. ตั้งชื่อบริการฐานข้อมูล (เช่น `odm-db`)
4. Coolify จะทำการสร้าง PostgreSQL Container ให้โดยอัตโนมัติ
5. เมื่อติดตั้งเสร็จ ให้จดจำข้อมูลการเชื่อมต่อจากหน้าการตั้งค่า Database:
   * **Connection String (Internal)**: สำหรับเชื่อมต่อภายในระหว่าง Docker Container ใน Coolify (แนะนำให้ใช้ค่านี้เพื่อความรวดเร็วและปลอดภัยสูงสุด) โดยมีรูปแบบดังนี้: `postgresql://postgres:<รหัสผ่าน>@<ชื่อ-container>:5432/<ชื่อ-db>` (เช่น `postgresql://postgres:randompwd@odm-db:5432/postgres`)
   * **Connection String (External)**: สำหรับการเชื่อมต่อจากนอกเซิร์ฟเวอร์ (เช่น จากเครื่องของคุณเพื่อเข้าไปดูข้อมูลผ่าน DBeaver/Prisma Studio)
6. แนะนำให้สร้าง Database แยกขึ้นมาชื่อ `odm_vidwa_db` ในบริการ PostgreSQL นี้ หรือจะใช้ Database หลักที่ชื่อ `postgres` ก็ได้

---

## 🚀 2. วิธีการติดตั้งผ่าน Coolify (เลือกรูปแบบที่ต้องการ)

แนะนำให้ใช้ **แบบที่ 1 (2 Applications แยกกัน)** เนื่องจากง่ายต่อการตั้งค่า SSL และ Domain แยกกัน

### 🔹 แบบที่ 1: ติดตั้งแบบ 2 Applications แยกกัน (แนะนำ)

วิธีนี้เราจะใช้ Git Repository เดียวกันมาสร้าง 2 บริการใน Coolify แยกกัน:

#### 1. ติดตั้งระบบ Admin
1. ในหน้า Dashboard ของ Coolify เลือก **Projects** -> เลือก Project ของคุณ -> กด **+ New Resource**
2. เลือก **Public Repository** หรือ **Private Repository** (ขึ้นอยู่กับสิทธิ์ของ GitHub Repo)
3. ใส่ URL ของ Repo: `https://github.com/isarachootip/odm.git`
4. ตั้งค่าในหน้าโปรเจกต์:
   * **Base Directory**: `/admin` (สำคัญมาก! เพื่อให้ใช้ Dockerfile และ config ของ admin)
   * **Build Pack**: `Dockerfile`
   * **Ports Exposed**: `3000`
5. ไปที่แท็บ **Environment Variables** และใส่ตัวแปรด้านล่างทั้งหมด (แทนที่ URL ฐานข้อมูลด้วยค่าที่ได้จากข้อ 1)
6. กำหนด **Domains** ในหน้าการตั้งค่า เช่น `https://admin.yourdomain.com`
7. กด **Deploy**

#### 2. ติดตั้งระบบ Chatbot
1. ทำขั้นตอนแบบเดียวกับการสร้าง Admin
2. ตั้งค่าในหน้าโปรเจกต์:
   * **Base Directory**: `/chatbot` (สำคัญมาก! เพื่อให้ใช้ Dockerfile และ config ของ chatbot)
   * **Build Pack**: `Dockerfile`
   * **Ports Exposed**: `3000` (ตัว Next.js ของ Chatbot รันที่ port 3000 ใน container)
3. ไปที่แท็บ **Environment Variables** และใส่ตัวแปรด้านล่างทั้งหมด
4. กำหนด **Domains** ในหน้าการตั้งค่า เช่น `https://chatbot.yourdomain.com`
5. กด **Deploy**

---

### 🔹 แบบที่ 2: ติดตั้งแบบ Docker Compose Stack (รันรวมกัน)

หากต้องการรันด้วย Compose เหมือน Local:
1. ในหน้า Dashboard ของ Coolify เลือก **+ New Resource** -> **Docker Compose**
2. ใส่ URL ของ Repo: `https://github.com/isarachootip/odm.git`
3. Coolify จะดึงไฟล์ `docker-compose.yml` มาให้โดยอัตโนมัติ
4. ไปที่แท็บ **Environment Variables** ของ Stack
5. ใส่ตัวแปรทั้งหมดของทั้ง Admin และ Chatbot รวมกันในหน้าเดียว
6. กำหนดโดเมนสำหรับแต่ละบริการในช่อง **Domains** ของ Coolify UI:
   * สำหรับบริการ `admin`: ให้ map ไปที่ port `3000` (เช่น `https://admin.yourdomain.com`)
   * สำหรับบริการ `chatbot`: ให้ map ไปที่ port `3001` (เช่น `https://chatbot.yourdomain.com`)
7. กด **Deploy**

---

## 🔑 3. ข้อมูล Environment Variables ที่ต้องระบุ

ให้แทนที่ `<URL-ฐานข้อมูล-Coolify>` ด้วย **Connection String (Internal)** ที่ได้จากขั้นตอนที่ 1 ครับ

### สำหรับ Admin Service
* `DATABASE_URL` = `<URL-ฐานข้อมูล-Coolify>`
* `POSTGRES_URL` = `<URL-ฐานข้อมูล-Coolify>`
* `POSTGRES_URL_NON_POOLING` = `<URL-ฐานข้อมูล-Coolify>`
* `NEXTAUTH_SECRET` = `OdmVidwaSecretKey2026Generated`
* `NEXTAUTH_URL` = `https://<โดเมนใหม่ของ-admin-บน-coolify>` (เช่น `https://admin.yourdomain.com`)
* `BLOB_READ_WRITE_TOKEN` = `vercel_blob_rw_XyACulKm03lZRfCh_AQxss0XQNFzJpT8A9bQSrJpsiBQbfy`
* `LINE_CHANNEL_ACCESS_TOKEN` = `OjsWYmeoNT9lQTB9GdbcyUDpQC5fhcrTxKCpEJxbRWFa60+K210rzvoJJz+GJL09sRnDXo2M+1kp/NktxpQsxCvtXJMZBDy1b/GGwT1pybfbz/WIt0N8MnTzxSat61jKUqQJkbXTNYdfgUgh8xo2lwdB04t89/1O/w1cDnyilFU=`

### สำหรับ Chatbot Service
* `DATABASE_URL` = `<URL-ฐานข้อมูล-Coolify>`
* `POSTGRES_URL` = `<URL-ฐานข้อมูล-Coolify>`
* `POSTGRES_PRISMA_URL` = `<URL-ฐานข้อมูล-Coolify>?connect_timeout=15`
* `POSTGRES_URL_NON_POOLING` = `<URL-ฐานข้อมูล-Coolify>`
* `LINE_CHANNEL_ACCESS_TOKEN` = `OjsWYmeoNT9lQTB9GdbcyUDpQC5fhcrTxKCpEJxbRWFa60+K210rzvoJJz+GJL09sRnDXo2M+1kp/NktxpQsxCvtXJMZBDy1b/GGwT1pybfbz/WIt0N8MnTzxSat61jKUqQJkbXTNYdfgUgh8xo2lwdB04t89/1O/w1cDnyilFU=`
* `LINE_CHANNEL_SECRET` = `3162832047074d1e13e7b2f555e9aee6`
* `GEMINI_API_KEY` = `AIzaSyAA3ACGKy17Ng6WaDqKFieEcpSBWz_dfVI`
* `BLOB_READ_WRITE_TOKEN` = `vercel_blob_rw_XyACulKm03lZRfCh_AQxss0XQNFzJpT8A9bQSrJpsiBQbfy`
* `API_KEY_VIDWA` = `odm_vidwa_secret_key_2026`

---

## 🔄 4. ขั้นตอนที่ต้องทำหลังการติดตั้ง (Post-Deployment Steps)

### 1. การเปลี่ยน Webhook URL ใน LINE Developers Console
เมื่อนำเว็บขึ้นและมีโดเมน HTTPS จาก Coolify แล้ว:
1. ล็อกอินเข้าสู่ [LINE Developers Console](https://developers.line.biz/)
2. เลือก Provider และ Channel ของ LINE Chatbot ของคุณ
3. ไปที่แท็บ **Messaging API** -> ค้นหาหัวข้อ **Webhook settings**
4. แก้ไข **Webhook URL** ให้เป็น URL ใหม่ เช่น:
   `https://<โดเมนใหม่-chatbot>/api/webhook`
5. กด **Verify** เพื่อให้ระบบเช็คการเชื่อมต่อ (ควรขึ้น Success)
6. ตรวจสอบให้มั่นใจว่าปุ่ม **Use webhook** ถูกเปิดใช้งานเป็นสีเขียว (Enabled)

### 2. การสร้างตารางข้อมูล (Database Migration)
เนื่องจากฐานข้อมูลที่สร้างใหม่บน Coolify ยังไม่มีตารางเก็บข้อมูล (Schema) คุณต้องทำการส่ง Schema โครงสร้างตารางจาก Prisma ขึ้นไปสร้างในฐานข้อมูลใหม่:
1. เปิด Terminal ในโฟลเดอร์โครงการที่เครื่องคอมพิวเตอร์ของคุณ
2. ปรับตัวแปร `DATABASE_URL` ในไฟล์ `.env` ของ `admin` ให้ชี้ไปที่ **Connection String (External)** ของฐานข้อมูลบน Coolify ชั่วคราว (หรือรันคำสั่งโดยส่งค่า Env เข้าไปตรงๆ)
3. รันคำสั่ง push schema:
   ```bash
   cd admin
   npx prisma db push
   ```
   *(หมายเหตุ: โครงสร้างตารางจะถูกอัปโหลดขึ้นไปสร้างบนฐานข้อมูล PostgreSQL ตัวใหม่ที่อยู่บน Coolify ทันที)*

### 3. การเตรียมข้อมูลพื้นฐาน (Database Seeding)
เมื่อตารางข้อมูลถูกสร้างเสร็จแล้ว ฐานข้อมูลจะยังว่างเปล่า ไม่มีข้อมูลผู้ใช้หรือสินค้า ให้ทำการรันตัวช่วยสร้างข้อมูลตั้งต้น (Seed) โดย:
1. เปิดเว็บเบราว์เซอร์แล้วเข้าไปที่ URL สำหรับการ Seed ของแอป Admin:
   `https://<โดเมนใหม่-admin>/api/seed`
2. ระบบจะทำการเพิ่มข้อมูลตั้งต้นให้อัตโนมัติ (ได้แก่ หมวดหมู่สินค้า, รายการสินค้าตัวอย่าง และผู้ใช้งานผู้ดูแลระบบเริ่มต้น)
3. เมื่อเสร็จสิ้น คุณสามารถเข้าสู่ระบบ Admin ได้ด้วยบัญชีผู้ใช้เริ่มต้น:
   * **อีเมล**: `admin@example.com`
   * **รหัสผ่าน**: `123456`
   *(แนะนำให้เปลี่ยนรหัสผ่านทันทีหลังจากการเข้าสู่ระบบครั้งแรกเพื่อความปลอดภัย)*
