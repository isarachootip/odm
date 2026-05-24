# odm_configuration.md

## 1. Local Path
- **Root**: `c:\atgv\odm`
- **Admin**: `c:\atgv\odm\admin`
- **Chatbot**: `c:\atgv\odm\chatbot`

## 2. Vercel Path
- **Project Name**: `joy-cafe` (inferred from OIDC token)
- **Framework**: Next.js (Admin & Chatbot)
- **Configuration**: `vercel.json` present in both `admin` and `chatbot`.

## 3. Database Information
- **Database URL**: `postgresql://neondb_owner:npg_yZnoLR05TqQW@ep-weathered-cake-a142l6vv.ap-southeast-1.aws.neon.tech/odm_vidwa_db?sslmode=require`
- **Provider**: Neon (PostgreSQL)
- **Connection Pooling**: Supported (see `POSTGRES_URL` vs `POSTGRES_URL_NON_POOLING` in env backups)

## 4. Admin Credentials (Default/Seed)
- **Email**: `admin@example.com`
- **Password**: `123456`
- **Source**: `admin/src/app/api/seed/route.ts`

## 5. Chatbot Path
- **Local**: `c:\atgv\odm\chatbot`
- **Configuration**: Uses `.env.local` for LINE and Gemini keys.

## 6. Admin Path
- **Local**: `c:\atgv\odm\admin`
- **Configuration**: Uses `.env` for Database URL, NextAuth Secret, and LINE keys.

## 7. Other Important Information
- **NextAuth Secret**: `OdmVidwaSecretKey2026Generated`
- **Line Channel Access Token**: Present in `admin/.env` and `chatbot/.env.local`.
- **Blob Storage**: Vercel Blob configured (`BLOB_READ_WRITE_TOKEN`).
- **Dependencies**: Uses `prisma`, `next-auth` (v5 beta), `@line/bot-sdk`.
- **Seed Scripts**: 
  - Chatbot: `seed.mjs` (seeds products only)
  - Admin: `/api/seed` route (seeds categories, products, and admin user)
