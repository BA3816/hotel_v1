import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  DollarSign,
  User,
  Mail,
  Phone,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';
import axiosClient from '../api/axios';

interface Activity {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  formatted_duration: string;
  max_participants: number;
  min_participants: number;
  difficulty_level: string;
  difficulty_color: string;
  location?: string;
  meeting_point?: string;
  start_time?: string;
  what_to_bring?: string;
}

interface ActivityBookingFormProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
}

const ActivityBookingForm: React.FC<ActivityBookingFormProps> = ({ 
  activity, 
  isOpen, 
  onClose 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  const [guestData, setGuestData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    nationality: '',
    date_of_birth: '',
  });

  const [bookingData, setBookingData] = useState({
    booking_date: '',
    booking_time: activity.start_time || '09:00',
    participants: activity.min_participants.toString(),
    special_requests: '',
  });

  const [bookingResult, setBookingResult] = useState<any>(null);

  const handleGuestInputChange = (field: string, value: string) => {
    setGuestData(prev => ({ ...prev, [field]: value }));
  };

  const handleBookingInputChange = (field: string, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    return activity.price * parseInt(bookingData.participants);
  };

  const incrementParticipants = () => {
    const currentParticipants = parseInt(bookingData.participants);
    if (currentParticipants < activity.max_participants) {
      setBookingData(prev => ({
        ...prev,
        participants: (currentParticipants + 1).toString()
      }));
    }
  };

  const decrementParticipants = () => {
    const currentParticipants = parseInt(bookingData.participants);
    if (currentParticipants > activity.min_participants) {
      setBookingData(prev => ({
        ...prev,
        participants: (currentParticipants - 1).toString()
      }));
    }
  };

  const handleGuestInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guestData.first_name || !guestData.last_name || !guestData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setStep(2);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      if (!bookingData.booking_date || !bookingData.booking_time) {
        toast.error('Please select date and time');
        return;
      }

      const participants = parseInt(bookingData.participants);
      if (participants < activity.min_participants || participants > activity.max_participants) {
        toast.error(`Participants must be between ${activity.min_participants} and ${activity.max_participants}`);
        return;
      }

      const guestResponse = await axiosClient.post('/api/bookings', {
        guest_info: guestData,
        room_id: null,
        check_in_date: bookingData.booking_date,
        check_out_date: bookingData.booking_date,
        number_of_guests: participants,
        special_requests: bookingData.special_requests,
        is_activity_guest: true,
      });

      if (!guestResponse.data.success) {
        throw new Error(guestResponse.data.message || 'Failed to create guest');
      }

      const guestId = guestResponse.data.data.guest.id;

      const activityBookingResponse = await axiosClient.post('/api/activity-bookings', {
        activity_id: activity.id,
        guest_id: guestId,
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        participants: participants,
        special_requests: bookingData.special_requests,
      });

      if (activityBookingResponse.data.success) {
        setBookingResult(activityBookingResponse.data.data);
        setStep(3);
        toast.success('Activity booking created successfully!');
      } else {
        throw new Error(activityBookingResponse.data.message || 'Failed to create activity booking');
      }

    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setGuestData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      nationality: '',
      date_of_birth: '',
    });
    setBookingData({
      booking_date: '',
      booking_time: activity.start_time || '09:00',
      participants: activity.min_participants.toString(),
      special_requests: '',
    });
    setBookingResult(null);
    onClose();
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Book Activity: {activity.name}</DialogTitle>
          <DialogDescription>
            Complete your booking in {step === 3 ? '3' : step === 2 ? '2' : '3'} steps
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <div className={`h-1 w-12 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <div className={`h-1 w-12 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
          </div>
        </div>

        <Card className="p-4 mb-6 bg-muted/50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{activity.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {activity.formatted_duration}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {activity.min_participants}-{activity.max_participants} people
                </span>
                {activity.location && (
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {activity.location}
                  </span>
                )}
              </div>
              <Badge className={activity.difficulty_color + ' mt-2'}>
                {activity.difficulty_level.charAt(0).toUpperCase() + activity.difficulty_level.slice(1)}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">${activity.price}</div>
              <div className="text-sm text-muted-foreground">per person</div>
            </div>
          </div>
        </Card>

        {step === 1 && (
          <form onSubmit={handleGuestInfoSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <User className="w-5 h-5 mr-2" />
              Guest Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={guestData.first_name}
                  onChange={(e) => handleGuestInputChange('first_name', e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={guestData.last_name}
                  onChange={(e) => handleGuestInputChange('last_name', e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={guestData.email}
                  onChange={(e) => handleGuestInputChange('email', e.target.value)}
                  placeholder="john@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={guestData.phone}
                    onChange={(e) => handleGuestInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={guestData.nationality}
                  onChange={(e) => handleGuestInputChange('nationality', e.target.value)}
                  placeholder="American"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={guestData.date_of_birth}
                onChange={(e) => handleGuestInputChange('date_of_birth', e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                Next: Booking Details
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Booking Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking_date">Activity Date *</Label>
                <Input
                  id="booking_date"
                  type="date"
                  value={bookingData.booking_date}
                  onChange={(e) => handleBookingInputChange('booking_date', e.target.value)}
                  min={getTomorrowDate()}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="booking_time">Preferred Time *</Label>
                <Input
                  id="booking_time"
                  type="time"
                  value={bookingData.booking_time}
                  onChange={(e) => handleBookingInputChange('booking_time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants">Number of Participants *</Label>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={decrementParticipants}
                  disabled={parseInt(bookingData.participants) <= activity.min_participants}
                  className="h-10 w-10 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-lg font-semibold">
                    {bookingData.participants} {parseInt(bookingData.participants) === 1 ? 'Participant' : 'Participants'}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={incrementParticipants}
                  disabled={parseInt(bookingData.participants) >= activity.max_participants}
                  className="h-10 w-10 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Minimum: {activity.min_participants}, Maximum: {activity.max_participants}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_requests">Special Requests</Label>
              <Textarea
                id="special_requests"
                value={bookingData.special_requests}
                onChange={(e) => handleBookingInputChange('special_requests', e.target.value)}
                placeholder="Any special requirements or requests..."
                rows={3}
              />
            </div>

            {activity.what_to_bring && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 mt-0.5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">What to bring:</h4>
                    <p className="text-blue-800 text-sm">{activity.what_to_bring}</p>
                  </div>
                </div>
              </div>
            )}

            {activity.meeting_point && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-2 mt-0.5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">Meeting Point:</h4>
                    <p className="text-green-800 text-sm">{activity.meeting_point}</p>
                  </div>
                </div>
              </div>
            )}

            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Total Cost</h4>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.participants} × ${activity.price} per person
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary flex items-center">
                    <DollarSign className="w-5 h-5" />
                    {calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-between space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && bookingResult && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground">Your activity booking has been successfully created.</p>
            </div>

            <Card className="p-6">
              <h4 className="font-semibold mb-4">Booking Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Booking Reference:</span>
                  <span className="font-mono font-medium">{bookingResult.booking_reference}</span>
                </div>
                <div className="flex justify-between">
                  <span>Activity:</span>
                  <span>{activity.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span>{bookingData.booking_date} at {bookingData.booking_time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Participants:</span>
                  <span>{bookingData.participants}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You'll receive a confirmation email shortly</li>
                <li>• Please arrive at the meeting point 15 minutes early</li>
                <li>• Bring the items mentioned in "What to bring"</li>
                <li>• Contact us if you need to make any changes</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActivityBookingForm;

