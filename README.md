# InfoTech Innovation — منصة الابتكار المجتمعي

A bilingual (Arabic / English) full-stack community platform built for InfoTech Innovation Algeria. Youth, teachers, and institutions can register, submit community issues & ideas, fill surveys, and stay connected with local innovation initiatives.

**Live:** https://innovation-club-two.vercel.app

---

## Features

- **Bilingual (AR/EN) with full RTL support** — every page switches language seamlessly
- **3-profile registration** — Youth, Teacher, Institution — each with tailored fields and document uploads
- **Email OTP verification** — HMAC-signed, rate-limited (3 attempts / 10 min)
- **Cloudinary file uploads** — birth certificates, CVs, diplomas, parental consent forms
- **Issues & Ideas** — citizens submit community problems with category and affected group
- **Surveys** — admin creates multi-type surveys (text / multiple choice / rating); users respond
- **Admin dashboard** — full management: review registrations, approve/reject with email, manage issues, analytics
- **Analytics tab** — KPI cards, monthly trend chart, donut charts, survey engagement table, recent activity feed
- **Email notifications** — admin on new registration, user on approve/reject, broadcast on new survey (Resend API)
- **Visual effects** — parallax hero, animated gradient border on CTAs, confetti burst on registration success
- **PWA** — installable on mobile with manifest + theme color
- **92 unit tests + 36 E2E tests** (Jest + Playwright)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| i18n | next-intl (AR/EN, RTL) |
| Database | Firebase Firestore |
| Auth | Firebase Auth |
| File Storage | Cloudinary (unsigned uploads) |
| Email | Resend API |
| Hosting | Vercel |
| Testing | Jest + Playwright |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/Walid-Redjem/InfoTech-Innovation.git
cd InfoTech-Innovation
npm install
```

### 2. Set up environment variables

Create a `.env.local` file at the root:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# Resend
RESEND_API_KEY=

# OTP
OTP_SECRET=your-secret-here

# Admin
ADMIN_EMAIL=your-admin-email@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app defaults to Arabic (`/ar`).

---

## Project Structure

```
app/
├── [locale]/           # All public pages (AR/EN routing)
│   ├── page.tsx        # Home
│   ├── about/
│   ├── join/           # Registration form
│   ├── issues/
│   ├── surveys/
│   ├── activities/
│   ├── terms/
│   └── admin/          # Protected dashboard
├── api/
│   ├── send-code/      # OTP generation (rate-limited)
│   ├── verify-code/    # HMAC token verification
│   ├── notify-admin/   # Email admin on new registration
│   ├── review-registration/  # Approve / reject + email user
│   └── notify-survey/  # Broadcast survey to approved members
components/
├── home/               # Hero, Stats, Services, Marquee, About
├── layout/             # Navbar, Footer
└── forms/              # FileUpload (Cloudinary)
lib/
├── firebase.ts
├── otp.ts              # generateCode, signToken, isCodeValid
├── formatDate.ts
└── exportCSV.ts
messages/
├── en.json
└── ar.json
```

---

## Admin Access

Go to `/en/admin/login` (or `/ar/admin/login`). Sign in with the Firebase Auth account created for the admin. The dashboard is a full overlay — separate from the public site.

---

## Tests

```bash
# Unit tests (92 tests across 7 suites)
npm run test:unit

# E2E tests (36 tests — Chromium + Mobile Safari)
npm run test:e2e
```

---

## Deployment

The project is deployed on **Vercel**. All environment variables must be added in the Vercel project settings under *Settings → Environment Variables*.

Firestore is currently in **test mode** — security rules should be tightened before going to production.

---

## License

Private project — built for InfoTech Innovation, Algeria. All rights reserved.
