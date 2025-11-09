# Notification System Testing Guide

## How to Test Notifications

### 1. **Test the Notification System Immediately**
- Go to the admin dashboard (`/admin`)
- You should see a welcome notification when the dashboard loads
- Click the "Test Booking" button to simulate a new booking request
- Click the "Test Guest" button to simulate a new guest registration
- Check the notification bell in the top-right corner of the sidebar

### 2. **Test Real-Time Notifications**
The system now polls for new bookings every 5 seconds. To test this:

1. **Open the admin dashboard** in one browser tab
2. **Open the public booking page** in another browser tab (or incognito window)
3. **Make a new booking** on the public site
4. **Wait up to 5 seconds** - you should see a notification appear in the admin dashboard

### 3. **Notification Features**
- **Real-time polling**: Checks for new bookings every 5 seconds
- **Toast notifications**: Immediate popup notifications
- **Notification bell**: Persistent notification panel with count badge
- **Multiple notification types**: Success, info, warning, error
- **Auto-refresh**: Dashboard data refreshes when new bookings are detected

### 4. **Troubleshooting**
If notifications aren't working:

1. **Check the browser console** for any errors
2. **Verify the API is working** by checking if bookings load in the dashboard
3. **Test with the test buttons** first to ensure the notification system works
4. **Check the notification bell** - click it to see if notifications are being stored

### 5. **Expected Behavior**
- ✅ Welcome notification when dashboard loads
- ✅ Test notifications work immediately
- ✅ Real-time notifications when new bookings are made
- ✅ Notification bell shows count of unread notifications
- ✅ Notifications persist until manually cleared
- ✅ Dashboard refreshes automatically when new bookings are detected

## Technical Details

- **Polling interval**: 5 seconds
- **Notification types**: success, info, warning, error
- **Storage**: Notifications are stored in React state (not persistent across page reloads)
- **API endpoint**: `/api/bookings` (checked for new bookings)

## Next Steps

If you want to make notifications persistent across page reloads, we can:
1. Store notifications in localStorage
2. Implement WebSocket connections for real-time updates
3. Add server-side notification storage
4. Add email/SMS notifications for critical events
