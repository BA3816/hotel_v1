# Backend Setup Guide

## Database Connection Setup

### 1. Create `.env` File

Copy the example environment file:
```bash
cp env.example .env
```

### 2. Configure Database Connection

The backend is configured to use the database name: **`hotel_booking`**

Update your `.env` file with your MySQL credentials:
```env
DB_NAME=hotel_booking
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_PORT=3306
```

### 3. Generate JWT Secret (IMPORTANT!)

**The JWT_SECRET is used to sign and verify authentication tokens. It's critical for security!**

#### Option 1: Use the provided script (Recommended)
```bash
npm run generate-secret
```

This will generate a secure random secret. Copy it and add to your `.env` file:
```env
JWT_SECRET=<generated_secret_here>
```

#### Option 2: Generate manually
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

#### Option 3: For development only (NOT for production)
You can use the placeholder value temporarily:
```env
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

⚠️ **IMPORTANT:** Never use the default JWT_SECRET in production! Always generate a unique, secure secret.

### 4. Test Database Connection

To test if your database connection is working:

```bash
cd backend
npm run test-db
```

This will:
- ✅ Test the MySQL connection
- ✅ Check if the database exists
- ✅ List all tables in the database

### 5. Initialize Database

If the database doesn't exist or tables are missing, initialize it:

```bash
npm run init-db
```

This will:
- ✅ Create the `hotel_booking` database
- ✅ Create all necessary tables (admins, guests, rooms, bookings, notifications)
- ✅ Insert default admin user (username: `admin`, password: `admin123`)
- ✅ Insert sample rooms

### 6. Start the Server

```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Troubleshooting

### Connection Issues

If you get connection errors:

1. **Check MySQL is running:**
   ```bash
   # Windows
   net start MySQL80
   
   # Linux/Mac
   sudo systemctl start mysql
   ```

2. **Verify credentials in `.env`:**
   - `DB_HOST` - Usually `localhost`
   - `DB_USER` - Your MySQL username (usually `root`)
   - `DB_PASSWORD` - Your MySQL password
   - `DB_PORT` - Usually `3306`
   - `DB_NAME` - Should be `hotel_booking`

3. **Test connection manually:**
   ```bash
   npm run test-db
   ```

### Database Already Exists

If the database already exists, the initialization script will:
- Skip creating the database
- Only create missing tables
- Not overwrite existing data

## Default Admin Credentials

After initialization:
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Change these credentials in production!**

## API Endpoints

Once the server is running, you can test:

- `GET http://localhost:5000/api/health` - Health check
- `POST http://localhost:5000/api/auth/login` - Login
- `POST http://localhost:5000/api/auth/register` - Register

