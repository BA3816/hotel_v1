import { Link, useNavigate } from 'react-router-dom';
import { Hotel, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { authService } from '@/lib/auth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = authService.isAuthenticated();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Hotel className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">Hotel Booking</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition">Home</Link>
            <Link to="/rooms" className="text-gray-700 hover:text-primary transition">Rooms</Link>
            <Link to="/book" className="text-gray-700 hover:text-primary transition">Book Now</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/admin" className="text-gray-700 hover:text-primary transition">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary transition">Login</Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link to="/" className="block text-gray-700 hover:text-primary">Home</Link>
            <Link to="/rooms" className="block text-gray-700 hover:text-primary">Rooms</Link>
            <Link to="/book" className="block text-gray-700 hover:text-primary">Book Now</Link>
            {isAuthenticated ? (
              <>
                <Link to="/admin" className="block text-gray-700 hover:text-primary">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-gray-700 hover:text-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-primary">Login</Link>
                <Link to="/register" className="block text-gray-700 hover:text-primary">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

