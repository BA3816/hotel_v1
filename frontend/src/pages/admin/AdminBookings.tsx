import AdminSidebar from "@/components/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Plus, Eye, Edit, Trash2, Loader2, CheckCircle, XCircle, Clock, Tag, Percent, Calendar, Users } from "lucide-react";
import { useState, useEffect } from "react";
import axiosClient from "../../api/axios";
import { toast } from "sonner";

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  nationality?: string;
  date_of_birth?: string;
  id_type?: string;
  id_number?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

interface Room {
  id: number;
  room_number: string;
  name: string;
  type: string;
  capacity: number;
  occupied: number;
  floor: number;
  price: number;
  status: string;
  description?: string;
  amenities?: string[];
  last_cleaned?: string;
  created_at: string;
  updated_at: string;
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

interface Booking {
  id: number;
  booking_reference: string;
  guest_id: number;
  room_id: number;
  offer_id?: number;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  total_amount: number;
  original_amount?: number;
  discount_amount?: number;
  status: string;
  special_requests?: string;
  confirmed_at?: string;
  checked_in_at?: string;
  checked_out_at?: string;
  created_at: string;
  updated_at: string;
  guest: Guest;
  room: Room;
  offer?: Offer;
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [offerFilter, setOfferFilter] = useState("all");

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get("/api/bookings");
      if (response.data.success) {
        setBookings(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch bookings");
      }
    } catch (error: unknown) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const response = await axiosClient.put(`/api/bookings/${bookingId}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        toast.success("Booking status updated successfully!");
        fetchBookings(); // Refresh the list
      } else {
        throw new Error(response.data.message || "Failed to update booking");
      }
    } catch (error: unknown) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking. Please try again.");
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const response = await axiosClient.delete(`/api/bookings/${bookingId}`);
      if (response.data.success) {
        toast.success("Booking deleted successfully!");
        fetchBookings(); // Refresh the list
      } else {
        throw new Error(response.data.message || "Failed to delete booking");
      }
    } catch (error: unknown) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking. Please try again.");
    }
  };

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guest.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guest.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (booking.offer && booking.offer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (booking.offer && booking.offer.offer_code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesOffer = offerFilter === "all" || 
                        (offerFilter === "with_offer" && booking.offer) ||
                        (offerFilter === "without_offer" && !booking.offer);
    
    return matchesSearch && matchesStatus && matchesOffer;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "checked_in": return "bg-blue-100 text-blue-800";
      case "checked_out": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmed";
      case "pending": return "Pending";
      case "cancelled": return "Cancelled";
      case "checked_in": return "Checked In";
      case "checked_out": return "Checked Out";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle size={16} />;
      case "pending": return <Clock size={16} />;
      case "cancelled": return <XCircle size={16} />;
      case "checked_in": return <CheckCircle size={16} />;
      case "checked_out": return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  // Offer utility functions
  const getOfferTypeColor = (type: string) => {
    switch (type) {
      case "group-discount": return "bg-blue-100 text-blue-800 border-blue-200";
      case "solo-discount": return "bg-green-100 text-green-800 border-green-200";
      case "length-discount": return "bg-purple-100 text-purple-800 border-purple-200";
      case "student-discount": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "early-booking": return "bg-orange-100 text-orange-800 border-orange-200";
      case "seasonal": return "bg-pink-100 text-pink-800 border-pink-200";
      case "loyalty": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOfferTypeText = (type: string) => {
    switch (type) {
      case "group-discount": return "Group";
      case "solo-discount": return "Solo";
      case "length-discount": return "Extended";
      case "student-discount": return "Student";
      case "early-booking": return "Early";
      case "seasonal": return "Seasonal";
      case "loyalty": return "Loyalty";
      default: return type;
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

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Bookings Management</h1>
            <p className="text-muted-foreground">Manage guest reservations and booking details.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus size={16} className="mr-2" />
            New Booking
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <Input 
                placeholder="Search bookings, offers..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={offerFilter} onValueChange={setOfferFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Offers" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="with_offer">With Offers</SelectItem>
                <SelectItem value="without_offer">Without Offers</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Rooms</SelectItem>
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
            <Button variant="outline">
              <Filter size={16} className="mr-2" />
              More Filters
            </Button>
          </div>
        </Card>

        {/* Bookings Table */}
        <Card className="shadow-soft">
          <div className="p-4 md:p-6">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Booking ID</TableHead>
                  <TableHead className="font-semibold">Guest</TableHead>
                  <TableHead className="font-semibold">Room</TableHead>
                  <TableHead className="font-semibold">Check-in</TableHead>
                  <TableHead className="font-semibold">Check-out</TableHead>
                  <TableHead className="font-semibold text-center">Guests</TableHead>
                  <TableHead className="font-semibold text-center">Offer</TableHead>
                  <TableHead className="font-semibold text-right">Total</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                  <TableHead className="font-semibold text-center">Payment</TableHead>
                  <TableHead className="font-semibold text-center w-48">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading bookings...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <p className="text-muted-foreground">No bookings found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium py-4">{booking.booking_reference}</TableCell>
                      <TableCell className="py-4">
                        <div>
                          <p className="font-medium">{booking.guest.first_name} {booking.guest.last_name}</p>
                          <p className="text-sm text-muted-foreground">{booking.guest.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div>
                          <p className="font-medium">{booking.room.name}</p>
                          <p className="text-sm text-muted-foreground">{booking.room.room_number}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">{new Date(booking.check_in_date).toLocaleDateString()}</TableCell>
                      <TableCell className="py-4">{new Date(booking.check_out_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full font-medium">
                          {booking.number_of_guests}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        {booking.offer ? (
                          <div className="flex flex-col items-center space-y-1">
                            <Badge className={`${getOfferTypeColor(booking.offer.type)} text-xs px-2 py-1 border`}>
                              <Tag size={12} className="mr-1" />
                              {getOfferTypeText(booking.offer.type)}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {formatDiscount(booking.offer)}
                            </div>
                            <div className="text-xs font-mono text-muted-foreground">
                              {booking.offer.offer_code}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No offer</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium py-4">
                        {booking.offer && booking.original_amount ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-end space-x-2">
                              <span className="text-sm text-muted-foreground line-through">
                                ${Number(booking.original_amount).toFixed(2)}
                              </span>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <Percent size={10} className="mr-1" />
                                -${Number(booking.discount_amount || 0).toFixed(2)}
                              </Badge>
                            </div>
                            <div className="text-lg font-bold text-primary">
                              ${Number(booking.total_amount).toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-lg font-bold text-foreground">
                            ${Number(booking.total_amount).toFixed(2)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Badge className={`${getStatusColor(booking.status)} px-3 py-1 min-w-[100px] justify-center`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(booking.status)}
                            {getStatusText(booking.status)}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="text-sm">
                          <p className="text-muted-foreground">Auto-calculated</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Select 
                            value={booking.status} 
                            onValueChange={(value) => handleUpdateBookingStatus(booking.id, value)}
                          >
                            <SelectTrigger className="w-32 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-50">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirm</SelectItem>
                              <SelectItem value="checked_in">Check In</SelectItem>
                              <SelectItem value="checked_out">Check Out</SelectItem>
                              <SelectItem value="cancelled">Cancel</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Delete Booking"
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          </div>
        </Card>

        {/* Popular Offers Section */}
        {bookings.some(booking => booking.offer) && (
          <Card className="p-6 mb-6 shadow-soft">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Tag className="mr-2 h-5 w-5 text-primary" />
              Popular Offers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(
                bookings
                  .filter(booking => booking.offer)
                  .reduce((acc, booking) => {
                    const offerId = booking.offer!.id;
                    if (!acc[offerId]) {
                      acc[offerId] = {
                        offer: booking.offer!,
                        count: 0,
                        totalSavings: 0
                      };
                    }
                    acc[offerId].count++;
                    acc[offerId].totalSavings += Number(booking.discount_amount) || 0;
                    return acc;
                  }, {} as Record<number, { offer: Offer; count: number; totalSavings: number }>)
              )
                .sort(([,a], [,b]) => b.count - a.count)
                .slice(0, 3)
                .map(([, data]) => data)
              .map((data) => (
                <div key={data.offer.id} className="p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getOfferTypeColor(data.offer.type)} text-xs px-2 py-1 border`}>
                      {getOfferTypeText(data.offer.type)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{data.count} uses</span>
                  </div>
                  <h4 className="font-medium text-foreground mb-1">{data.offer.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{data.offer.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">
                      {formatDiscount(data.offer)}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      ${Number(data.totalSavings).toFixed(2)} saved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mt-8">
          <Card className="p-4 shadow-soft">
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
          </Card>
          <Card className="p-4 shadow-soft">
            <p className="text-sm text-muted-foreground">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">
              {bookings.filter(booking => booking.status === 'confirmed').length}
            </p>
          </Card>
          <Card className="p-4 shadow-soft">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {bookings.filter(booking => booking.status === 'pending').length}
            </p>
          </Card>
          <Card className="p-4 shadow-soft">
            <p className="text-sm text-muted-foreground">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">
              {bookings.filter(booking => booking.status === 'cancelled').length}
            </p>
          </Card>
          <Card className="p-4 shadow-soft">
            <div className="flex items-center space-x-2 mb-2">
              <Tag className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">With Offers</p>
            </div>
            <p className="text-2xl font-bold text-primary">
              {bookings.filter(booking => booking.offer).length}
            </p>
          </Card>
          <Card className="p-4 shadow-soft">
            <div className="flex items-center space-x-2 mb-2">
              <Percent className="h-4 w-4 text-green-600" />
              <p className="text-sm text-muted-foreground">Total Savings</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${Number(bookings.reduce((sum, booking) => sum + (Number(booking.discount_amount) || 0), 0)).toFixed(2)}
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminBookings;