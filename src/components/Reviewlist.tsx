
import { useEffect, useState } from "react";
import {
  Users,
  MapPin,
  Layers,
  Clock
} from "lucide-react";
import { Ticket } from "../types";
import { axiosClient } from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";

const ReviewTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  /* FETCH BY ROLE */
  useEffect(() => {
    if (!user) return;

    let url = "";

    if (user.role === "admin") url = "/tickets/admin/my";
    if (user.role === "manager") url = "/tickets/manager/my";
    if (user.role === "employee") url = "/tickets/employee/my";

    axiosClient.get(url)
      .then(res => setTickets(res.data.tickets))
      .finally(() => setLoading(false));
  }, [user]);

  const respond = (id: string, action: "accept" | "decline") => {
    axiosClient
      .patch(`/tickets/${id}/respond`, { action })
      .then(() => {
        setTickets(t =>
          t.map(ticket =>
            ticket.id === id
              ? { ...ticket, status: action === "accept" ? "In Progress" : "Pending" }
              : ticket
          )
        );
      });
  };

  if (loading) return <p className="p-10">Loading...</p>;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 p-6 md:p-10">

      {/* AMBIENT BACKGROUND BLOBS */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />

      {/* HEADER */}
      <div className="relative z-10 mb-8 bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm rounded-3xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl rounded-full pointer-events-none" />
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight relative z-10">
          {user?.role.toUpperCase()} DASHBOARD
        </h1>
        <p className="text-slate-500 mt-2 relative z-10">
          Manage and review your assigned tickets
        </p>
      </div>

      {/* GRID */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {tickets.map(ticket => (
          <div
            key={ticket.id}
            className="group relative bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:bg-white/60 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            {/* CARD DECORATION */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-bl-full pointer-events-none" />

            {/* TOP */}
            <div className="flex justify-between items-start relative z-10">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${ticket.priority === 'Critical' ? 'bg-red-500/10 text-red-700 border-red-500/20' :
                ticket.priority === 'High' ? 'bg-orange-500/10 text-orange-700 border-orange-500/20' :
                  ticket.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' :
                    'bg-blue-500/10 text-blue-700 border-blue-500/20'
                }`}>
                {ticket.priority}
              </span>

              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${ticket.status === 'Open' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                ticket.status === 'Pending' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                  'bg-slate-500/10 text-slate-700 border-slate-500/20'
                }`}>
                {ticket.status}
              </span>
            </div>

            {/* TITLE */}
            <h2 className="mt-4 text-lg font-bold text-slate-800 leading-tight relative z-10">
              {ticket.title}
            </h2>

            <p className="mt-2 text-slate-600 text-sm line-clamp-3 relative z-10">
              {ticket.description}
            </p>

            {/* DETAILS */}
            <div className="mt-6 space-y-2.5 text-sm text-slate-500 relative z-10">
              <p className="flex items-center gap-2.5">
                <Users size={16} className="text-slate-400" />
                <span className="font-medium text-slate-700">Dept:</span> {ticket.department}
              </p>

              <p className="flex items-center gap-2.5">
                <Layers size={16} className="text-slate-400" />
                <span className="font-medium text-slate-700">Cat:</span> {ticket.category}
              </p>

              <p className="flex items-center gap-2.5">
                <MapPin size={16} className="text-slate-400" />
                <span className="font-medium text-slate-700">Loc:</span>
                Floor {ticket.Floor || "-"} / Room {ticket.Room || "-"}
              </p>

              <p className="flex items-center gap-2.5">
                <Clock size={16} className="text-slate-400" />
                {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* FOOTER */}
            <div className="mt-6 pt-4 border-t border-slate-200/60 flex justify-between items-center relative z-10">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Created by</span>
                <span className="text-sm font-semibold text-slate-700">
                  {ticket.createdBy}
                </span>
              </div>

              {/* EMPLOYEE ACTION */}
              {user?.role === "employee" &&
                ticket.status === "Pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(ticket.id, "accept")}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => respond(ticket.id, "decline")}
                      className="px-4 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Decline
                    </button>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewTickets;
