import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import axiosClient from "../api/axios";

interface CreateOfferModalProps {
  onOfferCreated: () => void;
}

interface OfferFormData {
  name: string;
  description: string;
  type: string;
  discount_type: string;
  discount_value: string;
  min_guests: string;
  min_nights: string;
  max_uses: string;
  valid_from: string;
  valid_to: string;
  status: string;
  is_public: boolean;
}

const CreateOfferModal = ({ onOfferCreated }: CreateOfferModalProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OfferFormData>({
    name: '',
    description: '',
    type: '',
    discount_type: '',
    discount_value: '',
    min_guests: '1',
    min_nights: '',
    max_uses: '',
    valid_from: '',
    valid_to: '',
    status: 'active',
    is_public: true
  });

  const handleInputChange = (field: keyof OfferFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.description || !formData.type || !formData.discount_type || !formData.discount_value || !formData.valid_from || !formData.valid_to) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.discount_value) < 0) {
      toast.error('Discount value must be positive');
      return;
    }

    if (parseInt(formData.min_guests) < 1) {
      toast.error('Minimum guests must be at least 1');
      return;
    }

    if (new Date(formData.valid_from) >= new Date(formData.valid_to)) {
      toast.error('Valid to date must be after valid from date');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await axiosClient.post('/api/offers', {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        min_guests: parseInt(formData.min_guests),
        min_nights: formData.min_nights ? parseInt(formData.min_nights) : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null
      });

      if (response.data.success) {
        toast.success('Offer created successfully!');
        setOpen(false);
        setFormData({
          name: '',
          description: '',
          type: '',
          discount_type: '',
          discount_value: '',
          min_guests: '1',
          min_nights: '',
          max_uses: '',
          valid_from: '',
          valid_to: '',
          status: 'active',
          is_public: true
        });
        onOfferCreated();
      } else {
        toast.error(response.data.message || 'Failed to create offer');
      }
    } catch (error: any) {
      console.error('Error creating offer:', error);
      toast.error(error.response?.data?.message || 'Failed to create offer');
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) {
    return (
      <Button 
        className="bg-primary hover:bg-primary/90"
        onClick={() => setOpen(true)}
      >
        <Plus size={16} className="mr-2" />
        Create New Offer
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create New Offer</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Offer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter offer name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Offer Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select offer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group-discount">Group Discount</SelectItem>
                    <SelectItem value="solo-discount">Solo Traveler</SelectItem>
                    <SelectItem value="length-discount">Extended Stay</SelectItem>
                    <SelectItem value="student-discount">Student Discount</SelectItem>
                    <SelectItem value="early-booking">Early Booking</SelectItem>
                    <SelectItem value="loyalty">Loyalty</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter offer description"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_type">Discount Type *</Label>
                <Select value={formData.discount_type} onValueChange={(value) => handleInputChange('discount_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    <SelectItem value="free_night">Free Night(s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount_value">Discount Value *</Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount_value}
                  onChange={(e) => handleInputChange('discount_value', e.target.value)}
                  placeholder="Enter discount value"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min_guests">Min Guests *</Label>
                <Input
                  id="min_guests"
                  type="number"
                  min="1"
                  value={formData.min_guests}
                  onChange={(e) => handleInputChange('min_guests', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_nights">Min Nights</Label>
                <Input
                  id="min_nights"
                  type="number"
                  min="1"
                  value={formData.min_nights}
                  onChange={(e) => handleInputChange('min_nights', e.target.value)}
                  placeholder="Optional"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_uses">Max Uses</Label>
                <Input
                  id="max_uses"
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => handleInputChange('max_uses', e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid_from">Valid From *</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => handleInputChange('valid_from', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valid_to">Valid To *</Label>
                <Input
                  id="valid_to"
                  type="date"
                  value={formData.valid_to}
                  onChange={(e) => handleInputChange('valid_to', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => handleInputChange('is_public', checked)}
                />
                <Label htmlFor="is_public">Public Offer</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Offer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOfferModal;

