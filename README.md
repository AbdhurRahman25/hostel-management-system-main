# Hostel Management System

A full-stack Hostel Management System built with React, TypeScript,
Node.js, Express, and MongoDB. The application helps hostel
administrators and staff manage rooms, residents, maintenance requests,
billing, payments, expenses, reports, and role-based access.

## Features

### 🏠 Room Management

-   Create and manage hostel rooms
-   Room types: Single, Double, Triple, Dormitory, and Shared
-   Track room capacity and occupied beds
-   Track available beds and room status
-   Room rent and utility fee management
-   Prevent occupied beds from exceeding room capacity

### 👤 Resident Management

-   Add, edit, and manage resident information
-   Store contact and emergency contact details
-   Track gender and resident status
-   Assign residents to rooms
-   Check-in and check-out support
-   Prevent a resident from being allocated to multiple rooms

### 🛠️ Maintenance Management

-   Create maintenance requests
-   Track maintenance request status
-   View pending and completed requests
-   Manage maintenance records

### 💰 Billing & Payments

-   Generate resident bills
-   Room rent and other charges
-   Discounts
-   Late fees
-   Automatic total amount calculation
-   Pending and paid billing status
-   Payment collection tracking
-   Invoice generation

### 💸 Expense Management

-   Record hostel expenses
-   Expense categories
-   Expense amount, date, title, and description
-   Expense tracking for reporting

### 📊 Reports

-   Total rooms
-   Total capacity
-   Occupied beds
-   Available beds
-   Occupancy rate
-   Active residents
-   Total billing
-   Collected amount
-   Pending amount
-   Total expenses
-   Net revenue
-   Maintenance summary
-   Monthly revenue

### 🔐 Role-Based Access Control

The system supports four roles:

-   **Admin** --- full system access
-   **Manager** --- management and reporting access
-   **Staff** --- operational access such as resident/room/maintenance
    workflows
-   **Resident** --- limited resident-level access

Account limits are enforced for privileged roles: - Maximum 1 Admin -
Maximum 2 Managers - Unlimited Staff and Residents

### 📱 Responsive UI

The frontend uses responsive layouts designed for desktop and mobile
screens.

------------------------------------------------------------------------

## Tech Stack

### Frontend

-   React
-   TypeScript
-   Vite
-   Tailwind CSS

### Backend

-   Node.js
-   Express.js
-   Mongoose
-   JWT-based authentication

### Database

-   MongoDB / MongoDB Atlas

### Deployment

-   Frontend: Netlify
-   Backend: Render
-   Database: MongoDB Atlas

------------------------------------------------------------------------

## Project Structure

``` text
hostel-management-system-main/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   ├── package.json
│   └── vite.config.*
│
└── README.md
```

------------------------------------------------------------------------

## Requirements

Make sure the following are installed:

-   Node.js
-   npm
-   MongoDB Atlas account or a MongoDB instance
-   Git

------------------------------------------------------------------------

## Installation

### 1. Clone the repository

``` bash
git clone https://github.com/AbdhurRahman25/hostel-management-system-main.git
cd hostel-management-system-main
```

### 2. Install backend dependencies

``` bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `backend` folder.

Example:

``` env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Use the actual variable names already expected by your backend
configuration.

### 4. Start the backend

``` bash
npm run dev
```

The backend normally runs on:

``` text
http://localhost:5000
```

### 5. Install frontend dependencies

Open another terminal:

``` bash
cd frontend
npm install
```

### 6. Start the frontend

``` bash
npm run dev
```

Vite will display the local frontend URL in the terminal.

------------------------------------------------------------------------

## Production Build

From the frontend directory:

``` bash
npm run build
```

The production build is generated in the `dist` directory.

------------------------------------------------------------------------

## Authentication

The application uses authentication with JWT.

After successful login, the frontend stores the authenticated user and
token and uses the token for protected API requests.

Protected backend routes use authentication and role authorization
middleware.

------------------------------------------------------------------------

## Important API Areas

The backend contains API routes for:

``` text
/api/auth
/api/rooms
/api/residents
/api/maintenance
/api/billing
/api/payments
/api/expenses
/api/reports
```

Exact endpoints may vary based on the current route implementation.

------------------------------------------------------------------------

## Reports Calculation

The reporting module calculates:

``` text
Pending = Total Billing - Collected

Net Revenue = Collected - Expenses
```

Billing totals include:

``` text
Rent + Other Charges + Late Fee - Discount
```

The final amount is prevented from becoming negative.

------------------------------------------------------------------------

## Deployment

### Backend --- Render

Deploy the `backend` directory as a Node.js Web Service.

Typical settings:

``` text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Configure the required environment variables in Render.

### Frontend --- Netlify

Deploy the `frontend` directory.

Typical build settings:

``` text
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

Configure the production backend API URL through the frontend
environment configuration used by the project.

### Database --- MongoDB Atlas

Create a MongoDB Atlas database and provide its connection string to the
backend through the environment variables.

------------------------------------------------------------------------

## Security Notes

-   Do not commit `.env` files or database credentials.
-   Keep JWT secrets private.
-   Configure CORS for the production frontend URL.
-   Use environment variables for production secrets and database
    connection strings.

------------------------------------------------------------------------

## Testing Checklist

Before final deployment, verify:

-   [ ] Admin login
-   [ ] Manager login
-   [ ] Staff access
-   [ ] Resident access
-   [ ] Room creation and editing
-   [ ] Resident creation and editing
-   [ ] Room allocation
-   [ ] Check-in / check-out
-   [ ] Maintenance request workflow
-   [ ] Billing creation
-   [ ] Payment workflow
-   [ ] Invoice generation
-   [ ] Expense creation
-   [ ] Reports and net revenue
-   [ ] Mobile responsive layout

------------------------------------------------------------------------

## Author

**Abdhur Rahman**

Hostel Management System --- Full Stack Web Application.
