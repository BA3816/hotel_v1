import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Clock, 
  MapPin, 
  Star, 
  Calendar,
  Search,
  Filter,
  Eye,
  Activity as ActivityIcon
} from 'lucide-react';
import { toast } from 'sonner';
import axiosClient from '@/api/axios';

interface Activity {
  id: number;
  name: string;
  description: string;
  short_description?: string;
  price: number;
  duration_minutes: number;
  formatted_duration: string;
  max_participants: number;
  min_participants: number;
  difficulty_level: 'easy' | 'moderate' | 'hard';
  difficulty_color: string;
  location?: string;
  meeting_point?: string;
  available_days?: string[];
  start_time?: string;
  end_time?: string;
  image_url?: string;
  is_active: boolean;
  advance_booking_hours: number;
  what_to_bring?: string;
  rating: number;
  total_reviews: number;
  total_bookings: number;
  confirmed_bookings: number;
  created_at: string;
  updated_at: string;
}

const AdminActivities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    duration_minutes: '',
    max_participants: '',
    min_participants: '1',
    difficulty_level: 'easy',
    location: '',
    meeting_point: '',
    available_days: [] as string[],
    start_time: '',
    end_time: '',
    image_url: '',
    is_active: true,
    advance_booking_hours: '24',
    what_to_bring: '',
  });

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get('/api/activities');
      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day]
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      short_description: '',
      price: '',
      duration_minutes: '',
      max_participants: '',
      min_participants: '1',
      difficulty_level: 'easy',
      location: '',
      meeting_point: '',
      available_days: [],
      start_time: '',
      end_time: '',
      image_url: '',
      is_active: true,
      advance_booking_hours: '24',
      what_to_bring: '',
    });
    setEditingActivity(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
        max_participants: parseInt(formData.max_participants),
        min_participants: parseInt(formData.min_participants),
        advance_booking_hours: parseInt(formData.advance_booking_hours),
      };

      let response;
      if (editingActivity) {
        response = await axiosClient.put(`/api/activities/${editingActivity.id}`, submitData);
      } else {
        response = await axiosClient.post('/api/activities', submitData);
      }

      if (response.data.success) {
        toast.success(editingActivity ? 'Activity updated successfully!' : 'Activity created successfully!');
        setShowAddDialog(false);
        resetForm();
        fetchActivities();
      }
    } catch (error: unknown) {
      console.error('Failed to save activity:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to save activity';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (activity: Activity) => {
    setFormData({
      name: activity.name,
      description: activity.description,
      short_description: activity.short_description || '',
      price: activity.price.toString(),
      duration_minutes: activity.duration_minutes.toString(),
      max_participants: activity.max_participants.toString(),
      min_participants: activity.min_participants.toString(),
      difficulty_level: activity.difficulty_level,
      location: activity.location || '',
      meeting_point: activity.meeting_point || '',
      available_days: activity.available_days || [],
      start_time: activity.start_time || '',
      end_time: activity.end_time || '',
      image_url: activity.image_url || '',
      is_active: activity.is_active,
      advance_booking_hours: activity.advance_booking_hours.toString(),
      what_to_bring: activity.what_to_bring || '',
    });
    setEditingActivity(activity);
    setShowAddDialog(true);
  };

  const handleDelete = async (activity: Activity) => {
    if (!confirm(`Are you sure you want to delete "${activity.name}"?`)) {
      return;
    }

    try {
      const response = await axiosClient.delete(`/api/activities/${activity.id}`);
      if (response.data.success) {
        toast.success('Activity deleted successfully!');
        fetchActivities();
      }
    } catch (error: unknown) {
      console.error('Failed to delete activity:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to delete activity';
      toast.error(errorMessage);
    }
  };

  const getDifficultyBadge = (level: string, color: string) => {
    return (
      <Badge className={color}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && activity.is_active) ||
                         (filterStatus === 'inactive' && !activity.is_active);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Activities Management</h1>
            <p className="text-muted-foreground">Manage hostel activities and experiences</p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingActivity ? 'Edit Activity' : 'Add New Activity'}
                </DialogTitle>
                <DialogDescription>
                  {editingActivity ? 'Update activity details' : 'Create a new activity for guests to book'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Activity Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., City Walking Tour"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Person ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="25.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Input
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    placeholder="Brief description for listings"
                    maxLength={500}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detailed description of the activity..."
                    rows={4}
                    required
                  />
                </div>

                {/* Activity Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
                    <Input
                      id="duration_minutes"
                      type="number"
                      min="1"
                      value={formData.duration_minutes}
                      onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                      placeholder="120"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max_participants">Max Participants *</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      min="1"
                      value={formData.max_participants}
                      onChange={(e) => handleInputChange('max_participants', e.target.value)}
                      placeholder="15"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="min_participants">Min Participants</Label>
                    <Input
                      id="min_participants"
                      type="number"
                      min="1"
                      value={formData.min_participants}
                      onChange={(e) => handleInputChange('min_participants', e.target.value)}
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty_level">Difficulty Level *</Label>
                    <Select value={formData.difficulty_level} onValueChange={(value) => handleInputChange('difficulty_level', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="advance_booking_hours">Advance Booking (hours)</Label>
                    <Input
                      id="advance_booking_hours"
                      type="number"
                      min="1"
                      value={formData.advance_booking_hours}
                      onChange={(e) => handleInputChange('advance_booking_hours', e.target.value)}
                      placeholder="24"
                    />
                  </div>
                </div>

                {/* Location & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City Center"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meeting_point">Meeting Point</Label>
                    <Input
                      id="meeting_point"
                      value={formData.meeting_point}
                      onChange={(e) => handleInputChange('meeting_point', e.target.value)}
                      placeholder="Hostel Reception"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => handleInputChange('start_time', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => handleInputChange('end_time', e.target.value)}
                    />
                  </div>
                </div>

                {/* Available Days */}
                <div className="space-y-2">
                  <Label>Available Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <Button
                        key={day.value}
                        type="button"
                        variant={formData.available_days.includes(day.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDayToggle(day.value)}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-2">
                  <Label htmlFor="what_to_bring">What to Bring</Label>
                  <Textarea
                    id="what_to_bring"
                    value={formData.what_to_bring}
                    onChange={(e) => handleInputChange('what_to_bring', e.target.value)}
                    placeholder="Comfortable shoes, water bottle, camera..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder="https://example.com/activity-image.jpg"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="is_active">Active (visible to guests)</Label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingActivity ? 'Update Activity' : 'Create Activity'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'inactive') => setFilterStatus(value)}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Activities Table */}
        <Card className="shadow-soft">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Activities ({filteredActivities.length})</h2>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading activities...</span>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-8">
                <ActivityIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No activities found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Get started by creating your first activity'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Activity</TableHead>
                      <TableHead className="font-semibold">Price</TableHead>
                      <TableHead className="font-semibold">Duration</TableHead>
                      <TableHead className="font-semibold">Capacity</TableHead>
                      <TableHead className="font-semibold">Difficulty</TableHead>
                      <TableHead className="font-semibold">Bookings</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((activity) => (
                      <TableRow key={activity.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{activity.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {activity.location && (
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {activity.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">${activity.price}</span>
                          <div className="text-xs text-muted-foreground">per person</div>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {activity.formatted_duration}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {activity.min_participants}-{activity.max_participants}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getDifficultyBadge(activity.difficulty_level, activity.difficulty_color)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{activity.confirmed_bookings} confirmed</div>
                            <div className="text-muted-foreground">{activity.total_bookings} total</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={activity.is_active ? "default" : "secondary"}>
                            {activity.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(activity)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(activity)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminActivities;
