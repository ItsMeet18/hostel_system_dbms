# Hostel Management System

A simple and modern hostel management system with CRUD operations for managing students, rooms, and room allocations.

## Features

- **Student Management**: Add, edit, delete, and view students
- **Room Management**: Manage hostel rooms with capacity tracking
- **Room Allocations**: Allocate rooms to students and track allocations
- **Modern UI**: Clean and responsive design

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

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Allocations
- `GET /api/allocations` - Get all allocations
- `GET /api/allocations/:id` - Get allocation by ID
- `POST /api/allocations` - Create new allocation
- `PUT /api/allocations/:id` - Update allocation
- `DELETE /api/allocations/:id` - Delete allocation

## Database Schema

The system automatically creates three tables:

1. **students**: Stores student information
2. **rooms**: Stores room details and capacity
3. **allocations**: Links students to rooms with allocation dates

## Usage

1. Start the MySQL server
2. Start the backend server (`cd server && npm start`)
3. Start the frontend (`cd client && npm start`)
4. Open `http://localhost:3000` in your browser
5. Navigate between Students, Rooms, and Allocations using the navigation bar

