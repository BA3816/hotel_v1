# ⚡ Quick Start Guide

## 🚀 Run Both Frontend & Backend

### Method 1: Two Terminal Windows (Easiest)

**Terminal 1 - Start Backend:**
```bash
cd backend
npm install          # First time only
npm run dev          # Starts on http://localhost:5000
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm install          # First time only
npm run dev          # Starts on http://localhost:3000
```

### Method 2: Root Package Script (Requires npm-run-all)

```bash
# Install npm-run-all (one time)
npm install

# Run both servers
npm run dev
```

---

## 📋 First Time Setup Checklist

### Backend Setup:
- [ ] `cd backend`
- [ ] `npm install`
- [ ] `cp env.example .env`
- [ ] Edit `.env` with MySQL credentials
- [ ] `npm run generate-secret` (copy output to .env as JWT_SECRET)
- [ ] `npm run test-db` (verify connection)
- [ ] `npm run init-db` (create database)
- [ ] `npm run dev`

### Frontend Setup:
- [ ] `cd frontend`
- [ ] `npm install`
- [ ] `npm run dev`

---

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Login Page:** http://localhost:3000/login
- **Default Login:** admin / admin123

---

## ✅ Verify It's Working

1. Backend shows: `✅ Connected to MySQL database`
2. Backend shows: `🚀 Server running on port 5000`
3. Frontend shows: `Local: http://localhost:3000/`
4. Open browser: http://localhost:3000/login
5. Login with: `admin` / `admin123`

---

## 🆘 Quick Fixes

**Port already in use?**
- Backend: Change `PORT=5001` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.ts` or use `npm run dev -- --port 3001`

**Database connection failed?**
- Check MySQL is running
- Verify credentials in `backend/.env`
- Run `npm run test-db` in backend folder

**Module not found?**
- Run `npm install` in the problematic directory

