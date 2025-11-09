# 🔐 Fix MySQL Access Denied Error

## Problem
```
Access denied for user 'root'@'localhost' (using password: YES)
```

This means your MySQL password in `.env` is incorrect.

## Solution

### Step 1: Check Your MySQL Password

You need to know your MySQL root password. Common scenarios:

**If you just installed MySQL:**
- You might have set a password during installation
- Check if you wrote it down somewhere

**If you forgot the password:**
- Windows: MySQL might be using no password (empty password)
- Or check MySQL installation notes

**If you're not sure:**
- Try connecting to MySQL directly:
  ```bash
  mysql -u root -p
  ```
  Enter your password when prompted

### Step 2: Update .env File

Edit `backend/.env` file and update the MySQL password:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password_here
DB_NAME=hotel_booking
DB_PORT=3306
```

### Step 3: Common Password Scenarios

**If MySQL has NO password (empty):**
```env
DB_PASSWORD=
```
(Leave it empty or just don't include the line)

**If you set a password during installation:**
```env
DB_PASSWORD=the_password_you_set
```

**If you're using XAMPP/WAMP default:**
```env
DB_PASSWORD=
```
(Usually empty by default)

**If you're using MySQL Workbench:**
- Check the password you use to connect in Workbench
- Use that same password

### Step 4: Test the Connection

After updating `.env`, test the connection:

```bash
cd backend
npm run test-db
```

If it works, you'll see:
```
✅ Database connection successful!
✅ Database "hotel_booking" exists
```

### Step 5: Initialize Database

Once connection works:

```bash
npm run init-db
```

---

## Alternative: Reset MySQL Password

If you can't remember your password:

### Windows (XAMPP/WAMP)
1. Open XAMPP/WAMP Control Panel
2. Click "Shell" or open MySQL command line
3. Connect without password:
   ```bash
   mysql -u root
   ```
4. If that works, your password is empty

### Reset Root Password (Advanced)

If you need to reset MySQL root password:

**Windows:**
```bash
# Stop MySQL service
net stop MySQL80

# Start MySQL in safe mode
mysqld --skip-grant-tables

# In another terminal, connect
mysql -u root

# Update password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

**Note:** This is advanced and should be done carefully.

---

## Quick Test

Try these common passwords (one at a time):

1. **Empty password** - Leave `DB_PASSWORD=` empty
2. **"root"** - `DB_PASSWORD=root`
3. **"password"** - `DB_PASSWORD=password`
4. **"admin"** - `DB_PASSWORD=admin`
5. **"123456"** - `DB_PASSWORD=123456`

After each try, test with:
```bash
npm run test-db
```

---

## Still Not Working?

1. **Check MySQL is running:**
   ```bash
   # Windows
   net start MySQL80
   
   # Check services
   services.msc
   # Look for "MySQL80" or "MySQL"
   ```

2. **Try connecting with MySQL client:**
   ```bash
   mysql -u root -p
   ```
   This will prompt for password - use the password that works here

3. **Check if MySQL is using a different port:**
   - Default is 3306
   - Check in MySQL configuration or Workbench

4. **Check if you need a different username:**
   - Some setups use `root` without password
   - Some use a different username

---

## Success!

Once `npm run test-db` shows:
```
✅ Database connection successful!
✅ Database "hotel_booking" exists
```

Then you can proceed with:
```bash
npm run init-db
```

And your login should work! 🎉

