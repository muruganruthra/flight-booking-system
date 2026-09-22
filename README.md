# ✈️ Flight Booking & Reservation System

A full-stack **Flight Booking & Reservation System** built using the MERN stack.

The application allows users to register and log in, search available flights, view flight details, select seats, enter passenger information, create bookings, make mock payments, generate PDF tickets, view booking history, and cancel bookings.

An administrator can manage airlines, airports, aircraft, flights, and customer bookings.

---

## 📌 Project Overview

This project is a complete flight reservation platform developed using:

* **MongoDB** — Database
* **Express.js** — Backend API
* **React.js** — Frontend
* **Node.js** — Server runtime
* **JWT** — Authentication
* **Mongoose** — MongoDB ODM
* **Axios** — API communication
* **Vite** — Frontend development/build tool
* **PDFKit** — PDF ticket generation
* **Nodemailer** — Email ticket support
* **Helmet** — Security headers
* **Morgan** — HTTP request logging

---

# 🎯 Main Features

## 👤 Customer Features

* User registration
* User login
* JWT authentication
* Protected routes
* Flight search
* Flight details
* Seat availability
* Seat selection
* Passenger information
* Booking creation
* Fare calculation
* Mock payment
* Booking confirmation
* My bookings
* Booking details
* PDF ticket generation
* Ticket download
* Email ticket support
* Booking cancellation
* Mock refund
* Automatic pending-booking expiration

---

## 👨‍💼 Admin Features

Administrators can:

* Manage airlines
* Manage airports
* Manage aircraft
* Create flights
* Update flights
* Delete flights
* View all customer bookings
* View booking statistics
* View individual booking details
* Cancel customer bookings

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │      Vite App       │
                    │   localhost:5173    │
                    └──────────┬──────────┘
                               │
                               │ Axios / REST API
                               ▼
                    ┌─────────────────────┐
                    │   Express.js API    │
                    │   Node.js Server    │
                    │   localhost:5000    │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
          Authentication    Booking       Payment
             JWT            Service        Service
                │              │              │
                └──────────────┼──────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    MongoDB Atlas    │
                    │      Database       │
                    └─────────────────────┘
```

---

# 📁 Project Structure

```text
flight-booking-system/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── flight/
│   │   │   ├── booking/
│   │   │   └── admin/
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SearchFlights.jsx
│   │   │   ├── FlightDetails.jsx
│   │   │   ├── SeatSelection.jsx
│   │   │   ├── PassengerDetails.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Payment.jsx
│   │   │   ├── BookingConfirmation.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   └── BookingDetails.jsx
│   │   │
│   │   ├── redux/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── flightController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   └── adminController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── adminMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Airline.js
│   │   ├── Airport.js
│   │   ├── Aircraft.js
│   │   ├── Flight.js
│   │   ├── Booking.js
│   │   └── Payment.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── airlineRoutes.js
│   │   ├── airportRoutes.js
│   │   ├── aircraftRoutes.js
│   │   ├── flightRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── services/
│   │   ├── bookingService.js
│   │   ├── paymentService.js
│   │   ├── emailService.js
│   │   └── bookingExpirationService.js
│   │
│   ├── utils/
│   │   ├── generatePNR.js
│   │   ├── generateTicket.js
│   │   └── generateToken.js
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

---

# 💻 Requirements

Before running the project, install:

* Node.js 20+ recommended
* npm
* MongoDB Atlas account
* Git
* VS Code recommended

Check Node.js:

```bash
node -v
```

Check npm:

```bash
npm -v
```

---

# 📥 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/muruganruthra/flight-booking-system.git
```

Move into the project:

```bash
cd flight-booking-system
```

---

# ⚙️ Backend Setup

Open a terminal:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

---

# 🔐 Backend Environment Variables

Create:

```text
server/.env
```

Add:

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING

JWT_SECRET=YOUR_SECRET_KEY

CLIENT_URL=http://localhost:5173

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=YOUR_EMAIL
EMAIL_PASSWORD=YOUR_EMAIL_APP_PASSWORD
```

### Example

```env
PORT=5000

MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/flight_booking?retryWrites=true&w=majority

JWT_SECRET=flight_booking_secret_key

CLIENT_URL=http://localhost:5173

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Important

Never upload `.env` to GitHub.

Make sure `.gitignore` contains:

```text
.env
node_modules/
```

---

# 🗄️ MongoDB Atlas Setup

1. Create a MongoDB Atlas account.
2. Create a cluster.
3. Create a database user.
4. Copy the MongoDB connection string.
5. Add your database password.
6. Add the database name:

```text
flight_booking
```

7. Add your connection IP under MongoDB Atlas Network Access.

For development/testing, MongoDB Atlas can be configured to allow:

```text
0.0.0.0/0
```

Use more restrictive network rules for production environments where appropriate.

---

# ▶️ Start Backend

From:

```text
flight-booking-system/server
```

run:

```bash
npm run dev
```

Expected output:

```text
MongoDB Connected: ...
Booking expiration job started.
Server running on port 5000
Client URL: http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

Expected:

```json
{
  "success": true,
  "message": "Flight Booking API is running"
}
```

---

# 🌐 Frontend Setup

Open a **new terminal**.

From the project root:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

---

# 🔐 Frontend Environment Variables

Create:

```text
client/.env
```

For local development:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, replace this with your deployed backend URL.

Example:

```env
VITE_API_URL=https://flight-booking-api.onrender.com/api
```

---

# ▶️ Start Frontend

Run:

```bash
npm run dev
```

Vite will display something similar to:

```text
Local: http://localhost:5173/
```

Open:

```text
http://localhost:5173
```

---

# 👤 How to Use the Application

## Step 1 — Register

Open:

```text
http://localhost:5173/register
```

Enter:

* Name
* Email
* Phone
* Password

Example:

```text
Name: Demo User
Email: demo@example.com
Phone: 9876543210
Password: Demo@12345
```

Click:

**Register**

---

# 🔑 Step 2 — Login

Open:

```text
http://localhost:5173/login
```

Enter the registered email and password.

After successful login, the JWT authentication token is stored by the frontend and protected pages become available.

---

# ✈️ Step 3 — Search Flights

From the dashboard, open:

**Search Flights**

Enter:

* Departure airport
* Arrival airport
* Travel date
* Number of passengers

Example:

```text
From: MAA
To: DEL
Date: 2026-10-15
Passengers: 1
```

Click:

**Search Flights**

The application requests available flights from the backend API.

---

# 🔎 Step 4 — View Flight Details

Select a flight from the search results.

You can view:

* Airline
* Flight number
* Departure airport
* Arrival airport
* Departure time
* Arrival time
* Duration
* Economy fare
* Business fare
* First-class fare
* Available seats

---

# 💺 Step 5 — Select Seats

Open:

**Seat Selection**

Available seats can be selected.

The application checks the backend seat availability before proceeding.

Select the required number of seats.

Click:

**Continue**

---

# 👨‍👩‍👧 Step 6 — Enter Passenger Details

Enter passenger information such as:

* Title
* First name
* Last name
* Date of birth
* Gender
* Nationality
* Passport number
* Travel class
* Baggage
* Seat number

Enter contact details:

* Email
* Phone

Submit the passenger information.

---

# 🧾 Step 7 — Create Booking

The backend creates the booking.

A unique:

```text
PNR
```

is generated for the booking.

Example:

```text
PNR: ABC123
```

The booking initially has:

```text
Status: pending
Payment Status: pending
```

---

# 💰 Fare Calculation

The system calculates the final amount using:

```text
Base Fare
    +
5% Tax
    +
₹200 Convenience Fee per Passenger
    =
Total Amount
```

Example:

```text
Base Fare        ₹5,000
Tax (5%)           ₹250
Convenience Fee    ₹200
-------------------------
Total            ₹5,450
```

---

# 💳 Step 8 — Payment

The project currently uses a **mock payment system** for demonstration purposes.

Supported payment methods include:

* Card
* UPI
* Net Banking
* Wallet

Select a payment method and submit the payment.

A successful mock payment changes the booking/payment status accordingly.

---

# ✅ Step 9 — Booking Confirmation

After successful payment, the user can view:

* Booking confirmation
* PNR
* Passenger details
* Flight information
* Seat numbers
* Payment information
* Total amount

---

# 🎫 Step 10 — Generate Ticket

From the booking details page, generate the ticket.

The backend generates a PDF ticket using PDFKit.

The ticket contains relevant booking and passenger information.

---

# 📥 Step 11 — Download Ticket

The generated ticket can be downloaded from:

**Booking Details**

---

# 📧 Step 12 — Email Ticket

The backend also supports sending tickets through email using Nodemailer.

SMTP credentials must be configured in:

```text
server/.env
```

If email credentials are not configured, the core booking system still works, but email delivery will not work.

---

# 📋 Step 13 — View My Bookings

Open:

**My Bookings**

The customer can see their previous bookings.

Each booking can be opened to view:

* PNR
* Flight
* Passenger information
* Booking status
* Payment status
* Total amount
* Ticket
* Cancellation option

---

# ❌ Step 14 — Cancel Booking

A customer can cancel an eligible booking.

The system updates:

```text
Booking Status → cancelled
```

If payment was already completed, the application provides a **mock refund workflow**.

---

# ⏱️ Automatic Booking Expiration

Pending bookings are automatically checked by the background service.

The system checks every:

```text
60 seconds
```

A pending booking that remains unpaid for more than:

```text
15 minutes
```

is automatically changed to:

```text
cancelled
```

The held seats are released.

This prevents unpaid bookings from permanently blocking seats.

---

# 👨‍💼 Admin Access

The application supports an administrator role.

Admin users can manage the flight inventory and customer bookings.

---

# 🔐 Creating an Admin

The standard registration endpoint creates a normal user.

Register a user:

```http
POST /api/auth/register
```

Example:

```json
{
  "name": "Flight System Admin",
  "email": "admin@example.com",
  "phone": "9876543210",
  "password": "Admin@12345"
}
```

After registration, open MongoDB Atlas.

Find the registered user in the `users` collection.

Change:

```text
role
```

from:

```text
user
```

to:

```text
admin
```

The administrator can then log in normally.

---

# 🛠️ Admin Workflow

The administrator should prepare the flight inventory before customers search for flights.

Recommended order:

```text
1. Login as Admin
       ↓
2. Create Airline
       ↓
3. Create Airport
       ↓
4. Create Aircraft
       ↓
5. Create Flight
       ↓
6. Customer searches flight
       ↓
7. Customer selects seats
       ↓
8. Customer creates booking
```

---

# 🧪 API Endpoints

## Authentication

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

---

## Airlines

```http
GET    /api/airlines
POST   /api/airlines
PUT    /api/airlines/:id
DELETE /api/airlines/:id
```

---

## Airports

```http
GET    /api/airports
POST   /api/airports
PUT    /api/airports/:id
DELETE /api/airports/:id
```

---

## Aircraft

```http
GET    /api/aircraft
POST   /api/aircraft
PUT    /api/aircraft/:id
DELETE /api/aircraft/:id
```

---

## Flights

```http
GET    /api/flights
GET    /api/flights/search
POST   /api/flights
PUT    /api/flights/:id
DELETE /api/flights/:id
```

---

## Booking

```http
GET  /api/bookings/seats/:flightId
POST /api/bookings
GET  /api/bookings/my-bookings
GET  /api/bookings/:id
POST /api/bookings/:id/ticket
GET  /api/bookings/:id/ticket
POST /api/bookings/:id/email-ticket
POST /api/bookings/:id/cancel
```

---

## Payment

```http
POST /api/payments
GET  /api/payments/my-payments
GET  /api/payments/:id
```

---

## Admin

```http
GET  /api/admin/bookings
GET  /api/admin/bookings/statistics
GET  /api/admin/bookings/:id
POST /api/admin/bookings/:id/cancel
```

---

# 🧪 API Testing

The API can be tested using:

* Postman
* Thunder Client
* Insomnia

---

## Register User

```http
POST http://localhost:5000/api/auth/register
```

Header:

```text
Content-Type: application/json
```

Body:

```json
{
  "name": "API Demo User",
  "email": "apidemo@example.com",
  "phone": "9876543210",
  "password": "Demo@12345"
}
```

---

## Login

```http
POST http://localhost:5000/api/auth/login
```

Body:

```json
{
  "email": "apidemo@example.com",
  "password": "Demo@12345"
}
```

The response contains:

```json
{
  "success": true,
  "token": "JWT_TOKEN"
}
```

Copy the token.

For protected requests:

```text
Authorization: Bearer JWT_TOKEN
```

---

# 🔎 Flight Search API

```http
GET http://localhost:5000/api/flights/search?from=MAA&to=DEL&date=2026-10-15&passengers=1
```

---

# 💺 Seat Availability API

Replace `FLIGHT_ID` with the actual flight ID:

```http
GET http://localhost:5000/api/bookings/seats/FLIGHT_ID
```

---

# 🧾 Create Booking

```http
POST http://localhost:5000/api/bookings
```

Headers:

```text
Content-Type: application/json
Authorization: Bearer YOUR_USER_TOKEN
```

Body:

```json
{
  "flightId": "YOUR_FLIGHT_ID",
  "passengers": [
    {
      "title": "Mr",
      "firstName": "API",
      "lastName": "Passenger",
      "dateOfBirth": "2000-04-03",
      "gender": "male",
      "passportNumber": "",
      "nationality": "Indian",
      "seatNumber": "1A",
      "travelClass": "economy",
      "baggage": 0
    }
  ],
  "contactEmail": "apidemo@example.com",
  "contactPhone": "9876543210"
}
```

---

# 💳 Payment API

```http
POST http://localhost:5000/api/payments
```

Headers:

```text
Content-Type: application/json
Authorization: Bearer YOUR_USER_TOKEN
```

Body:

```json
{
  "bookingId": "YOUR_BOOKING_ID",
  "amount": "BOOKING_TOTAL_AMOUNT",
  "paymentMethod": "upi"
}
```

---

# 🎫 Ticket API

Generate:

```http
POST /api/bookings/YOUR_BOOKING_ID/ticket
```

Download:

```http
GET /api/bookings/YOUR_BOOKING_ID/ticket
```

---

# ❌ Cancellation API

```http
POST /api/bookings/YOUR_BOOKING_ID/cancel
```

Header:

```text
Authorization: Bearer YOUR_USER_TOKEN
```

---

# 🔒 Security

The project implements several security mechanisms:

### Password Hashing

Passwords are hashed using:

```text
bcryptjs
```

### JWT Authentication

JWT tokens protect authenticated API endpoints.

### Role-Based Authorization

Admin endpoints require:

```text
role = admin
```

### Helmet

Helmet provides HTTP security headers.

### CORS

The backend restricts cross-origin requests using the configured client URL.

### Input Validation

API inputs are validated before processing.

### Ownership Validation

Customers can access their own bookings rather than arbitrary users' bookings.

---

# 🧪 Testing Checklist

A complete demonstration can follow this sequence:

```text
☐ Start MongoDB connection
☐ Start backend
☐ Test /api/health
☐ Start frontend
☐ Register customer
☐ Login customer
☐ Login admin
☐ Create airline
☐ Create airports
☐ Create aircraft
☐ Create flight
☐ Search flight
☐ View flight details
☐ Check seat availability
☐ Select seats
☐ Enter passenger details
☐ Create booking
☐ Verify PNR
☐ Verify fare calculation
☐ Make mock payment
☐ Verify booking confirmation
☐ Generate ticket
☐ Download ticket
☐ View My Bookings
☐ Cancel booking
☐ Verify refund status
☐ Test automatic booking expiration
```

---

# 🚀 Deployment

The project can be deployed using:

### Frontend

**Vercel**

Recommended configuration:

```text
Root Directory: client
Build Command: npm run build
Output Directory: dist
```

Frontend environment variable:

```env
VITE_API_URL=https://YOUR-BACKEND-URL/api
```

---

### Backend

**Render**

Recommended configuration:

```text
Root Directory: server
Build Command: npm install
Start Command: npm start
```

Required environment variables:

```text
MONGO_URI
JWT_SECRET
CLIENT_URL
```

Optional email variables:

```text
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASSWORD
```

---

# 🌍 Production Architecture

```text
User Browser
     │
     ▼
Vercel
React Frontend
     │
     │ HTTPS REST API
     ▼
Render
Express / Node.js Backend
     │
     ▼
MongoDB Atlas
```

---

# ⚠️ Current Project Limitations

This project is designed as a full-stack academic/demo flight reservation application.

Current limitations include:

1. Payment processing is mocked and does not connect to a real payment gateway.
2. Flight inventory is maintained inside the application's database.
3. It does not connect to live airline/GDS systems.
4. Email ticket delivery requires SMTP configuration.
5. Booking expiration runs as an application background job.
6. Real-world airline pricing and availability are not integrated.

---

# 🔮 Future Enhancements

Possible future improvements:

* Razorpay/Stripe payment integration
* Real airline/GDS API integration
* Google/OTP authentication
* Multi-city flight search
* Round-trip booking
* Promo codes
* Loyalty/reward points
* Advanced admin dashboard
* Revenue analytics
* Real-time notifications
* SMS notifications
* Cloud ticket storage
* Docker deployment
* Automated CI/CD
* Automated unit and integration testing
* Redis-based seat locking
* Production-grade distributed booking expiration

---

# 📚 Technologies Used

| Technology    | Purpose                    |
| ------------- | -------------------------- |
| React         | Frontend UI                |
| Vite          | Frontend build tool        |
| Node.js       | Backend runtime            |
| Express.js    | REST API                   |
| MongoDB Atlas | Database                   |
| Mongoose      | Database modeling          |
| JWT           | Authentication             |
| bcryptjs      | Password hashing           |
| Axios         | API requests               |
| Redux         | Frontend state management  |
| Helmet        | Security                   |
| CORS          | Cross-origin configuration |
| Morgan        | Request logging            |
| PDFKit        | PDF ticket generation      |
| Nodemailer    | Email delivery             |

---

# 👨‍💻 Developer

**Ruthramurugan V**

B.E. Computer Science and Engineering

---

# 📄 License

This project is developed for educational and demonstration purposes.

---

# ⭐ Quick Start

For someone who wants to run the project quickly:

### 1. Clone

```bash
git clone https://github.com/muruganruthra/flight-booking-system.git
cd flight-booking-system
```

### 2. Backend

```bash
cd server
npm install
```

Configure:

```text
server/.env
```

Then:

```bash
npm run dev
```

### 3. Frontend

Open another terminal:

```bash
cd client
npm install
```

Configure:

```text
client/.env
```

with:

```env
VITE_API_URL=http://localhost:5000/api
```

Then:

```bash
npm run dev
```

### 4. Open the application

```text
http://localhost:5173
```

### 5. Register

Create a customer account.

### 6. Login

Login using the registered account.

### 7. Admin

Create/change a user to the `admin` role through MongoDB Atlas.

### 8. Prepare flight data

Create:

```text
Airline
Airport
Aircraft
Flight
```

### 9. Book

```text
Search Flight
    ↓
Flight Details
    ↓
Select Seats
    ↓
Passenger Details
    ↓
Booking
    ↓
Payment
    ↓
Confirmation
    ↓
PDF Ticket
```

---

# ✅ Project Status

**Status: Completed full-stack academic/demo implementation**

Core modules implemented:

* Authentication
* Authorization
* Flight Management
* Flight Search
* Seat Management
* Booking
* Payment
* Ticket Generation
* Ticket Download
* Email Ticket Support
* Cancellation
* Mock Refund
* Automatic Booking Expiration
* Admin Booking Management
* Responsive React UI
* Deployment-ready configuration
