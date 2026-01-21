import { useState } from "react";
import { axiosClient } from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import GlassSelect from "./GlassSelect";
import { User, Mail, Lock, Phone, Building, Briefcase, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    unitId: "",
    role: "employee",
    department: "",
    adminCode: "",
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  /* ---------------- CONSTANT DATA ---------------- */

  const UNITS = [
    { id: 1, name: "Neotia Getwel Multispecialty Hospital - Siliguri" },
    { id: 2, name: "Neotia Bhagirathi Women & Child Care Center - Rawdon Street" },
    { id: 3, name: "Neotia Bhagirathi Women & Child Care Center - New Town" },
    { id: 4, name: "Neotia Bhagirathi Woman and Child Care Centre – Guwahati" },
    { id: 5, name: "Neotia Bhagirathi Woman and Child Care Centre – Raipur" },
  ];

  const DEPARTMENTS = [
    "Emergency",
    "ICU",
    "Operation Theatre",
    "Radiology",
    "Pathology",
    "Pharmacy",
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Gynecology",
    "Orthopedics",
    "Administration",
    "Maintenance",
    "Housekeeping",
    "IT Support",
  ];

  const ROLES = ["admin", "manager", "employee"];

  const isAdmin = form.role === "admin";

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateField = (name: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required");
      return;
    }

    if (!form.department) {
      setError("Department is required");
      return;
    }

    // Only admin can skip unit
    if (!isAdmin && !form.unitId) {
      setError("Unit is required");
      return;
    }

    try {
      setLoading(true);

      await axiosClient.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
        department: form.department,
        unitId: isAdmin ? null : Number(form.unitId),
        adminCode:
          form.role === "admin" || form.role === "manager"
            ? form.adminCode
            : null,
      });

      setSuccess("Registration successful! Redirecting...");

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-white to-blue-300 flex items-center justify-center p-2 md:p-2"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      <div className="max-w-xl w-full flex justify-center flex-col space-y-2 md:space-y-4">

        {/* Hospital Logos */}
        <div className="text-center space-y-1">
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

        {/* Register Form - Textured Glassmorphism Card */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-2xl md:rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] hover:shadow-[0_8px_40px_0_rgba(31,38,135,0.3)] transition-all duration-300 p-5 md:p-6 relative overflow-hidden">
          {/* Glass texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-50 pointer-events-none rounded-2xl md:rounded-3xl"></div>

          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl md:rounded-3xl mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
          ></div>

          {/* Content wrapper */}
          <div className="relative z-10">
            <h2 className="text-xl md:text-2xl text-center font-bold text-[#303036] mb-2 md:mb-2">Create Account</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div className="relative">
                <User className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl w-full bg-white/60 transition-all duration-200 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
                />
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Email */}
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl w-full bg-white/60 transition-all duration-200 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <Phone className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl w-full bg-white/60 transition-all duration-200 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
                  />
                </div>
              </div>

              {/* Password & Role Row */}
              <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-3">
                {/* Password */}
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="pl-10 pr-12 py-3 border border-gray-300 rounded-xl w-full bg-white/60 transition-all duration-200 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Role */}
                <GlassSelect
                  value={form.role}
                  onChange={(val) => updateField("role", val)}
                  options={ROLES.map((r) => ({
                    label: r.charAt(0).toUpperCase() + r.slice(1),
                    value: r,
                  }))}
                  icon={<ShieldCheck className="w-5 h-5 text-gray-500" />}
                  placeholder="Role"
                />
              </div>

              {/* Unit & Department Row */}
              <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-3">
                {/* Unit */}
                <GlassSelect
                  value={form.unitId}
                  onChange={(val) => updateField("unitId", val)}
                  options={UNITS.map((u) => ({
                    label: u.name,
                    value: u.id,
                  }))}
                  icon={<Building className="w-5 h-5 text-gray-500" />}
                  disabled={isAdmin}
                  placeholder="Unit"
                />

                {/* Department */}
                <GlassSelect
                  value={form.department}
                  onChange={(val) => updateField("department", val)}
                  options={DEPARTMENTS.map((d) => ({ label: d, value: d }))}
                  icon={<Briefcase className="w-5 h-5 text-gray-500" />}
                  placeholder="Dept"
                />
              </div>

              {/* Admin Code */}
              {(form.role === "admin" || form.role === "manager") && (
                <div className="relative animate-fadeIn">
                  <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    name="adminCode"
                    placeholder="Admin Code *"
                    type="password"
                    value={form.adminCode}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl w-full bg-white/60 transition-all duration-200 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
                  />
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    Required for admin & manager roles
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] disabled:from-[#93C5FD] disabled:to-[#60A5FA] text-white font-semibold py-3 md:py-3.5 rounded-xl shadow-[0_2px_8px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] transition-all duration-200"
              >
                {loading ? "Creating Account..." : "Register"}
              </button>

            </form>

            <div className="mt-2 text-center">
              <p className="text-sm text-[#787880]">
                Already have an account?
              </p>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-2 w-full py-2.5 md:py-3 rounded-xl border border-[#3B82F6]/40 bg-white/40 backdrop-blur-sm text-[#3B82F6] font-semibold hover:bg-[#3B82F6]/10 hover:border-[#3B82F6]/60 transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-0" style={{ fontFamily: 'Inter, sans-serif' }}>
          <p className="text-xs md:text-sm text-[#787880]">
            © 2026 Neotia Getwel Multispecialty Hospital. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
