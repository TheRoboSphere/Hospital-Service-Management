
import React, { useEffect, useMemo, useState } from "react";
import { Ticket, User } from "../types";
import { Building2, User2, FileText } from "lucide-react";
import { axiosClient } from "../api/axiosClient";
import CustomDatePicker from "./CustomDatePicker";
import CustomSelect from "./CustomSelect";

interface ServiceSlipProps {
  ticket: Ticket | null;
  onClose: () => void;
  onAccept: (updated: Ticket) => void;
  onDecline: (updated: Ticket) => void;
}

const FALLBACK_UNIT = "NGHC – SILIGURI";

const statusPill = (status: string) => {
  switch (status) {
    case "Resolved":
      return "bg-emerald-100 text-emerald-700";
    case "In Progress":
      return "bg-blue-100 text-blue-700";
    case "Pending":
      return "bg-amber-100 text-amber-700";
    case "Closed":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-rose-100 text-rose-700";
  }
};

const ServiceSlip: React.FC<ServiceSlipProps> = ({
  ticket,
  onClose,
  onAccept,
  onDecline,
}) => {
  if (!ticket) return null;

  const [remarks, setRemarks] = useState("");
  const [isAccepted, setIsAccepted] = useState(ticket.status === "In Progress");
  const [isAccepting, setIsAccepting] = useState(false);

  // Assignment state
  const [users, setUsers] = useState<User[]>([]);
  /* const [equipments, setEquipments] = useState<Equipment[]>([]); */
  const [assignedToId, setAssignedToId] = useState<number | null>(null);
  const [requiredEquipmentIds] = useState<number[]>([]);
  const [equipmentNote, setEquipmentNote] = useState("");
  const [deadline, setDeadline] = useState("");
  const [extraCost, setExtraCost] = useState<number | "">("");

  const [actionDate, setActionDate] = useState(
    () => new Date().toISOString().slice(0, 16)
  );

  const postedDate = useMemo(() => {
    return ticket.createdAt
      ? new Date(ticket.createdAt).toLocaleString("en-IN")
      : "—";
  }, [ticket.createdAt]);

  /* ---------------- ACCEPT ---------------- */
  const handleAccept = async () => {
    if (isAccepted || isAccepting) return;

    try {
      setIsAccepting(true);
      await axiosClient.patch(`/tickets/${ticket.id}/status`, {
        status: "In Progress",
      });

      setIsAccepted(true);
      onAccept({ ...ticket, status: "In Progress" });
    } catch (e) {
      console.error("Accept failed", e);
    } finally {
      setIsAccepting(false);
    }
  };

  /* ---------------- DECLINE ---------------- */
  const handleDecline = async () => {
    if (isAccepted) return;

    try {
      await axiosClient.patch(`/tickets/${ticket.id}/status`, {
        status: "Closed",
      });

      onDecline({ ...ticket, status: "Closed" });
      onClose();
    } catch (e) {
      console.error("Decline failed", e);
    }
  };

  /* ---------------- LOAD ASSIGNABLE USERS + EQUIPMENTS ---------------- */
  useEffect(() => {
    if (!isAccepted) return;

    axiosClient
      .get("/users/assignable", { params: { unitId: ticket.unitId } })
      .then((res) => setUsers(res.data.users));

    /* axiosClient
      .get("/equipments", { params: { unitId: ticket.unitId } })
      .then((res) => setEquipments(res.data.equipments)); */
  }, [isAccepted, ticket.unitId]);

  /* ---------------- ASSIGN ---------------- */
  const handleAssign = async () => {
    if (!assignedToId || !deadline) {
      alert("Employee and deadline are required");
      return;
    }

    try {
      const res = await axiosClient.post(
        `/tickets/${ticket.id}/assign`,
        {
          assignedToId,
          requiredEquipmentIds,
          equipmentNote,
          deadline,
          extraCost: extraCost || 0,
        }
      );

      onAccept(res.data.ticket);
      alert("Work assigned & notification sent");
    } catch (e) {
      console.error("Assignment failed", e);
      alert("Failed to assign work");
    }
  };

  /* ---------------- BODY SCROLL LOCK ---------------- */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-white/50 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Service Call Slip</p>
              <h2 className="text-xl font-bold text-slate-900">Ticket #{ticket.id}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 shadow-sm">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{ticket.unitId || FALLBACK_UNIT}</span>
            </div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

          {/* TICKET DETAILS GRID */}
          <section className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{ticket.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-slate-500 font-medium">Posted: {postedDate}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusPill(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User2 className="w-4 h-4 text-slate-400" />
                <span>Req by: <span className="font-semibold text-slate-900">{ticket.createdBy}</span></span>
              </div>
            </div>

            {/* DEPARTMENT & DESCRIPTION ROW */}
            <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-x-8 gap-y-4">
              {/* Department */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                <p className="font-semibold text-slate-900 leading-snug">{ticket.department}</p>
              </div>

              {/* Description */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-slate-900 leading-relaxed text-sm">{ticket.description || 'No description provided.'}</p>
              </div>
            </div>

            {/* OTHER LOCATION DETAILS */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Room No</p>
                <p className="font-semibold text-slate-900">{ticket.Room || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bed No</p>
                <p className="font-semibold text-slate-900">{ticket.Bed || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Floor</p>
                <p className="font-semibold text-slate-900">{ticket.Floor || 'N/A'}</p>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* ACTION FORM (Hidden if accepted) */}
          {!isAccepted && (
            <section className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Action Date</label>
                  {/* Custom Date Picker */}
                  <CustomDatePicker
                    value={actionDate}
                    onChange={setActionDate}
                    label="Select Date & Time"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Remarks</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any notes..."
                    className="w-full h-[62px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </section>
          )}

          {/* ASSIGNMENT SECTION (Conditional) */}
          {isAccepted && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-5 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="font-bold text-slate-900">Assign Work</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Assign To</label>
                  <CustomSelect
                    options={users}
                    value={assignedToId}
                    onChange={setAssignedToId}
                    label="Select Employee"
                    placeholder="Choose..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Deadline</label>
                  <CustomDatePicker
                    value={deadline}
                    onChange={setDeadline}
                    label="Select Deadline"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Est. Cost</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 shadow-sm"
                    value={extraCost}
                    onChange={(e) => setExtraCost(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Notes</label>
                  <input
                    type="text"
                    placeholder="Work notes..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 shadow-sm"
                    value={equipmentNote}
                    onChange={(e) => setEquipmentNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAssign}
                  disabled={!assignedToId || !deadline}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS (Hidden if accepted) */}
        {!isAccepted && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
            <button
              onClick={handleDecline}
              className="px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              Decline Request
            </button>

            <button
              onClick={handleAccept}
              className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Accept Request
            </button>
          </div>
        )}

      </div>
    </div>

  );
};

export default ServiceSlip;


