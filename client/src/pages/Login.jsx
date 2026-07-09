import { useState } from "react";
import { Star, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { assets } from "../assets/assets";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
        setSuccess("Success! Logging in...");
      } else {
        await register(username, email, password);
        setSuccess("Registration successful! You can now log in.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Background Image */}
      <img
        src={assets.bgImage}
        alt=""
        className="absolute top-0 left-0 -z-10 w-full h-full object-cover"
      />

      {/* Left Side : Branding */}
      <div className="flex-1 flex flex-col items-start justify-center p-6 md:p-10 lg:pl-40 relative">
        <img
          src={assets.logo1}
          alt="Smedia Logo"
          className="h-16 md:h-20 object-contain absolute top-6 left-6 md:top-10 md:left-10 lg:left-40"
        />
        <div className="mt-16 md:mt-0">
          <div className="flex items-center gap-3 mb-4">
            <img src={assets.group_users} alt="Users Group" className="h-8 md:h-10" />
            <div>
              <div className="flex">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 text-amber-500 fill-amber-500"
                    />
                  ))}
              </div>
              <p className="text-sm text-indigo-950 font-medium">Used By 18k+ Developers</p>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl pb-2 font-extrabold text-indigo-950 leading-tight">
            It is a great place<br />to Connect
          </h1>
          <p className="text-lg md:text-2xl text-indigo-900 max-w-md font-normal mt-2 leading-relaxed">
            Connect with people around the world on Smedia
          </p>
        </div>
      </div>

      {/* Right Side : Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 z-10">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? "Welcome Back!" : "Get Started"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isLogin
                ? "Enter your details to access your account"
                : "Create a free account to join the community"}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-600 text-sm px-4 py-3 rounded-xl border border-emerald-100">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username for Signup */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 pl-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <User className="size-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="john_doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 pl-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Mail className="size-4.5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 pl-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Lock className="size-4.5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="size-4.5" />
                  ) : (
                    <Eye className="size-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-100 pt-4 mt-2">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
              }}
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {isLogin ? "Create one" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
