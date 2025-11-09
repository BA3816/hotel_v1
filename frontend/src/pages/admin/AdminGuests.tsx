import AdminSidebar from "@/components/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Eye, Edit, MessageCircle, MapPin, Loader2, Users, Calendar, RefreshCw } from "lucide-react";
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
  bookings?: Booking[];
}

interface Booking {
  id: number;
  booking_reference: string;
  guest_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  total_amount: number;
  status: string;
  special_requests?: string;
  confirmed_at?: string;
  checked_in_at?: string;
  checked_out_at?: string;
  created_at: string;
  updated_at: string;
  guest: Guest;
  room: {
    id: number;
    room_number: string;
    name: string;
    type: string;
  };
}

const AdminGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [nationalityFilter, setNationalityFilter] = useState("all");
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());

  // Fetch guests from API
  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get("/api/bookings");
      if (response.data.success) {
        // Extract unique guests from bookings
        const uniqueGuests = response.data.data.reduce((acc: Guest[], booking: Booking) => {
          const existingGuest = acc.find(g => g.id === booking.guest.id);
          if (!existingGuest) {
            acc.push({
              ...booking.guest,
              bookings: [booking]
            });
          } else {
            existingGuest.bookings?.push(booking);
          }
          return acc;
        }, []);
        
        
        setGuests(uniqueGuests);
        setLastFetchTime(new Date());
      } else {
        throw new Error(response.data.message || "Failed to fetch guests");
      }
    } catch (error: unknown) {
      console.error("Error fetching guests:", error);
      toast.error("Failed to load guests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter guests based on search and filters
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNationality = nationalityFilter === "all" || guest.nationality === nationalityFilter;
    
    return matchesSearch && matchesNationality;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "checked-in": return "bg-green-100 text-green-800";
      case "arriving-today": return "bg-blue-100 text-blue-800";
      case "departing-today": return "bg-orange-100 text-orange-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "checked-in": return "Checked In";
      case "arriving-today": return "Arriving Today";
      case "departing-today": return "Departing Today";
      case "overdue": return "Overdue";
      default: return status;
    }
  };

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Guest Management</h1>
            <p className="text-muted-foreground">View and manage current and upcoming guests.</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={fetchGuests}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-2" />
              Add Guest
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <Input 
                placeholder="Search guests..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Nationality" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Nationalities</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="UK">UK</SelectItem>
                <SelectItem value="Germany">Germany</SelectItem>
                <SelectItem value="France">France</SelectItem>
                <SelectItem value="Spain">Spain</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
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
              <MessageCircle size={16} className="mr-2" />
              Send Message
            </Button>
          </div>
        </Card>

        {/* Guests Table */}
        <Card className="shadow-soft">
          <div className="p-4 md:p-6">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Guest ID</TableHead>
                    <TableHead className="font-semibold">Name & Contact</TableHead>
                    <TableHead className="font-semibold text-center">Nationality</TableHead>
                    <TableHead className="font-semibold text-center">Room & Bed</TableHead>
                    <TableHead className="font-semibold text-center">Check-in</TableHead>
                    <TableHead className="font-semibold text-center">Check-out</TableHead>
                    <TableHead className="font-semibold text-center">Nights</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                    <TableHead className="font-semibold text-center w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading guests...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <p className="text-muted-foreground">No guests found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">G{guest.id.toString().padStart(3, '0')}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{guest.first_name} {guest.last_name}</p>
                          <p className="text-sm text-muted-foreground">{guest.email}</p>
                          {guest.phone && <p className="text-sm text-muted-foreground">{guest.phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin size={14} className="text-muted-foreground" />
                          <span>{guest.nationality || 'Not specified'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {guest.bookings && guest.bookings.length > 0 ? (
                            <>
                              <p className="font-medium">{guest.bookings[0].room.name}</p>
                              <p className="text-sm text-muted-foreground">{guest.bookings[0].room.room_number}</p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">No bookings</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {guest.bookings && guest.bookings.length > 0 ? 
                          new Date(guest.bookings[0].check_in_date).toLocaleDateString() : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {guest.bookings && guest.bookings.length > 0 ? 
                          new Date(guest.bookings[0].check_out_date).toLocaleDateString() : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {guest.bookings && guest.bookings.length > 0 ? 
                          Math.ceil((new Date(guest.bookings[0].check_out_date).getTime() - new Date(guest.bookings[0].check_in_date).getTime()) / (1000 * 60 * 60 * 24)) : 
                          0
                        }
                      </TableCell>
                      <TableCell>
                        {guest.bookings && guest.bookings.length > 0 ? (
                          <Badge className={getStatusColor(guest.bookings[0].status)}>
                            {getStatusText(guest.bookings[0].status)}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">No booking</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" title="View Details">
                            <Eye size={14} />
                          </Button>
                          <Button variant="outline" size="sm" title="Edit Guest">
                            <Edit size={14} />
                          </Button>
                          <Button variant="outline" size="sm" title="Send Message">
                            <MessageCircle size={14} />
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card className="p-4 shadow-soft">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-bold text-foreground">{guests.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 shadow-soft">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="text-2xl font-bold text-blue-600">
                  {guests.filter(guest => guest.bookings?.some(booking => booking.status === 'checked_in')).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 shadow-soft">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {guests.filter(guest => guest.bookings?.some(booking => booking.status === 'confirmed')).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 shadow-soft">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {guests.filter(guest => guest.bookings?.some(booking => booking.status === 'pending')).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminGuests;