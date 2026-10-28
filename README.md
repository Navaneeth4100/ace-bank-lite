# Ace Bank Lite (Next.js & Vercel Edition)

A high-performance, full-stack digital banking web application converted from the original Java Servlets/JSP/Tomcat application into a modern **Next.js (App Router) + TypeScript + Prisma ORM** architecture tailored for 1-click serverless deployment on **Vercel**.

---

## 🌟 Key Features Preserved & Modernized

- **Authentication & Security:**
  - Secure registration with 12-digit UIDAI Aadhaar verification.
  - Automatic 8-digit random account number generation (`10000000`–`99999999`).
  - **BCrypt password hashing** (salt rounds: 12) with 100% cryptographic compatibility with Java's `jbcrypt`.
  - HTTP-only, SameSite JWT session cookies and edge-ready `middleware.ts` auth protection.
  - "Remember Me" persistent account number login.
  - Password reset and account recovery workflow.

- **Atomic Banking Operations:**
  - **Live Balance:** Real-time balance inquiry with animated count-up display.
  - **Quick Deposit:** Atomic balance credit with transaction logging (`remark: "Self"`).
  - **Fund Transfer:** Inter-account transfers with recipient validation, self-transfer prevention, balance verification, and ACID multi-step transactions via `prisma.$transaction`.
  - **Withdraw Money:** Daily limit enforcement (₹500.00 daily withdrawal cap queried dynamically), balance sufficiency check, and atomic debit.

- **Transactions & Statements:**
  - Complete statement ledger with real-time debit (-) and credit (+) indicators.
  - One-click CSV statement export.

- **UI & Experience:**
  - Faithful reproduction of AceBank's fintech aesthetic.
  - Seamless Light/Dark theme toggle with automatic OS preference detection.
  - Responsive mobile-first design built with Tailwind CSS.

---

## 📁 Project Directory Tree

```
ace-bank-lite-next/
├── app/
│   ├── api/
│   │   ├── account/
│   │   │   ├── dashboard/route.ts      # Replaces Home.java (doGet)
│   │   │   ├── deposit/route.ts        # Replaces Deposit.java
│   │   │   ├── statement/csv/route.ts  # CSV export endpoint
│   │   │   ├── transfer/route.ts       # Replaces Home.java (transfer)
│   │   │   └── withdraw/route.ts       # Replaces Home.java (withdraw)
│   │   └── auth/
│   │       ├── change-password/route.ts# Password reset endpoint
│   │       ├── forgot-password/route.ts# Account recovery endpoint
│   │       ├── login/route.ts          # Replaces Login.java
│   │       ├── logout/route.ts         # Replaces Logout.java
│   │       ├── me/route.ts             # Session status endpoint
│   │       └── signup/route.ts         # Replaces SignUp.java
│   ├── dashboard/
│   │   ├── change-password/page.tsx    # Replaces ChangePassword.jsp
│   │   └── page.tsx                    # Replaces Home.jsp (4-card grid & table)
│   ├── forgot-password/page.tsx        # Replaces ForgotPassword.jsp
│   ├── login/page.tsx                  # Replaces login.jsp
│   ├── sign-up/page.tsx                # Replaces sign-up.jsp
│   ├── error.tsx                       # Replaces error.jsp (500 handler)
│   ├── globals.css                     # Tailwind CSS & custom animations
│   ├── layout.tsx                      # Root layout & typography
│   ├── not-found.tsx                   # Replaces error.jsp (404 handler)
│   └── page.tsx                        # Replaces index.jsp (Landing page)
├── components/
│   ├── AlertBanner.tsx                 # Dynamic success/error banner
│   ├── BalanceCounter.tsx              # Smooth countUp.js counter
│   ├── Navbar.tsx                      # Header navigation with auth state
│   └── ThemeToggle.tsx                 # Light / Dark mode toggle
├── lib/
│   ├── auth.ts                         # BCrypt hashing & JWT session management
│   ├── bankService.ts                  # Replicates BankServiceImpl & BankUserDaoImpl
│   ├── mail.ts                         # Replicates MailUtil (Nodemailer)
│   └── prisma.ts                       # Prisma singleton client for serverless
├── prisma/
│   ├── schema.prisma                   # Production schema (Postgres / MySQL)
│   └── seed.ts                         # Seed script with test users & accounts
├── .env.example                        # Template for required environment variables
├── .gitignore                          # Standard git ignore rules
├── middleware.ts                       # Edge auth guard (replaces AuthFilter.java)
├── next.config.ts                      # Next.js production build config
├── package.json                        # Project scripts & dependencies
├── postcss.config.mjs                  # PostCSS Tailwind config
├── schema.sql                          # Direct SQL migration for PostgreSQL & MySQL
├── tailwind.config.ts                  # Custom colors & dark mode configuration
└── tsconfig.json                       # Strict TypeScript configuration
```

---

## 🛠️ Configuration Files

### 1. `package.json` Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push"
  }
}
```

### 2. `.env.example`
```env
# Database Connection URL (Neon / Supabase PostgreSQL or Aiven MySQL)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/acebank?sslmode=require"

# JWT Secret for Session Cookies
JWT_SECRET="generate-a-secure-random-secret-key-for-acebank"

# Optional SMTP Settings (Gmail / SendGrid / Resend)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
SMTP_FROM="AceBank Support <your-email@gmail.com>"
```

---

## 🗄️ Database Setup (Free Cloud Providers)

You can use any free serverless database:
- **Neon** (Recommended for Vercel): [https://neon.tech](https://neon.tech) (PostgreSQL)
- **Supabase**: [https://supabase.com](https://supabase.com) (PostgreSQL)
- **Aiven**: [https://aiven.io](https://aiven.io) (MySQL or PostgreSQL)

### Option A: Using Prisma DB Push (Recommended)
1. Copy `.env.example` to `.env.local` and paste your `DATABASE_URL`.
2. Run:
   ```bash
   npx prisma db push
   ```
3. (Optional) Populate demo users and transactions:
   ```bash
   npx ts-node prisma/seed.ts
   ```

### Option B: Using Direct SQL
If you prefer running SQL scripts directly in Neon's or Supabase's SQL Editor, execute the queries in `schema.sql`.

---

## 🚀 Step-by-Step Vercel Deployment Guide

### Step 1: Create a Free Cloud Database on Neon
1. Go to [neon.tech](https://neon.tech) and create a free project named `acebank`.
2. Copy the **Pooled Connection String** (it looks like `postgresql://user:pass@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`).

### Step 2: Push Your Project to GitHub
1. In the `ace-bank-lite-next` folder, open your terminal:
   ```bash
   git init
   git add .
   git commit -m "feat: migrate ace-bank-lite to Next.js fullstack"
   ```
2. Create a new repository on your GitHub account (`https://github.com/new`) named `ace-bank-lite-next`.
3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/ace-bank-lite-next.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
2. Select your `ace-bank-lite-next` repository from GitHub.
3. In the **Environment Variables** section, add:
   - `DATABASE_URL`: Your Neon/Supabase pooled connection string.
   - `JWT_SECRET`: A long random string (e.g. `acebank-production-jwt-secret-key-2026`).
   - *(Optional)* `SMTP_USER` and `SMTP_PASS` if you want live welcome emails.
4. Click **Deploy**.
5. Vercel will execute `prisma generate` and `next build` automatically. Within ~1 minute, your banking application is live globally!

---

## 🧪 Demo Credentials

If you ran the seed script (`prisma/seed.ts`), you can log in with:
- **Account Number:** `10001000`
- **Password:** `Password123!`
- **Demo Transfer Recipient:** `20002000`
