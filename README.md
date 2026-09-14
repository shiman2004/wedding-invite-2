# 🌸 Blossom & Oud - Wedding Invitation Web App

A luxury, interactive wedding invitation web application featuring scratch-to-reveal cards, background orchestra music, Arabic calligraphy, countdown timers, event timelines, responsive venue maps, Supabase-backed live RSVP collection, and a full admin dashboard.

---

## ✨ Features

- **Interactive Envelope Opening & Video Intro**
- **Scratch-to-Reveal Date Card** with realistic silver foil scratching physics
- **Background Symphony Player** with continuous luxury soundtrack
- **Countdown Timer** to the wedding day
- **Event Timeline & Program**
- **Venue & Google Maps Integration**
- **Dress Code Guide**
- **Real-Time RSVP Submission**:
  - Direct connection to **Supabase** database
  - Attendance confirmation & guest party size headcount
  - Congratulatory wishes & notes collection
  - Offline fallback support via `localStorage`
- **Admin Dashboard (`/admin`)**:
  - Live RSVP response counters & attending guest headcounts
  - Search & filter by attendance status
  - 1-click **Export RSVPs to CSV**
  - Live Theme & Color customization
  - Cloud Config Sync with Supabase

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd wedding-invite
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and add your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup (Supabase)
Run the queries in `supabase_schema.sql` in your **Supabase SQL Editor** to create the `rsvps` and `wedding_config` tables.

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

---

## 🛠️ Built With

- **React 19** + **TypeScript**
- **Vite**
- **Supabase** (`@supabase/supabase-js`)
- **Framer Motion** & **Canvas Confetti**
- **Lucide Icons**
