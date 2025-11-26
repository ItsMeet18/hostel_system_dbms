# Hostel Management System

A modern full-stack hostel management suite with dedicated **resident** and **admin** portals, multi-hostel support, and complete CRUD coverage across 12 core operational tables.

## Features

- **Resident Portal**
  - Login with Resident ID / email / contact
  - View personal info, mess plan, hostel & room details
  - Track recent bills, maintenance tickets, laundry history
  - Raise maintenance complaints and laundry requests
  - Select rooms based on roommate type preferences
  - Update profile including hostel and mess plan preferences
- **Admin Portal**
  - Secure admin login
  - Dashboards for residents, rooms, maintenance queue with status filtering, billing with status updates
  - Add residents, rooms, bills, mess plans, and manage all master tables
  - Reports & Analytics: Resident details, room occupancy, financial summaries, maintenance overview
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
- **Data Validation**
  - Database triggers prevent negative costs and fees
  - Comprehensive input validation on frontend and backend
  - Real-time error feedback and user-friendly messages

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
- `GET /api/resident-portal/:id/dashboard` – Aggregated resident info (personal, room, bills, maintenance, laundry, available rooms)
- `PUT /api/resident-portal/:id/profile` – Update resident profile and preferences
- `POST /api/resident-portal/:id/maintenance` – Raise complaint
- `POST /api/resident-portal/:id/laundry` – Add laundry request
- `POST /api/resident-portal/:id/room-selection` – Select and allocate a room

### Core CRUD (selection)
- `GET|POST|PUT|DELETE /api/residents`
- `GET|POST|PUT|DELETE /api/hostels`
- `GET|POST|PUT|DELETE /api/rooms`
- `GET|POST|PUT|DELETE /api/allotments`
- `GET|POST|PUT|DELETE /api/mess-plans`
- `GET|POST|PUT|DELETE /api/bills`
- `GET|POST|PUT|DELETE /api/payments`
- `GET /api/maintenance` – Get all maintenance requests
- `POST /api/maintenance` – Create maintenance request
- `PUT /api/maintenance/:id` – Update maintenance request status
- `DELETE /api/maintenance/:id` – Delete maintenance request
- `GET|POST|PUT|DELETE /api/laundry`
- `GET|POST|PUT|DELETE /api/visitors`
- `GET|POST|PUT|DELETE /api/access-cards`
- `GET|POST|DELETE /api/preferences`

### Database Views
- `GET /api/views/resident-room-details` – Comprehensive resident information report
- `GET /api/views/maintenance-dashboard` – Maintenance requests with location details
- `GET /api/views/room-occupancy` – Room availability and occupancy report
- `GET /api/views/financial-summary` – Resident financial overview report

## Database Schema

The backend automatically provisions the required schema if it does not exist:

### Core Entities
1. `hostels` - Hostel information with fees, location, and contact details
2. `mess_plans` - Meal plan options with pricing and descriptions
3. `residents` - Resident personal information and preferences
4. `rooms` - Room details with capacity and hostel association
5. `allotments` - Room allocation records for residents
6. `roommate_preferences` - Resident roommate matching preferences

### Services & Facilities
7. `maintenance_requests` - Resident complaint and service requests
8. `laundry_services` - Laundry service bookings and tracking
9. `visitor_logs` - Security tracking of hostel visitors
10. `access_cards` - Digital access card management

### Financial Management
11. `payments` - Payment transaction records
12. `bills` - Monthly billing with rent and additional charges
13. `mess_plan_assignments` - Links residents to mess plans over time

### Database Views (Auto-created)
- `resident_room_details` - Combined resident info with current room allocation, hostel, and billing details
- `maintenance_dashboard` - Maintenance requests with resident and location information
- `room_occupancy_view` - Room availability, occupancy status, and current occupants
- `financial_summary` - Resident financial overview with billing and payment history

### Database Triggers
- `check_mess_plan_cost_insert/update` - Prevents negative mess plan costs
- `check_hostel_fees_insert/update` - Prevents negative hostel fees

### Pre-seeded Data
The system automatically seeds 11 hostels with various fees and locations across Indian cities.

## Usage

1. Start MySQL (credentials set in `server/.env`)
2. `cd server && npm start`
3. `cd client && npm start`
4. Visit `http://localhost:3000`
5. Log in as:
   - **Resident:** use an existing resident's ID/email/contact number
   - **Admin:** default `admin@hostel.com / admin123` (update via env `ADMIN_EMAIL` / `ADMIN_PASSWORD`)

## Troubleshooting

### Common Issues

1. **Database Triggers Error**: If you see "Mess Plan Cost cannot be negative" or "Hostel fees cannot be negative", the database triggers are working correctly - ensure all costs and fees are positive values.

2. **Database Connection Error**: Ensure MySQL is running and credentials in `server/.env` are correct.

3. **Port Already in Use**: Kill processes using ports 3000 (frontend) or 5000 (backend).

4. **Module Not Found**: Run `npm install` in both `client` and `server` directories.

5. **Resident Login Issues**: Residents must be created by an admin first before they can log in.

### Database Reset

If you need to reset the database:
```bash
cd server
# Stop the server first
mysql -u root -pMeetshah@1801 -e "DROP DATABASE hostel_management;"
# Restart server to recreate tables and triggers
npm start
```

