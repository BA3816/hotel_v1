import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import heroImage from "@/assets/hero-hostel.jpg";
import { Star, MapPin, Coffee, Wifi, Car, Users, Calendar, Search, Phone, Mail, Clock, Shield, Heart, Award, ChevronLeft, ChevronRight, Bed } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

const Home = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('common-areas');

  // Get all available rooms for display
  const getAllRooms = useCallback(() => {
    return rooms.filter(room => room.is_available_for_booking !== false);
  }, [rooms]);

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

  useEffect(() => {
    fetchRooms();
  }, []);

  // Auto-play slider
  useEffect(() => {
    const roomsToShow = getAllRooms();
    const totalSlides = Math.ceil(roomsToShow.length / 2);
    if (totalSlides > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [rooms, getAllRooms]);

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

      const getRoomDescription = (roomType: string) => {
        const type = roomType.toLowerCase();
        if (type.includes('shared') || type.includes('dorm')) {
          return "Perfect for budget travelers and solo adventurers";
        } else if (type.includes('private')) {
          return "Ideal for couples or those seeking privacy";
        } else if (type.includes('suite') || type.includes('family')) {
          return "Spacious accommodation for families and groups";
        }
        return "Comfortable accommodation for your stay";
      };

      const isPopularRoom = (room: Room) => {
        return room.type.toLowerCase().includes('private');
      };

      // Slider functions - Updated for 2 rooms per slide
      const nextSlide = () => {
        const roomsToShow = getAllRooms();
        const totalSlides = Math.ceil(roomsToShow.length / 2);
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      };

      const prevSlide = () => {
        const roomsToShow = getAllRooms();
        const totalSlides = Math.ceil(roomsToShow.length / 2);
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
      };

      const goToSlide = (index: number) => {
        setCurrentSlide(index);
      };
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Booking Form */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-white">
              <div className="mb-6">
                <span className="inline-block bg-primary/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  ⭐ Rated #1 Hostel in the City
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Happy Hostel
          </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
                Experience comfort, community, and adventure in the heart of the city. 
                Where every stay becomes a story.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-200"
                  onClick={() => navigate('/rooms')}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Your Stay
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-primary hover:bg-white hover:text-primary px-8 py-4 rounded-xl font-semibold transition-all duration-200"
                  onClick={() => navigate('/rooms')}
                >
                  Virtual Tour
          </Button>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">4.9</div>
                  <div className="text-sm opacity-80">Guest Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">50K+</div>
                  <div className="text-sm opacity-80">Happy Guests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                  <div className="text-sm opacity-80">Support</div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:ml-8">
              <Card className="p-8 backdrop-blur-md bg-white/95 shadow-2xl rounded-2xl">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Book Your Room</h3>
                  <p className="text-gray-600">Find the perfect accommodation for your stay</p>
                </div>
                
                <form className="space-y-6">
                  {/* Check-in & Check-out */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkin" className="text-sm font-medium text-gray-700">Check-in</Label>
                      <Input 
                        id="checkin" 
                        type="date" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkout" className="text-sm font-medium text-gray-700">Check-out</Label>
                      <Input 
                        id="checkout" 
                        type="date" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Room Type & Guests */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Room Type</Label>
                      <Select>
                        <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg">
                          <SelectValue placeholder="Select room" />
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
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Guests</Label>
                      <Select>
                        <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg">
                          <SelectValue placeholder="1 Guest" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Guest</SelectItem>
                          <SelectItem value="2">2 Guests</SelectItem>
                          <SelectItem value="3">3 Guests</SelectItem>
                          <SelectItem value="4">4 Guests</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Search Button */}
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200"
                    onClick={() => navigate('/rooms')}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Check Availability
                  </Button>

                  {/* Contact Info */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        <span>+1 (555) 123-4567</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        <span>info@happyhostel.com</span>
                      </div>
                    </div>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Features */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Happy Hostel?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for an unforgettable stay, all included in one place
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { icon: Wifi, label: "Free WiFi", desc: "High-speed internet" },
              { icon: Coffee, label: "Free Breakfast", desc: "Continental daily" },
              { icon: Car, label: "Free Parking", desc: "Secure 24/7" },
              { icon: Users, label: "Common Areas", desc: "Social spaces" },
              { icon: MapPin, label: "City Center", desc: "Prime location" },
              { icon: Shield, label: "Safe & Secure", desc: "24/7 security" },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.label} className="text-center group">
                  <div className="bg-primary/10 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.label}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* A Peaceful Place to Stay Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-700 mb-6 leading-tight">
              A Peaceful Place to Stay
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our beautifully designed spaces where comfort meets community. Every corner is crafted to make you feel at home.
            </p>
          </div>

          {/* Three Areas Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Common Area - Large Left Section */}
              <div className="lg:col-span-2">
                <div className="relative rounded-2xl overflow-hidden shadow-lg group h-80">
                  <img 
                    src="https://miro.medium.com/v2/resize:fit:1200/0*Z8x2aF_sGouffvhZ" 
                    alt="Common Area - Where friendships begin"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Common Area</h3>
                    <p className="text-white/90">Where friendships begin</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Two Smaller Sections */}
              <div className="lg:col-span-1 space-y-6">
                {/* Breakfast Area */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg group h-36">
                  <img 
                    src="https://www.utopiahoteldesign.gr/wp-content/uploads/2018/03/03-Render-13.jpg" 
                    alt="Breakfast Area"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-2">
                      <Coffee className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold">Breakfast Area</h3>
                  </div>
                </div>

                {/* Rooftop Terrace */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg group h-36">
                  <img 
                    src="https://images.squarespace-cdn.com/content/v1/60788f263f83fd624d773453/1620901456557-7H4ZTP8X4MMHQD79I5Y3/rooftopia-urban-escape-rooftop-paver-flooring-pergola-chicago.jpg" 
                    alt="Rooftop Terrace"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-2">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold">Rooftop Terrace</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="mb-6">
                <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 uppercase tracking-wide">
                  About Us
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Your Favorite Place in London
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We are waiting for you here at Happy Hostel, your home in the heart of London!
              </p>
              <p className="text-base text-gray-600 mb-8 leading-relaxed">
                Our hostel is a family business that has been home for travelers and backpackers in London for the past 
                17 years. Our founder wanted to create a place which will be more than just a place to stay in a big city.
              </p>
              
              <Button 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200"
                onClick={() => navigate('/rooms')}
              >
                Learn More →
              </Button>
            </div>
            
            {/* Right side - Image and Amenities */}
            <div className="relative">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop" 
                  alt="Happy Hostel Common Area" 
                  className="w-full h-[500px] object-cover"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-primary/90 rounded-full flex items-center justify-center hover:bg-primary transition-colors cursor-pointer shadow-lg">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Amenities Icons */}
              <div className="mt-12">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-3 mx-auto group-hover:shadow-xl transition-shadow">
                      <Wifi className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Free WiFi</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-3 mx-auto group-hover:shadow-xl transition-shadow">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Luggage Lockers</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-3 mx-auto group-hover:shadow-xl transition-shadow">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Free Towels</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-3 mx-auto group-hover:shadow-xl transition-shadow">
                      <Coffee className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Breakfast</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-3 mx-auto group-hover:shadow-xl transition-shadow">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5v4m8-4v4" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Guest Kitchen</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-3 mx-auto group-hover:shadow-xl transition-shadow">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Laundry</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              Guest Reviews
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Happy Guests Say
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it - hear from travelers who've made Happy Hostel 
              their home away from home and discovered the magic of our community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                country: "Australia",
                avatar: "SC",
                rating: 5,
                text: "Amazing atmosphere! Met so many wonderful people here. The staff went above and beyond to help me plan my city adventures. Felt like home from day one!",
                date: "2 weeks ago"
              },
              {
                name: "Marcus Weber",
                country: "Germany", 
                avatar: "MW",
                rating: 5,
                text: "Perfect location and super clean facilities. The common areas are great for meeting fellow travelers. I've stayed in many hostels, but this one stands out!",
                date: "1 month ago"
              },
              {
                name: "Luna Rodriguez",
                country: "Mexico",
                avatar: "LR",
                rating: 5,
                text: "The best hostel experience I've ever had! Great value for money, friendly staff, and the breakfast was incredible. Already planning my next visit!",
                date: "3 weeks ago"
              }
            ].map((review, index) => (
              <Card key={index} className="p-8 shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 leading-relaxed text-lg">
                  "{review.text}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <p className="text-sm text-gray-600">{review.country}</p>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Review Summary */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-8 bg-white rounded-2xl px-8 py-6 shadow-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">4.9</div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">2.5K+</div>
                <div className="text-sm text-gray-600">Happy Reviews</div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">98%</div>
                <div className="text-sm text-gray-600">Would Recommend</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Amenities */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need for the Perfect Stay
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We've thought of every detail to make your stay comfortable, safe, and memorable. 
              From modern facilities to thoughtful touches that make all the difference.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Wifi,
                title: "High-Speed WiFi",
                description: "Stay connected with complimentary fiber internet throughout the property"
              },
              {
                icon: Coffee,
                title: "Continental Breakfast", 
                description: "Start your day right with fresh local pastries, fruits, and premium coffee"
              },
              {
                icon: Car,
                title: "Secure Parking",
                description: "Free parking available with 24/7 security monitoring for your peace of mind"
              },
              {
                icon: Users,
                title: "Social Spaces",
                description: "Multiple common areas including rooftop terrace, game room, and cozy lounge"
              },
              {
                icon: MapPin,
                title: "Prime Location",
                description: "Walking distance to major attractions, restaurants, and public transportation"
              },
              {
                icon: Star,
                title: "24/7 Reception",
                description: "Our friendly staff is always available to help with recommendations and assistance"
              }
            ].map((amenity, index) => {
              const Icon = amenity.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-primary/10 rounded-xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{amenity.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{amenity.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

          {/* Hostel Areas Section */}
          <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
              {/* Header */}
          <div className="text-center mb-16">
                <span className="inline-block text-primary text-sm font-medium mb-4 uppercase tracking-wide">
                  HOSTEL AREAS
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-700 mb-6 leading-tight">
                  A Hostel You Want to Stay at
            </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Welcome to a comfortable and thoughtful place with many public areas for our guests.
            </p>
          </div>

              {/* Tab Navigation */}
              <div className="flex justify-center mb-12">
                <div className="flex space-x-8 border-b border-gray-200">
                  <button 
                    onClick={() => setActiveTab('common-areas')}
                    className={`pb-4 px-2 font-medium text-sm uppercase tracking-wide transition-colors ${
                      activeTab === 'common-areas' 
                        ? 'text-primary border-b-2 border-primary' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    COMMON AREAS
                  </button>
                  <button 
                    onClick={() => setActiveTab('bathrooms')}
                    className={`pb-4 px-2 font-medium text-sm uppercase tracking-wide transition-colors ${
                      activeTab === 'bathrooms' 
                        ? 'text-primary border-b-2 border-primary' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    BATHROOMS
                  </button>
                  <button 
                    onClick={() => setActiveTab('kitchen')}
                    className={`pb-4 px-2 font-medium text-sm uppercase tracking-wide transition-colors ${
                      activeTab === 'kitchen' 
                        ? 'text-primary border-b-2 border-primary' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    KITCHEN
                  </button>
                </div>
              </div>

              {/* Image Grid */}
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Large Image - Left Column */}
                  <div className="lg:col-span-1">
                    <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl group">
                      <img 
                        src={
                          activeTab === 'common-areas' 
                            ? "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop"
                            : activeTab === 'bathrooms'
                            ? "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop"
                            : "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop"
                        }
                        alt={
                          activeTab === 'common-areas' 
                            ? "Common Area - Spacious lounge with modern furniture"
                            : activeTab === 'bathrooms'
                            ? "Modern bathroom facilities"
                            : "Fully equipped guest kitchen"
                        }
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </div>

                  {/* Right Column - Two Images */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Top Right Image */}
                    <div className="relative h-44 rounded-2xl overflow-hidden shadow-xl group">
                      <img 
                        src={
                          activeTab === 'common-areas' 
                            ? "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop"
                            : activeTab === 'bathrooms'
                            ? "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=400&fit=crop"
                            : "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
                        }
                        alt={
                          activeTab === 'common-areas' 
                            ? "Hallway with art gallery"
                            : activeTab === 'bathrooms'
                            ? "Clean bathroom facilities"
                            : "Kitchen dining area"
                        }
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    {/* Bottom Right Image */}
                    <div className="relative h-44 rounded-2xl overflow-hidden shadow-xl group">
                      <img 
                        src={
                          activeTab === 'common-areas' 
                            ? "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop"
                            : activeTab === 'bathrooms'
                            ? "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=400&fit=crop"
                            : "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
                        }
                        alt={
                          activeTab === 'common-areas' 
                            ? "Recreational area with social activities"
                            : activeTab === 'bathrooms'
                            ? "Modern shower facilities"
                            : "Kitchen cooking area"
                        }
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Text */}
              <div className="text-center mt-12">
                <p className="text-sm text-gray-500">
                  * HAPPY HOSTEL IN LONDON WAS TOTALLY REDESIGNED IN 2024
                </p>
              </div>
            </div>
          </section>

          {/* Our Rooms Section */}
          <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
              {/* Header */}
          <div className="text-center mb-16">
                <span className="inline-block text-primary text-sm font-medium mb-4 uppercase tracking-wide">
                  OUR ROOMS
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Book Your Room & Enjoy the Comfort
            </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  We have both dorms and private rooms with basic amenities.
            </p>
          </div>

              {/* Room Cards and Offer Section */}
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Room Cards - Takes 2/3 of the width */}
                  <div className="lg:col-span-2">
                    {isLoadingRooms ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2 text-muted-foreground">Loading rooms...</span>
                      </div>
                    ) : getAllRooms().length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No rooms available at the moment.</p>
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Room Cards Slider Container */}
                        <div className="overflow-hidden">
                          <div 
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                          >
                            {/* Generate slides with 2 rooms each */}
                            {Array.from({ length: Math.ceil(getAllRooms().length / 2) }, (_, slideIndex) => (
                              <div key={slideIndex} className="w-full flex-shrink-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                                  {getAllRooms()
                                    .slice(slideIndex * 2, slideIndex * 2 + 2)
                                    .map((room, roomIndex) => (
                                    <Card key={room.id} className="overflow-hidden shadow-xl bg-white rounded-2xl relative h-96 group">
                                      {/* Background Image */}
                                      <div 
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                                        style={{ backgroundImage: `url(${getRoomImage(room)})` }}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                      </div>
                                      
                                      {/* Content Overlay */}
                                      <div className="relative h-full flex flex-col justify-between p-6 text-white">
                                        {/* Top Section */}
                                        <div>
                                          <div className="bg-gray-800/80 text-white px-3 py-1 rounded text-xs font-medium mb-4 inline-block">
                                            FROM £{room.price} / PERSON
                                          </div>
                                          <h3 className="text-2xl font-bold mb-4">{room.name}</h3>
                                          
                                          {/* Amenities Icons */}
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
                                        
                                        {/* Bottom Section */}
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

                        {/* Navigation Arrows */}
                        {getAllRooms().length > 2 && (
                          <>
                            <button
                              onClick={prevSlide}
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-primary hover:text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 border border-gray-200"
                            >
                              <ChevronLeft className="w-6 h-6 text-gray-700 hover:text-white transition-colors" />
                            </button>
                            
                            <button
                              onClick={nextSlide}
                              className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-primary hover:text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 border border-gray-200"
                            >
                              <ChevronRight className="w-6 h-6 text-gray-700 hover:text-white transition-colors" />
                            </button>
                          </>
                        )}

                        {/* Dots Indicator */}
                        {getAllRooms().length > 2 && (
                          <div className="flex justify-center mt-6 space-x-2">
                            {Array.from({ length: Math.ceil(getAllRooms().length / 2) }, (_, index) => (
                              <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-200 hover:scale-125 ${
                                  index === currentSlide 
                                    ? 'bg-primary scale-110' 
                                    : 'bg-gray-300 hover:bg-primary/70'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Offer Section - Takes 1/3 of the width */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 shadow-lg h-fit sticky top-8">
                      <span className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wide">
                        OFFER
                      </span>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Stay Longer, Save More
                      </h3>
                      <p className="text-gray-600 mb-6 text-sm">
                        Alice was beginning to get very tired of sitting by her sister on the bank.
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="text-sm">
                          <span className="text-gray-600">Save up to <strong className="text-primary">20%</strong> off the nightly rate on stays for 7-14 nights;</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Save up to <strong className="text-primary">30%</strong> off the nightly rate on stays for 14-29 nights.</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold transition-all duration-200"
                        onClick={() => navigate('/rooms')}
                      >
                        VIEW ALL ROOMS
                      </Button>
                    </div>
                  </div>
                </div>
          </div>
        </div>
      </section>

      {/* Location & Nearby */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Perfect Location in the Heart of the City
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Happy Hostel is strategically located in the vibrant city center, putting you within walking distance 
                of major attractions, local markets, restaurants, and nightlife. Getting around has never been easier!
              </p>
              
              <div className="space-y-4">
                {[
                  { place: "Central Train Station", time: "5 min walk" },
                  { place: "Historic Old Town", time: "8 min walk" },
                  { place: "Main Shopping District", time: "10 min walk" },
                  { place: "Airport Express", time: "3 min walk" }
                ].map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg">
                    <span className="text-foreground font-medium">{location.place}</span>
                    <span className="text-primary font-semibold">{location.time}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-muted rounded-xl p-8 text-center">
              <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-4">Easy to Find</h3>
              <p className="text-muted-foreground mb-6">
                Located on the main boulevard with excellent public transport connections. 
                Free pickup service available from the airport with advance booking.
              </p>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                onClick={() => window.open('https://maps.google.com', '_blank')}
              >
                Get Directions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 border border-white rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-12 h-12 border border-white rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-24 h-24 border border-white rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Getting to Happy Hostel Has Never Been Easier
          </h2>
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Join thousands of happy travelers who've made unforgettable memories at Happy Hostel. 
              Book your stay today and become part of our global community of adventurers.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-primary hover:text-white text-lg px-10 py-4 rounded-xl shadow-lg font-semibold transition-all duration-200"
                onClick={() => navigate('/rooms')}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Your Stay
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-primary border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-10 py-4 rounded-xl font-semibold transition-all duration-200"
                onClick={() => window.open('tel:+442012345678')}
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Us Now
              </Button>
            </div>
            
            {/* Contact Info */}
            <div className="grid md:grid-cols-3 gap-8 text-white/90">
              <div className="flex items-center justify-center gap-3">
                <Phone className="w-5 h-5" />
                <span className="font-medium">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Mail className="w-5 h-5" />
                <span className="font-medium">info@happyhostel.com</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Downtown City Center</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Group Offers Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-primary text-sm font-medium mb-4 uppercase tracking-wide">
              FOR GROUPS
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-700 mb-6 leading-tight">
              Group Offers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn why Happy Hostel is a great accommodation for group travellers.
            </p>
          </div>

          {/* Feature Blocks */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* 100% Cleanliness */}
              <div className="text-center group">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:bg-primary/10 transition-colors">
                  <svg className="w-10 h-10 text-gray-600 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5v4m8-4v4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">100% Cleanliness</h3>
                <p className="text-gray-600">Daily housekeeping.</p>
              </div>

              {/* Group Tours */}
              <div className="text-center group">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:bg-primary/10 transition-colors">
                  <svg className="w-10 h-10 text-gray-600 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Group Tours</h3>
                <p className="text-gray-600">Group tours around the city.</p>
              </div>

              {/* Discount */}
              <div className="text-center group">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:bg-primary/10 transition-colors">
                  <svg className="w-10 h-10 text-gray-600 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Discount</h3>
                <p className="text-gray-600">Groups of 15+ people get a discount.</p>
              </div>

              {/* Comfortable Rooms */}
              <div className="text-center group">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:bg-primary/10 transition-colors">
                  <Bed className="w-10 h-10 text-gray-600 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Comfortable Rooms</h3>
                <p className="text-gray-600">We offer dorms and private rooms.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Tours Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="order-2 lg:order-1">
              <div className="max-w-lg">
                <span className="inline-block text-teal-600 text-sm font-medium mb-4 uppercase tracking-wide">
                  TOURS
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-700 mb-6 leading-tight">
                  Take a Tour of the City
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Discover the beauty and history of London with group tours offered by our partners, London City Tours!
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  If you want to sign up for the next tour, tell the reception staff about it or contact us in advance. We will gladly advise you. The tours offered by London City Tours last 2-3 hours and are offered for 10-15 people. We offer special prices for our guests. Also, some of the tours are totally free. The following group tours are available in 2024:
                </p>

                {/* Tour Types List */}
                <div className="mb-8">
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">Bicycle tour;</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">Free walking tour;</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v4m8-4v4" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">Foodie tour.</span>
                    </li>
                  </ul>
                </div>

                {/* Book Tour Button */}
                <Button 
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-200"
                  onClick={() => navigate('/activities')}
                >
                  BOOK A TOUR
                </Button>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://www.elabedu.eu/wp-content/uploads/2024/02/Universita-in-Olanda-Studiare-negli-Paesi-Bassi-scaled.jpg" 
                  alt="City tour with bicycles - Three young people with bikes by the waterfront"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting to Happy Hotel from Airport Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Map */}
            <div className="order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop" 
                  alt="London map showing airports and city center"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>

            {/* Right Column - Directions */}
            <div className="order-1 lg:order-2">
              <div className="max-w-lg">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-700 mb-6 leading-tight">
                  Getting to Happy Hotel from the Airport
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  If you are lost, contact us, and we will give you directions.
                </p>

                {/* Airport Directions */}
                <div className="space-y-6">
                  {/* Gatwick Airport */}
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Gatwick Airport</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Take the Gatwick Express to Victoria Station, from Victoria Underground Station take the Victorian Line (Victoria Line towards Walthamstow Central) to Oxford Street Station.
                      </p>
                    </div>
                  </div>

                  {/* Heathrow Airport */}
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Heathrow Airport</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Take the Heathrow Express to Paddington Station, from Paddington Underground Station take the Bakerloo Line (Bakerloo Line towards Elephant & Castle) to Oxford Street Station.
                      </p>
                    </div>
                  </div>

                  {/* Stansted Airport */}
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Stansted Airport</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Take the Stansted Express to Liverpool Street Station, from Liverpool Street Underground Station take the Central Line towards West Ruislip to Tottenham Court Road Station.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Need Help?</h4>
                  <p className="text-gray-600 mb-4">
                    If you get lost or need assistance, don't hesitate to contact us for detailed directions.
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-teal-600 mr-2" />
                      <span className="text-gray-700">+44 (0) 20 1234 5678</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-teal-600 mr-2" />
                      <span className="text-gray-700">info@happyhostel.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-primary text-sm font-medium mb-4 uppercase tracking-wide">
              BLOG
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-700 mb-6 leading-tight">
              Latest News & Stories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay updated with our latest news, tips, and stories from Happy Hostel.
            </p>
          </div>

          {/* Blog Cards */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Blog Card 1 */}
              <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop" 
                    alt="Spring Evenings in London - Cozy hostel interior"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <time className="text-sm text-gray-500 mb-2 block">11 MAY, 2024</time>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">
                    Spring Evenings in London
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Spring in London is filled with the scent of wisteria and peonies. This is a great time to visit the capital of England and spend cosy evenings in our hostel...
                  </p>
                  <a href="#" className="text-primary hover:text-primary/80 font-medium text-sm inline-flex items-center group">
                    READ MORE 
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </article>

              {/* Blog Card 2 */}
              <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop" 
                    alt="Happy Valentine's Day - Romantic cards and bell"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <time className="text-sm text-gray-500 mb-2 block">12 FEBRUARY, 2024</time>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">
                    Happy Valentine's Day!
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Do you feel? Love is in the air! We join the romantic atmosphere and offer -15% for twin and double rooms from February 13 to February 17...
                  </p>
                  <a href="#" className="text-primary hover:text-primary/80 font-medium text-sm inline-flex items-center group">
                    READ MORE 
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </article>

              {/* Blog Card 3 */}
              <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop" 
                    alt="How to Choose a Hostel - Dorm room with bunk beds"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <time className="text-sm text-gray-500 mb-2 block">08 JANUARY, 2024</time>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">
                    How to Choose a Hostel?
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Looking through the websites of different hostels, you may wonder how to choose accommodation. They may look really similar, but still, there are differences...
                  </p>
                  <a href="#" className="text-primary hover:text-primary/80 font-medium text-sm inline-flex items-center group">
                    READ MORE 
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Happy Hostel</h3>
              <p className="text-gray-400 mb-4">
                Your home away from home in the heart of the city. 
                Creating memories and friendships since 2015.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">i</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Rooms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Amenities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Location</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Free WiFi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Breakfast</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Laundry</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tours</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>123 Main St, City Center</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@happyhostel.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Happy Hostel. All rights reserved. Made with ❤️ for travelers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;