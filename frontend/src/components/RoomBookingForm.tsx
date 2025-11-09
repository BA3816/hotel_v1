import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import axiosClient from '../api/axios';

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

interface RoomBookingFormProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  selectedOffer?: Offer | null;
  onBookingSuccess?: (booking: any) => void;
}

const RoomBookingForm: React.FC<RoomBookingFormProps> = ({ 
  room, 
  isOpen, 
  onClose,
  checkInDate,
  checkOutDate,
  numberOfGuests,
  selectedOffer,
  onBookingSuccess
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [isVisitorLoggedIn, setIsVisitorLoggedIn] = useState(false);
  
  const [guestData, setGuestData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    nationality: '',
    date_of_birth: '',
    id_type: '',
    id_number: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const [specialRequests, setSpecialRequests] = useState('');

  // Auto-fill visitor data if logged in
  useEffect(() => {
    if (isOpen) {
      const visitorToken = localStorage.getItem('visitor_token');
      setIsVisitorLoggedIn(!!visitorToken);
      
      if (visitorToken) {
        // Try to get visitor data from localStorage or API
        const visitorData = localStorage.getItem('visitor');
        if (visitorData) {
          try {
            const visitor = JSON.parse(visitorData);
            // Auto-fill visitor information
            setGuestData(prev => ({
              ...prev,
              email: visitor.email || prev.email,
              // If name is stored in visitor, split it or use as first_name
              first_name: visitor.name ? visitor.name.split(' ')[0] : prev.first_name,
              last_name: visitor.name && visitor.name.split(' ').length > 1 
                ? visitor.name.split(' ').slice(1).join(' ') 
                : prev.last_name,
              phone: visitor.phone || prev.phone,
            }));
          } catch (error) {
            console.error('Error parsing visitor data:', error);
          }
        } else {
          // Fetch visitor profile if not in localStorage
          axiosClient.get('/api/visitor/profile')
            .then(response => {
              if (response.data.success && response.data.visitor) {
                const visitor = response.data.visitor;
                setGuestData(prev => ({
                  ...prev,
                  email: visitor.email || prev.email,
                  first_name: visitor.name ? visitor.name.split(' ')[0] : prev.first_name,
                  last_name: visitor.name && visitor.name.split(' ').length > 1 
                    ? visitor.name.split(' ').slice(1).join(' ') 
                    : prev.last_name,
                  phone: visitor.phone || prev.phone,
                }));
              }
            })
            .catch(error => {
              console.error('Error fetching visitor profile:', error);
            });
        }
      }
    }
  }, [isOpen]);

  const handleGuestInputChange = (field: string, value: string) => {
    setGuestData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    const numberOfNights = Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24));
    const baseAmount = room.price * numberOfNights;
    
    if (selectedOffer) {
      switch (selectedOffer.discount_type) {
        case "percentage":
          return baseAmount * (1 - selectedOffer.discount_value / 100);
        case "fixed_amount":
          return Math.max(0, baseAmount - (selectedOffer.discount_value * numberOfNights));
        default:
          return baseAmount;
      }
    }
    
    return baseAmount;
  };

  const handleGuestInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guestData.first_name || !guestData.last_name || !guestData.email) {
      toast.error('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setStep(2);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      const bookingData = {
        first_name: guestData.first_name,
        last_name: guestData.last_name,
        email: guestData.email,
        phone: guestData.phone || null,
        nationality: guestData.nationality || null,
        date_of_birth: guestData.date_of_birth || null,
        id_type: guestData.id_type || null,
        id_number: guestData.id_number || null,
        address: guestData.address || null,
        emergency_contact_name: guestData.emergency_contact_name || null,
        emergency_contact_phone: guestData.emergency_contact_phone || null,
        room_id: room.id,
        offer_id: selectedOffer?.id || null,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        number_of_guests: numberOfGuests,
        special_requests: specialRequests || null,
      };

      const response = await axiosClient.post('/api/bookings', bookingData);
      
      if (response.data.success) {
        const booking = response.data.data.booking;
        const isVisitor = !!localStorage.getItem('visitor_token');
        
        if (isVisitor) {
          toast.success("Booking confirmed! Reference: " + booking.booking_reference + ". Redirecting to your dashboard...");
          // Close the form first
          onClose();
          // Navigate to visitor dashboard after a short delay
          setTimeout(() => {
            navigate('/visitor/dashboard');
          }, 1000);
        } else {
          toast.success("Booking confirmed! Reference: " + booking.booking_reference);
        }
        
        if (onBookingSuccess) {
          onBookingSuccess(booking);
        }
        
        if (!isVisitor) {
          onClose();
        }
      } else {
        throw new Error(response.data.message || 'Failed to create booking');
      }
    } catch (error: unknown) {
      console.error('Booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Booking failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setGuestData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      nationality: '',
      date_of_birth: '',
      id_type: '',
      id_number: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
    });
    setSpecialRequests('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const totalAmount = calculateTotal();
  const numberOfNights = Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Book Your Stay</DialogTitle>
          <DialogDescription>
            Complete your booking details for {room.name}
          </DialogDescription>
        </DialogHeader>

        <Card className="p-4 mb-6">
          <div className="flex items-center space-x-4">
            <img 
              src={room.image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'} 
              alt={room.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{room.name}</h3>
              <p className="text-sm text-muted-foreground">Room {room.room_number} • Floor {room.floor}</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(checkInDate).toLocaleDateString()} - {new Date(checkOutDate).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {numberOfGuests} guest{numberOfGuests !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">${room.price}</div>
              <div className="text-sm text-muted-foreground">per night</div>
            </div>
          </div>
        </Card>

        {step === 1 ? (
          <form onSubmit={handleGuestInfoSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Guest Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name" className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>First Name *</span>
                  </Label>
                  <Input
                    id="first_name"
                    value={guestData.first_name}
                    onChange={(e) => handleGuestInputChange('first_name', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name" className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Last Name *</span>
                  </Label>
                  <Input
                    id="last_name"
                    value={guestData.last_name}
                    onChange={(e) => handleGuestInputChange('last_name', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>Email *</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={guestData.email}
                    onChange={(e) => handleGuestInputChange('email', e.target.value)}
                    required
                    readOnly={isVisitorLoggedIn}
                    disabled={isVisitorLoggedIn}
                    className="mt-1"
                  />
                  {isVisitorLoggedIn && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Using your account email. Bookings will appear in your dashboard.
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={guestData.phone}
                    onChange={(e) => handleGuestInputChange('phone', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={guestData.nationality}
                    onChange={(e) => handleGuestInputChange('nationality', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={guestData.date_of_birth}
                    onChange={(e) => handleGuestInputChange('date_of_birth', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="id_type">ID Type</Label>
                  <Input
                    id="id_type"
                    value={guestData.id_type}
                    onChange={(e) => handleGuestInputChange('id_type', e.target.value)}
                    placeholder="e.g., Passport, Driver's License"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="id_number">ID Number</Label>
                  <Input
                    id="id_number"
                    value={guestData.id_number}
                    onChange={(e) => handleGuestInputChange('id_number', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>Address</span>
                </Label>
                <Textarea
                  id="address"
                  value={guestData.address}
                  onChange={(e) => handleGuestInputChange('address', e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={guestData.emergency_contact_name}
                    onChange={(e) => handleGuestInputChange('emergency_contact_name', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    type="tel"
                    value={guestData.emergency_contact_phone}
                    onChange={(e) => handleGuestInputChange('emergency_contact_phone', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                Continue to Confirmation
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Booking Confirmation</h3>
              
              <Card className="p-4">
                <h4 className="font-medium mb-3">Guest Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">{guestData.first_name} {guestData.last_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2 font-medium">{guestData.email}</span>
                  </div>
                  {guestData.phone && (
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="ml-2 font-medium">{guestData.phone}</span>
                    </div>
                  )}
                  {guestData.nationality && (
                    <div>
                      <span className="text-muted-foreground">Nationality:</span>
                      <span className="ml-2 font-medium">{guestData.nationality}</span>
                    </div>
                  )}
                </div>
              </Card>

              <div>
                <Label htmlFor="special_requests">Special Requests</Label>
                <Textarea
                  id="special_requests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requests or notes for your stay..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Card className="p-4">
                <h4 className="font-medium mb-3">Pricing Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room price per night:</span>
                    <span className="font-medium">${room.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number of nights:</span>
                    <span className="font-medium">{numberOfNights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number of guests:</span>
                    <span className="font-medium">{numberOfGuests}</span>
                  </div>
                  {selectedOffer && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({selectedOffer.name}):</span>
                      <span className="font-medium">
                        -${(room.price * numberOfNights - totalAmount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-primary">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back to Guest Info
              </Button>
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoomBookingForm;


