import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Bed, Wifi, Coffee, Lock, Bath, Loader2, Calendar, MapPin, AlertCircle, Plus, Minus, Tag, Percent, Clock, CheckCircle, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ViewToggle from "@/components/ViewToggle";
import RoomBookingForm from "@/components/RoomBookingForm";
import axiosClient from '../api/axios';
import { 
  initializeRoomAvailability, 
  getRoomAvailability, 
  updateRoomAvailability, 
  getAvailableBeds, 
  isRoomAvailable, 
  saveBooking, 
  generateBookingId,
  BookingData,
  RoomAvailability
} from "@/utils/cookieStorage";

interface Room {
  id: number;
  room_number: string;
  name: string;
  type: string;
  capacity: number;
  floor: number;
  price: number;
  description?: string;
  image_url?: string;
  amenities?: string[];
}

interface SearchResultRoom {
  id: number;
  room_number: string;
  name: string;
  type: string;
  capacity: number;
  floor: number;
  price: number;
  description?: string;
  image_url?: string;
  amenities?: string[];
  available_beds: number;
  total_price: number;
  price_per_night: number;
  is_available: boolean;
  can_accommodate: boolean;
}

interface Offer {
  id: number;
  offer_code: string;
  name: string;
  description: string;
  type: string;
  discount_type: string;
  discount_value: number;
  min_guests: number;
  min_nights?: number;
  valid_from: string;
  valid_to: string;
  status: string;
  is_public: boolean;
}

interface ConfirmationBooking {
  id: string;
  roomId: number;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount: number;
  timestamp: number;
}

// Helper function to parse amenities (can be string, array, or null)
const parseAmenities = (amenities: any): string[] => {
  if (!amenities) return [];
  if (Array.isArray(amenities)) return amenities;
  if (typeof amenities === 'string') {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(amenities);
      return Array.isArray(parsed) ? parsed : [amenities];
    } catch {
      // If not JSON, split by comma or return as single item
      return amenities.includes(',') ? amenities.split(',').map(a => a.trim()) : [amenities];
    }
  }
  return [];
};

const Rooms = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomAvailability, setRoomAvailability] = useState<RoomAvailability[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showOffers, setShowOffers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  // Search functionality state
  const [searchResults, setSearchResults] = useState<SearchResultRoom[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentSearchParams, setCurrentSearchParams] = useState<{
    check_in_date: string;
    check_out_date: string;
    number_of_guests: number;
    room_type?: string;
  } | null>(null);
  
  // Booking form state
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState("1");
  const [preferredRoomType, setPreferredRoomType] = useState("all");
  const [isBooking, setIsBooking] = useState<number | null>(null);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [lastBooking, setLastBooking] = useState<ConfirmationBooking | null>(null);
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [modalFormData, setModalFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: "1"
  });
  
  // New booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    room: null as Room | null,
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 1,
    selectedOffer: null as Offer | null
  });
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({
    checkInDate: false,
    checkOutDate: false,
    numberOfGuests: false
  });

  // Initialize rooms and availability data
  useEffect(() => {
    initializeRooms();
  }, []);

  const initializeRooms = async () => {
    setIsLoading(true);
    
    try {
      // Fetch all available rooms from API (public endpoint)
      const response = await axiosClient.get('/api/rooms?status=available');
      
      if (response.data.success && response.data.data) {
        const fetchedRooms = response.data.data.map((room: any) => ({
          ...room,
          // Handle price field variations
          price: room.price || room.price_per_night || 0,
          // Handle type field variations
          type: room.type || room.room_type || 'standard',
          // Handle amenities parsing
          amenities: parseAmenities(room.amenities),
        }));
        
        setRooms(fetchedRooms);
        // Initialize room availability in cookies
        initializeRoomAvailability(fetchedRooms, []);
      } else {
        // Fallback to empty array if API fails
        setRooms([]);
        console.error('Failed to fetch rooms from API');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // On error, set empty array - rooms page will show "No rooms available"
      setRooms([]);
    } finally {
      // Load current availability state - initialize empty array
      setRoomAvailability([]);
      
      // Fetch offers if available
      try {
        const offersResponse = await axiosClient.get('/api/offers?status=active&is_public=true');
        if (offersResponse.data.success && offersResponse.data.data) {
          setOffers(offersResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
        // Initialize static offers as fallback
        const staticOffers: Offer[] = [
          {
            id: 1,
            offer_code: "EARLY20",
            name: "Early Bird Special",
            description: "Book 30 days in advance and save 20% on your stay! Perfect for planning ahead.",
            type: "early-booking",
            discount_type: "percentage",
            discount_value: 20,
            min_guests: 1,
            min_nights: 2,
            valid_from: "2024-01-01",
            valid_to: "2024-12-31",
            status: "active",
            is_public: true
          },
          {
            id: 2,
            offer_code: "GROUP15",
            name: "Group Discount",
            description: "Traveling with 4+ people? Get 15% off your entire booking when you book together.",
            type: "group-discount",
            discount_type: "percentage",
            discount_value: 15,
            min_guests: 4,
            valid_from: "2024-01-01",
            valid_to: "2024-12-31",
            status: "active",
            is_public: true
          },
          {
            id: 3,
            offer_code: "STUDENT10",
            name: "Student Special",
            description: "Valid student ID required. Get 10% off any room type with your student discount.",
            type: "student-discount",
            discount_type: "percentage",
            discount_value: 10,
            min_guests: 1,
            valid_from: "2024-01-01",
            valid_to: "2024-12-31",
            status: "active",
            is_public: true
          }
        ];
        setOffers(staticOffers);
      }
      
      setIsLoading(false);
    }
  };

  const handleBookRoom = (room: Room) => {
    // Validate form first
    if (!validateForm()) {
      return;
    }
    
    // Validate date logic
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }
    
    // Validate future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(checkInDate) < today) {
      toast.error("Check-in date cannot be in the past");
      return;
    }

    const requestedBeds = parseInt(numberOfGuests);
    
    // Check if room has enough available beds
    if (!isRoomAvailable(room.id, checkInDate, checkOutDate, requestedBeds)) {
      toast.error("All beds in this room are already booked. Please select another room.");
      return;
    }

    // Open the new booking form
    setBookingFormData({
      room,
      checkInDate,
      checkOutDate,
      numberOfGuests: requestedBeds,
      selectedOffer
    });
    setShowBookingForm(true);
  };

  const closeBookingConfirmation = () => {
    setShowBookingConfirmation(false);
    setLastBooking(null);
  };

  const handleBookingSuccess = (booking: { booking_reference: string }) => {
    // Update local availability
    if (bookingFormData.room) {
      // Update availability for each day of the booking
      const checkIn = new Date(bookingFormData.checkInDate);
      const checkOut = new Date(bookingFormData.checkOutDate);
      const room = bookingFormData.room;
      
      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        const currentAvailability = getRoomAvailability(room.id, dateKey);
        if (currentAvailability) {
          updateRoomAvailability(
            room.id,
            dateKey,
            Math.max(0, currentAvailability.available_beds - bookingFormData.numberOfGuests),
            currentAvailability.total_beds
          );
        }
      }
      
      // Calculate total amount
      const numberOfNights = Math.ceil((new Date(bookingFormData.checkOutDate).getTime() - new Date(bookingFormData.checkInDate).getTime()) / (1000 * 60 * 60 * 24));
      const baseAmount = bookingFormData.room.price * numberOfNights;
      const finalAmount = calculateDiscountedPrice(bookingFormData.room, bookingFormData.selectedOffer);
      
      // Show confirmation with real booking data
      setLastBooking({
        id: booking.booking_reference,
        roomId: bookingFormData.room.id,
        roomName: bookingFormData.room.name,
        checkInDate: bookingFormData.checkInDate,
        checkOutDate: bookingFormData.checkOutDate,
        numberOfGuests: bookingFormData.numberOfGuests,
        totalAmount: finalAmount,
        timestamp: Date.now()
      });
      setShowBookingConfirmation(true);
    }
    
    setShowBookingForm(false);
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {
      checkInDate: !checkInDate,
      checkOutDate: !checkOutDate,
      numberOfGuests: !numberOfGuests || numberOfGuests === "0"
    };
    
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Clear validation errors when user starts typing
  const clearValidationError = (field: keyof typeof validationErrors) => {
    setValidationErrors(prev => ({ ...prev, [field]: false }));
  };

  // Check if form is valid for booking
  const isFormValid = () => {
    return checkInDate && checkOutDate && numberOfGuests && numberOfGuests !== "0";
  };

  // Open booking modal
  const openBookingModal = (room: Room) => {
    setSelectedRoomForBooking(room);
    setModalFormData({
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      numberOfGuests: numberOfGuests
    });
    setShowBookingModal(true);
  };

  // Close booking modal
  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedRoomForBooking(null);
    setModalFormData({
      checkInDate: "",
      checkOutDate: "",
      numberOfGuests: "1"
    });
  };

  // Handle modal form changes
  const handleModalFormChange = (field: string, value: string) => {
    setModalFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate modal form
  const validateModalForm = () => {
    const errors = {
      checkInDate: !modalFormData.checkInDate,
      checkOutDate: !modalFormData.checkOutDate,
      numberOfGuests: !modalFormData.numberOfGuests || modalFormData.numberOfGuests === "0"
    };
    
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Handle booking from modal
  const handleModalBooking = async () => {
    if (!validateModalForm() || !selectedRoomForBooking) return;
    
    // Update main form data
    setCheckInDate(modalFormData.checkInDate);
    setCheckOutDate(modalFormData.checkOutDate);
    setNumberOfGuests(modalFormData.numberOfGuests);
    
    // Close modal and proceed with booking
    closeBookingModal();
    await handleBookRoom(selectedRoomForBooking);
  };


  // Get available beds for a room
  const getAvailableBedsForRoom = (roomId: number): number => {
    // Get today's date for availability check
    const today = new Date().toISOString().split('T')[0];
    return getAvailableBeds(roomId, today);
  };

  // Check if room is available for booking
  const isRoomAvailableForBooking = (room: Room): boolean => {
    const availableBeds = getAvailableBedsForRoom(room.id);
    return availableBeds > 0;
  };

  // Offer utility functions
  const isOfferValid = (offer: Offer) => {
    const now = new Date().toISOString().split('T')[0];
    return offer.status === 'active' && 
           offer.valid_from <= now && 
           offer.valid_to >= now;
  };

  const formatDiscount = (offer: Offer) => {
    switch (offer.discount_type) {
      case "percentage":
        return `${offer.discount_value}%`;
      case "fixed_amount":
        return `$${offer.discount_value}`;
      default:
        return offer.discount_value.toString();
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "early-booking": return "bg-green-100 text-green-800";
      case "group-discount": return "bg-blue-100 text-blue-800";
      case "student-discount": return "bg-yellow-100 text-yellow-800";
      case "length-discount": return "bg-purple-100 text-purple-800";
      case "weekend-special": return "bg-orange-100 text-orange-800";
      case "new-guest": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "early-booking": return "Early Bird";
      case "group-discount": return "Group";
      case "student-discount": return "Student";
      case "length-discount": return "Extended";
      case "weekend-special": return "Weekend";
      case "new-guest": return "New Guest";
      default: return type;
    }
  };

  const calculateDiscountedPrice = (room: Room, offer: Offer | null) => {
    const numberOfNights = checkInDate && checkOutDate ? 
      Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)) : 1;
    
    const totalPrice = room.price * numberOfNights;
    
    if (!offer) {
      return totalPrice;
    }
    
    switch (offer.discount_type) {
      case "percentage":
        return totalPrice * (1 - offer.discount_value / 100);
      case "fixed_amount":
        return Math.max(0, totalPrice - (offer.discount_value * numberOfNights));
      default:
        return totalPrice;
    }
  };

  const incrementGuests = () => {
    const currentGuests = parseInt(numberOfGuests);
    if (currentGuests < 8) {
      setNumberOfGuests((currentGuests + 1).toString());
    }
  };

  const decrementGuests = () => {
    const currentGuests = parseInt(numberOfGuests);
    if (currentGuests > 1) {
      setNumberOfGuests((currentGuests - 1).toString());
    }
  };

  // Search functionality
  const handleSearch = async (searchParams: {
    check_in_date: string;
    check_out_date: string;
    number_of_guests: number;
    room_type?: string;
  }) => {
    setIsSearching(true);
    setCurrentSearchParams(searchParams);

    try {
      const response = await axiosClient.post('/api/room-availability/search', searchParams);
      
      if (response.data.success) {
        setSearchResults(response.data.data);
        setHasSearched(true);
        toast.success(`Found ${response.data.count} available rooms`);
      } else {
        toast.error(response.data.message || 'No rooms found');
        setSearchResults([]);
      }
    } catch (error: unknown) {
      console.error('Search error:', error);
      toast.error('Failed to search rooms. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookSearchRoom = (room: SearchResultRoom) => {
    if (!currentSearchParams) {
      toast.error('No search parameters available');
      return;
    }

    // Validate room availability
    if (!room.is_available || !room.can_accommodate) {
      toast.error('This room is not available for the selected dates');
      return;
    }

    // Convert SearchResultRoom to Room interface
    const roomData: Room = {
      id: room.id,
      room_number: room.room_number,
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      floor: room.floor,
      price: room.price_per_night,
      description: room.description,
      image_url: room.image_url,
      amenities: parseAmenities(room.amenities)
    };

    // Open the new booking form
    setBookingFormData({
      room: roomData,
      checkInDate: currentSearchParams.check_in_date,
      checkOutDate: currentSearchParams.check_out_date,
      numberOfGuests: currentSearchParams.number_of_guests,
      selectedOffer
    });
    setShowBookingForm(true);
  };

  // Filter rooms based on search and filters, only show rooms with available beds
  const filteredRooms = rooms.filter(room => {
    const hasAvailableBeds = isRoomAvailableForBooking(room);
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || room.type === typeFilter;
    const matchesPrice = priceFilter === "all" || 
      (priceFilter === "budget" && room.price <= 30) ||
      (priceFilter === "mid" && room.price > 30 && room.price <= 60) ||
      (priceFilter === "luxury" && room.price > 60);
    
    return hasAvailableBeds && matchesSearch && matchesType && matchesPrice;
  });

  // Get room status based on availability
  const getRoomStatus = (room: Room) => {
    const availableBeds = getAvailableBedsForRoom(room.id);
    if (availableBeds === 0) {
      return { text: "Fully Booked", color: "bg-red-100 text-red-800" };
    } else if (availableBeds <= room.capacity * 0.3) {
      return { text: "Limited Availability", color: "bg-orange-100 text-orange-800" };
    } else {
      return { text: "Available", color: "bg-green-100 text-green-800" };
    }
  };




  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Enhanced Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary/5 via-secondary to-accent/10 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-accent rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-primary/50 rounded-full blur-lg"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
              <Bed className="h-4 w-4" />
              <span>Live Availability</span>
            </div>
            
            <h1 className="text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Find Your Perfect Stay
          </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Discover comfortable accommodations with real-time availability. 
              <span className="text-primary font-semibold"> Free WiFi</span>, 
              <span className="text-primary font-semibold"> breakfast</span>, and 
              <span className="text-primary font-semibold"> 24/7 support</span> included.
            </p>
            
            {/* Search Button */}
            <div className="mb-8">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
                onClick={() => {
                  // Scroll to the booking form
                  const bookingForm = document.querySelector('.lg\\:col-span-1');
                  if (bookingForm) {
                    bookingForm.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Search className="h-5 w-5 mr-2" />
                Search Available Rooms
              </Button>
            </div>
            
            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">20+</div>
                <div className="text-sm text-muted-foreground">Rooms Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-muted-foreground">Guest Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Special Offers Section */}
        {offers.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Special Offers</h2>
                {selectedOffer && (
                  <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        Selected Offer: {selectedOffer.name} - {formatDiscount(selectedOffer)} off
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        This offer will be applied to your booking
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOffer(null)}
                        className="text-xs h-6 px-2"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowOffers(!showOffers)}
                className="flex items-center space-x-2"
              >
                <Tag className="h-4 w-4" />
                <span>{showOffers ? 'Hide' : 'Show'} Offers</span>
              </Button>
            </div>
            
            {showOffers && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {offers.filter(offer => isOfferValid(offer)).map((offer) => (
                  <Card key={offer.id} className={`p-4 border-2 transition-colors ${
                    selectedOffer?.id === offer.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-primary/20 hover:border-primary/40'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{offer.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getTypeColor(offer.type)} text-xs`}>
                            {getTypeText(offer.type)}
                          </Badge>
                          {selectedOffer?.id === offer.id && (
                            <Badge className="bg-primary text-white text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {formatDiscount(offer)}
                        </div>
                        <div className="text-xs text-muted-foreground">off</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {offer.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>Code: {offer.offer_code}</span>
                      <span>Min {offer.min_guests} guest{offer.min_guests > 1 ? 's' : ''}</span>
                    </div>
                    {selectedOffer?.id !== offer.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOffer(offer)}
                        className="w-full"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        Select This Offer
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enhanced Booking Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 shadow-soft sticky top-6 border-2 border-primary/10 hover:border-primary/20 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Book Your Stay</h2>
                <p className="text-sm text-muted-foreground">Quick & easy booking process</p>
              </div>
              
              <div className="space-y-4">
                <div className="group">
                  <Label htmlFor="checkin" className={`flex items-center space-x-2 ${validationErrors.checkInDate ? "text-red-600" : "text-foreground"}`}>
                    <Calendar className="h-4 w-4" />
                    <span>Check-in Date {validationErrors.checkInDate && <span className="text-red-500">*</span>}</span>
                  </Label>
                  <div className="relative mt-1">
                  <Input 
                    type="date" 
                    id="checkin" 
                      className={`pl-10 ${validationErrors.checkInDate ? "border-red-500 focus:border-red-500" : "group-hover:border-primary/50"}`}
                    value={checkInDate}
                      onChange={(e) => {
                        setCheckInDate(e.target.value);
                        clearValidationError('checkInDate');
                      }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {validationErrors.checkInDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Please select your check-in date</span>
                    </p>
                  )}
                </div>
                
                <div className="group">
                  <Label htmlFor="checkout" className={`flex items-center space-x-2 ${validationErrors.checkOutDate ? "text-red-600" : "text-foreground"}`}>
                    <Calendar className="h-4 w-4" />
                    <span>Check-out Date {validationErrors.checkOutDate && <span className="text-red-500">*</span>}</span>
                  </Label>
                  <div className="relative mt-1">
                  <Input 
                    type="date" 
                    id="checkout" 
                      className={`pl-10 ${validationErrors.checkOutDate ? "border-red-500 focus:border-red-500" : "group-hover:border-primary/50"}`}
                    value={checkOutDate}
                      onChange={(e) => {
                        setCheckOutDate(e.target.value);
                        clearValidationError('checkOutDate');
                      }}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                  />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {validationErrors.checkOutDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Please select your check-out date</span>
                    </p>
                  )}
                </div>
                
                <div className="group">
                  <Label htmlFor="guests" className={`flex items-center space-x-2 ${validationErrors.numberOfGuests ? "text-red-600" : "text-foreground"}`}>
                    <Users className="h-4 w-4" />
                    <span>Number of Guests {validationErrors.numberOfGuests && <span className="text-red-500">*</span>}</span>
                  </Label>
                  <div className={`flex items-center space-x-3 mt-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                    validationErrors.numberOfGuests 
                      ? "border-red-500 bg-red-50/50" 
                      : "border-border hover:border-primary/50 bg-card/50"
                  }`}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        decrementGuests();
                        clearValidationError('numberOfGuests');
                      }}
                      disabled={parseInt(numberOfGuests) <= 1}
                      className="h-10 w-10 p-0 hover:bg-primary/10 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {numberOfGuests}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {parseInt(numberOfGuests) === 1 ? 'Guest' : 'Guests'}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        incrementGuests();
                        clearValidationError('numberOfGuests');
                      }}
                      disabled={parseInt(numberOfGuests) >= 8}
                      className="h-10 w-10 p-0 hover:bg-primary/10 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {validationErrors.numberOfGuests && (
                    <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Please select the number of guests</span>
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    Maximum: 8 guests
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="room-type">Preferred Room Type</Label>
                  <Select value={preferredRoomType} onValueChange={setPreferredRoomType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Any room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any room type</SelectItem>
                      <SelectItem value="Private Single">Private Single</SelectItem>
                      <SelectItem value="Private Double">Private Double</SelectItem>
                      <SelectItem value="Private Twin">Private Twin</SelectItem>
                      <SelectItem value="Private Triple">Private Triple</SelectItem>
                      <SelectItem value="Private Quad">Private Quad</SelectItem>
                      <SelectItem value="Mixed Dormitory">Mixed Dormitory</SelectItem>
                      <SelectItem value="Female Dormitory">Female Dormitory</SelectItem>
                      <SelectItem value="Executive Suite">Executive Suite</SelectItem>
                      <SelectItem value="Deluxe Private">Deluxe Private</SelectItem>
                      <SelectItem value="Family Suite">Family Suite</SelectItem>
                      <SelectItem value="Penthouse Suite">Penthouse Suite</SelectItem>
                      <SelectItem value="Accessible Suite">Accessible Suite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Real-time Availability
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Room availability is updated in real-time. Only rooms with available beds are shown.
                  </p>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      if (!checkInDate || !checkOutDate) {
                        toast.error('Please select check-in and check-out dates');
                        return;
                      }
                      if (new Date(checkInDate) >= new Date(checkOutDate)) {
                        toast.error('Check-out date must be after check-in date');
                        return;
                      }
                      handleSearch({
                        check_in_date: checkInDate,
                        check_out_date: checkOutDate,
                        number_of_guests: parseInt(numberOfGuests),
                        room_type: preferredRoomType === "all" ? undefined : preferredRoomType
                      });
                    }}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search Available Rooms
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setCheckInDate("");
                      setCheckOutDate("");
                      setNumberOfGuests("1");
                      setPreferredRoomType("all");
                      setSearchResults([]);
                      setHasSearched(false);
                    }}
                  >
                    Reset Search
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Included in All Bookings</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">Free Breakfast</Badge>
                  <Badge variant="secondary" className="text-xs">Free WiFi</Badge>
                  <Badge variant="secondary" className="text-xs">24/7 Reception</Badge>
                  <Badge variant="secondary" className="text-xs">Common Areas</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Room Types */}
          <div className="lg:col-span-2">
            {/* View Toggle Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Available Rooms</h2>
              <ViewToggle 
                currentView={viewMode} 
                onViewChange={setViewMode}
              />
            </div>
            
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : ""}`}>
              {isLoading ? (
                <div className="col-span-2 flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading rooms...</p>
                  </div>
                </div>
              ) : hasSearched ? (
                // Search Results Display
                <div className="col-span-2">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Search Results ({searchResults.length})
                    </h3>
                    <p className="text-muted-foreground">
                      {currentSearchParams && `${new Date(currentSearchParams.check_in_date).toLocaleDateString()} - ${new Date(currentSearchParams.check_out_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  
                  {searchResults.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="max-w-md mx-auto">
                        <Bed className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Rooms Available</h3>
                        <p className="text-muted-foreground mb-4">
                          Sorry, no rooms are available for your selected dates and criteria.
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchResults([]);
                            setHasSearched(false);
                          }}
                        >
                          Try Different Dates
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : ""}`}>
                      {searchResults.map((room) => (
                        <Card key={room.id} className="overflow-hidden shadow-soft h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                          <div className={`flex ${viewMode === "grid" ? "flex-col" : "flex-col md:flex-row"} h-full`}>
                            {/* Room Image */}
                            <div className={`relative ${viewMode === "grid" ? "h-48" : "h-48 md:h-auto md:w-80"} flex-shrink-0 overflow-hidden`}>
                              <img 
                                src={room.image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'} 
                                alt={room.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                              
                              {/* Status badge */}
                              <div className="absolute top-4 right-4">
                                <Badge className={room.is_available && room.can_accommodate ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                  {room.is_available && room.can_accommodate ? "Available" : "Not Available"}
                                </Badge>
                              </div>
                            </div>

                            {/* Room Details */}
                            <div className="flex-1 p-6 flex flex-col">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-1">{room.name}</h3>
                                    <p className="text-sm text-muted-foreground">Room #{room.room_number}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">${room.price_per_night}</div>
                                    <div className="text-sm text-muted-foreground">per night</div>
                                  </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>Capacity: {room.capacity} guests</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Bed className="h-4 w-4" />
                                    <span>Available beds: {room.available_beds}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>Floor {room.floor}</span>
                                  </div>
                                </div>

                                {room.description && (
                                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                    {room.description}
                                  </p>
                                )}

                                {/* Amenities */}
                                {(() => {
                                  const amenities = parseAmenities(room.amenities);
                                  return amenities.length > 0 && (
                                    <div className="mb-4">
                                      <div className="flex flex-wrap gap-2">
                                        {amenities.slice(0, 4).map((amenity, index) => (
                                          <Badge key={index} variant="secondary" className="text-xs">
                                            {amenity}
                                          </Badge>
                                        ))}
                                        {amenities.length > 4 && (
                                          <Badge variant="secondary" className="text-xs">
                                            +{amenities.length - 4} more
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Pricing Summary */}
                                <div className="bg-muted/50 p-3 rounded-lg mb-4">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                      {Math.ceil((new Date(currentSearchParams.check_out_date).getTime() - new Date(currentSearchParams.check_in_date).getTime()) / (1000 * 60 * 60 * 24))} night(s) × ${room.price_per_night}
                                    </span>
                                    <span className="font-semibold text-lg text-foreground">
                                      ${room.total_price}
                                    </span>
                                  </div>
                                </div>

                                {/* Availability Status */}
                                <div className="flex items-center gap-2 mb-4">
                                  {room.is_available && room.can_accommodate ? (
                                    <div className="flex items-center gap-1 text-green-600 text-sm">
                                      <CheckCircle className="h-4 w-4" />
                                      <span>Available for {currentSearchParams.number_of_guests} guest{currentSearchParams.number_of_guests !== 1 ? 's' : ''}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-red-600 text-sm">
                                      <AlertCircle className="h-4 w-4" />
                                      <span>
                                        {!room.is_available ? 'Not available for selected dates' : 
                                         !room.can_accommodate ? `Cannot accommodate ${currentSearchParams.number_of_guests} guests` : 
                                         'Limited availability'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Book Button */}
                              <Button
                                onClick={() => handleBookSearchRoom(room)}
                                disabled={!room.is_available || !room.can_accommodate}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {!room.is_available || !room.can_accommodate ? (
                                  'Not Available'
                                ) : (
                                  <>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Book Now
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <div className="max-w-md mx-auto">
                    <Bed className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Available Rooms</h3>
                    <p className="text-muted-foreground mb-4">
                      All rooms are currently fully booked. Please try different dates or check back later.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        initializeRooms();
                        setCheckInDate("");
                        setCheckOutDate("");
                        setNumberOfGuests("1");
                        setPreferredRoomType("all");
                      }}
                    >
                      View All Rooms
                    </Button>
                  </div>
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <Card key={room.id} className="overflow-hidden shadow-soft h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                    <div className={`flex ${viewMode === "grid" ? "flex-col" : "flex-col md:flex-row"} h-full`}>
                      {/* Enhanced Room Image */}
                      <div className={`relative ${viewMode === "grid" ? "h-48" : "h-48 md:h-auto md:w-80"} flex-shrink-0 overflow-hidden`}>
                        <img 
                          src={room.image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'} 
                          alt={room.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop';
                          }}
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        
                        {/* Status badge with animation */}
                        <div className="absolute top-4 right-4">
                          <Badge className={`${getRoomStatus(room).color} animate-pulse`}>
                            {getRoomStatus(room).text}
                          </Badge>
                        </div>
                        
                        {/* Price overlay */}
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                            <div className="text-2xl font-bold text-primary">${room.price}</div>
                            <div className="text-xs text-muted-foreground">per night</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Room Information */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        {/* Main Content */}
                        <div className="flex-1">
                          <div className="mb-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{room.name}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm text-muted-foreground">Live availability</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">${room.price}</div>
                                <div className="text-sm text-muted-foreground">per night</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-muted-foreground mb-3">
                              <div className="flex items-center space-x-1">
                                <Users size={16} />
                                <span className="text-sm">Up to {room.capacity} guests</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Bed size={16} />
                                <span className="text-sm">{room.capacity} beds</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin size={16} />
                                <span className="text-sm">Floor {room.floor}</span>
                              </div>
                            </div>
                            
                            {/* Available Beds Display */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${
                                    getAvailableBedsForRoom(room.id) > 0 ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                                  <span className="text-sm font-medium text-foreground">
                                    {getAvailableBedsForRoom(room.id) > 0 
                                      ? `${getAvailableBedsForRoom(room.id)} bed${getAvailableBedsForRoom(room.id) === 1 ? '' : 's'} available`
                                      : 'Fully booked'
                                    }
                                </span>
                                </div>
                                <Badge 
                                  variant={getAvailableBedsForRoom(room.id) > 0 ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {getAvailableBedsForRoom(room.id) > 0 ? 'Available' : 'Full'}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Simple alert for limited availability */}
                            {getAvailableBedsForRoom(room.id) > 0 && getAvailableBedsForRoom(room.id) <= room.capacity * 0.3 && (
                              <div className="flex items-center mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                                <span className="text-sm text-yellow-700">
                                  Limited availability - Book soon!
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-foreground mb-2">Room Features:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {(() => {
                              const amenities = parseAmenities(room.amenities);
                              return amenities.length > 0 ? amenities.map((amenity, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  {amenity.includes("WiFi") && <Wifi size={14} className="text-primary" />}
                                  {amenity.includes("Locker") && <Lock size={14} className="text-primary" />}
                                  {amenity.includes("Bathroom") && <Bath size={14} className="text-primary" />}
                                  {!amenity.includes("WiFi") && !amenity.includes("Locker") && !amenity.includes("Bathroom") && (
                                    <Coffee size={14} className="text-primary" />
                                  )}
                                  <span className="text-sm text-muted-foreground">{amenity}</span>
                                </div>
                              )) : (
                                <div className="text-sm text-muted-foreground">No amenities listed</div>
                              );
                            })()}
                          </div>
                        </div>

                        {room.description && (
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground">{room.description}</p>
                          </div>
                        )}

                        <div className="space-y-3">
                          {/* Price Display */}
                          <div className="text-sm text-muted-foreground">
                            {checkInDate && checkOutDate ? (
                              <>
                                {(() => {
                                  const nights = Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24));
                                  const basePrice = room.price * nights;
                                  const discountedPrice = selectedOffer ? calculateDiscountedPrice(room, selectedOffer) : basePrice;
                                  
                                  return (
                                    <>
                                      Total for {nights} nights: 
                                      {selectedOffer && discountedPrice < basePrice ? (
                                        <div className="flex items-center space-x-2">
                                          <span className="line-through text-muted-foreground">${basePrice.toFixed(2)}</span>
                                          <span className="font-semibold text-green-600">${discountedPrice.toFixed(2)}</span>
                                          <Badge className="bg-green-100 text-green-800 text-xs">
                                            {formatDiscount(selectedOffer)} off
                                          </Badge>
                                        </div>
                                      ) : (
                                        <span className="font-semibold">${basePrice.toFixed(2)}</span>
                                      )}
                                    </>
                                  );
                                })()}
                              </>
                            ) : (
                              <>
                                Total for 1 night: <span className="font-semibold">${room.price}</span>
                              </>
                            )}
                          </div>

                          {/* Available Offers for this room */}
                          {offers.filter(offer => 
                            isOfferValid(offer) && 
                            parseInt(numberOfGuests) >= offer.min_guests &&
                            (!offer.min_nights || (checkInDate && checkOutDate && 
                              Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)) >= offer.min_nights))
                          ).length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">Available offers:</p>
                              <div className="flex flex-wrap gap-2">
                                {offers.filter(offer => 
                                  isOfferValid(offer) && 
                                  parseInt(numberOfGuests) >= offer.min_guests &&
                                  (!offer.min_nights || (checkInDate && checkOutDate && 
                                    Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)) >= offer.min_nights))
                                ).slice(0, 2).map((offer) => (
                                  <Button
                                    key={offer.id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedOffer(offer)}
                                    className="text-xs h-8"
                                    disabled={!isRoomAvailableForBooking(room) || isBooking === room.id}
                                  >
                                    <Tag className="h-3 w-3 mr-1" />
                                    {formatDiscount(offer)} off
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                        
                        {/* Enhanced Action Buttons */}
                        <div className="mt-auto pt-4">
                          <div className="space-y-3">
                            {/* Quick info bar */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  getAvailableBedsForRoom(room.id) > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                }`}></div>
                                <span className="text-muted-foreground">
                                  {getAvailableBedsForRoom(room.id)} bed{getAvailableBedsForRoom(room.id) === 1 ? '' : 's'} available
                                </span>
                              </div>
                              <div className="text-muted-foreground">
                                Floor {room.floor}
                              </div>
                            </div>
                            
                            {/* Enhanced Book Now Button */}
                            <Button 
                              disabled={!isRoomAvailableForBooking(room) || isBooking === room.id}
                              onClick={() => openBookingModal(room)}
                              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
                            >
                              {isBooking === room.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  <span>Booking...</span>
                                </>
                              ) : !isRoomAvailableForBooking(room) ? (
                                <>
                                  <X className="mr-2 h-4 w-4" />
                                  <span>Fully Booked</span>
                                </>
                              ) : (
                                <>
                                  <Bed className="mr-2 h-4 w-4" />
                                  <span>Book Now</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedRoomForBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Book Your Stay</h3>
                  <p className="text-muted-foreground">Complete your booking details</p>
                </div>
                              <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeBookingModal}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Room Info */}
              <div className="bg-primary/5 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <img 
                    src={selectedRoomForBooking.image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'} 
                    alt={selectedRoomForBooking.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{selectedRoomForBooking.name}</h4>
                    <p className="text-sm text-muted-foreground">Room {selectedRoomForBooking.room_number}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Up to {selectedRoomForBooking.capacity} guests</span>
                      <span>Floor {selectedRoomForBooking.floor}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">${selectedRoomForBooking.price}</div>
                    <div className="text-sm text-muted-foreground">per night</div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-4">
                {/* Check-in Date */}
                <div className="group">
                  <Label htmlFor="modal-checkin" className="flex items-center space-x-2 text-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Check-in Date {validationErrors.checkInDate && <span className="text-red-500">*</span>}</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input 
                      type="date" 
                      id="modal-checkin" 
                      className={`pl-10 ${validationErrors.checkInDate ? "border-red-500 focus:border-red-500" : "group-hover:border-primary/50"}`}
                      value={modalFormData.checkInDate}
                      onChange={(e) => handleModalFormChange('checkInDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {validationErrors.checkInDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Please select your check-in date</span>
                    </p>
                  )}
                </div>

                {/* Check-out Date */}
                <div className="group">
                  <Label htmlFor="modal-checkout" className="flex items-center space-x-2 text-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Check-out Date {validationErrors.checkOutDate && <span className="text-red-500">*</span>}</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input 
                      type="date" 
                      id="modal-checkout" 
                      className={`pl-10 ${validationErrors.checkOutDate ? "border-red-500 focus:border-red-500" : "group-hover:border-primary/50"}`}
                      value={modalFormData.checkOutDate}
                      onChange={(e) => handleModalFormChange('checkOutDate', e.target.value)}
                      min={modalFormData.checkInDate || new Date().toISOString().split('T')[0]}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {validationErrors.checkOutDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Please select your check-out date</span>
                    </p>
                  )}
                </div>

                {/* Number of Guests */}
                <div className="group">
                  <Label htmlFor="modal-guests" className="flex items-center space-x-2 text-foreground">
                    <Users className="h-4 w-4" />
                    <span>Number of Guests {validationErrors.numberOfGuests && <span className="text-red-500">*</span>}</span>
                  </Label>
                  <div className={`flex items-center space-x-3 mt-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                    validationErrors.numberOfGuests 
                      ? "border-red-500 bg-red-50/50" 
                      : "border-border hover:border-primary/50 bg-card/50"
                  }`}>
                    <Button
                      type="button"
                                variant="outline"
                      size="sm"
                      onClick={() => handleModalFormChange('numberOfGuests', Math.max(1, parseInt(modalFormData.numberOfGuests) - 1).toString())}
                      disabled={parseInt(modalFormData.numberOfGuests) <= 1}
                      className="h-10 w-10 p-0 hover:bg-primary/10 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                              </Button>
                    <div className="flex-1 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {modalFormData.numberOfGuests}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {parseInt(modalFormData.numberOfGuests) === 1 ? 'Guest' : 'Guests'}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleModalFormChange('numberOfGuests', Math.min(8, parseInt(modalFormData.numberOfGuests) + 1).toString())}
                      disabled={parseInt(modalFormData.numberOfGuests) >= 8}
                      className="h-10 w-10 p-0 hover:bg-primary/10 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {validationErrors.numberOfGuests && (
                    <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Please select the number of guests</span>
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    Maximum: 8 guests
                  </p>
                          </div>
                        </div>

              {/* Price Summary */}
              {modalFormData.checkInDate && modalFormData.checkOutDate && (
                <div className="bg-accent/10 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-foreground mb-3">Price Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room price per night:</span>
                      <span className="font-medium">${selectedRoomForBooking.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number of nights:</span>
                      <span className="font-medium">
                        {Math.ceil((new Date(modalFormData.checkOutDate).getTime() - new Date(modalFormData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number of guests:</span>
                      <span className="font-medium">{modalFormData.numberOfGuests}</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span className="text-primary">
                          ${(selectedRoomForBooking.price * Math.ceil((new Date(modalFormData.checkOutDate).getTime() - new Date(modalFormData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={closeBookingModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleModalBooking}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Bed className="mr-2 h-4 w-4" />
                  Confirm Booking
                </Button>
                      </div>
                    </div>
                  </Card>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {showBookingConfirmation && lastBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
              <h3 className="text-lg font-semibold text-center text-foreground mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Your booking has been successfully created and saved.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room:</span>
                    <span className="font-medium">{lastBooking.roomName}</span>
          </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in:</span>
                    <span className="font-medium">{new Date(lastBooking.checkInDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out:</span>
                    <span className="font-medium">{new Date(lastBooking.checkOutDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests:</span>
                    <span className="font-medium">{lastBooking.numberOfGuests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">${lastBooking.totalAmount.toFixed(2)}</span>
                  </div>
                  {selectedOffer && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Offer Applied:</span>
                      <span className="font-medium text-green-600">{selectedOffer.name} ({formatDiscount(selectedOffer)} off)</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking ID:</span>
                    <span className="font-medium text-xs">{lastBooking.id}</span>
                  </div>
        </div>
      </div>

              <div className="flex justify-center">
                <Button 
                  className="w-full max-w-xs"
                  onClick={closeBookingConfirmation}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* New Booking Form */}
      {showBookingForm && bookingFormData.room && (
        <RoomBookingForm
          room={bookingFormData.room}
          isOpen={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          checkInDate={bookingFormData.checkInDate}
          checkOutDate={bookingFormData.checkOutDate}
          numberOfGuests={bookingFormData.numberOfGuests}
          selectedOffer={bookingFormData.selectedOffer}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default Rooms;