import { useEffect, useState, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import axiosClient from "../../api/axios";
import { Users, Bed, DollarSign, Calendar, TrendingUp, AlertCircle, Loader2, RefreshCw, Activity, MapPin } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";

interface RecentBooking {
  id: string;
  guest: string;
  room: string;
  checkIn: string;
  status: string;
}

interface Alert {
  type: string;
  message: string;
  priority: string;
}

interface DashboardStats {
  totalBookings: number;
  currentGuests: number;
  availableBeds: number;
  monthlyRevenue: number;
  totalActivities: number;
  activeActivities: number;
  recentBookings: RecentBooking[];
}

const AdminDashboard = () => {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    currentGuests: 0,
    availableBeds: 0,
    monthlyRevenue: 0,
    totalActivities: 0,
    activeActivities: 0,
    recentBookings: [],
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastBookingId, setLastBookingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Try the protected endpoint first, fallback to public endpoint
      let response;
      try {
        response = await axiosClient.get('/api/dashboard/stats');
      } catch (error) {
        console.log('Protected endpoint failed, trying public endpoint...');
        response = await axiosClient.get('/api/dashboard/stats/public');
      }
      
      if (response.data.success) {
        const data = response.data.data;
        
        // Transform the data to match the expected format
        // Handle both array and object formats for recentBookings
        let recentBookings = [];
        try {
          if (Array.isArray(data.recentBookings)) {
            recentBookings = data.recentBookings.map((booking: {
              booking_reference: string;
              guest_name: string;
              room_name: string;
              check_in_date: string;
              status: string;
            }) => ({
              id: booking.booking_reference,
              guest: booking.guest_name,
              room: booking.room_name,
              checkIn: booking.check_in_date,
              status: booking.status
            }));
          } else if (data.recentBookings && typeof data.recentBookings === 'object') {
            // Convert object to array
            recentBookings = Object.values(data.recentBookings).map((booking: {
              booking_reference?: string;
              id?: string;
              guest_name?: string;
              guest?: string;
              room_name?: string;
              room?: string;
              check_in_date?: string;
              checkIn?: string;
              status: string;
            }) => ({
              id: booking.booking_reference || booking.id,
              guest: booking.guest_name || booking.guest,
              room: booking.room_name || booking.room,
              checkIn: booking.check_in_date || booking.checkIn,
              status: booking.status
            }));
          }
        } catch (error) {
          console.error('Error processing recent bookings:', error);
          console.log('Recent bookings data:', data.recentBookings);
          recentBookings = []; // Fallback to empty array
        }
        
        console.log('Dashboard data loaded successfully');
        
        setStats({
          totalBookings: data.totalBookings || 0,
          currentGuests: data.currentGuests || 0,
          availableBeds: data.availableBeds || 0,
          monthlyRevenue: data.monthlyRevenue || data.totalRevenue || 0,
          totalActivities: data.totalActivities || 0,
          activeActivities: data.activeActivities || 0,
          recentBookings,
        });
        
        // Generate alerts based on the data
        const alerts = [];
        
        // Check for low occupancy
        const totalCapacity = data.availableBeds + (data.currentGuests || 0);
        if (totalCapacity > 0) {
          const occupancyRate = ((data.currentGuests || 0) / totalCapacity) * 100;
          if (occupancyRate < 30) {
            alerts.push({
              type: "info",
              message: `Low occupancy rate: ${occupancyRate.toFixed(1)}%`,
              priority: "low"
            });
          }
        }
        
        setAlerts(alerts);
        
        // Set the latest booking ID for polling
        if (data.recentBookings.length > 0) {
          setLastBookingId(data.recentBookings[0].id);
        }
        
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error: unknown) {
      console.error('Error fetching dashboard data:', error);
      
      // Show more specific error message
      let errorMessage = 'Failed to load dashboard data. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Dashboard Error: ${error.message}`;
      }
      
      addNotification({
        type: 'error',
        title: 'Dashboard Error',
        message: errorMessage
      });
      
      // Set default values to prevent showing zeros
      setStats({
        totalBookings: 0,
        currentGuests: 0,
        availableBeds: 0,
        monthlyRevenue: 0,
        totalActivities: 0,
        activeActivities: 0,
        recentBookings: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    // Fetch user data
    axiosClient.get('/api/auth/verify')
      .then(response => {
        if (response.data.success) {
          setUser(response.data.user);
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });

    // Fetch dashboard data
    fetchDashboardData();
    
  }, [fetchDashboardData, addNotification]);

  // Poll for new bookings every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axiosClient.get('/api/bookings');
        if (response.data.success) {
          const bookings = response.data.data;
          const latestBooking = bookings[0]; // Assuming bookings are sorted by created_at desc
          
          if (latestBooking && lastBookingId && latestBooking.id > lastBookingId) {
            // New booking detected
            addNotification({
              type: 'success',
              title: 'New Booking Request',
              message: `New booking from ${latestBooking.guest.first_name} ${latestBooking.guest.last_name} for ${latestBooking.room.name}`
            });
            
            // Update the last booking ID
            setLastBookingId(latestBooking.id);
            
            // Refresh dashboard data
            fetchDashboardData();
          }
        }
      } catch (error) {
        console.error('Error checking for new bookings:', error);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [lastBookingId, addNotification, fetchDashboardData]);

  const statsCards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings.toString(),
      change: "+12%",
      trend: "up",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Current Guests",
      value: stats.currentGuests.toString(),
      change: "+5%",
      trend: "up",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Available Beds",
      value: stats.availableBeds.toString(),
      change: "-8%",
      trend: "down",
      icon: Bed,
      color: "text-orange-600",
    },
    {
      title: "Monthly Revenue",
      value: `$${stats.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+18%",
      trend: "up",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Total Activities",
      value: stats.totalActivities.toString(),
      change: "+3%",
      trend: "up",
      icon: Activity,
      color: "text-teal-600",
    },
    {
      title: "Active Activities",
      value: stats.activeActivities.toString(),
      change: "+1%",
      trend: "up",
      icon: MapPin,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Your personal management center - view and manage your rooms, bookings, and activities.</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
        </div>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="h-6 w-6 bg-muted rounded animate-pulse"></div>
                </div>
              </Card>
            ))
          ) : (
            statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`${stat.color} opacity-80`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Bookings */}
          <Card className="p-6 shadow-soft">
            <h2 className="text-xl font-bold text-foreground mb-4">Recent Bookings</h2>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-muted rounded animate-pulse mb-1 w-3/4"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                    </div>
                    <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentBookings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent bookings</p>
                ) : (
                  stats.recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{booking.guest}</p>
                        <p className="text-sm text-muted-foreground">{booking.room}</p>
                        <p className="text-xs text-muted-foreground">Check-in: {booking.checkIn}</p>
                      </div>
                      <Badge 
                        variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                        className={booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>

          {/* Alerts */}
          <Card className="p-6 shadow-soft">
            <h2 className="text-xl font-bold text-foreground mb-4">Alerts & Notifications</h2>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                    <div className="h-4 w-4 bg-muted rounded animate-pulse mt-0.5"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                      <div className="h-5 w-20 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No alerts at this time</p>
                ) : (
                  alerts.map((alert, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                      <AlertCircle 
                        size={16} 
                        className={`mt-0.5 ${
                          alert.type === 'error' ? 'text-red-500' : 
                          alert.type === 'warning' ? 'text-yellow-500' : 
                          'text-blue-500'
                        }`} 
                      />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{alert.message}</p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs mt-1 ${
                            alert.priority === 'high' ? 'border-red-300 text-red-700' :
                            alert.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                            'border-blue-300 text-blue-700'
                          }`}
                        >
                          {alert.priority} priority
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </div>


        {/* Quick Actions */}
        <Card className="p-6 shadow-soft">
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="ghost" 
              className="p-4 h-auto flex-col space-y-2 bg-primary/10 hover:bg-primary/20"
              onClick={() => navigate('/admin/bookings')}
            >
              <Calendar className="w-6 h-6 text-primary" />
              <p className="text-sm font-medium text-foreground">New Booking</p>
            </Button>
            <Button 
              variant="ghost" 
              className="p-4 h-auto flex-col space-y-2 bg-primary/10 hover:bg-primary/20"
              onClick={() => navigate('/admin/guests')}
            >
              <Users className="w-6 h-6 text-primary" />
              <p className="text-sm font-medium text-foreground">Check-in Guest</p>
            </Button>
            <Button 
              variant="ghost" 
              className="p-4 h-auto flex-col space-y-2 bg-primary/10 hover:bg-primary/20"
              onClick={() => navigate('/admin/rooms')}
            >
              <Bed className="w-6 h-6 text-primary" />
              <p className="text-sm font-medium text-foreground">Room Status</p>
            </Button>
            <Button 
              variant="ghost" 
              className="p-4 h-auto flex-col space-y-2 bg-primary/10 hover:bg-primary/20"
              onClick={() => navigate('/admin/payments')}
            >
              <TrendingUp className="w-6 h-6 text-primary" />
              <p className="text-sm font-medium text-foreground">View Reports</p>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;

