import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, Globe, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            About Happy Hostel
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Founded in 2018, Happy Hostel has welcomed thousands of travelers from over 80 countries. 
            We're more than just accommodation – we're a community.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Happy Hostel was born from a simple idea: travel should bring people together. 
                Our founders, Maria and James, were backpackers who experienced the magic of hostels 
                around the world and wanted to create something special in their own city.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                What started as a small 20-bed hostel has grown into a vibrant community space 
                where solo travelers find their tribe, couples create memories, and groups 
                discover the joy of shared experiences.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Family-Owned</Badge>
                <Badge variant="secondary">Eco-Friendly</Badge>
                <Badge variant="secondary">Community-Focused</Badge>
                <Badge variant="secondary">Award-Winning</Badge>
              </div>
            </div>
            <div className="space-y-6">
              <Card className="p-6 shadow-soft">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">10,000+ Happy Guests</h3>
                </div>
                <p className="text-muted-foreground">
                  Travelers from around the world have made Happy Hostel their home base.
                </p>
              </Card>
              
              <Card className="p-6 shadow-soft">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">80+ Countries</h3>
                </div>
                <p className="text-muted-foreground">
                  Our diverse community represents cultures from every continent.
                </p>
              </Card>

              <Card className="p-6 shadow-soft">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Best Hostel 2023</h3>
                </div>
                <p className="text-muted-foreground">
                  Recognized by Travel Awards for outstanding hospitality and community.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center shadow-soft">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Community</h3>
              <p className="text-muted-foreground">
                We believe in the power of human connection and creating spaces where 
                friendships flourish and memories are made.
              </p>
            </Card>

            <Card className="p-8 text-center shadow-soft">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Sustainability</h3>
              <p className="text-muted-foreground">
                We're committed to responsible travel and reducing our environmental 
                impact through eco-friendly practices.
              </p>
            </Card>

            <Card className="p-8 text-center shadow-soft">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Inclusivity</h3>
              <p className="text-muted-foreground">
                Happy Hostel welcomes everyone. We celebrate diversity and ensure 
                all guests feel safe, respected, and valued.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Maria Rodriguez", role: "Co-Founder & Manager", bio: "Travel enthusiast with 15+ years in hospitality." },
              { name: "James Chen", role: "Co-Founder & Operations", bio: "Former backpacker turned hostel entrepreneur." },
              { name: "Sophie Williams", role: "Community Coordinator", bio: "Creates amazing experiences for our guests daily." },
              { name: "Alex Thompson", role: "Night Manager", bio: "Ensures everyone feels safe and welcome 24/7." },
              { name: "Luna Garcia", role: "Activities Coordinator", bio: "Organizes tours and events that bring people together." },
              { name: "David Kim", role: "Maintenance Manager", bio: "Keeps our facilities in perfect condition." },
            ].map((member) => (
              <Card key={member.name} className="p-6 text-center shadow-soft">
                <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;