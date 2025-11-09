import { useEffect, useRef } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import axiosClient from '../api/axios';

export const useBookingNotifications = () => {
  const { addNotification } = useNotifications();
  const lastBookingIdRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Initialize the last booking ID
    const initializeLastBookingId = async () => {
      try {
        const response = await axiosClient.get('/api/bookings');
        if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
          lastBookingIdRef.current = response.data.data[0].id;
          isInitializedRef.current = true;
        } else {
          // No bookings yet, but initialization is complete
          isInitializedRef.current = true;
        }
      } catch (error: any) {
        // Silently fail - don't spam console with errors
        // The endpoint might not be ready yet or there might be no bookings
        if (error.response?.status !== 500) {
          console.error('Error initializing booking notifications:', error);
        }
        // Still mark as initialized to avoid retrying
        isInitializedRef.current = true;
      }
    };

    initializeLastBookingId();

    // Poll for new bookings every 5 seconds
    const interval = setInterval(async () => {
      if (!isInitializedRef.current) return;

      try {
        const response = await axiosClient.get('/api/bookings');
        if (response.data && response.data.success && response.data.data) {
          const bookings = response.data.data;
          if (bookings.length > 0) {
            const latestBooking = bookings[0]; // Assuming bookings are sorted by created_at desc
            
            if (latestBooking && latestBooking.guest && latestBooking.room) {
              if (lastBookingIdRef.current === null) {
                // First time, just set the ID
                lastBookingIdRef.current = latestBooking.id;
              } else if (latestBooking.id > lastBookingIdRef.current) {
                // New booking detected
                addNotification({
                  type: 'success',
                  title: 'New Booking Request',
                  message: `New booking from ${latestBooking.guest.first_name || ''} ${latestBooking.guest.last_name || ''} for ${latestBooking.room.name || latestBooking.room.room_number || 'room'}`
                });
                
                // Update the last booking ID
                lastBookingIdRef.current = latestBooking.id;
              }
            }
          }
        }
      } catch (error: any) {
        // Silently fail - don't spam console with errors
        // Only log non-500 errors to avoid noise
        if (error.response?.status && error.response.status !== 500) {
          console.error('Error checking for new bookings:', error);
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [addNotification]);
};

