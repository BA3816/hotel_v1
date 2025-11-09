# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 500 Internal Server Error on Login

This error usually means the server encountered an unexpected problem. Here's how to diagnose and fix it:

#### Step 1: Check Backend Console

Look at your backend terminal for error messages. The error should show:
- What went wrong
- Which database table is missing
- Connection issues

#### Step 2: Check Database Connection

```bash
cd backend
npm run test-db
```

This will tell you if:
- MySQL is running
- Database exists
- Connection credentials are correct

#### Step 3: Check if Database is Initialized

Visit: `http://localhost:5000/api/check/check`

This will show:
- Which tables exist
- If admin user exists
- If database needs initialization

#### Step 4: Initialize Database

If tables are missing:

```bash
cd backend
npm run init-db
```

This will:
- Create the `hotel_booking` database
- Create all tables
- Create default admin user (admin/admin123)

#### Step 5: Common Causes

**1. Database not initialized**
- **Symptom:** Error mentions "Table 'hotel_booking.admins' doesn't exist"
- **Fix:** Run `npm run init-db`

**2. Wrong database name**
- **Symptom:** Error mentions "Unknown database"
- **Fix:** Check `DB_NAME=hotel_booking` in `.env` file

**3. MySQL not running**
- **Symptom:** Connection timeout or "ECONNREFUSED"
- **Fix:** Start MySQL service
  ```bash
  # Windows
  net start MySQL80
  
  # Linux/Mac
  sudo systemctl start mysql
  ```

**4. Wrong MySQL credentials**
- **Symptom:** "Access denied" error
- **Fix:** Check `.env` file:
  ```env
  DB_USER=root
  DB_PASSWORD=your_actual_password
  ```

**5. Missing .env file**
- **Symptom:** Uses default values
- **Fix:** Create `.env` from `env.example`

#### Step 6: Verify Database Setup

After running `npm run init-db`, verify:

1. **Check tables exist:**
   ```bash
   # In MySQL
   USE hotel_booking;
   SHOW TABLES;
   ```
   Should show: admins, guests, rooms, bookings, notifications

2. **Check admin user exists:**
   ```bash
   SELECT * FROM admins;
   ```
   Should show at least one admin user

3. **Test login endpoint:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

---

## Error Messages Explained

### "Table 'hotel_booking.admins' doesn't exist"
**Solution:** Run `npm run init-db`

### "Access denied for user"
**Solution:** Check MySQL username/password in `.env`

### "Unknown database 'hotel_booking'"
**Solution:** Run `npm run init-db` to create database

### "ECONNREFUSED" or "Connection timeout"
**Solution:** 
- Check MySQL is running
- Verify `DB_HOST` and `DB_PORT` in `.env`
- Check firewall settings

### "JWT_SECRET is not defined"
**Solution:** 
- Generate secret: `npm run generate-secret`
- Add to `.env`: `JWT_SECRET=<generated_secret>`

---

## Quick Diagnostic Commands

```bash
# 1. Test database connection
cd backend
npm run test-db

# 2. Check database status via API
curl http://localhost:5000/api/check/check

# 3. Test health endpoint
curl http://localhost:5000/api/health

# 4. Initialize database
npm run init-db

# 5. Check backend logs
# Look at terminal where backend is running
```

---

## Still Having Issues?

1. **Check backend console** - Error details are logged there
2. **Verify .env file exists** - Should be in `backend/.env`
3. **Check MySQL is running** - Service must be active
4. **Restart backend server** - After changing `.env` file
5. **Check port 5000 is available** - No other app using it

---

## Need More Help?

Check the error message in:
- Backend terminal console
- Browser developer console (Network tab)
- API response body (check error details)

