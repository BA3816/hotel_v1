import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import ActivityBookingForm from "@/components/ActivityBookingForm";
import { 
  Star, 
  MapPin, 
  Coffee, 
  Wifi, 
  Car, 
  Users, 
  Calendar, 
  Search, 
  Phone, 
  Mail, 
  Clock, 
  Shield, 
  Heart, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Bed,
  Plus,
  Minus,
  DollarSign,
  User
} from "lucide-react";
import axiosClient from "../api/axios";
import { toast } from "sonner";

interface Room {
  id: number;
  room_number: string;
  name: string;
  type: string;
  capacity: number;
  floor: number;
  price: number;
  status: string;
  description?: string;
  image_url?: string;
  amenities?: string[];
  is_available_for_booking?: boolean;
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: number;
  name: string;
  description: string;
  short_description: string;
  price: number;
  duration_minutes: number;
  formatted_duration: string;
  max_participants: number;
  min_participants: number;
  difficulty_level: 'easy' | 'moderate' | 'hard';
  difficulty_color: string;
  location?: string;
  meeting_point?: string;
  available_days?: string[];
  start_time?: string;
  end_time?: string;
  advance_booking_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_reviews: number;
}

const PublicLanding = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [currentRoomSlide, setCurrentRoomSlide] = useState(0);
  const [currentActivitySlide, setCurrentActivitySlide] = useState(0);
  
  // Room filters
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [roomPriceFilter, setRoomPriceFilter] = useState("all");
  
  // Activity filters
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
  const [activityDifficultyFilter, setActivityDifficultyFilter] = useState<'all' | 'easy' | 'moderate' | 'hard'>('all');
  const [activityPriceFilter, setActivityPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  
  // Activity booking
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showActivityBookingForm, setShowActivityBookingForm] = useState(false);

  useEffect(() => {
    fetchRooms();
    fetchActivities();
  }, []);

  // Auto-play sliders
  useEffect(() => {
    const roomsToShow = getFilteredRooms();
    const totalRoomSlides = Math.ceil(roomsToShow.length / 3);
    if (totalRoomSlides > 1) {
      const interval = setInterval(() => {
        setCurrentRoomSlide((prev) => (prev + 1) % totalRoomSlides);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [rooms, roomSearchTerm, roomTypeFilter, roomPriceFilter]);

  useEffect(() => {
    const activitiesToShow = getFilteredActivities();
    const totalActivitySlides = Math.ceil(activitiesToShow.length / 3);
    if (totalActivitySlides > 1) {
      const interval = setInterval(() => {
        setCurrentActivitySlide((prev) => (prev + 1) % totalActivitySlides);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activities, activitySearchTerm, activityDifficultyFilter, activityPriceFilter]);

  const fetchRooms = async () => {
    try {
      setIsLoadingRooms(true);
      const response = await axiosClient.get('/api/rooms/public');
      if (response.data.success) {
        setRooms(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setIsLoadingActivities(true);
      const response = await axiosClient.get('/api/activities/public');
      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const getFilteredRooms = () => {
    return rooms.filter(room => {
      const matchesSearch = room.name.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
                           room.type.toLowerCase().includes(roomSearchTerm.toLowerCase());
      const matchesType = roomTypeFilter === "all" || room.type.toLowerCase().includes(roomTypeFilter);
      const matchesPrice = roomPriceFilter === "all" || 
                          (roomPriceFilter === "low" && room.price <= 50) ||
                          (roomPriceFilter === "medium" && room.price > 50 && room.price <= 100) ||
                          (roomPriceFilter === "high" && room.price > 100);
      
      return matchesSearch && matchesType && matchesPrice && room.is_available_for_booking !== false;
    });
  };

  const getFilteredActivities = () => {
    return activities.filter(activity => {
      const matchesSearch = activity.name.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
                           activity.description.toLowerCase().includes(activitySearchTerm.toLowerCase());
      const matchesDifficulty = activityDifficultyFilter === 'all' || activity.difficulty_level === activityDifficultyFilter;
      const matchesPrice = activityPriceFilter === 'all' ||
                          (activityPriceFilter === 'low' && activity.price <= 25) ||
                          (activityPriceFilter === 'medium' && activity.price > 25 && activity.price <= 50) ||
                          (activityPriceFilter === 'high' && activity.price > 50);
      
      return matchesSearch && matchesDifficulty && matchesPrice && activity.is_active;
    });
  };

  const getRoomImage = (room: Room) => {
    // Use room's image_url if available, otherwise fallback to type-based image
    if (room.image_url) {
      return room.image_url;
    }
    
    const type = room.type.toLowerCase();
    if (type.includes('shared') || type.includes('dorm')) {
      return "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop";
    } else if (type.includes('private')) {
      return "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop";
    } else if (type.includes('suite') || type.includes('family')) {
      return "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop";
    }
    return "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop";
  };

  const getDifficultyBadge = (level: string, color: string) => {
    return (
      <Badge className={color}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const handleBookActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowActivityBookingForm(true);
  };

  const handleActivityBookingSuccess = () => {
    setShowActivityBookingForm(false);
    setSelectedActivity(null);
    toast.success("Activity booking submitted successfully!");
  };

  // Room slider functions
  const nextRoomSlide = () => {
    const roomsToShow = getFilteredRooms();
    const totalSlides = Math.ceil(roomsToShow.length / 3);
    setCurrentRoomSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevRoomSlide = () => {
    const roomsToShow = getFilteredRooms();
    const totalSlides = Math.ceil(roomsToShow.length / 3);
    setCurrentRoomSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Activity slider functions
  const nextActivitySlide = () => {
    const activitiesToShow = getFilteredActivities();
    const totalSlides = Math.ceil(activitiesToShow.length / 3);
    setCurrentActivitySlide((prev) => (prev + 1) % totalSlides);
  };

  const prevActivitySlide = () => {
    const activitiesToShow = getFilteredActivities();
    const totalSlides = Math.ceil(activitiesToShow.length / 3);
    setCurrentActivitySlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="mb-8">
            <span className="inline-block bg-primary/20 backdrop-blur-sm text-primary px-6 py-3 rounded-full text-lg font-medium mb-6">
              ⭐ Welcome to Our Hostel
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-foreground">
            Discover Amazing
            <span className="text-primary"> Rooms & Activities</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 opacity-80 leading-relaxed max-w-4xl mx-auto">
            Explore our comfortable accommodations and exciting activities. 
            Book your perfect stay and create unforgettable memories.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-xl font-semibold shadow-lg transition-all duration-200"
              onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Bed className="w-5 h-5 mr-2" />
              View Rooms
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-10 py-4 rounded-xl font-semibold transition-all duration-200"
              onClick={() => document.getElementById('activities-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Calendar className="w-5 h-5 mr-2" />
              View Activities
            </Button>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms-section" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block text-primary text-sm font-medium mb-4 uppercase tracking-wide">
              ACCOMMODATION
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Our Available Rooms
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our variety of comfortable rooms designed for every type of traveler.
            </p>
          </div>

          {/* Room Filters */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  value={roomSearchTerm}
                  onChange={(e) => setRoomSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Room Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
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
              <Select value={roomPriceFilter} onValueChange={setRoomPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Under $50</SelectItem>
                  <SelectItem value="medium">$50 - $100</SelectItem>
                  <SelectItem value="high">Over $100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Room Cards */}
          {isLoadingRooms ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading rooms...</span>
            </div>
          ) : getFilteredRooms().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No rooms available matching your criteria.</p>
            </div>
          ) : (
            <div className="relative max-w-6xl mx-auto">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentRoomSlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(getFilteredRooms().length / 3) }, (_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                        {getFilteredRooms()
                          .slice(slideIndex * 3, slideIndex * 3 + 3)
                          .map((room) => (
                          <Card key={room.id} className="overflow-hidden shadow-xl bg-white rounded-2xl relative h-96 group">
                            <div 
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                              style={{ backgroundImage: `url(${getRoomImage(room)})` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                            </div>
                            
                            <div className="relative h-full flex flex-col justify-between p-6 text-white">
                              <div>
                                <div className="bg-gray-800/80 text-white px-3 py-1 rounded text-xs font-medium mb-4 inline-block">
                                  FROM ${room.price} / NIGHT
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{room.name}</h3>
                                
                                <div className="flex items-center space-x-4 text-sm">
                                  <div className="flex items-center space-x-1">
                                    <Wifi className="w-4 h-4" />
                                    <span>FREE</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>24/7</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Coffee className="w-4 h-4" />
                                    <span>kitchen</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Bed className="w-4 h-4" />
                                    <span>{room.capacity}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex space-x-2">
                                <Button 
                                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200"
                                  size="sm"
                                  onClick={() => navigate('/rooms')}
                                >
                                  BOOK NOW
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="border-white text-white hover:bg-white hover:text-primary px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200"
                                  size="sm"
                                  onClick={() => navigate('/rooms')}
                                >
                                  DETAILS
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Navigation Arrows */}
              {getFilteredRooms().length > 3 && (
                <>
                  <button
                    onClick={prevRoomSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-primary hover:text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 border border-gray-200"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700 hover:text-white transition-colors" />
                  </button>
                  
                  <button
                    onClick={nextRoomSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-primary hover:text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 border border-gray-200"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700 hover:text-white transition-colors" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Activities Section */}
      <section id="activities-section" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block text-primary text-sm font-medium mb-4 uppercase tracking-wide">
              ACTIVITIES
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Exciting Activities & Tours
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our guided tours and activities to explore the city and make new friends.
            </p>
          </div>

          {/* Activity Filters */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={activitySearchTerm}
                  onChange={(e) => setActivitySearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={activityDifficultyFilter} onValueChange={(value) => setActivityDifficultyFilter(value as 'all' | 'easy' | 'moderate' | 'hard')}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={activityPriceFilter} onValueChange={(value) => setActivityPriceFilter(value as 'all' | 'low' | 'medium' | 'high')}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Under $25</SelectItem>
                  <SelectItem value="medium">$25 - $50</SelectItem>
                  <SelectItem value="high">Over $50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Activity Cards */}
          {isLoadingActivities ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading activities...</span>
            </div>
          ) : getFilteredActivities().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activities available matching your criteria.</p>
            </div>
          ) : (
            <div className="relative max-w-6xl mx-auto">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentActivitySlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(getFilteredActivities().length / 3) }, (_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                        {getFilteredActivities()
                          .slice(slideIndex * 3, slideIndex * 3 + 3)
                          .map((activity) => (
                          <Card key={activity.id} className="overflow-hidden shadow-xl bg-white rounded-2xl group hover:shadow-2xl transition-all duration-300">
                            <div className="relative h-48 overflow-hidden">
                              <img 
                                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop"
                                alt={activity.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-4 right-4">
                                {getDifficultyBadge(activity.difficulty_level, activity.difficulty_color)}
                              </div>
                              <div className="absolute bottom-4 left-4">
                                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                  <span className="text-sm font-semibold text-gray-900">${activity.price}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-6">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.name}</h3>
                              <p className="text-gray-600 mb-4 line-clamp-2">{activity.short_description}</p>
                              
                              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {activity.formatted_duration}
                                </div>
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {activity.min_participants}-{activity.max_participants} people
                                </div>
                              </div>
                              
                              <Button 
                                className="w-full bg-primary hover:bg-primary/90 text-white"
                                onClick={() => handleBookActivity(activity)}
                              >
                                Book Activity
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Navigation Arrows */}
              {getFilteredActivities().length > 3 && (
                <>
                  <button
                    onClick={prevActivitySlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-primary hover:text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 border border-gray-200"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700 hover:text-white transition-colors" />
                  </button>
                  
                  <button
                    onClick={nextActivitySlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-primary hover:text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 border border-gray-200"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700 hover:text-white transition-colors" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Book Your Stay?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Contact us for more information or to make a reservation. We're here to help!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-xl font-semibold"
              onClick={() => navigate('/rooms')}
            >
              <Bed className="w-5 h-5 mr-2" />
              Book a Room
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-xl font-semibold"
              onClick={() => window.open('tel:+1234567890')}
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Us
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-white/90">
            <div className="flex items-center justify-center gap-3">
              <Phone className="w-5 h-5" />
              <span className="font-medium">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Mail className="w-5 h-5" />
              <span className="font-medium">info@hostel.com</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Downtown City Center</span>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Booking Form Modal */}
      {showActivityBookingForm && selectedActivity && (
        <ActivityBookingForm
          activity={selectedActivity}
          isOpen={showActivityBookingForm}
          onClose={handleActivityBookingSuccess}
        />
      )}
    </div>
  );
};

export default PublicLanding;
