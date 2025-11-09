# 🚀 How to Run Your Hotel Booking Project

This guide will help you run both the **Backend** and **Frontend** of your hotel booking system.

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Node.js installed (v16 or higher)
- ✅ MySQL installed and running
- ✅ npm or yarn package manager

## 🔧 Step 1: Setup Backend

### 1.1 Install Backend Dependencies

```bash
cd backend
npm install
```

### 1.2 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Copy the example file
cp env.example .env
```

Edit `.env` and update these values:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hotel_booking
DB_PORT=3306

# Generate a JWT secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

FRONTEND_URL=http://localhost:3000
PORT=5000
```

**Generate JWT Secret:**
```bash
npm run generate-secret
```
Copy the output and paste it in `.env` as `JWT_SECRET`

### 1.3 Test Database Connection

```bash
npm run test-db
```

If connection fails, check your MySQL credentials in `.env`.

### 1.4 Initialize Database (First Time Only)

```bash
npm run init-db
```

This will:
- Create the `hotel_booking` database
- Create all necessary tables
- Insert default admin user (username: `admin`, password: `admin123`)
- Insert sample rooms

### 1.5 Start Backend Server

```bash
npm run dev
```

The backend will run on: **http://localhost:5000**

You should see:
```
✅ Connected to MySQL database
🚀 Server running on port 5000
📍 Environment: development
```

---

## 🎨 Step 2: Setup Frontend

### 2.1 Install Frontend Dependencies

Open a **NEW terminal window** and:

```bash
cd frontend
npm install
```

### 2.2 Start Frontend Server

```bash
npm run dev
```

The frontend will run on: **http://localhost:3000**

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

---

## 🎯 Step 3: Access the Application

### Backend API
- **URL:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health
- **API Docs:** All endpoints are in `backend/routes/`

### Frontend Application
- **URL:** http://localhost:3000
- **Login Page:** http://localhost:3000/login
- **Register Page:** http://localhost:3000/register

### Default Admin Credentials
- **Username:** `admin`
- **Password:** `admin123`

---

## 🔄 Running Both Servers

### Option 1: Two Separate Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Using npm-run-all (If installed)

Create a script in root `package.json`:
```json
{
  "scripts": {
    "dev": "npm-run-all --parallel dev:backend dev:frontend",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev"
  }
}
```

Then run: `npm run dev` from root directory.

---

## ✅ Verification Checklist

After starting both servers, verify:

- [ ] Backend server is running on port 5000
- [ ] Frontend server is running on port 3000
- [ ] MySQL database is connected
- [ ] Can access http://localhost:3000/login
- [ ] Can login with admin/admin123

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: Database connection failed**
```bash
# Check MySQL is running
# Windows: net start MySQL80
# Linux/Mac: sudo systemctl start mysql

# Test connection
cd backend
npm run test-db
```

**Problem: Port 5000 already in use**
```bash
# Change PORT in backend/.env
PORT=5001
```

**Problem: Module not found errors**
```bash
cd backend
npm install
```

### Frontend Issues

**Problem: Port 3000 already in use**
```bash
# Change port in frontend/vite.config.ts or
npm run dev -- --port 3001
```

**Problem: Cannot connect to backend API**
- Check backend is running on port 5000
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check browser console for CORS errors

**Problem: Module not found errors**
```bash
cd frontend
npm install
```

### Common Issues

**Problem: "Cannot find module" errors**
- Make sure you've run `npm install` in both directories
- Delete `node_modules` and `package-lock.json`, then reinstall

**Problem: Database doesn't exist**
```bash
cd backend
npm run init-db
```

**Problem: JWT authentication fails**
- Generate a new JWT secret: `npm run generate-secret`
- Update `.env` file with the new secret
- Restart the backend server

---

## 📝 Quick Start Commands

**First Time Setup:**
```bash
# Backend
cd backend
npm install
cp env.example .env
# Edit .env with your MySQL credentials
npm run generate-secret  # Add to .env
npm run init-db
npm run dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

**Daily Development:**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

---

## 🎉 Success!

If everything is working:
- ✅ Backend API: http://localhost:5000
- ✅ Frontend App: http://localhost:3000
- ✅ Login Page: http://localhost:3000/login
- ✅ You can login with admin/admin123

Happy coding! 🚀

