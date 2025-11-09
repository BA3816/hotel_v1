import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Percent, Users, Clock, Loader2, Search, Filter, Tag, Bed } from "lucide-react";
import { useState, useEffect } from "react";
import axiosClient from "../api/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  max_uses?: number;
  used_count: number;
  valid_from: string;
  valid_to: string;
  status: string;
  is_public: boolean;
  conditions?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const Offers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get("/api/offers/public", {
        params: {
          search: searchTerm,
          type: typeFilter
        }
      });
      if (response.data && response.data.success) {
        setOffers(response.data.data || []);
      } else {
        setOffers([]);
      }
    } catch (error: any) {
      console.error("Error fetching offers:", error);
      // Only show error toast for actual errors, not empty results or 404s
      if (error.response?.status && error.response.status !== 404) {
        toast.error("Failed to load offers. Please try again.");
      }
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch offers from API when component mounts or filters change
  useEffect(() => {
    fetchOffers();
  }, [searchTerm, typeFilter]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "group-discount": return "bg-blue-100 text-blue-800";
      case "solo-discount": return "bg-green-100 text-green-800";
      case "length-discount": return "bg-purple-100 text-purple-800";
      case "student-discount": return "bg-yellow-100 text-yellow-800";
      case "early-booking": return "bg-orange-100 text-orange-800";
      case "seasonal": return "bg-pink-100 text-pink-800";
      case "loyalty": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "group-discount": return "Group Discount";
      case "solo-discount": return "Solo Traveler";
      case "length-discount": return "Extended Stay";
      case "student-discount": return "Student";
      case "early-booking": return "Early Booking";
      case "seasonal": return "Seasonal";
      case "loyalty": return "Loyalty";
      default: return type;
    }
  };

  const handleBookOffer = (offer: Offer) => {
    // Navigate to rooms page with offer pre-selected
    navigate('/rooms', { 
      state: { 
        selectedOffer: offer,
        showOffers: true 
      } 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "expired": return "bg-red-100 text-red-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "scheduled": return "Scheduled";
      case "expired": return "Expired";
      case "paused": return "Paused";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  const formatDiscount = (offer: Offer) => {
    switch (offer.discount_type) {
      case "percentage":
        return `${offer.discount_value}%`;
      case "fixed_amount":
        return `$${offer.discount_value}`;
      case "free_night":
        return `Free ${offer.discount_value} night(s)`;
      default:
        return offer.discount_value.toString();
    }
  };

  const isOfferValid = (offer: Offer) => {
    const now = new Date().toISOString().split('T')[0];
    return offer.status === 'active' && 
           offer.valid_from <= now && 
           offer.valid_to >= now &&
           (!offer.max_uses || offer.used_count < offer.max_uses);
  };

  const getUsagePercentage = (offer: Offer) => {
    if (!offer.max_uses) return 0;
    return Math.round((offer.used_count / offer.max_uses) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Special Offers
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our exclusive deals and discounts. Save more on your stay with our special offers!
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="group-discount">Group Discount</SelectItem>
                  <SelectItem value="solo-discount">Solo Traveler</SelectItem>
                  <SelectItem value="length-discount">Extended Stay</SelectItem>
                  <SelectItem value="student-discount">Student</SelectItem>
                  <SelectItem value="early-booking">Early Booking</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="loyalty">Loyalty</SelectItem>
                </SelectContent>
              </Select>


              <Button 
                variant="outline" 
                onClick={fetchOffers}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Filter className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </Card>
        </div>

        {/* Offers Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading offers...</p>
            </div>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No offers found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <Card key={offer.id} className="overflow-hidden shadow-soft hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{offer.name}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getTypeColor(offer.type)}>
                          {getTypeText(offer.type)}
                        </Badge>
                        <Badge className={getStatusColor(offer.status)}>
                          {getStatusText(offer.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {formatDiscount(offer)}
                      </div>
                      <div className="text-sm text-muted-foreground">discount</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {offer.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Min {offer.min_guests} guest{offer.min_guests > 1 ? 's' : ''}</span>
                    </div>
                    
                    {offer.min_nights && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Min {offer.min_nights} night{offer.min_nights > 1 ? 's' : ''}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Valid until {new Date(offer.valid_to).toLocaleDateString()}
                      </span>
                    </div>

                    {offer.max_uses && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {offer.used_count}/{offer.max_uses} used ({getUsagePercentage(offer)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Usage Bar */}
                  {offer.max_uses && (
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getUsagePercentage(offer)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Code: <span className="font-mono font-semibold">{offer.offer_code}</span>
                    </div>
                    <Button 
                      onClick={() => handleBookOffer(offer)}
                      disabled={!isOfferValid(offer)}
                      className="bg-primary hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Bed className="h-4 w-4 mr-2" />
                      {!isOfferValid(offer) ? "Not Available" : "Book Now"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
