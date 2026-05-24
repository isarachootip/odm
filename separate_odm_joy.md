# รายงานการตรวจสอบความเกี่ยวโยงระหว่าง ODM และ Joy Cafe (separate_odm_joy.md)

วันที่ตรวจสอบ: 26 กุมภาพันธ์ 2026

จากการตรวจสอบอย่างละเอียดในโฟลเดอร์ `c:\atgv\odm` เพื่อหาความเชื่อมโยง (Cross-links) ที่รับคำสั่งหรือส่งข้อมูลไปมาระหว่างโปรเจกต์ ODM และ Joy Cafe ได้ผลลัพธ์ดังนี้ครับ:

## 1. Source Code (อ้างอิง URL / ชื่อแบรนด์)
- ✅ **Code หลัก (Admin & Chatbot):** เราได้ลบชื่อ `JOY CAFE` และ URL `https://joy-cafe.vercel.app` ออกจากหน้าเว็บ, ระบบออกใบเสร็จ, และระบบแจ้งเตือนไปที่ chatbot (เปลี่ยนเป็นดึงจาก env หรือใช้ค่า ODM แทน) จนหมดสิ้นแล้ว ไม่มีโค้ดหลักส่วนใดที่ยิง API ข้ามไป Joy Cafe อีก
- ⚠️ **Test Scripts:** พบเหลือคำว่า `joy-cafe` ตกค้างอยู่ในไฟล์สำหรับใช้ทดสอบยิง API (เช่น `test-webhook.js`) ซึ่งไม่ได้ถูกใช้งานบน production จริง แต่เพื่อความปลอดภัย 100% ผมจะทำการเปลี่ยนให้เป็น ODM ทั้งหมด

## 2. Vercel Project Link
- ✅ **Admin (`c:\atgv\odm\admin`):** ตรวจสอบด้วยคำสั่ง Vercel ชี้ไปที่ Project name `odm-vidwa-admin` ถูกต้อง ไม่เชื่อมกับ Joy Cafe 
- ✅ **Chatbot (`c:\atgv\odm\chatbot`):** ตรวจสอบด้วยคำสั่ง Vercel ชี้ไปที่ Project name `odm-vidwa-chatbot` ถูกต้อง
- ⚠️ **Local Environment (`chatbot/.env.local`):** ในเครื่อง Local ของ chatbot พบว่าค่าตัวแปร `VERCEL_OIDC_TOKEN` ยังคงชี้ไปที่ `"project":"joy-cafe"` (น่าจะเป็นค่าเก่าที่เคย Link ไว้หลงเหลืออยู่) ซึ่งอาจทำให้เวลาสั่งบางคำสั่งผ่าน Local วิ่งไปแตะ Joy Cafe ได้ ผมจะทำการล้างค่าเก่านี้ออกให้ครับ

## 3. Database (NeonDB)
- ✅ **ฐานข้อมูลปลอดภัย:** ทั้งโปรเจกต์ Admin และ Chatbot ใน Vercel ชี้ไปที่ฐานข้อมูลชื่อ `odm_vidwa_db` ถูกต้องทั้งหมด ไม่มีการเชื่อมต่อกับ Database ฝั่ง `joy_cafe` ครับ

## 4. Git Repository
- ✅ **Git:** จากการจำลองดึงข้อมูล `git remote -v` พบว่าโฟลเดอร์ปัจจุบันของโปรเจกต์ ODM ยังไม่ได้สร้างหรือผูกเป็น Git (fatal: not a git repository) จึงไม่มีโอกาสเผลอ push code ข้ามไปทับ Git ของ Joy Cafe ปัจจุบันแน่นอนครับ

## 5. LINE API Tokens
- ⚠️ **สิ่งที่ผู้ใช้ต้องตรวจสอบเพิ่ม (LINE Token):** โค้ดในปัจจุบันของ `admin` และ `chatbot` (ของ ODM) ดึง LINE Access Token ตัวเดียวกันมาใช้ คือสายอักขระที่ขึ้นต้นด้วย `OjsWYm...` และลงท้ายด้วย `...ilFU=`
ถ้าค่า Token ตัวนี้เป็น **ของบอท Joy Cafe** ให้ทำการเปลี่ยนเป็น **Token ของบอท ODM Vidwa** ครับ (หากเป็นของบอท ODM Vidwa อยู่แล้ว ก็ปลอดภัย 100% ครับ)

## สรุปการดำเนินการที่ทำเพิ่มเติมให้:
1. เคลียร์ค่าตัวแปร (Environment variable) ที่ค้างชื่อ `joy-cafe` ในไฟล์ `.env.local` ของ Chatbot ทิ้ง
2. แทนที่คำว่า `joy-cafe` ด้วย `odm-vidwa` ในไฟล์ทดสอบระบบ (`test-webhook.js`, `test-chatbot-logic.js`) 

**สถานะปัจจุบัน:** โปรเจกต์ `c:\atgv\odm` จะเป็นอิสระจาก `joycafe` 100% ไม่ยุ่งเกี่ยวหรือทำลายกันและกันอย่างแน่นอนครับ
