import React, { useState, useEffect } from "react";
import { User, Calendar } from "lucide-react";
import { TICKET_CATEGORIES } from "../constants/category";
import { Ticket } from "../types";

interface ReviewticketProps {
  ticket: Ticket | null;
  onUpdate: (ticket: Ticket) => void;
  onApprove?: () => void;
  onReject?: () => void;
}

const Reviewticket: React.FC<ReviewticketProps> = ({ ticket, onUpdate, onApprove, onReject }) => {
  if (!ticket) {
    return (
      <div className="p-10 ml-[300px] text-center text-gray-600 text-xl">
        No tickets selected for review.
      </div>
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    priority: ticket.priority,
    category: ticket.category,
    assignedTo: ticket.assignedTo || "",
  });

  useEffect(() => {
    setIsEditing(false);
    setEditData({
      priority: ticket.priority,
      category: ticket.category,
      assignedTo: ticket.assignedTo || "",
    });
  }, [ticket]);

  const priorities = ["Low", "Medium", "High", "Critical"];
  const assignees = [
    "IT Admin",
    "Maintenance Engineer",
    "Network Admin",
    "HR Manager",
    "Security Lead",
  ];

  const handleApprove = () => {
    if (onApprove) {
      onApprove();
      return;
    }
    onUpdate({ ...ticket, status: "Approved" });
  };

  const handleReject = () => {
    if (onReject) {
      onReject();
      return;
    }
    onUpdate({ ...ticket, status: "Rejected" });
  };

  const handleSave = () => {
    onUpdate({ ...ticket, ...editData });
    setIsEditing(false);
  };

  return (
    <div className="p-10 ml-[300px] w-full">
      <div className="bg-white grid place-content-center shadow p-8 rounded-xl max-w-5xl mx-auto shadow-slate-950">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Review Ticket</h1>
          <p className="text-gray-500 text-sm">#{ticket.id}</p>
        </div>

        <h2 className="text-2xl mt-4 font-semibold">{ticket.title}</h2>

        {/* EDIT BUTTON */}
        <div className="flex justify-end mt-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Save
            </button>
          )}
        </div>

        {/* DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

          {/* LEFT SECTION */}
          <div>
            <p className="font-semibold text-gray-600">Created By</p>
            <p className="flex items-center gap-2 mt-1">
              <User size={18} className="text-blue-600" /> {ticket.createdBy}
            </p>

            <p className="font-semibold text-gray-600 mt-4">Department</p>
            <p>{ticket.department}</p>

            <p className="font-semibold text-gray-600 mt-4">Created Date</p>
            <p className="flex items-center gap-2 mt-1">
              <Calendar size={18} /> {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>

          {/* RIGHT SECTION */}
          <div>
            {/* Priority */}
            {!isEditing ? (
              <div>
                <p className="font-semibold text-gray-600">Priority</p>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                  {ticket.priority}
                </span>
              </div>
            ) : (
              <select
                className="w-full border p-2 rounded"
                value={editData.priority}
                onChange={(e) =>
                  setEditData({ ...editData, priority: e.target.value as Ticket['priority'] })
                }
              >
                {priorities.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            )}

            {/* Category */}
            {!isEditing ? (
              <div className="mt-4">
                <p className="font-semibold text-gray-600">Category</p>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {ticket.category}
                </span>
              </div>
            ) : (
              <select
                className="w-full p-2 border rounded mt-4"
                value={editData.category}
                onChange={(e) =>
                  setEditData({ ...editData, category: e.target.value })
                }
              >
                {TICKET_CATEGORIES.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            )}

            {/* Assigned To */}
            {!isEditing ? (
              <div className="mt-4">
                <p className="font-semibold text-gray-600">Assigned To</p>
                {ticket.assignedTo || "Unassigned"}
              </div>
            ) : (
              <select
                className="w-full border p-2 rounded mt-4"
                value={editData.assignedTo}
                onChange={(e) =>
                  setEditData({ ...editData, assignedTo: e.target.value })
                }
              >
                <option value="">Unassigned</option>
                {assignees.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="mt-6 bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-lg">Description</h3>
          <p className="mt-2">{ticket.description}</p>
        </div>

        {/* APPROVE / REJECT */}
        <div className="flex justify-between mt-10">
          <button
            onClick={handleReject}
            className="px-6 py-2 bg-red-600 text-white rounded-md"
          >
            Reject
          </button>

          <button
            onClick={handleApprove}
            className="px-6 py-2 bg-green-600 text-white rounded-md"
          >
            Approve
          </button>
        </div>

      </div>
    </div>
  );
};

export default Reviewticket;
