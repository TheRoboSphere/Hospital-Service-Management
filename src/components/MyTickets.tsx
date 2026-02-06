import { useEffect, useState } from "react";
import {
  Users,
  MapPin,
  Layers,
  Clock,
  CheckCircle,
  User,
  Edit,
  ArrowRight
} from "lucide-react";
import { Ticket } from "../types";
import { axiosClient } from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";

interface ExtendedTicket extends Ticket {
  assignedToName?: string;
  comment?: string;
}

const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<ExtendedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<ExtendedTicket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updateComment, setUpdateComment] = useState("");

  useEffect(() => {
    if (!user) return;

    let url = "";
    if (user.role === "admin") url = "/tickets/admin/assigned";
    else if (user.role === "manager") url = "/tickets/manager/assigned";
    else if (user.role === "employee") url = "/tickets/employee/assigned";

    axiosClient.get(url)
      .then(res => setTickets(res.data.tickets))
      .finally(() => setLoading(false));
  }, [user]);

  const handleAction = async (id: string, action: string, data?: any) => {
    try {
      let endpoint = "";
      if (action === "assign") endpoint = `/tickets/${id}/assign`;
      else if (action === "accept") endpoint = `/tickets/${id}/accept`;
      else if (action === "update") endpoint = `/tickets/${id}/update`;
      else if (action === "close") endpoint = `/tickets/${id}/close`;
      else if (action === "verify") endpoint = `/tickets/${id}/verify`;

      const method = action === "assign" ? "post" : "patch";
      await axiosClient[method](endpoint, data);

      // Refresh tickets
      window.location.reload();
    } catch (error) {
      alert("Action failed");
    }
  };

  const openModal = (ticket: ExtendedTicket) => {
    setSelectedTicket(ticket);
    setUpdateComment(ticket.comment || "");
    setShowModal(true);
  };



  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-xl">Loading...</div></div>;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">

      {/* AMBIENT BACKGROUND BLOBS */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full p-6 md:p-10">
        {/* Header */}
        <div className="mb-8 bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm rounded-3xl p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl rounded-full pointer-events-none" />
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight relative z-10">
            My Tickets
          </h1>
          <p className="text-slate-500 mt-2 relative z-10">
            {user?.role === "admin" && "New tickets awaiting assignment"}
            {user?.role === "manager" && "Tickets assigned to you and pending verification"}
            {user?.role === "employee" && "Tickets assigned to you"}
          </p>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => openModal(ticket)}
              className="group relative bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:bg-white/60 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* CARD DECORATION */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-bl-full pointer-events-none" />

              {/* Header */}
              <div className="pb-4 mb-4 border-b border-slate-200/60 relative z-10">
                <div className="flex space-x-2 mb-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${ticket.priority.toLowerCase() === 'high' ? 'bg-red-500/10 text-red-700 border-red-500/20' :
                    ticket.priority.toLowerCase() === 'medium' ? 'bg-orange-500/10 text-orange-700 border-orange-500/20' :
                      ticket.priority.toLowerCase() === 'low' ? 'bg-green-500/10 text-green-700 border-green-500/20' :
                        'bg-slate-500/10 text-slate-700 border-slate-500/20'
                    }`}>
                    {ticket.priority}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${ticket.status === 'Pending' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                    ticket.status === 'In Progress' ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' :
                      ticket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                        ticket.status === 'Closed' ? 'bg-slate-500/10 text-slate-700 border-slate-500/20' :
                          'bg-gray-100 text-gray-800'
                    }`}>
                    {ticket.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 line-clamp-2">
                  {ticket.title}
                </h3>

                <p className="text-slate-600 text-sm line-clamp-3">
                  {ticket.description}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-2.5 relative z-10">
                <div className="flex items-center text-sm text-slate-500">
                  <Users size={16} className="mr-2.5 text-slate-400" />
                  <span className="font-medium text-slate-700">Dept:</span>
                  <span className="ml-1">{ticket.department}</span>
                </div>

                {
                  ticket.Floor && (
                    <div className="flex items-center text-sm text-slate-500">
                      <MapPin size={16} className="mr-2.5 text-slate-400" />
                      <span className="font-medium text-slate-700">Loc:</span>
                      <span className="ml-1">Floor {ticket.Floor}, Room {ticket.Room || 'N/A'}</span>
                    </div>
                  )
                }

                < div className="flex items-center text-sm text-slate-500" >
                  <Layers size={16} className="mr-2.5 text-slate-400" />
                  <span className="font-medium text-slate-700">Cat:</span>
                  <span className="ml-1">{ticket.category}</span>
                </div>

                <div className="flex items-center text-sm text-slate-500">
                  <Clock size={16} className="mr-2.5 text-slate-400" />
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>

                {ticket.assignedToName && (
                  <div className="flex items-center text-sm text-slate-500">
                    <User size={16} className="mr-2.5 text-slate-400" />
                    <span className="font-medium text-slate-700">Assigned:</span>
                    <span className="ml-1">{ticket.assignedToName}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-200/60 relative z-10">
                <div className="flex space-x-2">
                  {user?.role === "admin" && ticket.status === "Pending" && (
                    <button
                      onClick={() => handleAction(ticket.id, "assign", { assignedToId: 2 })} // Example manager ID
                      className="flex-1 bg-blue-600/90 hover:bg-blue-600 text-white py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                    >
                      <ArrowRight size={16} className="mr-2" />
                      Assign Manager
                    </button>
                  )}

                  {user?.role === "manager" && (
                    <button
                      onClick={() => handleAction(ticket.id, "assign", { assignedToId: 3 })} // Example employee ID
                      className="flex-1 bg-emerald-600/90 hover:bg-emerald-600 text-white py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                    >
                      <ArrowRight size={16} className="mr-2" />
                      Assign Employee
                    </button>
                  )}

                  {user?.role === "manager" && ticket.status === "Resolved" && (
                    <button
                      onClick={() => handleAction(ticket.id, "verify")}
                      className="flex-1 bg-purple-600/90 hover:bg-purple-600 text-white py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Verify & Close
                    </button>
                  )}

                  {user?.role === "employee" && (
                    <button
                      onClick={() => handleAction(ticket.id, "accept")}
                      className="flex-1 bg-emerald-600/90 hover:bg-emerald-600 text-white py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Accept
                    </button>
                  )}

                  {user?.role === "employee" && (
                    <>
                      <button
                        onClick={() => openModal(ticket)}
                        className="flex-1 bg-blue-600/90 hover:bg-blue-600 text-white py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                      >
                        <Edit size={16} className="mr-2" />
                        Update
                      </button>
                      <button
                        onClick={() => handleAction(ticket.id, "close")}
                        className="flex-1 bg-red-600/90 hover:bg-red-600 text-white py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Close
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
          }
        </div >

        {
          tickets.length === 0 && (
            <div className="text-center py-20 relative z-10">
              <div className="w-20 h-20 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No tickets found</h3>
              <p className="text-slate-500">You don't have any assigned tickets at the moment.</p>
            </div>
          )
        }
      </div >

      {/* Modal - Glassmorphic Overlay */}
      {
        showModal && selectedTicket && (
          <div onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div onClick={(e) => e.stopPropagation()} className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-200/60">
                <h2 className="text-2xl font-bold text-slate-800">{selectedTicket.title}</h2>
                <div className="flex space-x-2 mt-3">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${selectedTicket.priority.toLowerCase() === 'high' ? 'bg-red-500/10 text-red-700 border-red-500/20' :
                    selectedTicket.priority.toLowerCase() === 'medium' ? 'bg-orange-500/10 text-orange-700 border-orange-500/20' :
                      selectedTicket.priority.toLowerCase() === 'low' ? 'bg-green-500/10 text-green-700 border-green-500/20' :
                        'bg-slate-500/10 text-slate-700 border-slate-500/20'
                    }`}>
                    {selectedTicket.priority}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${selectedTicket.status === 'Pending' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                    selectedTicket.status === 'In Progress' ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' :
                      selectedTicket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                        selectedTicket.status === 'Closed' ? 'bg-slate-500/10 text-slate-700 border-slate-500/20' :
                          'bg-gray-100 text-gray-800'
                    }`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Assignment Section (Moved Up) */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Assignment</h3>
                  <div className="space-y-3 text-sm">
                    {selectedTicket.assignedToName ? (
                      <p className="text-slate-600"><strong className="text-slate-800">Assigned to:</strong> {selectedTicket.assignedToName}</p>
                    ) : (
                      <div className="flex items-center text-slate-400 italic bg-slate-50 px-3 py-2 rounded-lg">
                        <User size={16} className="mr-2" /> Not assigned
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-slate-600 leading-relaxed">{selectedTicket.description}</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Details</h3>
                    <div className="space-y-3 text-sm text-slate-600">
                      <p><strong className="text-slate-800">Department:</strong> {selectedTicket.department}</p>
                      <p><strong className="text-slate-800">Category:</strong> {selectedTicket.category}</p>
                      <p><strong className="text-slate-800">Created:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                      {selectedTicket.Floor && (
                        <p><strong className="text-slate-800">Location:</strong> Floor {selectedTicket.Floor}, Room {selectedTicket.Room}, Bed {selectedTicket.Bed}</p>
                      )}
                    </div>
                  </div>
                </div>

                {user?.role === "employee" && selectedTicket.status === "In Progress" && (
                  <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <Edit size={18} className="mr-2" /> Update Work Progress
                    </h3>
                    <textarea
                      value={updateComment}
                      onChange={(e) => setUpdateComment(e.target.value)}
                      placeholder="Describe your progress, equipment used, etc."
                      className="w-full p-4 border border-blue-200 bg-white/80 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      rows={4}
                    />
                    <button
                      onClick={() => {
                        handleAction(selectedTicket.id, "update", { comment: updateComment });
                        setShowModal(false);
                      }}
                      className="mt-4 w-full bg-blue-600 text-white py-2.5 px-6 rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-200"
                    >
                      Submit Progress Update
                    </button>
                  </div>
                )}

                {selectedTicket.comment && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Work Updates</h3>
                    <div className="text-slate-700 bg-slate-50/80 p-5 rounded-xl border border-slate-200/60 leading-relaxed shadow-inner">
                      {selectedTicket.comment}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default MyTickets;