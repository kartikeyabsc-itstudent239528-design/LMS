// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import { BookOpen, Eye, EyeOff } from "lucide-react";
// import { toast } from "sonner";

// export default function SignupPage() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { signup } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
//     setLoading(true);
//     try {
//       await signup(name, email, password);
//       toast.success("Account created successfully!");
//       navigate("/dashboard");
//     } catch (err: unknown) {
//       toast.error(err instanceof Error ? err.message : "Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center px-6">
//       <div className="w-full max-w-sm fade-up">
//         <div className="mb-8 flex items-center gap-2">
//           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
//             <BookOpen className="h-4 w-4 text-primary-foreground" />
//           </div>
//           <span className="text-lg font-semibold">Library Management System</span>
//         </div>
//         <h2 className="text-2xl font-bold">Create an account</h2>
//         <p className="mt-1 text-sm text-muted-foreground">Start managing your library today</p>

//         <form onSubmit={handleSubmit} className="mt-8 space-y-4">
//           <div>
//             <label className="mb-1.5 block text-sm font-medium">Full Name</label>
//             <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/20" placeholder="Your name" />
//           </div>
//           <div>
//             <label className="mb-1.5 block text-sm font-medium">Email</label>
//             <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/20" placeholder="you@example.com" />
//           </div>
//           <div>
//             <label className="mb-1.5 block text-sm font-medium">Password</label>
//             <div className="relative">
//               <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/20" placeholder="Min. 6 characters" />
//               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
//                 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//               </button>
//             </div>
//           </div>
//           <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50">
//             {loading ? "Creating account..." : "Create account"}
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-muted-foreground">
//           Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
//         </p>
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s'-]+$/.test(name)) return "Name can only contain letters, spaces, hyphens, and apostrophes";
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    
    // Check for at least one number
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    
    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)";
    }
    
    return undefined;
  };

  const handleInputChange = (field: string, value: string) => {
    // Clear error for the field being edited
    setErrors(prev => ({ ...prev, [field]: undefined }));
    
    // Update state based on field
    switch (field) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    const strengthMap: Record<number, { label: string; color: string }> = {
      0: { label: "Very Weak", color: "bg-red-500" },
      1: { label: "Weak", color: "bg-orange-500" },
      2: { label: "Fair", color: "bg-yellow-500" },
      3: { label: "Good", color: "bg-blue-500" },
      4: { label: "Strong", color: "bg-green-500" },
      5: { label: "Very Strong", color: "bg-emerald-500" },
    };
    
    return {
      strength,
      label: strengthMap[strength]?.label || "Very Weak",
      color: strengthMap[strength]?.color || "bg-red-500",
    };
  };

  const passwordStrength = getPasswordStrength(password);
  const showPasswordStrength = password.length > 0;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm fade-up">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Library Management System</span>
        </div>
        <h2 className="text-2xl font-bold">Create an account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Start managing your library today</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {/* Name Field */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/20 ${
                errors.name ? "border-red-500 focus:ring-red-500/20" : ""
              }`}
              placeholder="John Doe"
            />
            {errors.name && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/20 ${
                errors.email ? "border-red-500 focus:ring-red-500/20" : ""
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/20 ${
                  errors.password ? "border-red-500 focus:ring-red-500/20" : ""
                }`}
                placeholder="Min. 8 characters with 1 uppercase, 1 number, 1 special char"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Password requirements list */}
            {password.length > 0 && !errors.password && (
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${password.length >= 8 ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className={password.length >= 8 ? "text-green-600" : "text-gray-500"}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"}>
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${/[a-z]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className={/[a-z]/.test(password) ? "text-green-600" : "text-gray-500"}>
                    One lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${/[0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className={/[0-9]/.test(password) ? "text-green-600" : "text-gray-500"}>
                    One number
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-600" : "text-gray-500"}>
                    One special character
                  </span>
                </div>
              </div>
            )}
            
            {/* Password strength indicator */}
            {showPasswordStrength && (
              <div className="mt-2">
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength.strength >= 4 ? "text-green-600" :
                    passwordStrength.strength >= 3 ? "text-blue-600" :
                    passwordStrength.strength >= 2 ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
            
            {errors.password && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}