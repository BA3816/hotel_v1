import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Info, Bed, Calendar, BookOpen, MapPin, Settings, Tag, User } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/rooms", label: "Rooms & Booking", icon: Bed },
    { href: "/offers", label: "Special Offers", icon: Tag },
    { href: "/activities", label: "Activities", icon: Calendar },
    { href: "/blog", label: "Blog", icon: BookOpen },
    { href: "/contact", label: "Contact", icon: MapPin },
  ];

  const isAdmin = location.pathname.startsWith("/admin");
  const isVisitor = location.pathname.startsWith("/visitor");
  const visitorToken = localStorage.getItem("visitor_token");

  return (
    <nav className="bg-card border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            Happy Hostel
          </Link>

          {/* Navigation Links - Hidden on small screens */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Action Links */}
          <div className="flex items-center space-x-4">
            {/* Visitor Dashboard Link */}
            {visitorToken ? (
              <Link
                to="/visitor/dashboard"
                className={cn(
                  "hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                  isVisitor 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <User size={16} />
                <span>My Bookings</span>
              </Link>
            ) : (
              <Link
                to="/visitor/login"
                className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <User size={16} />
                <span>Visitor Login</span>
              </Link>
            )}

            {/* Admin Link */}
            <Link
              to="/login"
              className={cn(
                "hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                isAdmin 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Settings size={16} />
              <span>Admin</span>
            </Link>
            
            <Button className="bg-primary hover:bg-primary/90" onClick={() => window.location.href = '/rooms'}>
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

