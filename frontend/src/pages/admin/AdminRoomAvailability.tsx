import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, Wrench, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface RoomAvailability {
  room_id: number;
  room_number: string;
  name: string;
  type: string;
  status: string;
  capacity: number;
  occupied: number;
  available_spaces: number;
  occupancy_percentage: number;
  is_available: boolean;
  last_cleaned: string | null;
  needs_cleaning: boolean;
  floor: number;
  price: number;
}

interface OccupancySummary {
  total_rooms: number;
  total_capacity: number;
  total_occupied: number;
  total_available: number;
  occupancy_rate: number;
  rooms_by_status: {
    available: number;
    occupied: number;
    full: number;
    maintenance: number;
  };
  rooms_by_type: Record<string, {
    total: number;
    occupied: number;
    available: number;
  }>;
}

interface UpcomingTransition {
  check_ins: Array<{
    id: number;
    booking_reference: string;
    check_in_date: string;
    guest: {
      first_name: string;
      last_name: string;
    };
    room: {
      room_number: string;
      name: string;
    };
    number_of_guests: number;
    status: string;
  }>;
  check_outs: Array<{
    id: number;
    booking_reference: string;
    check_out_date: string;
    guest: {
      first_name: string;
      last_name: string;
    };
    room: {
      room_number: string;
      name: string;
    };
    number_of_guests: number;
    status: string;
  }>;
  total_check_ins: number;
  total_check_outs: number;
}

const AdminRoomAvailability: React.FC = () => {
  const [rooms, setRooms] = useState<RoomAvailability[]>([]);
  const [summary, setSummary] = useState<OccupancySummary | null>(null);
  const [upcomingTransitions, setUpcomingTransitions] = useState<UpcomingTransition | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch occupancy summary
      const summaryResponse = await fetch('/api/room-availability/occupancy-summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData.data);
      }

      // Fetch upcoming transitions
      const transitionsResponse = await fetch('/api/room-availability/upcoming-transitions?days=7', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (transitionsResponse.ok) {
        const transitionsData = await transitionsResponse.json();
        setUpcomingTransitions(transitionsData.data);
      }

      // Fetch rooms needing attention
      const attentionResponse = await fetch('/api/room-availability/needing-attention', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (attentionResponse.ok) {
        const attentionData = await attentionResponse.json();
        setRooms(attentionData.data);
      }

    } catch (error) {
      console.error('Error fetching room availability data:', error);
      toast.error('Failed to fetch room availability data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Room availability data refreshed');
  };

  const updateAllRoomStatuses = async () => {
    try {
      const response = await fetch('/api/room-availability/update-all-statuses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('All room statuses updated successfully');
        await fetchData();
      } else {
        toast.error('Failed to update room statuses');
      }
    } catch (error) {
      console.error('Error updating room statuses:', error);
      toast.error('Failed to update room statuses');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'full': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'occupied': return <Users className="h-4 w-4" />;
      case 'full': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredRooms = rooms.filter(room => {
    const typeMatch = selectedRoomType === 'all' || room.type === selectedRoomType;
    const statusMatch = selectedStatus === 'all' || room.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading room availability data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Room Availability Management</h1>
          <p className="text-gray-600">Monitor and manage room availability, occupancy, and maintenance</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refreshData} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={updateAllRoomStatuses}>
            Update All Statuses
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_rooms}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_capacity}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_occupied}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.occupancy_rate}%</div>
              <Progress value={summary.occupancy_rate} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rooms">Room Status</TabsTrigger>
          <TabsTrigger value="transitions">Upcoming Transitions</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="room-type">Room Type</Label>
              <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Mixed Dormitory">Mixed Dormitory</SelectItem>
                  <SelectItem value="Female Dormitory">Female Dormitory</SelectItem>
                  <SelectItem value="Private Single">Private Single</SelectItem>
                  <SelectItem value="Private Double">Private Double</SelectItem>
                  <SelectItem value="Private Triple">Private Triple</SelectItem>
                  <SelectItem value="Private Quad">Private Quad</SelectItem>
                  <SelectItem value="Executive Suite">Executive Suite</SelectItem>
                  <SelectItem value="Penthouse Suite">Penthouse Suite</SelectItem>
                  <SelectItem value="Accessible Suite">Accessible Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rooms Table */}
          <Card>
            <CardHeader>
              <CardTitle>Room Status Overview</CardTitle>
              <CardDescription>
                Current status and occupancy of all rooms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Available Spaces</TableHead>
                    <TableHead>Last Cleaned</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room) => (
                    <TableRow key={room.room_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{room.room_number}</div>
                          <div className="text-sm text-gray-500">{room.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(room.status)}>
                          {getStatusIcon(room.status)}
                          <span className="ml-1">{room.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{room.occupied}/{room.capacity}</span>
                          <Progress value={room.occupancy_percentage} className="w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={room.available_spaces > 0 ? "default" : "destructive"}>
                          {room.available_spaces} spaces
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {room.last_cleaned ? (
                          <span className="text-sm">
                            {new Date(room.last_cleaned).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          {room.needs_cleaning && (
                            <Button size="sm" variant="outline">
                              Mark Cleaned
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transitions" className="space-y-4">
          {upcomingTransitions && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Check-ins ({upcomingTransitions.total_check_ins})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingTransitions.check_ins.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <div className="font-medium">
                          {booking.guest.first_name} {booking.guest.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Room {booking.room.room_number} - {booking.room.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {new Date(booking.check_in_date).toLocaleDateString()}
                        </div>
                        <Badge variant="outline">{booking.number_of_guests} guests</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Check-outs ({upcomingTransitions.total_check_outs})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingTransitions.check_outs.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <div className="font-medium">
                          {booking.guest.first_name} {booking.guest.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Room {booking.room.room_number} - {booking.room.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {new Date(booking.check_out_date).toLocaleDateString()}
                        </div>
                        <Badge variant="outline">{booking.number_of_guests} guests</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance & Cleaning Status</CardTitle>
              <CardDescription>
                Rooms that need attention for maintenance or cleaning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rooms.filter(room => room.needs_cleaning || room.status === 'maintenance').length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All rooms are in good condition! No maintenance or cleaning needed.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Needs Cleaning</TableHead>
                      <TableHead>Last Cleaned</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms
                      .filter(room => room.needs_cleaning || room.status === 'maintenance')
                      .map((room) => (
                        <TableRow key={room.room_id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{room.room_number}</div>
                              <div className="text-sm text-gray-500">{room.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(room.status)}>
                              {room.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={room.needs_cleaning ? "destructive" : "default"}>
                              {room.needs_cleaning ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {room.last_cleaned ? (
                              <span className="text-sm">
                                {new Date(room.last_cleaned).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {room.needs_cleaning && (
                                <Button size="sm" variant="outline">
                                  Mark Cleaned
                                </Button>
                              )}
                              {room.status === 'maintenance' && (
                                <Button size="sm" variant="outline">
                                  Remove Maintenance
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminRoomAvailability;

