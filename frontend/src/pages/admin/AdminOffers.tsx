import AdminSidebar from "@/components/AdminSidebar";
import CreateOfferModal from "@/components/CreateOfferModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Eye, Edit, Trash2, Users, Gift, Calendar, Percent, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import axiosClient from "../../api/axios";
import { toast } from "sonner";

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

interface OfferStats {
  total_offers: number;
  active_offers: number;
  total_bookings: number;
  total_revenue: number;
  avg_discount: number;
}

const AdminOffers = () => {

  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<OfferStats>({
    total_offers: 0,
    active_offers: 0,
    total_bookings: 0,
    total_revenue: 0,
    avg_discount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  // Fetch offers data
  const fetchOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      params.append('sort_by', sortBy);

      const response = await axiosClient.get(`/api/offers?${params.toString()}`);
      if (response.data.success) {
        setOffers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to fetch offers');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, typeFilter, sortBy]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await axiosClient.get('/api/offers/statistics');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  // Delete offer
  const handleDeleteOffer = async (id: number) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    
    try {
      const response = await axiosClient.delete(`/api/offers/${id}`);
      if (response.data.success) {
        toast.success('Offer deleted successfully');
        fetchOffers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Failed to delete offer');
    }
  };

  // Update offer status
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await axiosClient.put(`/api/offers/${id}`, { status: newStatus });
      if (response.data.success) {
        toast.success('Offer status updated successfully');
        fetchOffers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating offer status:', error);
      toast.error('Failed to update offer status');
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchStats();
  }, [searchTerm, statusFilter, typeFilter, sortBy, fetchOffers, fetchStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "expired": return "bg-gray-100 text-gray-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "group-discount": return "bg-purple-100 text-purple-800";
      case "solo-discount": return "bg-blue-100 text-blue-800";
      case "length-discount": return "bg-green-100 text-green-800";
      case "student-discount": return "bg-orange-100 text-orange-800";
      case "early-booking": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "group-discount": return "Group Discount";
      case "solo-discount": return "Solo Traveler";
      case "length-discount": return "Extended Stay";
      case "student-discount": return "Student Discount";
      case "early-booking": return "Early Booking";
      default: return type;
    }
  };

  const getUsagePercentage = (used: number, max: number | null) => {
    if (!max) return 0;
    return Math.round((used / max) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-orange-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getFormattedDiscount = (offer: Offer) => {
    switch (offer.discount_type) {
      case 'percentage':
        return `${offer.discount_value}%`;
      case 'fixed_amount':
        return `$${offer.discount_value.toFixed(2)}`;
      case 'free_night':
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Group Offers & Discounts</h1>
            <p className="text-muted-foreground">Manage special offers, group discounts, and promotional deals.</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => { fetchOffers(); fetchStats(); }}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </Button>
            <CreateOfferModal onOfferCreated={() => { fetchOffers(); fetchStats(); }} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Offers</p>
                <p className="text-2xl font-bold text-foreground">{stats.active_offers}</p>
                <p className="text-sm text-green-600">Currently running</p>
              </div>
              <Gift className="w-8 h-8 text-primary opacity-80" />
            </div>
          </Card>
          
          <Card className="p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold text-foreground">{stats.total_bookings}</p>
                <p className="text-sm text-blue-600">From all offers</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-80" />
            </div>
          </Card>
          
          <Card className="p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue Impact</p>
                <p className="text-2xl font-bold text-foreground">${stats.total_revenue.toLocaleString()}</p>
                <p className="text-sm text-purple-600">This month</p>
              </div>
              <Percent className="w-8 h-8 text-purple-600 opacity-80" />
            </div>
          </Card>
          
          <Card className="p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Discount</p>
                <p className="text-2xl font-bold text-foreground">{stats.avg_discount}%</p>
                <p className="text-sm text-orange-600">Across all offers</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600 opacity-80" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <Input 
                placeholder="Search offers..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Offer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="group-discount">Group Discount</SelectItem>
                <SelectItem value="solo-discount">Solo Traveler</SelectItem>
                <SelectItem value="length-discount">Extended Stay</SelectItem>
                <SelectItem value="student-discount">Student Discount</SelectItem>
                <SelectItem value="early-booking">Early Booking</SelectItem>
                <SelectItem value="loyalty">Loyalty</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="usage">Usage Rate</SelectItem>
                <SelectItem value="expiry">Expiry Date</SelectItem>
                <SelectItem value="discount">Discount Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Offers Table */}
        <Card className="shadow-soft">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading offers...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Offer Code</TableHead>
                    <TableHead>Name & Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No offers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    offers.map((offer) => {
                      const usagePercentage = getUsagePercentage(offer.used_count, offer.max_uses);
                      return (
                        <TableRow key={offer.id}>
                          <TableCell className="font-medium">{offer.offer_code}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{offer.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(offer.type)}>
                              {getTypeText(offer.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-primary">{getFormattedDiscount(offer)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{new Date(offer.valid_from).toLocaleDateString()}</p>
                              <p className="text-muted-foreground">to {new Date(offer.valid_to).toLocaleDateString()}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className={`font-medium ${getUsageColor(usagePercentage)}`}>
                                {offer.used_count}/{offer.max_uses || '∞'}
                              </p>
                              <p className="text-xs text-muted-foreground">{usagePercentage}% used</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(offer.status)}>
                              {offer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" title="View Details">
                                <Eye size={14} />
                              </Button>
                              <Button variant="outline" size="sm" title="Edit Offer">
                                <Edit size={14} />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive hover:text-destructive" 
                                title="Delete Offer"
                                onClick={() => handleDeleteOffer(offer.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminOffers;