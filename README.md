# Hostel Management System

A modern full-stack hostel management suite with dedicated **resident** and **admin** portals, multi-hostel support, and complete CRUD coverage across 12 core operational tables.

## Features

- **Resident Portal**
  - Login with Resident ID / email / contact
  - View personal info, mess plan, hostel & room details
  - Track recent bills, maintenance tickets, laundry history
  - Raise maintenance complaints and laundry requests
- **Admin Portal**
  - Secure admin login
  - Dashboards for residents, rooms, maintenance queue, billing
  - Add residents, rooms, bills, mess plans, and manage all master tables
  - Visibility over all maintenance, laundry, visitor logs, access cards (API ready)
- **Backend**
  - Node.js + Express REST API
  - MySQL schema auto-initialised with 12 tables (Residents, Rooms, Hostels, Allotments, Preferences, Mess Plans, Maintenance, Laundry, Payments, Bills, Visitor Logs, Access Cards) plus helper tables
  - Dedicated resident dashboard API aggregating cross-table data
  - Admin CRUD endpoints for every entity
- **Frontend**
  - React 19 + React Router 6
  - Axios-based API client
  - Responsive, card-based UI with reusable design tokens

## Tech Stack

- **Frontend**: React.js with React Router
- **Backend**: Node.js with Express
- **Database**: MySQL

## Setup Instructions

### Prerequisites

- Node.js installed
- MySQL server running on localhost:3306
- MySQL credentials:
  - User: root
  - Password: Meetshah@1801

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. The database will be automatically created when you start the server. The `.env` file contains the database configuration.

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/resident` – Resident login (identifier = email/contact/resident_id)
- `POST /api/auth/admin` – Admin login (defaults: `admin@hostel.com` / `admin123`, configurable via env)

### Resident Portal
- `GET /api/resident-portal/:id/dashboard` – Aggregated resident info (personal, room, bills, maintenance, laundry)
- `POST /api/resident-portal/:id/maintenance` – Raise complaint
- `POST /api/resident-portal/:id/laundry` – Add laundry request

### Core CRUD (selection)
- `GET|POST|PUT|DELETE /api/residents`
- `GET|POST|PUT|DELETE /api/hostels`
- `GET|POST|PUT|DELETE /api/rooms`
- `GET|POST|PUT|DELETE /api/allotments`
- `GET|POST|PUT|DELETE /api/mess-plans`
- `GET|POST|PUT|DELETE /api/bills`
- `GET|POST|PUT|DELETE /api/payments`
- `GET|POST|PUT|DELETE /api/maintenance`
- `GET|POST|PUT|DELETE /api/laundry`
- `GET|POST|PUT|DELETE /api/visitors`
- `GET|POST|PUT|DELETE /api/access-cards`
- `GET|POST|DELETE /api/preferences`

## Database Schema

The backend automatically provisions the required schema if it does not exist:

1. `hostels`
2. `mess_plans`
3. `residents`
4. `rooms`
5. `allotments`
6. `roommate_preferences`
7. `maintenance_requests`
8. `laundry_services`
9. `payments`
10. `bills`
11. `visitor_logs`
12. `access_cards`
13. `mess_plan_assignments` (helper)

## Usage

1. Start MySQL (credentials set in `server/.env`)
2. `cd server && npm start`
3. `cd client && npm start`
4. Visit `http://localhost:3000`
5. Log in as:
   - **Resident:** use an existing resident’s ID/email/contact number
   - **Admin:** default `admin@hostel.com / admin123` (update via env `ADMIN_EMAIL` / `ADMIN_PASSWORD`)

