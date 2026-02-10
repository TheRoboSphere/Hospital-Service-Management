
import { useEffect, useState } from "react";
import {
  Users,
  MapPin,
  Layers,
  Clock,
  CheckCircle,
  Edit,
  ArrowRight,
  X,
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

  // State to handle comments for multiple tickets independently
  const [updateComments, setUpdateComments] = useState<Record<string, string>>({});

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

  /* Updated HandleAction to support shouldReload parameter */
  const handleAction = async (id: string, action: string, data?: any, shouldReload: boolean = true) => {
    try {
      let endpoint = "";
      if (action === "assign") endpoint = `/tickets/${id}/assign`;
      else if (action === "accept") endpoint = `/tickets/${id}/accept`;
      else if (action === "update") endpoint = `/tickets/${id}/update`;
      else if (action === "close") endpoint = `/tickets/${id}/close`;
      else if (action === "verify") endpoint = `/tickets/${id}/manager-verify`;
      else if (action === "mark-done") endpoint = `/tickets/${id}/mark-done`;

      const method = action === "assign" ? "post" : "patch";

      // Special handling for "mark-done": save comment first if exists
      if (action === "mark-done" && updateComments[id]) {
        try {
          // We fire and forget this update? Or await it?
          // Ideally await it to ensure comment is saved before status changes.
          await axiosClient.patch(`/tickets/${id}/update`, { comment: updateComments[id] });
        } catch (err) {
          console.error("Failed to save comment before action", err);
          // Proceed anyway to mark as done/verify, or alert user?
          // Proceeding is safer for UX flow, data loss is minor compared to blocking.
        }
      }

      await axiosClient[method](endpoint, data);

      if (shouldReload) {
        window.location.reload();
      } else {
        // Optimistically update comment in local state if "update" action
        if (action === "update" && data?.comment) {
          setTickets(prev => prev.map(t => t.id === id ? { ...t, comment: data.comment } : t));
          alert("Note saved!");
        }
      }
    } catch (error) {
      console.error("Action failed:", error);
      alert("Action failed");
    }
  };

  // Fetch assignable users for all relevant tickets on mount
  useEffect(() => {
    if (tickets.length === 0) return;

    const fetchAllAssignableUsers = async () => {
      const newAssignableUsers: Record<string, User[]> = {};

      const uniqueUnitIds = new Set<string | number>();

      // 1. Identify unique units from tickets that need fetching
      for (const ticket of tickets) {
        if (assignableUsers[ticket.id]) continue; // Skip if already loaded

        const uId = ticket.unitId || (ticket as any).unit_id;
        if (uId) {
          uniqueUnitIds.add(uId);
        }
      }

      if (uniqueUnitIds.size === 0) return;

      console.log(`Fetching users for ${uniqueUnitIds.size} unique units...`);

      // 2. Fetch users for each unique unit in parallel
      const unitUserMap: Record<string, User[]> = {};

      await Promise.all(Array.from(uniqueUnitIds).map(async (uId) => {
        try {
          console.log(`Fetching users for Unit ID: ${uId}`);
          const res = await axiosClient.get("/users/assignable", {
            params: { unitId: uId }
          });
          const data = res.data;
          let usersList: User[] = [];

          // Handle { users: [...] }, { data: [...] }, and [...] formats
          if (Array.isArray(data)) {
            usersList = data;
          } else if (Array.isArray(data.users)) {
            usersList = data.users;
          } else if (Array.isArray(data.data)) {
            usersList = data.data;
          }

          unitUserMap[String(uId)] = usersList;
        } catch (error) {
          console.error(`Failed to fetch users for Unit ID ${uId}`, error);
        }
      }));

      // 3. Map fetched users back to tickets
      for (const ticket of tickets) {
        const uId = ticket.unitId || (ticket as any).unit_id;
        if (uId && unitUserMap[String(uId)]) {
          newAssignableUsers[ticket.id] = unitUserMap[String(uId)];
        }
      }

      if (Object.keys(newAssignableUsers).length > 0) {
        console.log("Batch update assignableUsers:", Object.keys(newAssignableUsers).length, "tickets updated.");
        requestAnimationFrame(() => {
          setAssignableUsers(prev => ({ ...prev, ...newAssignableUsers }));
        });
      }
    };

    fetchAllAssignableUsers();
  }, [tickets]);



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
          {tickets.map(ticket => {
            const isReverseTicket =
              ticket.status === "Verified" ||
              ticket.status === "Closed" ||
              (user?.role === "manager" && ticket.status === "Resolved");

            if (isReverseTicket) {
              return (
                <div
                  key={ticket.id}
                  className={`group relative border rounded-2xl p-6 shadow-sm overflow-hidden cursor-default transition-all duration-300 ${ticket.status === "Verified" || ticket.status === "Resolved"
                    ? "bg-emerald-50/50 border-emerald-100 hover:shadow-md"
                    : "bg-slate-50/50 border-slate-200 hover:shadow-md"
                    }`}
                >
                  {/* HEADER */}
                  <div className="pb-4 mb-4 border-b border-slate-200/60 relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-2">
                        {ticket.title}
                      </h3>
                      {/* STATUS BADGE */}
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${ticket.status === 'Verified' || ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm line-clamp-3">
                      {ticket.description}
                    </p>
                  </div>

                  {/* DETAILS ROW */}
                  <div className="space-y-2.5 relative z-10 mb-6">
                    <div className="flex items-center text-sm text-slate-500">
                      <Users size={16} className="mr-2.5 text-slate-400" />
                      <span className="font-medium text-slate-700">Dept:</span>
                      <span className="ml-1">{ticket.department}</span>
                    </div>

                    <div className="flex items-center text-sm text-slate-500">
                      <Layers size={16} className="mr-2.5 text-slate-400" />
                      <span className="font-medium text-slate-700">Cat:</span>
                      <span className="ml-1">{ticket.category}</span>
                    </div>

                    {/* DEADLINE (Replaces Created At) */}
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock size={16} className="mr-2.5 text-slate-400" />
                      <span className="font-medium text-slate-700 mr-1">Deadline:</span>
                      <span>
                        {ticket.deadline ? new Date(ticket.deadline).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* BODY CONTENT (Replaces Assignment) */}
                  <div className="space-y-4 pt-4 border-t border-slate-200/60">

                    {/* WORK UPDATES (Replaces Select Manager) */}
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                        {ticket.status === 'Verified' || ticket.status === 'Closed' ? 'Verification Note' : 'Work Updates'}
                      </label>
                      <div className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 min-h-[46px] flex items-center">
                        {ticket.comment || <span className="text-slate-400 italic">No notes provided</span>}
                      </div>
                    </div>

                    {/* EQUIPMENT COST (Replaces Deadline Input) */}
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Equipment Cost</label>
                      <div className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-mono">
                        ₹0.00
                      </div>
                    </div>

                  </div>

                  {/* ACTIONS */}
                  <div className="mt-6 pt-4 border-t border-slate-200/60">

                    {/* Admin Close Button */}
                    {user?.role === "admin" && ticket.status === "Verified" && (
                      <button
                        onClick={() => handleAction(ticket.id, "close")}
                        className="w-full bg-slate-700 hover:bg-slate-800 text-white py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                      >
                        <X size={16} className="mr-2" />
                        Close Ticket
                      </button>
                    )}

                    {/* Manager Verify Actions */}
                    {user?.role === "manager" && ticket.status === "Resolved" && (
                      <div className="space-y-3">
                        <textarea
                          value={updateComments[ticket.id] || ""}
                          onChange={(e) => setUpdateComments(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                          placeholder="Add verification notes..."
                          className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                          rows={2}
                        />
                        <button
                          onClick={() => handleAction(ticket.id, "verify", { note: updateComments[ticket.id] })}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Verify & Approve
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            }

            // ACTIVE TICKET UI (Existing Design)
            return (
              <div
                key={ticket.id}
                className={`group relative bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-default hover:bg-white/60 hover:-translate-y-1`}
              >
                {/* CARD DECORATION */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-bl-full pointer-events-none" />

                {/* Header */}
                <div className="pb-4 mb-4 border-b border-slate-200/60 relative z-10">


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
                    <span className="mr-3">{new Date(ticket.createdAt).toLocaleDateString()}</span>

                    {/* Status Badges Moved Here */}
                    <div className="flex space-x-2">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${ticket.priority.toLowerCase() === 'high' ? 'bg-red-500/10 text-red-700 border-red-500/20' :
                        ticket.priority.toLowerCase() === 'medium' ? 'bg-orange-500/10 text-orange-700 border-orange-500/20' :
                          ticket.priority.toLowerCase() === 'low' ? 'bg-green-500/10 text-green-700 border-green-500/20' :
                            'bg-slate-500/10 text-slate-700 border-slate-500/20'
                        }`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${ticket.status === 'Pending' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                        ticket.status === 'In Progress' ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' :
                          ticket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                            ticket.status === 'Closed' ? 'bg-slate-500/10 text-slate-700 border-slate-500/20' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                </div>

                {/* EXPANDED CONTENT - Dynamic Rendering (Always visible if exists) */}
                <div>
                  {/* Only show container if there is content */}
                  {(ticket.Floor || ticket.comment || (user?.role === "employee" && ticket.status === "In Progress")) && (
                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-6 animate-in slide-in-from-top-2 duration-200 cursor-default">

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
                            value={updateComments[ticket.id] || ""}
                            onChange={(e) => setUpdateComments(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                            placeholder="Describe your progress..."
                            className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-3"
                            rows={3}
                          />
                          <button
                            onClick={() => handleAction(ticket.id, "update", { comment: updateComments[ticket.id] })}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Submit Update
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Assignment Section - Always visible for admins/managers if applicable */}
                {(
                  (user?.role === "admin" && ticket.status !== "Rejected") ||
                  (user?.role === "manager" && ticket.status !== "Resolved" && ticket.status !== "Verified" && ticket.status !== "Closed")
                ) && (
                    <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-3">
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Assignment</h4>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {user?.role === "admin" ? "Select Manager" : "Select Employee"}
                          </label>
                          <CustomSelect
                            options={assignableUsers[ticket.id] || []}
                            value={selectedUserIds[ticket.id] ?? null} // Use selected or null
                            onChange={(val) => setSelectedUserIds(prev => ({ ...prev, [ticket.id]: val }))}
                            placeholder="Choose..."
                            disabled={!!ticket.assignedToName && user?.role !== "manager"}
                            forcedDisplayName={user?.role === "manager" ? undefined : ticket.assignedToName}
                          />
                          {(assignableUsers[ticket.id]?.length ?? 0) === 0 && !ticket.assignedToName && (
                            <p className="text-[10px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                              ⚠️ No {user?.role === "admin" ? "managers" : "employees"} found in Unit {ticket.unitId}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deadline</label>
                          <CustomDatePicker
                            value={deadlines[ticket.id] || ticket.deadline || ""}
                            onChange={(val) => setDeadlines(prev => ({ ...prev, [ticket.id]: val }))}
                            disabled={!!ticket.assignedToName && user?.role !== "manager"}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-slate-200/60 relative z-10">
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

                    {user?.role === "manager" && ticket.status !== "Resolved" && ticket.status !== "Closed" && (
                      <button
                        onClick={() => {
                          const ticketUserId = selectedUserIds[ticket.id];
                          const ticketDeadline = deadlines[ticket.id];
                          if (!ticketUserId) {
                            alert("Please select an employee");
                            return;
                          }

                          // If deadline is not changed/set, use existing
                          if (!ticketDeadline && !ticket.deadline) {
                            alert("Please set a deadline");
                            return;
                          }

                          handleAction(ticket.id, "assign", {
                            assignedToId: ticketUserId,
                            deadline: ticketDeadline || ticket.deadline, // Use new or existing
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

                    {user?.role === "employee" && ticket.status === "In Progress" && (
                      <>
                        <button
                          onClick={() => handleAction(ticket.id, "update", { comment: updateComments[ticket.id] })}
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

                    {/* Admin Close Button - Only for Verified (Active block fallback just in case, though verified is handled in reverse block) */}
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
            );
          })}
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