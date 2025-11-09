# ⚡ Quick Fix: Connection Refused Error

## The Problem
```
ERR_CONNECTION_REFUSED on http://localhost:8000
```

**The backend server is NOT running!**

---

## ✅ Solution: Start the Backend Server

### Step 1: Open Terminal in Backend Folder

Navigate to the backend directory:
```bash
cd backend
```

### Step 2: Start the Server

```bash
npm run dev
```

You should see:
```
✅ Connected to MySQL database
🚀 Server running on port 8000
📍 Environment: development
```

### Step 3: Keep It Running

**IMPORTANT:** Keep this terminal window open! The server needs to stay running.

---

## 🎯 Quick Commands

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend (in a NEW terminal):**
```bash
cd frontend
npm run dev
```

---

## ✅ Verify It's Working

Once the server is running, test it:

1. **Check health endpoint:**
   - Open browser: http://localhost:8000/api/health
   - Should show: `{"status":"OK","message":"Server is running"}`

2. **Try registration again:**
   - Go to: http://localhost:3000/register
   - Should work now!

---

## 🔄 Running Both Servers

You need **TWO terminal windows**:

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

Both must be running at the same time!

---

## 🆘 Still Not Working?

1. **Check if port 8000 is available:**
   ```bash
   netstat -ano | findstr :8000
   ```
   If something is already using it, change PORT in `.env`

2. **Check backend console:**
   - Look for error messages
   - Make sure MySQL is running

3. **Verify .env file:**
   - Make sure `PORT=8000` is set
   - Check database credentials

