# Hotel Booking System Backend

Express.js backend with MySQL database for hotel booking management system.

## Features

- ✅ User Authentication (Admin/Staff)
- ✅ Bookings Management (CRUD)
- ✅ Guests Management (CRUD)
- ✅ Rooms Management (CRUD)
- ✅ Dashboard Statistics
- ✅ Notifications System
- ✅ Room Availability Checking
- ✅ Booking Conflict Prevention

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` file with your MySQL credentials:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hotel_db
DB_PORT=3306

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
FRONTEND_URL=http://localhost:3000
```

### 3. Create MySQL Database

The database will be created automatically when you run the initialization script. Make sure MySQL is running and accessible with the credentials in your `.env` file.

### 4. Initialize Database

Run the initialization script to create tables and seed sample data:

```bash
node scripts/init.js
```

Or if you want to initialize manually, you can import the SQL schema from `database/schema.sql`.

### 5. Start the Server

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

### Authentication

- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register new admin (optional)
- `GET /api/auth/verify` - Verify JWT token

### Bookings

- `GET /api/bookings` - Get all bookings (requires auth)
- `GET /api/bookings/:id` - Get single booking (requires auth)
- `POST /api/bookings` - Create new booking (public)
- `PUT /api/bookings/:id` - Update booking (requires auth)
- `DELETE /api/bookings/:id` - Delete booking (requires auth)

### Guests

- `GET /api/guests` - Get all guests (requires auth)
- `GET /api/guests/:id` - Get single guest (requires auth)
- `POST /api/guests` - Create new guest (public)
- `PUT /api/guests/:id` - Update guest (requires auth)
- `DELETE /api/guests/:id` - Delete guest (requires auth)

### Rooms

- `GET /api/rooms` - Get all rooms (public)
- `GET /api/rooms/:id` - Get single room (public)
- `POST /api/rooms` - Create new room (requires auth)
- `PUT /api/rooms/:id` - Update room (requires auth)
- `DELETE /api/rooms/:id` - Delete room (requires auth)

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics (requires auth)
- `GET /api/dashboard/notifications` - Get notifications (requires auth)
- `PUT /api/dashboard/notifications/:id/read` - Mark notification as read (requires auth)
- `PUT /api/dashboard/notifications/read-all` - Mark all as read (requires auth)

## Default Admin Credentials

After initialization, you can login with:
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change the default password in production!

## Database Schema

### Tables

1. **admins** - Admin users
2. **guests** - Guest information
3. **rooms** - Room details
4. **bookings** - Booking records
5. **notifications** - System notifications

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

All API responses follow this format:

```json
{
  "success": true/false,
  "message": "Response message",
  "data": {}
}
```

## Development

The backend uses:
- **Express.js** - Web framework
- **MySQL2** - MySQL driver with promise support
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

## Notes

- The booking system automatically checks for room availability
- Bookings prevent double-booking by checking date conflicts
- Notifications are created automatically for new bookings and guest registrations
- Room prices are calculated based on number of nights

