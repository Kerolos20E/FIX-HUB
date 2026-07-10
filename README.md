# FixHub React Portal

React + TypeScript project with Bootstrap classes in JSX and Bootstrap CDN links in `index.html`.

## Main Features

- Auth flow starts with role selection (Customer / Technical Worker)
- Separate sign-up forms for customer and technical worker
- Technical sign-up requires National ID + card image upload
- Login with saved account
- Animated auth layout: blue panel starts from left then slides to right on page load
- Real logo used in auth page and navbar
- Component-based structure (split into pages, layout, and reusable components)
- Hub, Home, Services, Request, Contact, and Profile pages
- Profile page for both customer and technical with editable data
- Experience management in profile (add/remove work experiences + years)
- Customer request form supports issue attachment upload (image/file)
- Technician has Requests Board page to receive all requests, pick one, and mark as done
- Top navigation includes shared chat and pinned AI-chat placeholder page
- Profile shows repair timeline for both roles with status (Pending/In Progress/Done)
- LocalStorage account + session handling

## Run

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:5173/auth
```

## Quality Checks

```bash
npm run lint
npm run build
```

## Important Files

- `index.html` (Bootstrap CDN + root mount)
- `src/App.tsx` (router)
- `src/pages/AuthPage.tsx`
- `src/components/auth/*`
- `src/components/layout/AppNavbar.tsx`
- `src/layouts/ProtectedLayout.tsx`
- `src/App.css`
