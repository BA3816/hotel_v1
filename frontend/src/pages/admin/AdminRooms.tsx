import AdminSidebar from "@/components/AdminSidebar";
import AddRoomForm from "@/components/AddRoomForm";
import EditRoomForm from "@/components/EditRoomForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Eye, Edit, Settings, Users, Bed, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import axiosClient from "../../api/axios";
import { toast } from "sonner";

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
  image_url?: string;
  amenities?: string[];
  last_cleaned?: string;
  created_at: string;
  updated_at: string;
}

const AdminRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Fetch rooms from API
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get("/api/rooms");
      if (response.data.success) {
        setRooms(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch rooms");
      }
    } catch (error: unknown) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to load rooms. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const response = await axiosClient.delete(`/api/rooms/${roomId}`);
      if (response.data.success) {
        toast.success("Room deleted successfully!");
        fetchRooms(); // Refresh the list
      } else {
        throw new Error(response.data.message || "Failed to delete room");
      }
    } catch (error: unknown) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete room. Please try again.");
    }
  };

  const handleAddRoomSuccess = () => {
    setShowAddForm(false);
    fetchRooms(); // Refresh the list
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowEditForm(true);
  };

  const handleEditRoomSuccess = () => {
    setShowEditForm(false);
    setSelectedRoom(null);
    fetchRooms(); // Refresh the list
  };

  const handleEditRoomCancel = () => {
    setShowEditForm(false);
    setSelectedRoom(null);
  };

  // Filter rooms based on search and filters
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    const matchesType = typeFilter === "all" || room.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "occupied": return "bg-blue-100 text-blue-800";
      case "full": return "bg-orange-100 text-orange-800";
      case "maintenance": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available": return "Available";
      case "occupied": return "Occupied";
      case "full": return "Full";
      case "maintenance": return "Maintenance";
      default: return status;
    }
  };

  const getOccupancyColor = (occupied: number, capacity: number) => {
    const percentage = (occupied / capacity) * 100;
    if (percentage === 100) return "text-red-600";
    if (percentage >= 75) return "text-orange-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Room Management</h1>
            <p className="text-muted-foreground">Manage room inventory, pricing, and maintenance.</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} className="mr-2" />
            Add Room
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <Input 
                placeholder="Search rooms..." 
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
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Mixed Dormitory">Mixed Dormitory</SelectItem>
                <SelectItem value="Female Dormitory">Female Dormitory</SelectItem>
                <SelectItem value="Male Dormitory">Male Dormitory</SelectItem>
                <SelectItem value="Private Single">Private Single</SelectItem>
                <SelectItem value="Private Double">Private Double</SelectItem>
                <SelectItem value="Private Twin">Private Twin</SelectItem>
                <SelectItem value="Family Room">Family Room</SelectItem>
                <SelectItem value="Deluxe Room">Deluxe Room</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Floors</SelectItem>
                <SelectItem value="1">Floor 1</SelectItem>
                <SelectItem value="2">Floor 2</SelectItem>
                <SelectItem value="3">Floor 3</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Settings size={16} className="mr-2" />
              Bulk Actions
            </Button>
          </div>
        </Card>

        {/* Rooms Table */}
        <Card className="shadow-soft">
          <div className="p-4 md:p-6">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Room ID</TableHead>
                    <TableHead className="font-semibold">Image</TableHead>
                    <TableHead className="font-semibold">Name & Type</TableHead>
                    <TableHead className="font-semibold text-center">Floor</TableHead>
                    <TableHead className="font-semibold text-center">Occupancy</TableHead>
                    <TableHead className="font-semibold text-right">Price/Night</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                    <TableHead className="font-semibold text-center">Last Cleaned</TableHead>
                    <TableHead className="font-semibold text-center w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading rooms...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <p className="text-muted-foreground">No rooms found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.room_number}</TableCell>
                      <TableCell>
                        <div className="w-16 h-12 rounded-md overflow-hidden">
                          <img 
                            src={room.image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop'} 
                            alt={room.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop';
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{room.name}</p>
                          <p className="text-sm text-muted-foreground">{room.type}</p>
                        </div>
                      </TableCell>
                      <TableCell>{room.floor}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users size={14} className="text-muted-foreground" />
                          <span className={getOccupancyColor(room.occupied, room.capacity)}>
                            {room.occupied}/{room.capacity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${room.price}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(room.status)}>
                          {getStatusText(room.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {room.last_cleaned ? new Date(room.last_cleaned).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" title="View Details">
                            <Eye size={14} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Edit Room"
                            onClick={() => handleEditRoom(room)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Delete Room"
                            onClick={() => handleDeleteRoom(room.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card className="p-4 shadow-soft">
            <div className="flex items-center space-x-2">
              <Bed className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Rooms</p>
                <p className="text-2xl font-bold text-foreground">{rooms.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 shadow-soft">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available Beds</p>
                <p className="text-2xl font-bold text-green-600">
                  {rooms.reduce((total, room) => total + (room.capacity - room.occupied), 0)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 shadow-soft">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-orange-600">
                  {rooms.filter(room => room.status === 'maintenance').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 shadow-soft">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-primary rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold text-primary">
                  {rooms.length > 0 
                    ? Math.round((rooms.reduce((total, room) => total + room.occupied, 0) / 
                                 rooms.reduce((total, room) => total + room.capacity, 0)) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Add Room Form Modal */}
      {showAddForm && (
        <AddRoomForm
          onSuccess={handleAddRoomSuccess}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Room Form Modal */}
      {showEditForm && selectedRoom && (
        <EditRoomForm
          room={selectedRoom}
          onSuccess={handleEditRoomSuccess}
          onCancel={handleEditRoomCancel}
        />
      )}
    </div>
  );
};

export default AdminRooms;