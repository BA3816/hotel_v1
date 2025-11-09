import React, { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import ActivityBookingForm from "@/components/ActivityBookingForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Clock, 
  MapPin, 
  Star, 
  Calendar,
  Search,
  Filter,
  Activity as ActivityIcon,
  ChevronRight,
  Info
} from "lucide-react";
import { toast } from "sonner";
import axiosClient from "../api/axios";

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
  what_to_bring?: string;
  rating: number;
  total_reviews: number;
}

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'moderate' | 'hard'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get('/api/activities/public');
      if (response.data && response.data.success) {
        setActivities(response.data.data || []);
      } else {
        setActivities([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch activities:', error);
      // Only show error toast for actual errors, not empty results
      if (error.response?.status !== 404) {
        toast.error('Failed to load activities');
      }
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowBookingForm(true);
  };

  const getDifficultyBadge = (level: string, color: string) => {
    return (
      <Badge className={color}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const getAvailableDaysText = (days?: string[]) => {
    if (!days || days.length === 0) return 'Contact for availability';
    if (days.length === 7) return 'Daily';
    if (days.length === 5 && !days.includes('saturday') && !days.includes('sunday')) return 'Weekdays';
    if (days.length === 2 && days.includes('saturday') && days.includes('sunday')) return 'Weekends';
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity.location && activity.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = difficultyFilter === 'all' || activity.difficulty_level === difficultyFilter;
    
    const matchesPrice = priceFilter === 'all' || 
                        (priceFilter === 'low' && activity.price <= 25) ||
                        (priceFilter === 'medium' && activity.price > 25 && activity.price <= 50) ||
                        (priceFilter === 'high' && activity.price > 50);
    
    return matchesSearch && matchesDifficulty && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Activities & Experiences
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover amazing activities and create unforgettable memories during your stay
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Filter Activities</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Search</label>
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

              {/* Difficulty Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                <Select value={difficultyFilter} onValueChange={(value: 'all' | 'easy' | 'moderate' | 'hard') => setDifficultyFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <Select value={priceFilter} onValueChange={(value: 'all' | 'low' | 'medium' | 'high') => setPriceFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="low">Under $25</SelectItem>
                    <SelectItem value="medium">$25 - $50</SelectItem>
                    <SelectItem value="high">Over $50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Stats */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Available Activities</h4>
                <p className="text-2xl font-bold text-primary">{filteredActivities.length}</p>
                <p className="text-sm text-muted-foreground">activities found</p>
              </div>
            </Card>
          </div>

          {/* Activities Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading activities...</span>
              </div>
            ) : filteredActivities.length === 0 ? (
              <Card className="p-12 text-center">
                <ActivityIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No activities found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || difficultyFilter !== 'all' || priceFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Check back soon for exciting activities!'}
                </p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredActivities.map((activity) => (
                  <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="md:flex">
                      {/* Activity Image */}
                      <div className="md:w-1/3">
                        {activity.image_url ? (
                          <img 
                            src={activity.image_url} 
                            alt={activity.name}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 md:h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <ActivityIcon className="w-12 h-12 text-primary/60" />
                          </div>
                        )}
                      </div>

                      {/* Activity Details */}
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground mb-2">{activity.name}</h3>
                            <p className="text-muted-foreground mb-3">
                              {activity.short_description || activity.description.substring(0, 150) + '...'}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-primary">${activity.price}</div>
                            <div className="text-sm text-muted-foreground">per person</div>
                          </div>
                        </div>

                        {/* Activity Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            {activity.formatted_duration}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="w-4 h-4 mr-2" />
                            {activity.min_participants}-{activity.max_participants} people
                          </div>
                          {activity.location && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-2" />
                              {activity.location}
                            </div>
                          )}
                          {activity.rating > 0 && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
                              {Number(activity.rating).toFixed(1)} ({activity.total_reviews})
                            </div>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {getDifficultyBadge(activity.difficulty_level, activity.difficulty_color)}
                          <Badge variant="outline">
                            <Calendar className="w-3 h-3 mr-1" />
                            {getAvailableDaysText(activity.available_days)}
                          </Badge>
                          {activity.start_time && (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {activity.start_time}
                            </Badge>
                          )}
                        </div>

                        {/* What to Bring */}
                        {activity.what_to_bring && (
                          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-start">
                              <Info className="w-4 h-4 mr-2 mt-0.5 text-primary" />
                              <div>
                                <div className="text-sm font-medium mb-1">What to bring:</div>
                                <div className="text-sm text-muted-foreground">{activity.what_to_bring}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            {activity.meeting_point && (
                              <span>Meeting point: {activity.meeting_point}</span>
                            )}
                          </div>
                          <Button 
                            onClick={() => handleBookActivity(activity)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Book Now
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Booking Form Modal */}
      {showBookingForm && selectedActivity && (
        <ActivityBookingForm
          activity={selectedActivity}
          isOpen={showBookingForm}
          onClose={() => {
            setShowBookingForm(false);
            setSelectedActivity(null);
          }}
        />
      )}
    </div>
  );
};

export default Activities;