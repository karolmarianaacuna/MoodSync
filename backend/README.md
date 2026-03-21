# MoodSync — Frontend

Interface of MoodSync, built with Next.js 14, TypeScript and Tailwind CSS.
Installable as a PWA on Android and iPhone.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios (HTTP requests to the API)
- Socket.io client (real-time sync)

## Project Structure

frontend/
├── app/
│   ├── layout.tsx          ← base layout, fonts, metadata
│   ├── page.tsx            ← redirects to /login
│   ├── login/
│   │   └── page.tsx        ← login screen
│   ├── register/
│   │   └── page.tsx        ← register screen
│   └── dashboard/
│       └── page.tsx        ← main screen after login
├── components/
│   ├── MoodForm.tsx        ← form to log daily mood
│   └── MoodCard.tsx        ← displays partner's mood
└── lib/
    └── api.ts              ← API call functions

## Getting Started

npm install
npm run dev

Open http://localhost:3000

## Developer

[@karolmarianaacuna](https://github.com/karolmarianaacuna) — Frontend
