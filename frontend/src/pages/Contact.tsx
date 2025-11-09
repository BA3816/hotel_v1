import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Plane, Train, Car } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get in touch with us for bookings, questions, or just to say hello! 
            We're here to help make your stay unforgettable.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="p-8 shadow-soft">
              <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" className="mt-1" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Booking inquiry" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us how we can help you..."
                    className="mt-1 min-h-[120px]"
                  />
                </div>
                
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card className="p-6 shadow-soft">
              <h3 className="text-xl font-bold text-foreground mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Address</p>
                    <p className="text-muted-foreground">123 Backpacker Street<br />Downtown District<br />City, State 12345</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <p className="text-muted-foreground">+1 (555) 123-HAPPY<br />+1 (555) 123-4277</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p className="text-muted-foreground">hello@happyhostel.com<br />bookings@happyhostel.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Reception Hours</p>
                    <p className="text-muted-foreground">24/7 - We're always here for you!</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Transportation */}
            <Card className="p-6 shadow-soft">
              <h3 className="text-xl font-bold text-foreground mb-4">How to Get Here</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Plane className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">From Airport</p>
                    <p className="text-muted-foreground text-sm">Take Airport Express Line to Central Station (25 min), then Bus #42 to Backpacker Street (10 min). Total: 35 minutes, $8</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Train className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">From Train Station</p>
                    <p className="text-muted-foreground text-sm">Walk 8 minutes north on Main Street, turn right on Backpacker Street. We're the colorful building on the left!</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Car className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">By Car</p>
                    <p className="text-muted-foreground text-sm">Free parking available! Enter our address in GPS: "123 Backpacker Street". Parking entrance on the side street.</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Map Placeholder */}
            <Card className="p-6 shadow-soft">
              <h3 className="text-xl font-bold text-foreground mb-4">Location</h3>
              <div className="bg-muted rounded-lg h-48 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Interactive Map</p>
                  <p className="text-sm text-muted-foreground">123 Backpacker Street</p>
                </div>
              </div>
            </Card>

            {/* Emergency Contact */}
            <Card className="p-6 shadow-soft bg-destructive/5 border-destructive/20">
              <h3 className="text-lg font-bold text-foreground mb-2">Emergency Contact</h3>
              <p className="text-sm text-muted-foreground mb-2">
                For urgent matters outside reception hours:
              </p>
              <p className="font-medium text-foreground">+1 (555) 999-HELP</p>
              <p className="text-xs text-muted-foreground mt-2">
                Available 24/7 for emergencies only
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;