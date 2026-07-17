# One Small Question...

A cinematic, comic/Spider-Verse-inspired invitation page built with Next.js (App Router),
TypeScript, GSAP, the Canvas API, and Firebase/Firestore.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Firebase setup (for recording RSVPs / the picked date)

1. Copy `.env.local.example` to `.env.local`.
2. In the [Firebase console](https://console.firebase.google.com), open your project ->
   Project settings -> General -> Your apps -> add/select a Web app, and copy the SDK config
   values into `.env.local`.
3. Enable **Firestore** (Build -> Firestore Database -> Create database).
4. RSVPs are written to a top-level `rsvps` collection by [src/lib/rsvp.ts](src/lib/rsvp.ts)
   with shape `{ decision: "yes" | "no", watchDate?, theatre?, createdAt, userAgent }`.
5. Set Firestore security rules to allow create-only, no read, on that collection, e.g.:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /rsvps/{docId} {
         allow create: if true;
         allow read, update, delete: if false;
       }
     }
   }
   ```

If `.env.local` is missing/incomplete, the app still works — `submitRsvp` fails soft and the
UI shows a friendly note instead of an error.

## Audio

Drop an original / royalty-free ambient lo-fi loop at `public/assets/audio/audio.mp3`. It
autoplays on load, loops, and has no mute button by design — if the browser blocks autoplay
with sound, playback silently starts on the visitor's first click or keypress instead.

## Structure

- `src/components/InvitationExperience.tsx` — top-level orchestrator (entrance, background,
  spider, card, confetti, easter eggs, audio)
- `src/components/EntranceSequence.tsx` — black screen -> THWIP -> web -> title swing intro
- `src/components/CitySkyline.tsx` — parallax skyline, clouds, dust particles, web strands
- `src/components/SpiderCharacter.tsx` — the hanging spider (5 clicks = easter egg)
- `src/components/InvitationCard.tsx` — the question, Yes/No states, exact copy
- `src/components/DateTheatrePicker.tsx` — date/theatre form, writes to Firestore
- `src/lib/firebase.ts`, `src/lib/rsvp.ts` — Firebase init + RSVP writer
- `src/styles/scene.css` — all bespoke cinematic styling (design tokens live in
  `src/app/globals.css`)

Respects `prefers-reduced-motion`, is keyboard operable, and is responsive from 320px up.
