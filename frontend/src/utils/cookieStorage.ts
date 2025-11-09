// Room availability and booking management using localStorage

export interface RoomAvailability {
  room_id: number;
  date: string;
  available_beds: number;
  total_beds: number;
}

export interface BookingData {
  booking_id: string;
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

const STORAGE_KEYS = {
  ROOM_AVAILABILITY: 'room_availability',
  BOOKINGS: 'bookings',
  LAST_SYNC: 'last_sync'
};

// Room Availability Functions
export const initializeRoomAvailability = (rooms: any[], bookings: any[] = []) => {
  const availability: Record<string, RoomAvailability> = {};
  const today = new Date();
  const endDate = new Date();
  endDate.setMonth(today.getMonth() + 3); // 3 months ahead

  rooms.forEach(room => {
    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const key = `${room.id}_${dateKey}`;
      
      // Count bookings for this room on this date
      const bookingsOnDate = bookings.filter(booking => {
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        const currentDate = new Date(dateKey);
        return (
          booking.room_id === room.id &&
          currentDate >= checkIn &&
          currentDate < checkOut &&
          booking.status !== 'cancelled'
        );
      });

      const occupiedBeds = bookingsOnDate.reduce((sum, booking) => sum + (booking.number_of_guests || 1), 0);
      
      availability[key] = {
        room_id: room.id,
        date: dateKey,
        available_beds: Math.max(0, room.capacity - occupiedBeds),
        total_beds: room.capacity
      };
    }
  });

  localStorage.setItem(STORAGE_KEYS.ROOM_AVAILABILITY, JSON.stringify(availability));
  return availability;
};

export const getRoomAvailability = (roomId: number, date: string): RoomAvailability | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.ROOM_AVAILABILITY);
  if (!stored) return null;
  
  const availability = JSON.parse(stored);
  const key = `${roomId}_${date}`;
  return availability[key] || null;
};

export const updateRoomAvailability = (roomId: number, date: string, availableBeds: number, totalBeds: number) => {
  const stored = localStorage.getItem(STORAGE_KEYS.ROOM_AVAILABILITY);
  const availability = stored ? JSON.parse(stored) : {};
  
  const key = `${roomId}_${date}`;
  availability[key] = {
    room_id: roomId,
    date,
    available_beds: availableBeds,
    total_beds: totalBeds
  };
  
  localStorage.setItem(STORAGE_KEYS.ROOM_AVAILABILITY, JSON.stringify(availability));
};

export const getAvailableBeds = (roomId: number, date: string): number => {
  const availability = getRoomAvailability(roomId, date);
  return availability ? availability.available_beds : 0;
};

export const isRoomAvailable = (roomId: number, checkIn: string, checkOut: string, guests: number): boolean => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  for (let d = new Date(checkInDate); d < checkOutDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    const availableBeds = getAvailableBeds(roomId, dateKey);
    if (availableBeds < guests) {
      return false;
    }
  }
  
  return true;
};

// Booking Functions
export const saveBooking = (booking: BookingData) => {
  const stored = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  const bookings = stored ? JSON.parse(stored) : [];
  
  bookings.push(booking);
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  
  // Update availability
  const checkInDate = new Date(booking.check_in);
  const checkOutDate = new Date(booking.check_out);
  
  for (let d = new Date(checkInDate); d < checkOutDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    const currentAvailability = getRoomAvailability(booking.room_id, dateKey);
    if (currentAvailability) {
      updateRoomAvailability(
        booking.room_id,
        dateKey,
        Math.max(0, currentAvailability.available_beds - booking.guests),
        currentAvailability.total_beds
      );
    }
  }
};

export const generateBookingId = (): string => {
  return `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
};

export const getBookings = (): BookingData[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  return stored ? JSON.parse(stored) : [];
};

export const clearAllBookings = () => {
  localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
  localStorage.removeItem(STORAGE_KEYS.ROOM_AVAILABILITY);
};

