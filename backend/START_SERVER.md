# How to Start the Backend Server

## Quick Start

```bash
npm run dev
```

## If Port 8000 is Already in Use

### Option 1: Auto-fix (Recommended)
```bash
npm run kill-port
npm run dev
```

### Option 2: Manual
```bash
node kill-port.js
nodemon server.js
```

## Verify Server is Running

1. Check if server responds:
   ```bash
   curl http://localhost:8000/api/health
   ```

2. Should return:
   ```json
   {"status":"OK","message":"Server is running"}
   ```

## Database Connection

The database connection is automatically tested when the server starts. You should see:
```
✅ Connected to MySQL database
🚀 Server running on port 8000
```

## Troubleshooting

### Port Already in Use
- Run: `npm run kill-port`
- Or manually: Find PID with `netstat -ano | findstr :8000` and kill with `taskkill /F /PID <PID>`

### Database Connection Failed
- Check MySQL is running: `net start MySQL80` (Windows)
- Verify `.env` file has correct database credentials
- Test connection: `npm run test-db`

### Server Won't Start
- Check for errors in the console
- Verify all dependencies: `npm install`
- Check `.env` file exists and is configured

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server
- `npm run test-db` - Test database connection
- `npm run test-db-full` - Full database connection test
- `npm run kill-port` - Free port 8000
- `npm run init-db` - Initialize database
