import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import * as Yup from "yup";

// Components
import Error from "./error";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

// Hooks & API
import useFetch from "@/hooks/use-fetch";
import { signup } from "@/db/apiAuth";

// ===== CONSTANTS =====
const FORM_VALIDATION_SCHEMA = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  profile_pic: Yup.mixed().required("Profile picture is required"),
});

const INITIAL_FORM_DATA = {
  name: "",
  email: "",
  password: "",
  profile_pic: null,
};

// ===== COMPONENT =====
const Signup = () => {
  const [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");
  const navigate = useNavigate();

  // State management
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [userAlreadyExists, setUserAlreadyExists] = useState(false);

  const { loading, error, fn: fnSignup, data } = useFetch(signup, formData);

  // ===== EVENT HANDLERS =====
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSignup = async () => {
    setErrors({});
    setShowVerificationMessage(false);
    setUserAlreadyExists(false);
    
    try {
      await FORM_VALIDATION_SCHEMA.validate(formData, { abortEarly: false });
      await fnSignup();
    } catch (validationError) {
      const newErrors = {};
      
      if (validationError?.inner) {
        // Validation errors from Yup
        validationError.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        // API errors from Supabase
        const errorMessage = validationError.message || "";
        
        // Check if user already exists
        if (errorMessage.includes("User already registered") || 
            errorMessage.includes("already registered") ||
            errorMessage.includes("email already exists") ||
            errorMessage.includes("already taken")) {
          setUserAlreadyExists(true);
        } else {
          setErrors({ api: errorMessage });
        }
      }
    }
  };

  // ===== EFFECTS =====

  useEffect(() => {
    if (error === null && data) {
      // Show verification message instead of immediate redirect
      setShowVerificationMessage(true);
      
      // Optional: Auto redirect after showing message for a few seconds
      setTimeout(() => {
        navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
      }, 5000);
    } else if (error) {
      // Handle API errors from useFetch
      const errorMessage = error.message || "";
      
      if (errorMessage.includes("User already registered") || 
          errorMessage.includes("already registered") ||
          errorMessage.includes("email already exists") ||
          errorMessage.includes("already taken")) {
        setUserAlreadyExists(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, loading, data]);

  // ===== RENDER =====
  // Show message when user already exists
  if (userAlreadyExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-orange-600">⚠️ Account Already Exists</CardTitle>
          <CardDescription>
            An account with this email already exists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">
              📧 Email already registered
            </h3>
            <p className="text-orange-700 text-sm">
              The email <strong>{formData.email}</strong> is already associated with an account.
            </p>
            <p className="text-orange-600 text-sm mt-2">
              Please use a different email address or sign in to your existing account.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700 text-sm">
              <strong>💡 What you can do:</strong>
            </p>
            <ul className="text-blue-600 text-sm mt-2 space-y-1">
              <li>• Try signing in with your existing account</li>
              <li>• Use a different email address</li>
              <li>• Reset your password if you forgot it</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={() => navigate('/auth')} 
            className="w-full"
          >
            Sign In Instead
          </Button>
          <Button 
            onClick={() => {
              setUserAlreadyExists(false);
              setFormData(INITIAL_FORM_DATA);
              setErrors({});
            }} 
            variant="outline" 
            className="w-full"
          >
            Try Different Email
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Show verification message after successful registration
  if (showVerificationMessage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">✅ Registration Successful!</CardTitle>
          <CardDescription>
            Your account has been created successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success Alert */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="ml-3 text-sm font-medium text-green-800">
                Account Created Successfully!
              </h3>
            </div>
            <p className="text-green-700 text-sm">
              Welcome to URLzhourt! Your account has been set up and is ready to use.
            </p>
          </div>

          {/* Email Verification Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              📧 Please verify your email address
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              We&apos;ve sent a verification email to <strong>{formData.email}</strong>
            </p>
            <p className="text-blue-600 text-sm mb-4">
              Please check your inbox and click the verification link to activate your account.
            </p>
            
            {/* Gmail Button */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => window.open('https://gmail.com', '_blank')}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50 border-blue-300 text-blue-700 hover:text-blue-800"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.877.732-1.636 1.636-1.636h.273L12 10.446 21.91 3.82h.273c.904 0 1.637.732 1.637 1.636z"/>
                </svg>
                Open Gmail
              </Button>
              
              <Button 
                onClick={() => window.open(`https://mail.google.com/mail/u/0/#search/from%3Anoreply+${encodeURIComponent(formData.email)}`, '_blank')}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50 border-blue-300 text-blue-700 hover:text-blue-800"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="21 21l-4.35-4.35"/>
                </svg>
                Search Verification Email
              </Button>
            </div>
            
            <p className="text-blue-500 text-xs mt-2">
              💡 Tip: Check your spam folder if you don&apos;t see the email in your inbox
            </p>
          </div>

          {/* Auto Redirect Notice */}
          <div className="text-center bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-gray-600 text-sm">
              🔄 Redirecting to dashboard in 5 seconds...
            </p>
            <p className="text-gray-500 text-xs mt-1">
              You can continue using the app while waiting for email verification
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={() => navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`)}
            className="w-full"
          >
            Continue to Dashboard
          </Button>
          <Button 
            onClick={() => navigate('/auth')} 
            variant="outline" 
            className="w-full"
          >
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && <Error message={error?.message} />}
      
      <div className="space-y-4">
        {/* Name Input */}
        <div className="space-y-2">
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleInputChange}
            className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 ${errors.name ? "border-red-500" : ""}`}
          />
          {errors.name && <Error message={errors.name} />}
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleInputChange}
            className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 ${errors.email ? "border-red-500" : ""}`}
          />
          {errors.email && <Error message={errors.email} />}
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password (min 6 characters)"
            value={formData.password}
            onChange={handleInputChange}
            className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 ${errors.password ? "border-red-500" : ""}`}
          />
          {errors.password && <Error message={errors.password} />}
        </div>

        {/* Profile Picture Input */}
        <div className="space-y-2">
          <input
            id="profile_pic"
            name="profile_pic"
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className={`
              file:mr-4 file:py-2 file:px-4 
              file:rounded-lg file:border-0 
              file:text-sm file:font-semibold 
              file:bg-gray-100 dark:file:bg-gray-700 
              file:text-gray-700 dark:file:text-gray-300
              hover:file:bg-gray-200 dark:hover:file:bg-gray-600
              border rounded-lg p-2 w-full
              bg-white dark:bg-gray-700 
              border-gray-300 dark:border-gray-600
              ${errors.profile_pic ? "border-red-500" : ""}
            `}
          />
          {errors.profile_pic && <Error message={errors.profile_pic} />}
        </div>

        {/* API Error */}
        {errors.api && <Error message={errors.api} />}
      </div>
      
      <Button 
        onClick={handleSignup} 
        disabled={loading}
        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <BeatLoader size={8} color="currentColor" />
            <span>Creating Account...</span>
          </div>
        ) : (
          "Create Account"
        )}
      </Button>
    </div>
  );
};

export default Signup;