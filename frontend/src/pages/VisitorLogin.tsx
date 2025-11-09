import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Lock, Loader2, Mail } from "lucide-react";
import axiosClient from "../api/axios";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const VisitorLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("visitor_token");
        if (token) {
            // Redirect to visitor dashboard
            const from = location.state?.from || "/visitor/dashboard";
            navigate(from, { replace: true });
        }
    }, [navigate, location.state]);

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent multiple submissions
        if (isLoading) return;

        setIsLoading(true);

        console.log("Form Data:", formData);

        try {
            // Make visitor login request
            console.log("Making visitor login request...");
            const response = await axiosClient.post("/api/visitor/login", {
                email: formData.email,
                password: formData.password
            });
            console.log("✅ Visitor login success:", response.data);

            // Save token and user data
            if (response.data.token) {
                // Clear any admin tokens to avoid conflicts
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                
                // Set visitor token and data
                localStorage.setItem("visitor_token", response.data.token);
                localStorage.setItem("visitor", JSON.stringify(response.data.visitor));
                
                // Show success message
                toast.success("Login successful! Redirecting to dashboard...");
                
                // Redirect to visitor dashboard (not admin dashboard)
                const from = location.state?.from || "/visitor/dashboard";
                navigate(from, { replace: true });
            } else {
                throw new Error("No token received from server");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(
                    "❌ Visitor login failed:",
                    error.response?.data || error.message
                );
                
                // Handle validation errors
                if (error.response?.status === 422) {
                    const errors = error.response.data.errors;
                    const errorMessage = Object.values(errors).flat().join(', ');
                    toast.error(errorMessage);
                } else {
                    toast.error(
                        error.response?.data?.message || 
                        error.response?.data?.error || 
                        "Login failed, please try again!"
                    );
                }
            } else {
                console.error("❌ Unexpected error:", error);
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link
                        to="/"
                        className="text-3xl font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                        Happy Hostel
                    </Link>
                    <p className="text-muted-foreground mt-2">
                        Visitor Booking Access
                    </p>
                </div>

                {/* Login Card */}
                <Card className="p-8 shadow-elegant border-border/50">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            Check Your Booking
                        </h1>
                        <p className="text-muted-foreground">
                            Sign in to view your booking details and status
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="pl-10 border-border/50 focus:border-primary"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="text-foreground"
                            >
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="pl-10 pr-10 border-border/50 focus:border-primary"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded border-border/50 text-primary focus:ring-primary/20"
                                />
                                <span className="text-muted-foreground">
                                    Remember me
                                </span>
                            </label>
                            <Link
                                to="/visitor/forgot-password"
                                className="text-primary hover:text-primary/80 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Login Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/30" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Or
                                </span>
                            </div>
                        </div>

                        {/* Register Link */}
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <Link
                                    to="/visitor/register"
                                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                                >
                                    Register here
                                </Link>
                            </p>
                        </div>

                        {/* Back to Website */}
                        <div className="text-center">
                            <Link
                                to="/"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                ← Back to Happy Hostel website
                            </Link>
                        </div>
                    </form>
                </Card>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground">
                        Need help? Contact{" "}
                        <Link
                            to="/contact"
                            className="text-primary hover:text-primary/80 transition-colors"
                        >
                            support
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VisitorLogin;

