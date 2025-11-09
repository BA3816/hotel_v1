import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import axiosClient from "../api/axios";
import { toast } from "sonner";

const VisitorForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isLoading) return;
        
        setIsLoading(true);

        try {
            const response = await axiosClient.post("/api/visitor/forgot-password", {
                email: email
            });

            if (response.data.success) {
                setIsSubmitted(true);
                toast.success("Password reset link sent to your email!");
            } else {
                toast.error(response.data.message || "Failed to send reset link");
            }
        } catch (error: unknown) {
            console.error("Forgot password error:", error);
            
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } } };
                if (axiosError.response?.status === 422) {
                    const errors = axiosError.response.data?.errors;
                    const errorMessage = errors ? Object.values(errors).flat().join(', ') : 'Validation failed';
                    toast.error(errorMessage);
                } else {
                    toast.error(
                        axiosError.response?.data?.message || 
                        "Failed to send reset link. Please try again."
                    );
                }
            } else {
                toast.error("Failed to send reset link. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
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
                            Password Reset
                        </p>
                    </div>

                    {/* Success Card */}
                    <Card className="p-8 shadow-elegant border-border/50">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            
                            <h1 className="text-2xl font-bold text-foreground mb-4">
                                Check Your Email
                            </h1>
                            
                            <p className="text-muted-foreground mb-6">
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                            
                            <p className="text-sm text-muted-foreground mb-6">
                                Please check your email and click the link to reset your password. 
                                The link will expire in 1 hour.
                            </p>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        setEmail("");
                                    }}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Send Another Email
                                </Button>
                                
                                <Link
                                    to="/visitor/login"
                                    className="block w-full"
                                >
                                    <Button variant="outline" className="w-full">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <p className="text-sm text-muted-foreground">
                            Didn't receive the email? Check your spam folder or{" "}
                            <button
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setEmail("");
                                }}
                                className="text-primary hover:text-primary/80 transition-colors"
                            >
                                try again
                            </button>
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
                        Reset Your Password
                    </p>
                </div>

                {/* Forgot Password Card */}
                <Card className="p-8 shadow-elegant border-border/50">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-muted-foreground">
                            Enter your email address and we'll send you a link to reset your password.
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
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 border-border/50 focus:border-primary"
                                    required
                                />
                            </div>
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
                                    Sending Reset Link...
                                </>
                            ) : (
                                "Send Reset Link"
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

export default VisitorForgotPassword;
