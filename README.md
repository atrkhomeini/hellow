<div align="center">

# Personal Portfolio

A Modern, Interactive Portfolio for Data Scientist & Full Stack Developer

[![Live Site](https://img.shields.io/badge/Live%20Site-Visit%20Portfolio-3ecf8e?style=for-the-badge&logo=vercel&logoColor=white)](https://your-portfolio-url.com)

</div>

---

## Overview

A dark-mode-native portfolio designed to impress HR professionals and technical recruiters. Built with modern web technologies, featuring smooth animations, 3D effects, and an intuitive admin dashboard for content management.

Inspired by Supabase's developer-centric aesthetic with deep blacks and emerald green accents, creating a premium code-editor feel.

---

## Features

### User Experience

| Feature | Description |
|---|---|
| Dark Mode Native | Deep, eye-friendly dark theme with emerald green accents |
| Spotlight Cards | Interactive project cards with glow-on-hover effects |
| Scroll Timeline | Smooth, animated career timeline with 3D perspective |
| Blur Reveal Text | Elegant text reveal animations in the hero section |
| Fully Responsive | Seamless experience across all devices |
| Lightning Fast | Optimized for performance with Next.js standalone build |

### Admin Dashboard

| Feature | Description |
|---|---|
| Secure Authentication | NextAuth-powered admin access with session management |
| Rich Text Editor | MDX editor for formatted descriptions |
| Drag and Drop Ordering | Reorder projects and experiences visually |
| Media Upload | Upload images, videos, and documents |
| Draft/Publish System | Save drafts without publishing to public |
| Message Inbox | View contact form submissions |

### Sections

| Section | Description |
|---|---|
| Hero | Introduction with blur-reveal text effect and shine button for CV download |
| Skills | Categorized skills (Expertise, Hard Skills, Languages) with brand icons |
| Experience | Animated scroll timeline with bullet-point descriptions |
| Projects | Spotlight cards with expandable details and skill tags |
| My Taste | Bento grid showcasing Apple Music, Brewing, and Fitness |
| Contact | 3D form wrapper with social links |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="20" height="20"/> Next.js | 16.1.1 | React framework with App Router |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="20" height="20"/> TypeScript | 5.0 | Type-safe development |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="20" height="20"/> Tailwind CSS | 4.0 | Utility-first styling |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="20" height="20"/> React | 19.0.0 | UI library |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/framermotion/framermotion-original.svg" width="20" height="20"/> Framer Motion | 12.38.0 | Smooth animations |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/zustand/zustand-original.svg" width="20" height="20"/> Zustand | 5.0.6 | Lightweight state management |

### Backend & Database

| Technology | Version | Purpose |
|---|---|---|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" width="20" height="20"/> Prisma | 6.11.1 | ORM for database management |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg" width="20" height="20"/> SQLite | - | Lightweight embedded database |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="20" height="20"/> NextAuth | 4.24.11 | Authentication system |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="20" height="20"/> Zod | 4.4.1 | Schema validation |

### UI Libraries

| Library | Purpose |
|---|---|
| shadcn/ui | 40+ accessible components |
| Radix UI | Headless UI primitives |
| Lucide React | Icon library |
| KokonutUI | Spotlight cards, loaders, smooth tabs |
| Lightswind | Scroll timeline, shine button, drag order list |
| Vaul | Drawer component |
| Sonner | Toast notifications |

---

## Design System

### Color Palette

| Color | Hex | Usage |
|---|---|---|
| Near Black | `#0f0f0f` | Primary button, deepest surface |
| Dark Background | `#171717` | Page background |
| Emerald Green | `#3ecf8e` | Brand accent, links |
| Green Link | `#00c573` | Interactive elements |
| Border Dark | `#2e2e2e` | Card borders |
| Off White | `#fafafa` | Primary text |
| Muted | `#898989` | Secondary text |

### Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Display Hero | Geist Sans | 72px | 400 |
| Section Heading | Geist Sans | 36px | 400 |
| Body | Geist Sans | 16px | 400 |
| Code | Geist Mono | 14px | 400 |

---

## Project Structure

```
personal_web-app/
├── public/
│   ├── assets/               # Brand icons & SVGs
│   ├── uploads/              # User uploaded media
│   └── logo.svg              # Portfolio logo
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Initial data seeding
├── src/
│   ├── app/
│   │   ├── api/              # REST API routes
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Main page
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── admin/            # Admin dashboard components
│   │   ├── sections/         # Page sections
│   │   ├── ui/               # Reusable UI components
│   │   ├── kokonutui/        # Spotlight cards, loaders
│   │   └── lightswind/       # Scroll timeline, shine button
│   ├── lib/                  # Utilities (auth, db, utils)
│   ├── hooks/                # Custom React hooks
│   └── store/                # Zustand state management
├── db/
│   └── custom.db             # SQLite database file
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

<div align="center">

Built with Next.js, TypeScript & Tailwind CSS

</div>