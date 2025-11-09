# ✅ Create .env File with Empty Password

Since you don't have a MySQL password, follow these steps:

## Step 1: Create .env File

**Option A: Copy from example (Windows PowerShell)**
```powershell
cd backend
Copy-Item env.example .env
```

**Option B: Manual Creation**
1. In `backend` folder, create a new file named `.env`
2. Copy the content from `env.example`
3. Make sure `DB_PASSWORD=` is empty (line 8)

## Step 2: Verify .env File

Your `backend/.env` should have:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hotel_booking
DB_PORT=3306
```

**Important:** `DB_PASSWORD=` should be **completely empty** (no spaces, no quotes)

## Step 3: Test Connection

```powershell
cd backend
npm run test-db
```

If you see ✅, you're good!

## Step 4: Initialize Database

```powershell
npm run init-db
```

Then restart your backend server and try login!

