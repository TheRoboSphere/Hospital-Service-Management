import { useNavigate } from "react-router-dom";
import { Building2, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { axiosClient } from "../api/axiosClient";

interface Unit {
  id: number;
  name: string;
}

const SelectUnitPage = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    axiosClient.get("/units")
      .then(res => setUnits(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSelect = (unitId: number) => {
    navigate(`/unit/${unitId}/tickets`);
  };

  return (
    <div
      className="min-h-screen lg:h-screen w-full bg-gradient-to-br from-blue-100 via-white to-blue-300 flex items-center justify-center p-2 md:p-4 lg:overflow-hidden overflow-y-auto"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      <div className="max-w-4xl lg:max-w-6xl w-full flex flex-col lg:max-h-screen h-auto">

        {/* Hospital Logos - Compact */}
        <div className="text-center mb-4 shrink-0">
          <div className="flex items-center justify-center gap-4">
            <div className='h-10 md:h-14 transition-all duration-300'>
              <img src="https://i.postimg.cc/SQ3Nj54Y/logo-1.png" alt="Ambuja Neotia" className="h-full w-auto object-contain" />
            </div>
            <div className='h-10 md:h-14 transition-all duration-300'>
              <img src="https://i.postimg.cc/Y9XN17Rk/logo-2.png" alt="Park Hospitals" className="h-full w-auto object-contain" />
            </div>
          </div>
          <p className="text-xs md:text-sm text-[#787880] font-bold mt-2 uppercase tracking-wide">Service Management System</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] p-4 md:p-8 relative flex flex-col lg:shrink lg:min-h-0 h-auto mx-auto w-full max-w-3xl lg:max-w-5xl">
          {/* Glass texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-50 pointer-events-none rounded-3xl"></div>
          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-3xl mix-blend-soft-light"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
          ></div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="text-center mb-6 shrink-0">
              <h1 className="text-xl md:text-3xl font-bold text-[#303036] mb-2">Select Hospital Unit</h1>
              <p className="text-gray-500 text-xs md:text-base">Please choose the unit you wish to manage to proceed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:overflow-y-auto custom-scrollbar p-3 md:p-8">
              {units.map((u) => {
                const [hospitalName, location] = u.name.split(' - ');
                const [hospitalName2, location2] = u.name.split(' – ');
                // Handle both hyphen types
                const finalName = location ? hospitalName : (location2 ? hospitalName2 : u.name);
                const finalLocation = location || location2 || '';

                return (
                  <button
                    key={u.id}
                    onClick={() => handleSelect(u.id)}
                    className="group relative flex items-center p-4 gap-6 rounded-2xl bg-white/40 border border-white/50 shadow-xl hover:bg-white/90 hover:shadow-[0_4px_20px_rgba(59,130,246,0.15)] hover:border-blue-200 transition-all duration-300 text-left w-full"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                      <Building2 className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-gray-700 group-hover:text-blue-700 transition-colors duration-300 block text-xs sm:text-sm md:text-base leading-tight">
                        {finalName}
                      </span>
                      {finalLocation && (
                        <span className="text-[12px] sm:text-xs scale-[0.75] sm:scale-100 origin-left font-medium text-gray-400 group-hover:text-blue-500/80 block mt-1 uppercase tracking-wider leading-none">
                          {finalLocation}
                        </span>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center ml-2 shrink-0 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 bg-blue-50 group-hover:bg-blue-100">
                      <ChevronRight className="w-5 h-5 text-blue-600" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 shrink-0 mb-2">
          <p className="text-xs text-[#787880]/70 font-medium">
            © 2026 Neotia Getwel Multispecialty Hospital. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
};

export default SelectUnitPage;
