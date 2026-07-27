# Office Attendance Tool

A modern, dynamic, and complete office attendance and HR management system built with Next.js App Router, Prisma, and Better Auth.

## Features
- **Role-Based Access Control (RBAC):** Separate dashboards for Admins and Employees.
- **Attendance Tracking:** Secure Check-In / Check-Out system with automatic Late detection based on configurable thresholds.
- **Leave Management:** Request, approve, or reject leaves seamlessly.
- **Holiday Calendar:** Manage company and national holidays.
- **Comprehensive Reporting:** Generate, print, and export (CSV) monthly attendance and late arrival reports.
- **Dynamic Settings:** Configurable office hours, late thresholds, and localization.
- **Modern UI:** Built with Shadcn UI, Tailwind CSS, Base UI, and Framer Motion micro-animations. Fully responsive and supports Dark Mode.

## Tech Stack
- **Framework:** Next.js 16.2.11 (App Router)
- **Database:** SQLite (via Prisma ORM)
- **Authentication:** Better Auth (v1)
- **Styling:** Tailwind CSS + Shadcn UI
- **Tables & Forms:** TanStack Table, React Hook Form, Zod
- **Charts:** Recharts
- **Icons:** Lucide React

## Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd office-attendance-tools
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and update the values.
   ```bash
   cp .env.example .env
   ```
   *Ensure you generate a secure `BETTER_AUTH_SECRET`.*

4. **Setup the Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed Initial Data:**
   Creates a default Admin user and initial settings.
   ```bash
   npm run db:seed
   ```
   *Default Admin credentials:*
   Email: `admin@example.com`
   Password: `Password123!`

6. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## Production Deployment

### Building for Production
```bash
npm run build
npm run start
```

### Deploying to Vercel
This project is fully compatible with Vercel out of the box. 
1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Add the required Environment Variables in Vercel Settings.
4. (Optional) If using Postgres instead of SQLite, update the `provider` in `schema.prisma` and use `DATABASE_URL` for the Postgres connection string.
5. Deploy!

### Deploying to a VPS (Hostinger, DigitalOcean, etc.)
1. Ensure Node.js and PM2 are installed on your server.
2. Clone the repository and run `npm install`.
3. Configure your `.env` file.
4. Run `npx prisma generate` and `npx prisma db push`.
5. Run `npm run build`.
6. Start the server using PM2:
   ```bash
   pm2 start npm --name "attendance-app" -- start
   ```
7. Configure Nginx as a reverse proxy to `http://localhost:3000`.

## Scripts
- `npm run dev` - Starts the development server.
- `npm run build` - Builds the application for production.
- `npm run start` - Starts the production server.
- `npm run lint` - Lints the codebase.
- `npm run db:seed` - Seeds the database with default data.
