// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
// import { login as loginAPI } from '../api/auth';
// import toast from 'react-hot-toast';
// import { LogIn } from 'lucide-react';

// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [loading, setLoading] = useState(false);
//     const { login, isAuthenticated } = useAuth();
//     const navigate = useNavigate();

//     // Redirect to dashboard if already authenticated
//     useEffect(() => {
//         if (isAuthenticated()) {
//             navigate('/dashboard', { replace: true });
//         }
//     }, [isAuthenticated, navigate]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             const response = await loginAPI(email, password);
//             login(response.data, response.data.token);
//             toast.success('Login successful!');
//             // Redirect to dashboard after successful login
//             navigate('/dashboard', { replace: true });
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Login failed');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center p-4">
//             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 border border-gray-100">
//                 {/* Logo */}
//                 <div className="flex justify-center mb-8">
//                     <div className="relative">
//                         <img
//                             src="/logo.jpg"
//                             alt="mSana Logo"
//                             className="w-28 h-28 rounded-2xl shadow-xl ring-4 ring-primary-100"
//                         />
//                         <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
//                     </div>
//                 </div>

//                 {/* Title */}
//                 <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
//                     Welcome Back
//                 </h1>
//                 <p className="text-center text-gray-600 mb-10 text-lg font-medium">
//                     Sign in to mSana Billing System
//                 </p>

//                 {/* Form */}
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div>
//                         <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
//                             Email Address
//                         </label>
//                         <input
//                             id="email"
//                             type="email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             required
//                             className="input"
//                             placeholder="Enter your email"
//                         />
//                     </div>

//                     <div>
//                         <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
//                             Password
//                         </label>
//                         <input
//                             id="password"
//                             type="password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             required
//                             className="input"
//                             placeholder="Enter your password"
//                         />
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="btn btn-primary w-full flex items-center justify-center space-x-2 py-3 text-lg"
//                     >
//                         {loading ? (
//                             <div className="spinner border-white"></div>
//                         ) : (
//                             <>
//                                 <LogIn size={22} />
//                                 <span>Sign In</span>
//                             </>
//                         )}
//                     </button>
//                 </form>

//                 {/* Demo credentials */}
//                 {/* <div className="mt-8 p-5 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
//                     <p className="text-xs font-semibold text-primary-900 text-center mb-3 uppercase tracking-wide">
//                         Demo Credentials
//                     </p>
//                     <div className="space-y-2">
//                         <p className="text-sm text-primary-800 text-center font-medium">
//                             <span className="font-bold">Admin:</span> admin@msana.com / admin123
//                         </p>
//                         <p className="text-sm text-primary-800 text-center font-medium">
//                             <span className="font-bold">Staff:</span> staff@msana.com / staff123
//                         </p>
//                     </div>
//                 </div> */}

//             </div>
//         </div>
//     );
// };

// export default Login;
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

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 🔍 Validation function
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
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 border border-gray-100">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logo.jpg"
            alt="mSana Logo"
            className="w-28 h-28 rounded-2xl shadow-xl ring-4 ring-primary-100"
          />
        </div>

        <h1 className="text-4xl font-bold text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sign in to mSana Billing System
        </p>

        {/* Form */}
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
              className={`input ${errors.email ? "border-red-500" : ""}`}
              placeholder="Enter your email"
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
                className={`input pr-10 ${errors.password ? "border-red-500" : ""}`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 text-lg disabled:opacity-50"
          >
            {loading ? "Logging in..." : <>
              <LogIn size={22} />
              Sign In
            </>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
