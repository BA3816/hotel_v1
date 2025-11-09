import { useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Lock, Loader2, Mail, UserPlus } from "lucide-react";
import axiosClient from "../../api/axios";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const AdminRegister = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/admin"); // redirect if already logged in
        }
    }, [navigate]);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent multiple submissions
        if (isLoading) return;

        // Validate password confirmation
        if (formData.password !== formData.password_confirmation) {
            toast.error("Passwords do not match");
            return;
        }

        // Validate password length
        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        setIsLoading(true);

        try {
            // Make registration request
            console.log("Making registration request...");
            const response = await axiosClient.post("/api/auth/register", {
                username: formData.email, // Use email as username
                email: formData.email,
                password: formData.password,
                full_name: formData.name
            });

            console.log("✅ Registration success:", response.data);

            // Save token and user data
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                toast.success("Registration completed successfully!");
                navigate("/admin");
            } else {
                throw new Error("No token received from server");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(
                    "❌ Registration failed:",
                    error.response?.data || error.message
                );
                
                // Handle validation errors
                if (error.response?.status === 422) {
                    const errors = error.response.data.errors;
                    if (errors) {
                        Object.entries(errors).forEach(([field, messages]) => {
                            if (Array.isArray(messages)) {
                                messages.forEach((message) => {
                                    toast.error(`${field}: ${message}`);
                                });
                            }
                        });
                    }
                } else {
                    toast.error(
                        error.response?.data?.message || 
                        error.response?.data?.error || 
                        "Registration failed, please try again!"
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
                        Admin Registration
                    </p>
                </div>

                {/* Registration Card */}
                <Card className="p-8 shadow-elegant border-border/50">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            Create Admin Account
                        </h1>
                        <p className="text-muted-foreground">
                            Register to access the admin dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-foreground">
                                Full Name
                            </Label>
                            <div className="relative">
                                <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="pl-10 border-border/50 focus:border-primary"
                                    required
                                />
                            </div>
                        </div>

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
                                    placeholder="Enter your email address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="pl-10 border-border/50 focus:border-primary"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password (min. 8 characters)"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="pl-10 pr-10 border-border/50 focus:border-primary"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
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

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation" className="text-foreground">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    value={formData.password_confirmation}
                                    onChange={handleInputChange}
                                    className="pl-10 pr-10 border-border/50 focus:border-primary"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="flex items-start space-x-2 text-sm">
                            <input
                                type="checkbox"
                                id="terms"
                                className="rounded border-border/50 text-primary focus:ring-primary/20 mt-0.5"
                                required
                            />
                            <label htmlFor="terms" className="text-muted-foreground cursor-pointer">
                                I accept the{" "}
                                <Link
                                    to="/terms"
                                    className="text-primary hover:text-primary/80 transition-colors"
                                >
                                    Terms and Conditions
                                </Link>{" "}
                                and{" "}
                                <Link
                                    to="/privacy"
                                    className="text-primary hover:text-primary/80 transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        {/* Register Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Registering...
                                </>
                            ) : (
                                "Register"
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

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                                >
                                    Sign in here
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

export default AdminRegister;
