import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Bed,
  CreditCard,
  BarChart3,
  Settings,
  Home,
  Gift,
  LogOut,
  Activity,
} from "lucide-react";
import axiosClient from "../api/axios";
import NotificationBell from "./NotificationBell";
import { useBookingNotifications } from "../hooks/useBookingNotifications";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name?: string; email?: string }>({});
  
  // Enable booking notifications
  useBookingNotifications();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axiosClient
        .get("/api/auth/verify")
        .then((response) => {
          if (response.data.success) {
            setUser(response.data.user);
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          // If 401, the interceptor will handle logout
        });
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API to invalidate token on server (if exists)
      await axiosClient.post("/api/auth/logout").catch(() => {
        // Ignore errors if endpoint doesn't exist
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // All admins have access to everything - no filtering needed
  const sidebarItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
    { href: "/admin/bookings", label: "Bookings", icon: Calendar },
    { href: "/admin/guests", label: "Guests", icon: Users },
    { href: "/admin/rooms", label: "Rooms", icon: Bed },
    { href: "/admin/activities", label: "Activities", icon: Activity },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/offers", label: "Group Offers", icon: Gift },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="bg-sidebar border-r border-sidebar-border h-screen w-64 fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Home className="w-6 h-6 text-sidebar-primary" />
            <span className="text-xl font-bold text-sidebar-foreground">
              Happy Hostel
            </span>
          </Link>
          <NotificationBell />
        </div>
        <p className="text-sm text-sidebar-foreground/60 mt-1">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="space-y-1 px-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-6 left-3 right-3">
        {/* User Info - Clickable Profile */}
        <Link
          to="/admin/settings?tab=profile"
          className="block mb-4 rounded-xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {(user.name || user.email || "A").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.name || user.email || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email || "admin@example.com"}
              </p>
            </div>
          </div>
        </Link>

        {/* User Actions */}
        <div className="space-y-1">
          {/* Settings */}
          <Link
            to="/admin/settings"
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              location.pathname.startsWith("/admin/settings")
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-800 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;

