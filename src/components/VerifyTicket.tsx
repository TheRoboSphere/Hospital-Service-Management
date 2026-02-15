import { useEffect, useState } from "react";
import {
    Users,
    Layers,
    Clock,
    CheckCircle,
    X,
} from "lucide-react";
import { Ticket } from "../types";
import { axiosClient } from "../api/axiosClient";
import { useAuth } from "../hooks/useAuth";

interface ExtendedTicket extends Ticket {
    assignedToName?: string;
    comment?: string;
    cost?: number; // Add cost to interface
}

const VerifyTicket = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<ExtendedTicket[]>([]);
    const [loading, setLoading] = useState(true);

    // State for verification notes
    const [verificationNotes, setVerificationNotes] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!user) return;

        // Reuse existing endpoints - they return relevant tickets
        // We will filter heavily in the frontend for this specific page view
        let url = "";
        if (user.role === "admin") url = "/tickets/admin/assigned";
        else if (user.role === "manager") url = "/tickets/manager/assigned";
        else return; // Employees don't have access to this page

        axiosClient.get(url)
            .then(res => {
                const allTickets = res.data.tickets;
                // FILTER: Only show tickets appearing in the "Verification Queue"
                // Manager: Needs to see 'Resolved' tickets (to verify them)
                // Admin: Needs to see 'Verified' tickets (to close them)

                let filtered = [];
                if (user.role === "manager") {
                    filtered = allTickets.filter((t: Ticket) => t.status === "Resolved" || t.status === "Verified");
                } else if (user.role === "admin") {
                    filtered = allTickets.filter((t: Ticket) => t.status === "Verified");
                }

                console.log("[VerifyTicket] Filtered tickets:", filtered);
                setTickets(filtered);
            })
            .catch(err => console.error("Failed to fetch tickets", err))
            .finally(() => setLoading(false));
    }, [user]);

    const handleAction = async (id: string, action: string, data?: any) => {
        try {
            let endpoint = "";
            if (action === "verify") endpoint = `/tickets/${id}/manager-verify`;
            else if (action === "close") endpoint = `/tickets/${id}/close`;
            else if (action === "reject") endpoint = `/tickets/${id}/reject`;

            await axiosClient.patch(endpoint, data);

            if (action === "verify") {
                // Update status to Verified so it stays visible (read-only)
                setTickets(prev => prev.map(t =>
                    t.id === id ? { ...t, status: 'Verified', managerReviewNote: data?.note } : t
                ));
            } else {
                // Remove ticket from list (Close action)
                setTickets(prev => prev.filter(t => t.id !== id));
            }
            alert("Action successful!");
        } catch (error) {
            console.error("Action failed:", error);
            alert("Action failed");
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-xl">Loading...</div></div>;

    if (user?.role === 'employee') {
        return <div className="p-10 text-center">Access Denied</div>;
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50">
            {/* AMBIENT BACKGROUND */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-400/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-teal-400/20 blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full p-6 md:p-10">
                {/* Header */}
                <div className="mb-8 bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm rounded-3xl p-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100/40 to-teal-100/40 blur-3xl rounded-full pointer-events-none" />
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight relative z-10">
                        Verification Queue
                    </h1>
                    <p className="text-slate-500 mt-2 relative z-10">
                        {user?.role === "admin" && "Review verified tickets for final closure"}
                        {user?.role === "manager" && "Review resolved tickets and approve work"}
                    </p>
                </div>

                {/* Tickets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            className="group relative border rounded-2xl p-6 shadow-sm overflow-hidden cursor-default transition-all duration-300 bg-emerald-50/50 border-emerald-100 hover:shadow-md"
                        >
                            {/* HEADER */}
                            <div className="pb-4 mb-4 border-b border-slate-200/60 relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-2">
                                        {ticket.title}
                                    </h3>
                                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200">
                                        {ticket.status}
                                    </span>
                                    {/* Iteration Count Badge */}
                                    {(ticket.rejectionCount || 0) > 0 && (
                                        <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold rounded-full border bg-amber-100 text-amber-700 border-amber-200" title={`This ticket has been rejected ${ticket.rejectionCount} times`}>
                                            Attempt #{(ticket.rejectionCount || 0) + 1}
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-600 text-sm line-clamp-3">
                                    {ticket.description}
                                </p>
                            </div>

                            {/* DETAILS */}
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

                                {ticket.assignedToName && (
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Users size={16} className="mr-2.5 text-slate-400" />
                                        <span className="font-medium text-slate-700">Done By:</span>
                                        <span className="ml-1">{ticket.assignedToName}</span>
                                    </div>
                                )}

                                {ticket.deadline && (
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Clock size={16} className="mr-2.5 text-slate-400" />
                                        <span className="font-medium text-slate-700 mr-1">Deadline:</span>
                                        <span>{new Date(ticket.deadline).toLocaleDateString()}</span>
                                    </div>
                                )}

                                {/* Cost Display */}
                                {ticket.cost && ticket.cost > 0 ? (
                                    <div className="flex items-center text-sm text-slate-500">
                                        <span className="w-4 h-4 mr-2.5 flex items-center justify-center font-bold text-slate-400 text-xs border border-slate-300 rounded-full">₹</span>
                                        <span className="font-medium text-slate-700 mr-1">Costing:</span>
                                        <span className="font-semibold text-slate-800">₹{ticket.cost}</span>
                                    </div>
                                ) : null}
                            </div>

                            {/* WORK CONTENT */}
                            <div className="space-y-4 pt-4 border-t border-slate-200/60">
                                {/* Employee Work Note */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        Employee Work Update
                                    </label>
                                    <div className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 min-h-[46px] flex items-center">
                                        {ticket.workNote || ticket.comment || <span className="text-slate-400 italic">No notes provided</span>}
                                    </div>
                                </div>

                                {/* Manager Verification Note (For Admins) */}
                                {ticket.managerReviewNote && (
                                    <div>
                                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 block">
                                            Manager Verification
                                        </label>
                                        <div className="w-full p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-900">
                                            {ticket.managerReviewNote}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ACTIONS */}
                            <div className="mt-6 pt-4 border-t border-slate-200/60">

                                {/* Manager: Verify */}
                                {user?.role === "manager" && ticket.status === "Resolved" && (
                                    <div className="space-y-3">
                                        <textarea
                                            value={verificationNotes[ticket.id] || ""}
                                            onChange={(e) => setVerificationNotes(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                                            placeholder="Add verification notes..."
                                            className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                                            rows={2}
                                        />

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    const reason = prompt("Enter reason for rejection:");
                                                    if (reason) handleAction(ticket.id, "reject", { reason });
                                                }}
                                                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                                            >
                                                <X size={16} className="mr-2" />
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleAction(ticket.id, "verify", { note: verificationNotes[ticket.id] })}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                                            >
                                                <CheckCircle size={16} className="mr-2" />
                                                Verify
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Admin: Close or Reject */}
                                {user?.role === "admin" && ticket.status === "Verified" && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                const reason = prompt("Enter reason for rejection:");
                                                if (reason) handleAction(ticket.id, "reject", { reason });
                                            }}
                                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                                        >
                                            <X size={16} className="mr-2" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(ticket.id, "close")}
                                            className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm font-medium"
                                        >
                                            <CheckCircle size={16} className="mr-2" />
                                            Close Ticket
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    ))}
                </div>

                {tickets.length === 0 && (
                    <div className="text-center py-20 relative z-10">
                        <div className="w-20 h-20 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <span className="text-4xl">✨</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">All caught up!</h3>
                        <p className="text-slate-500">No tickets currently pending verification.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyTicket;
