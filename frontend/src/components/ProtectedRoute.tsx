import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import axiosClient from '../api/axios';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          // No token, redirect to login
          navigate("/login", { 
            state: { from: location.pathname },
            replace: true 
          });
          return;
        }

        // Verify token with backend
        try {
          const response = await axiosClient.get("/api/auth/verify");
          if (response.data.success) {
            setIsAuthenticated(true);
          } else {
            throw new Error("Invalid response");
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          // Token is invalid, clear it and redirect
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { 
            state: { from: location.pathname },
            replace: true 
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Network error or other issue, clear token and redirect
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { 
          state: { from: location.pathname },
          replace: true 
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
};

export default ProtectedRoute;

