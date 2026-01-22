import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  Home,
  Package,
  Settings,
  Ticket,
  LogOut,
} from "lucide-react";

const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
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
    <div className="bg-slate-900/95 backdrop-blur-xl fixed left-0 top-0 text-white w-[280px] h-screen p-6 flex flex-col border-r border-slate-700/50 shadow-2xl z-50 transition-all duration-300">

      {/* Decorative Gradient Blob */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header / Logo */}
      <div className="relative z-10 flex items-center justify-center mb-10 mt-4">
        <img
          src="https://i.postimg.cc/SQ3Nj54Y/logo-1.png"
          className="h-24 w-auto object-contain brightness-0 invert"
          alt="Logo"
        />
      </div>

      <nav className="space-y-2 flex-1 relative z-10">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4 font-mono">Menu</p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.key);

          return (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 border ${isActive
                ? "bg-blue-600 shadow-[0_4px_20px_rgba(37,99,235,0.3)] border-blue-500 text-white translate-x-1"
                : "bg-transparent border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
              />
              <span className="font-medium tracking-wide">{item.label}</span>


            </button>
          );
        })}
      </nav>

      <div className="relative z-10 pt-6 mt-auto border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all duration-200 group"
        >
          <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-red-500/20 transition-colors">
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
          <span className="font-medium text-red-500">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
