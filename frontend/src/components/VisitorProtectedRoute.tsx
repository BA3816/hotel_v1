import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface VisitorProtectedRouteProps {
  children: React.ReactNode;
}

const VisitorProtectedRoute = ({ children }: VisitorProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("visitor_token");
        
        if (!token) {
          // No token, redirect to visitor login
          navigate("/visitor/login", { 
            state: { from: location.pathname },
            replace: true 
          });
          setIsLoading(false);
          return;
        }

        // For now, just check if token exists
        // In the future, you can add backend verification here
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Visitor auth check failed:", error);
        // Clear token and redirect
        localStorage.removeItem("visitor_token");
        localStorage.removeItem("visitor");
        navigate("/visitor/login", { 
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

export default VisitorProtectedRoute;

