
import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { axiosClient } from '../api/axiosClient';
import { useNavigate } from "react-router-dom";
interface LoginPageProps {
  onLogin: (user: any) => void;  // updated: backend returns user object
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: "", // backend expects email, not username
    password: "",
  });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!credentials.email.trim()) newErrors.email = "Email is required";
    if (!credentials.password.trim()) {
      newErrors.password = "Password is required";
    } else if (credentials.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const res = await axiosClient.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });

      // Login success → send user object to parent
      onLogin(res.data.user);

    } catch (err: any) {
      console.error(err);

      let message = "Login failed";

      if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      setErrors({ general: message });
    }

    setIsLoading(false);
  };

  const handleChange = (field: keyof typeof credentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    if (errors.general) setErrors(prev => ({ ...prev, general: "" }));
  };

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-white to-blue-300 flex items-center justify-center p-4 md:p-6 lg:p-6"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      <div className="max-w-md w-full flex justify-center flex-col space-y-4 md:space-y-6">

        {/* Hospital Logos */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 md:gap-6">
            <div className='h-9 md:h-16'>
              <img src="https://i.postimg.cc/SQ3Nj54Y/logo-1.png" alt="Ambuja Neotia" className="h-full w-auto object-contain" />
            </div>
            <div className='h-9 md:h-16'>
              <img src="https://i.postimg.cc/Y9XN17Rk/logo-2.png" alt="Park Hospitals" className="h-full w-auto object-contain" />
            </div>
          </div>
          <p className="text-sm md:text-base text-[#787880] font-semibold">Service Management System</p>
        </div>

        {/* Login Form - Textured Glassmorphism Card */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-2xl md:rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] hover:shadow-[0_8px_40px_0_rgba(31,38,135,0.3)] transition-all duration-300 p-5 md:p-8 relative overflow-hidden">
          {/* Glass texture overlay - creates the frosted appearance */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-50 pointer-events-none rounded-2xl md:rounded-3xl"></div>

          {/* Subtle noise/grain texture for realistic glass effect */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl md:rounded-3xl mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
          ></div>

          {/* Content wrapper */}
          <div className="relative z-10">

            <h2 className="text-xl md:text-2xl text-center font-bold text-[#303036] mb-4 md:mb-4">Login</h2>

            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#303036] mb-2">Email</label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={credentials.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className={`pl-10 pr-4 py-3 border rounded-xl w-full bg-white/60 transition-all duration-200 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 ${errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#303036] mb-2">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Enter your password"
                    className={`pl-10 pr-12 py-3 border rounded-xl w-full bg-white/60 transition-all duration-200 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 ${errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] disabled:from-[#93C5FD] disabled:to-[#60A5FA] text-white font-semibold py-3 md:py-3.5 rounded-xl shadow-[0_2px_8px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] transition-all duration-200"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-[#787880]">
                Don’t have an account?
              </p>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="mt-2 w-full py-2.5 md:py-3 rounded-xl border border-[#3B82F6]/40 bg-white/40 backdrop-blur-sm text-[#3B82F6] font-semibold hover:bg-[#3B82F6]/10 hover:border-[#3B82F6]/60 transition-all duration-200"
              >
                Create an account
              </button>
            </div>
          </div>
        </div>
        {/* End of content wrapper and glassmorphism card */}

        <div className="text-center mt-6 md:mt-8" style={{ fontFamily: 'Inter, sans-serif' }}>
          <p className="text-xs md:text-sm text-[#787880]">
            © 2026 Neotia Getwel Multispecialty Hospital. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


