import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  Home,
  Package,
  Settings,
  Ticket,
  LogOut,
} from "lucide-react";
import UserProfileCard from "./UserProfileCard";

const Sidebar = ({ onLogout, user }: { onLogout: () => void; user: any }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // ⭐ THE FIX — always read unitId from URL
  const { unitId } = useParams();

  // If unitId missing, block sidebar navigation
  const safeUnitId = unitId ?? "0";

  const menuItems = [
    { key: "tickets", label: "Dashboard", icon: Home },
    { key: "review", label: "Review Ticket", icon: Ticket },
    { key: "equipments", label: "Equipment", icon: Package },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  const handleNavClick = (key: string) => {
    navigate(`/unit/${safeUnitId}/${key}`);
  };

  return (
    <div className="bg-[#F6F8FA] fixed left-0 top-0 w-[280px] h-screen p-6 flex flex-col z-50 transition-all duration-300 shadow-xl">

      {/* Header / Logo */}
      <div className="relative z-10 flex items-center justify-center mb-10 mt-4">
        <img
          src="https://i.postimg.cc/SQ3Nj54Y/logo-1.png"
          className="h-20 w-auto object-contain"
          alt="Ambuja Neotia"
        />
      </div>

      <nav className="space-y-2 flex-1 relative z-10">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-4 font-sans">Menu</p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.key);

          return (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "" : "group-hover:text-slate-600"}`}
              />
              <span className="font-semibold tracking-wide text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="relative z-10 mt-auto mb-3">
        <UserProfileCard user={user} />
      </div>

      {/* Logout Button */}
      <div className="relative z-10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
