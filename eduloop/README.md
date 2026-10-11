# EduLoop Philippines

A responsive React + Vite + TypeScript school-project prototype aligned with **SDG 4: Quality Education**. EduLoop combines **OpenDoor**, a directory of learning resources, and **ClassCycle**, a community exchange for school materials.

> **Prototype notice:** All seed listings and demo accounts are fictional. This version stores data and account sessions in the current browser's `localStorage`. It is not a production authentication system, does not synchronize between devices, and must not be used for real personal information.

## Requirements

- Node.js 18 or later
- npm

## Run locally

1. Unzip this project.
2. Open the `eduloop` folder in VS Code (the folder containing `package.json`).
3. Open Terminal and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite, usually `http://localhost:5173`.

To test production compilation, run `npm run build`.

## Roles and demo accounts

You can register as a **Student**, **Contributor / Donator**, or **Administrator**. A prototype administrator registration requires the demo code below. Since the code and role checks run in the browser, this is only a classroom demonstration—not real access control.

| Role | Email | Password |
|---|---|---|
| Student | `mika@eduloop.demo` | `student123` |
| Contributor | `paolo@eduloop.demo` | `contribute123` |
| Administrator | `lea@eduloop.demo` | `admin123` |

**Demo administrator registration code:** `EDULOOP-DEMO-ADMIN`

Use the demo sign-in shortcuts on the login screen to quickly test each role.

## Included features

- Registration, login, logout, and role-aware navigation
- Admin-only review screen (demo access controls)
- OpenDoor resource directory with keyword, category, region, cost and learning-mode filters
- Detailed resource pages with access steps, schedules, subject support, amenities and contact notes
- ClassCycle listings with category, region, condition and exchange filters
- Detailed material pages, availability controls, request messages and request status updates
- Resource submission and material-listing forms with pending review status
- Personal dashboard with counts, recently viewed items and quick links
- My Requests, notifications, and a basic reports/review workflow
- About page explaining purpose, intended users and prototype limitations
- Responsive layout for mobile and desktop

## Storage and reset

The app saves prototype data to the browser using the key `eduloop-v2`. To reset seed data, open the browser's DevTools → Application (or Storage) → Local Storage and delete `eduloop-v2`, then reload the page.

## Before using this as a real public website

A public, multi-user deployment needs a backend/database, secure server-side password hashing, server-enforced role permissions, email verification, input validation, rate limiting, privacy controls and a secure hosting setup. Do not expose an admin code in a frontend-only app and assume it is secure. The current project deliberately remains a self-contained prototype for classroom demonstration.
