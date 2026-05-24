# Deployment Guide for okproduct-ecommerce

This guide details how to deploy the **okproduct-ecommerce** application to [Vercel](https://vercel.com), which is the recommended platform for Next.js applications.

## Prerequisites

1.  **Vercel Account**: [Sign up here](https://vercel.com/signup).
2.  **GitHub Repository**: Push this project to a GitHub repository.
3.  **Vercel Postgres (Recommended)** or any PostgreSQL database accessible from the internet.

## Option A: Deploy via Vercel Dashboard (Recommended)

1.  **Push to GitHub**:
    - Commit all your changes.
    - Create a new repository on GitHub.
    - Push your code:
      ```bash
      git init
      git add .
      git commit -m "Initial commit"
      git branch -M main
      git remote add origin <your-repo-url>
      git push -u origin main
      ```

2.  **Create Project on Vercel**:
    - Go to your Vercel Dashboard.
    - Click **"Add New..."** -> **"Project"**.
    - Import your GitHub repository.

3.  **Configure Project**:
    - **Framework Preset**: Next.js (Default)
    - **Root Directory**: `okproduct-ecommerce` (If you pushed the entire `chatbot-system` folder, select that subfolder, otherwise `./`)
    - **Environment Variables**: You need to set the following:
        - `DATABASE_URL`: The connection string to your PostgreSQL database.
        - `AUTH_SECRET`: A random string for session encryption.
        - `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://your-project.vercel.app`).

4.  **Deploy**:
    - Click **"Deploy"**.
    - Wait for the build to finish.

## Option B: Deploy via Vercel CLI

If you have the Vercel CLI installed (`npm i -g vercel`), you can deploy directly from your terminal:

1.  **Login**:
    ```bash
    vercel login
    ```

2.  **Deploy**:
    Run this command in the project directory:
    ```bash
    vercel
    ```

## Database Setup

After deployment:

1.  **Push Schema**:
    - Ensure your production database has the schema.
    - You can run `npx prisma db push` locally while `DATABASE_URL` in your `.env` points to the production DB.

2.  **Seed Data**:
    - Visit: `https://your-project.vercel.app/api/seed`
    - This will populate products and create the Admin user.

## Login Details

- **Admin**: `admin@example.com` / `123456`
