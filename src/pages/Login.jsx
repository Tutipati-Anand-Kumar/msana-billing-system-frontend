

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { login as loginAPI } from "../api/auth";
import toast from "react-hot-toast";
import { LogIn, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await loginAPI(email, password);
      login(response.data, response.data.token);
      toast.success("Login successful!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden border">

        {/* LEFT CARD – LOGIN FORM */}
        <div className="p-10 md:p-12">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Welcome Back
          </h1>
          <p className="text-gray-500 mb-8">
            Sign in to your Pharmacy Billing System
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pharmacy.com"
                className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full rounded-xl border px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 text-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Logging in..." : (
                <>
                  <LogIn size={22} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT CARD – BRANDING */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12">
          <img
            src="/logo.jpg"
            alt="Pharmacy Logo"
            className="w-40 h-40 rounded-2xl bg-white p-3 mb-6 shadow-xl hover:scale-110 transition duration-300"
          />
          <h2 className="text-3xl font-bold mb-2">
            mSana Pharmacy
          </h2>
          <p className="text-blue-100 text-center max-w-sm">
            Smart billing, inventory tracking, and secure pharmacy management
            — all in one system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
