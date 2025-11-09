import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    User, 
    LogOut, 
    Calendar, 
    MapPin, 
    Clock, 
    CreditCard, 
    Phone, 
    Mail,
    Bed,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2
} from "lucide-react";
import axiosClient from "../api/axios";
import { toast } from "sonner";

interface Visitor {
    id: number;
    name: string;
    email: string;
    phone?: string;
    created_at: string;
}

interface Room {
    id: number;
    name: string;
    room_number: string;
    type: string;
    capacity: number;
    price: number;
}

interface Booking {
    id: number;
    booking_reference: string;
    check_in: string;
    check_out: string;
    number_of_guests: number;
    total_amount: number;
    status: string;
    special_requests?: string;
    created_at: string;
    updated_at: string;
    room: Room;
    guest: Visitor;
}

const VisitorDashboard = () => {
    const navigate = useNavigate();
    const [visitor, setVisitor] = useState<Visitor | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const fetchVisitorData = useCallback(async () => {
        try {
            const response = await axiosClient.get("/api/visitor/profile");
            if (response.data.success) {
                setVisitor(response.data.visitor);
            }
        } catch (error: unknown) {
            console.error("Error fetching visitor data:", error);
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number } };
                if (axiosError.response?.status === 401) {
                    // Token is invalid, redirect to login
                    localStorage.removeItem("visitor_token");
                    localStorage.removeItem("visitor");
                    navigate("/visitor/login");
                    return;
                }
            }
            toast.error("Failed to load visitor data");
        }
    }, [navigate]);

    const fetchBookings = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axiosClient.get("/api/visitor/bookings");
            if (response.data.success) {
                // Handle empty bookings gracefully - this is not an error
                setBookings(response.data.bookings || []);
            } else {
                // Only show error if the response indicates failure
                console.error("Failed to fetch bookings:", response.data.message);
                setBookings([]);
            }
        } catch (error: unknown) {
            console.error("Error fetching bookings:", error);
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
                if (axiosError.response?.status === 401) {
                    // Token is invalid, redirect to login silently
                    localStorage.removeItem("visitor_token");
                    localStorage.removeItem("visitor");
                    navigate("/visitor/login");
                    return;
                }
                // Only show error for server errors (500), not client errors
                if (axiosError.response?.status && axiosError.response.status >= 500) {
                    toast.error(axiosError.response.data?.message || "Failed to load bookings. Please try again later.");
                } else {
                    // For other errors, just log and set empty array
                    setBookings([]);
                }
            } else {
                // Network errors or other issues
                setBookings([]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem("visitor_token");
        if (!token) {
            navigate("/visitor/login");
            return;
        }

        fetchVisitorData();
        fetchBookings();
    }, [navigate, fetchVisitorData, fetchBookings]);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await axiosClient.post("/api/visitor/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("visitor_token");
            localStorage.removeItem("visitor");
            setIsLoggingOut(false);
            navigate("/visitor/login");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return <CheckCircle className="h-4 w-4" />;
            case 'pending':
                return <AlertCircle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border shadow-soft">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-primary">Happy Hostel</h1>
                            <span className="text-muted-foreground">|</span>
                            <span className="text-foreground">Visitor Dashboard</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {visitor && (
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Welcome back</p>
                                    <p className="font-medium text-foreground">{visitor.name}</p>
                                </div>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <LogOut className="h-4 w-4 mr-2" />
                                )}
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                        Welcome back, {visitor?.name}!
                    </h2>
                    <p className="text-muted-foreground">
                        Here are your booking details and status updates.
                    </p>
                </div>

                {/* Bookings Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-foreground">Your Bookings</h3>
                        <Button
                            onClick={() => navigate("/rooms")}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Bed className="h-4 w-4 mr-2" />
                            Book Another Room
                        </Button>
                    </div>

                    {bookings.length === 0 ? (
                        <Card className="p-8 text-center">
                            <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                No bookings found
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                You haven't made any bookings yet. Start by exploring our available rooms!
                            </p>
                            <Button
                                onClick={() => navigate("/rooms")}
                                className="bg-primary hover:bg-primary/90"
                            >
                                Browse Rooms
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {bookings.map((booking) => (
                                <Card key={booking.id} className="p-6 shadow-soft">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="text-lg font-semibold text-foreground mb-1">
                                                Booking #{booking.booking_reference}
                                            </h4>
                                            <p className="text-muted-foreground">
                                                {booking.room.name} - Room {booking.room.room_number}
                                            </p>
                                        </div>
                                        <Badge 
                                            className={`${getStatusColor(booking.status)} flex items-center space-x-1`}
                                        >
                                            {getStatusIcon(booking.status)}
                                            <span className="capitalize">{booking.status}</span>
                                        </Badge>
                                    </div>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Check-in</p>
                                                <p className="font-medium text-foreground">
                                                    {formatDate(booking.check_in)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Check-out</p>
                                                <p className="font-medium text-foreground">
                                                    {formatDate(booking.check_out)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Guests</p>
                                                <p className="font-medium text-foreground">
                                                    {booking.number_of_guests}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total</p>
                                                <p className="font-medium text-foreground">
                                                    {formatCurrency(booking.total_amount)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {booking.special_requests && (
                                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                            <p className="text-sm text-muted-foreground mb-1">Special Requests:</p>
                                            <p className="text-foreground">{booking.special_requests}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                        <div className="text-sm text-muted-foreground">
                                            Booked on {formatDate(booking.created_at)}
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm">
                                                View Details
                                            </Button>
                                            {booking.status.toLowerCase() === 'pending' && (
                                                <Button variant="destructive" size="sm">
                                                    Cancel Booking
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Contact Information */}
                <Card className="mt-8 p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Need Help?</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-medium text-foreground">Phone</p>
                                <p className="text-muted-foreground">+1 (555) 123-4567</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-medium text-foreground">Email</p>
                                <p className="text-muted-foreground">support@happyhostel.com</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default VisitorDashboard;
