import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import axiosClient from "../api/axios";
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

interface EditRoomFormProps {
  room: Room;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditRoomForm = ({ room, onSuccess, onCancel }: EditRoomFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    room_number: "",
    name: "",
    type: "",
    capacity: "",
    occupied: "",
    floor: "",
    price: "",
    status: "available",
    description: "",
    image_url: "",
    amenities: [] as string[],
  });
  const [newAmenity, setNewAmenity] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const predefinedAmenities = [
    "Free WiFi",
    "Air Conditioning",
    "Individual Lockers",
    "Reading Lights",
    "Power Outlets",
    "Shared Bathroom",
    "Private Bathroom",
    "Hair Dryer",
    "TV",
    "Mini Fridge",
    "City View",
    "Garden View",
    "Balcony",
    "Desk",
    "Chair",
    "Wardrobe",
    "Bed Linens",
    "Towels",
    "Daily Cleaning",
    "Laundry Service",
    "Common Area Access",
    "Kitchen Access",
    "24/7 Reception",
    "Luggage Storage",
    "Security Cameras",
    "Key Card Access",
    "Elevator Access",
    "Parking Available",
    "Pet Friendly",
    "Non-Smoking"
  ];

  const roomTypes = [
    "Mixed Dormitory",
    "Female Dormitory", 
    "Male Dormitory",
    "Private Single",
    "Private Double",
    "Private Twin",
    "Family Room",
    "Deluxe Room"
  ];

  const statusOptions = [
    { value: "available", label: "Available" },
    { value: "occupied", label: "Occupied" },
    { value: "full", label: "Full" },
    { value: "maintenance", label: "Maintenance" },
  ];

  // Initialize form data with room data
  useEffect(() => {
    setFormData({
      room_number: room.room_number,
      name: room.name,
      type: room.type,
      capacity: room.capacity.toString(),
      occupied: room.occupied.toString(),
      floor: room.floor.toString(),
      price: room.price.toString(),
      status: room.status,
      description: room.description || "",
      image_url: room.image_url || "",
      amenities: room.amenities || [],
    });
  }, [room]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image_url: ""
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity("");
    }
  };

  const addPredefinedAmenity = (amenity: string) => {
    if (!formData.amenities.includes(amenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      // If image is selected, upload it first
      let imageUrl = formData.image_url;
      
      if (selectedImage) {
        const formDataImage = new FormData();
        formDataImage.append('image', selectedImage);
        
        const uploadResponse = await axiosClient.post('/api/upload-image', formDataImage, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (uploadResponse.data.success) {
          imageUrl = uploadResponse.data.image_url;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      const submitData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        occupied: parseInt(formData.occupied),
        floor: parseInt(formData.floor),
        price: parseFloat(formData.price),
        image_url: imageUrl,
      };

      const response = await axiosClient.put(`/api/rooms/${room.id}`, submitData);
      
      if (response.data.success) {
        toast.success("Room updated successfully!");
        onSuccess();
      } else {
        throw new Error(response.data.message || "Failed to update room");
      }
    } catch (error: any) {
      console.error("Error updating room:", error);
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        toast.error(errorMessages.join(", "));
      } else {
        toast.error(error.response?.data?.message || "Failed to update room. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Edit Room - {room.room_number}</CardTitle>
          <CardDescription>
            Update the room details and settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room Number and Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room_number">Room Number *</Label>
                <Input
                  id="room_number"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleInputChange}
                  placeholder="e.g., R001, 101A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Room Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., 4-Bed Mixed Dorm A"
                  required
                />
              </div>
            </div>

            {/* Type and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Room Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Capacity, Occupied, Floor, and Price */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="e.g., 4"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupied">Occupied</Label>
                <Input
                  id="occupied"
                  name="occupied"
                  type="number"
                  min="0"
                  value={formData.occupied}
                  onChange={handleInputChange}
                  placeholder="e.g., 2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor *</Label>
                <Input
                  id="floor"
                  name="floor"
                  type="number"
                  min="1"
                  value={formData.floor}
                  onChange={handleInputChange}
                  placeholder="e.g., 1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per Night ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 25.00"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Room description, special features, etc."
                rows={3}
              />
            </div>

            {/* Room Image */}
            <div className="space-y-2">
              <Label>Room Image</Label>
              
              {/* Current Image Display */}
              {room.image_url && !imagePreview && (
                <div className="space-y-2">
                  <Label>Current Image</Label>
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                    <img
                      src={room.image_url}
                      alt="Current room image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              {/* Image Upload */}
              <div className="space-y-4">
                {/* File Upload */}
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label 
                    htmlFor="image-upload" 
                    className="flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{room.image_url ? 'Change Image' : 'Upload Image'}</span>
                  </Label>
                  
                  {(imagePreview || room.image_url) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Room preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Or URL Input */}
                <div className="text-sm text-gray-500 text-center">OR</div>
                
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/room-image.jpg"
                    disabled={!!imagePreview}
                  />
                  {imagePreview && (
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded image will be used instead of URL
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <Label>Amenities</Label>
              
              {/* Predefined Amenities */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Quick Select:</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {predefinedAmenities.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => addPredefinedAmenity(amenity)}
                      disabled={formData.amenities.includes(amenity)}
                      className={`text-xs p-1 rounded border text-left transition-colors ${
                        formData.amenities.includes(amenity)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted border-border'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amenity Input */}
              <div className="flex gap-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Add custom amenity"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                />
                <Button type="button" onClick={addAmenity} variant="outline" size="sm">
                  <Plus size={16} />
                </Button>
              </div>

              {/* Selected Amenities */}
              {formData.amenities.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Selected Amenities:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Room...
                  </>
                ) : (
                  "Update Room"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditRoomForm;

