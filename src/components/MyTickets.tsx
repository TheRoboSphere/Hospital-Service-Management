
import { useEffect, useState } from "react";
import {
  Users,
  MapPin,
  Layers,
  Clock,
  CheckCircle,
  User as UserIcon,
  Edit,
  ArrowRight,
  X,
  Filter
} from "lucide-react";
import { Ticket, User } from "../types";
import { axiosClient } from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";
import CustomSelect from "./CustomSelect";
import CustomDatePicker from "./CustomDatePicker";

interface ExtendedTicket extends Ticket {
  assignedToName?: string;
  comment?: string;
}

const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<ExtendedTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [updateComment, setUpdateComment] = useState("");
  const [assignableUsers, setAssignableUsers] = useState<Record<string, User[]>>({});
  // Ticket-specific states to prevent cross-ticket contamination
  const [selectedUserIds, setSelectedUserIds] = useState<Record<string, number | null>>({});
  const [deadlines, setDeadlines] = useState<Record<string, string>>({});

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
      else if (action === "mark-done") endpoint = `/tickets/${id}/mark-done`;

      const method = action === "assign" ? "post" : "patch";
      await axiosClient[method](endpoint, data);

      // Refresh tickets
      window.location.reload();
    } catch (error) {
      console.error("Action failed:", error);
      alert("Action failed");
    }
  };

  const toggleExpand = async (ticket: ExtendedTicket) => {
    if (expandedTicketId === ticket.id) {
      setExpandedTicketId(null);
      return;
    }

    setExpandedTicketId(ticket.id);
    setUpdateComment(ticket.comment || "");
    // Reset ticket-specific states
    setSelectedUserIds(prev => ({ ...prev, [ticket.id]: null }));
    setDeadlines(prev => ({ ...prev, [ticket.id]: "" }));

    // Fetch assignable users
    try {
      const uId = ticket.unitId || (ticket as any).unit_id;

      const res = await axiosClient.get("/users/assignable", {
        params: { unitId: uId }
      });
      setAssignableUsers(prev => ({ ...prev, [ticket.id]: res.data.users }));
    } catch (error) {
      console.error("Failed to fetch assignable users:", error);
      setAssignableUsers(prev => ({ ...prev, [ticket.id]: [] }));
    }
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
              onClick={() => toggleExpand(ticket)}
              className={`group relative bg-white/40 backdrop-blur-md border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer ${expandedTicketId === ticket.id ? 'border-blue-500/30 ring-2 ring-blue-500/10' : 'border-white/50 hover:bg-white/60 hover:scale-[1.02] hover:-translate-y-1'}`}
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

                <div className="flex items-center text-sm text-slate-500">
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
                    <UserIcon size={16} className="mr-2.5 text-slate-400" />
                    <span className="font-medium text-slate-700">Assigned:</span>
                    <span className="ml-1">{ticket.assignedToName}</span>
                  </div>
                )}
              </div>

              {/* EXPANDED CONTENT */}
              {expandedTicketId === ticket.id && (
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-6 animate-in slide-in-from-top-2 duration-200 cursor-default" onClick={(e) => e.stopPropagation()}>

                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">{ticket.description}</p>
                  </div>

                  {/* Location Details */}
                  {ticket.Floor && (
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center">
                      <MapPin size={16} className="mr-2 text-slate-400" />
                      <span>Floor {ticket.Floor}, Room {ticket.Room}, Bed {ticket.Bed}</span>
                    </div>
                  )}

                  {/* Work Updates / Comments */}
                  {ticket.comment && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Work Updates</h4>
                      <div className="text-sm text-slate-700 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 leading-relaxed">
                        {ticket.comment}
                      </div>
                    </div>
                  )}

                  {/* Employee Update Form */}
                  {user?.role === "employee" && ticket.status === "In Progress" && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Update Progress</h4>
                      <textarea
                        value={updateComment}
                        onChange={(e) => setUpdateComment(e.target.value)}
                        placeholder="Describe your progress..."
                        className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-3"
                        rows={3}
                      />
                      <button
                        onClick={() => handleAction(ticket.id, "update", { comment: updateComment })}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Submit Update
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Assignment Section */}
              {expandedTicketId === ticket.id && (
                (user?.role === "admin" && !ticket.assignedToName && ticket.status !== "Rejected") ||
                (user?.role === "manager" && ticket.assignedToName === user.name && ticket.status !== "Resolved" && ticket.status !== "Verified" && ticket.status !== "Closed")
              ) && (
                  <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Assignment</h4>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {user?.role === "admin" ? "Select Manager" : "Select Employee"}
                        </label>
                        <CustomSelect
                          options={assignableUsers[ticket.id] || []}
                          value={selectedUserIds[ticket.id] ?? null}
                          onChange={(val) => setSelectedUserIds(prev => ({ ...prev, [ticket.id]: val }))}
                          placeholder="Choose..."
                          label={user?.role === "admin" ? "Assign to Manager" : "Assign to Employee"}
                        />
                        {(assignableUsers[ticket.id]?.length ?? 0) === 0 && (
                          <p className="text-[10px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                            ⚠️ No {user?.role === "admin" ? "managers" : "employees"} found in Unit {ticket.unitId}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deadline</label>
                        <CustomDatePicker
                          value={deadlines[ticket.id] ?? ""}
                          onChange={(val) => setDeadlines(prev => ({ ...prev, [ticket.id]: val }))}
                          label="Select Deadline"
                        />
                      </div>
                    </div>
                  </div>
                )}

              {/* Manager Verification Section */}
              {expandedTicketId === ticket.id && user?.role === "manager" && ticket.status === "Resolved" && (
                <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-3" onClick={(e) => e.stopPropagation()}>
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Manager Review</h4>
                  <textarea
                    value={updateComment}
                    onChange={(e) => setUpdateComment(e.target.value)}
                    placeholder="Add verification notes..."
                    className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-3"
                    rows={2}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-200/60 relative z-10" onClick={(e) => e.stopPropagation()}>
                <div className="flex space-x-2">
                  {user?.role === "admin" && ticket.status === "Pending" && !ticket.assignedToName && (
                    <button
                      onClick={() => {
                        const ticketUserId = selectedUserIds[ticket.id];
                        const ticketDeadline = deadlines[ticket.id];
                        if (!ticketUserId || !ticketDeadline) {
                          alert("Please select a manager and set a deadline");
                          return;
                        }
                        handleAction(ticket.id, "assign", {
                          assignedToId: ticketUserId,
                          deadline: ticketDeadline,
                          requiredEquipmentIds: [],
                          equipmentNote: "",
                          extraCost: 0
                        });
                      }}
                      className="flex-1 bg-blue-600/90 hover:bg-blue-600 text-white py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                    >
                      <ArrowRight size={16} className="mr-2" />
                      Assign Manager
                    </button>
                  )}

                  {user?.role === "manager" && ticket.assignedToName === user.name && ticket.status !== "Resolved" && ticket.status !== "Closed" && (
                    <button
                      onClick={() => {
                        const ticketUserId = selectedUserIds[ticket.id];
                        const ticketDeadline = deadlines[ticket.id];
                        if (!ticketUserId || !ticketDeadline) {
                          alert("Please select an employee and set a deadline");
                          return;
                        }
                        handleAction(ticket.id, "assign", {
                          assignedToId: ticketUserId,
                          deadline: ticketDeadline,
                          requiredEquipmentIds: [],
                          equipmentNote: "",
                          extraCost: 0
                        });
                      }}
                      className="flex-1 bg-green-600/90 hover:bg-green-600 text-white py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
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
                      Verify & Approve
                    </button>
                  )}



                  {user?.role === "employee" && ticket.status === "In Progress" && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(ticket);
                        }}
                        className="flex-1 bg-blue-600/90 hover:bg-blue-600 text-white py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                      >
                        <Edit size={16} className="mr-2" />
                        Update
                      </button>
                      <button
                        onClick={() => handleAction(ticket.id, "mark-done")}
                        className="flex-1 bg-emerald-600/90 hover:bg-emerald-600 text-white py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Mark as Done
                      </button>
                    </>
                  )}

                  {user?.role === "admin" && ticket.status === "Verified" && (
                    <button
                      onClick={() => handleAction(ticket.id, "close")}
                      className="flex-1 bg-slate-600/90 hover:bg-slate-600 text-white py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                    >
                      <X size={16} className="mr-2" />
                      Close Ticket
                    </button>
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

      {/* Modal REMOVED */}
    </div >
  );
};

export default MyTickets;