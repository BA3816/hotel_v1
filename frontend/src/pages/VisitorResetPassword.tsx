import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import axiosClient from "../api/axios";
import { toast } from "sonner";

const VisitorResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        email: "",
        token: "",
        password: "",
        password_confirmation: ""
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const email = searchParams.get('email');
        const token = searchParams.get('token');
        
        if (email && token) {
            setFormData(prev => ({
                ...prev,
                email,
                token
            }));
        } else {
            toast.error("Invalid reset link. Please request a new password reset.");
            navigate("/visitor/forgot-password");
        }
    }, [searchParams, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isLoading) return;
        
        if (formData.password !== formData.password_confirmation) {
            toast.error("Passwords do not match");
            return;
        }
        
        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }
        
        setIsLoading(true);

        try {
            const response = await axiosClient.post("/api/visitor/reset-password", formData);

            if (response.data.success) {
                setIsSuccess(true);
                toast.success("Password reset successfully!");
            } else {
                toast.error(response.data.message || "Failed to reset password");
            }
        } catch (error: unknown) {
            console.error("Reset password error:", error);
            
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } } };
                if (axiosError.response?.status === 422) {
                    const errors = axiosError.response.data?.errors;
                    const errorMessage = errors ? Object.values(errors).flat().join(', ') : 'Validation failed';
                    toast.error(errorMessage);
                } else {
                    toast.error(
                        axiosError.response?.data?.message || 
                        "Failed to reset password. Please try again."
                    );
                }
            } else {
                toast.error("Failed to reset password. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (isSuccess) {
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
                            Password Reset Complete
                        </p>
                    </div>

                    {/* Success Card */}
                    <Card className="p-8 shadow-elegant border-border/50">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            
                            <h1 className="text-2xl font-bold text-foreground mb-4">
                                Password Reset Successfully!
                            </h1>
                            
                            <p className="text-muted-foreground mb-6">
                                Your password has been updated. You can now sign in with your new password.
                            </p>

                            <Link to="/visitor/login" className="block">
                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                                    Continue to Login
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <p className="text-sm text-muted-foreground">
                            Having trouble?{" "}
                            <Link
                                to="/contact"
                                className="text-primary hover:text-primary/80 transition-colors"
                            >
                                Contact support
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

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
                        Set New Password
                    </p>
                </div>

                {/* Reset Password Card */}
                <Card className="p-8 shadow-elegant border-border/50">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            Reset Your Password
                        </h1>
                        <p className="text-muted-foreground">
                            Enter your new password below.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground">
                                New Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your new password"
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
                                Confirm New Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your new password"
                                    value={formData.password_confirmation}
                                    onChange={handleInputChange}
                                    className="pl-10 pr-10 border-border/50 focus:border-primary"
                                    required
                                    minLength={8}
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

                        {/* Password Requirements */}
                        <div className="text-sm text-muted-foreground">
                            <p className="mb-1">Password requirements:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>At least 8 characters long</li>
                                <li>Must match confirmation</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting Password...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>

                        {/* Back to Login */}
                        <div className="text-center">
                            <Link
                                to="/visitor/login"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </Card>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground">
                        Remember your password?{" "}
                        <Link
                            to="/visitor/login"
                            className="text-primary hover:text-primary/80 transition-colors"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VisitorResetPassword;
