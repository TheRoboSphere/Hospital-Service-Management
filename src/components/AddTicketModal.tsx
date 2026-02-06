import React, { useState, useEffect } from 'react';
import { Ticket, Equipment } from '../types';
import { axiosClient } from '../api/axiosClient';
import GlassSelect from './GlassSelect';

interface AddTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: Ticket) => void | Promise<void>;
  equipments: Equipment[];
}

const AddTicketModal: React.FC<AddTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipments
}) => {

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other',
    priority: 'Medium',
    status: 'Open',
    //  createdBy: '',
    department: '',
    floor: '',
    room: '',
    Bed: '',
    // equipmentId: '',
    //assignedTo: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories: Ticket['category'][] = [
    // 'Technical Issue',
    // 'Software Request', 
    // 'Access Request',
    // 'Equipment Issue',
    // 'Maintenance Request',
    // 'Biomedical Request',
    // 'Other'
    'Information Technology',
    'Maintenance',
    'Biomedical',
    'Project'
  ];

  const priorities: Ticket['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
  const floor: string[] = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];
  const room: string[] = ['101', '110', '205', '300', '410', '512'];
  const departments = [
    'Emergency Department',
    'Intensive Care Unit',
    'Radiology Department',
    'Laboratory',
    'Cardiology Department',
    'OB/GYN Department',
    'Operating Theater',
    'Pharmacy',
    'Physiotherapy',
    'Administration',
    'IT Department',
    'Human Resources',
    'Maintenance'
  ];

  // const assignees = [
  //   'Dr. Priya Sharma',
  //   'IT Team Lead',
  //   'Biomedical Engineer',
  //   'Maintenance Supervisor',
  //   'Security Manager',
  //   'HR Manager',
  //   'Admin Manager'
  // ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    if (!formData.department) newErrors.department = 'Department is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------- SUBMIT ----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Convert priority for backend
      const mappedPriority =
        formData.priority.toLowerCase() as "low" | "medium" | "high" | "critical";

      // Convert `/unit/3/tickets` → 3
      const unitId = Number(window.location.pathname.split("/")[2]);

      // FULL PAYLOAD — ALL FIELDS INCLUDED
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: mappedPriority === 'critical' ? 'high' : mappedPriority,
        department: formData.department,
        //  equipmentId: formData.equipmentId || null,
        //  assignedTo: formData.assignedTo || null,
        Floor: formData.floor || null,
        Room: formData.room || null,
        Bed: formData.Bed || null,
        unitId,
      };

      const response = await axiosClient.post("/tickets", payload);

      // Return backend ticket to parent
      // onSubmit(response.data.ticket);

      // onClose();

      if (typeof onSubmit === "function") {
        await onSubmit(response.data.ticket);
      } else {
        console.error("onSubmit is not a function");
      }
      onClose();

    } catch (error: any) {
      console.error("Create ticket failed", error);

    }
  };

  // ---------------- FIELD UPDATE ----------------------------
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="max-w-2xl w-full flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>

        {/* HEADER CARD */}
        <div
          className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-6 animate-in zoom-in-95 duration-200"
          style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system' }}
        >
          <h2 className="text-2xl font-bold text-slate-800">Raise New Ticket</h2>
        </div>

        {/* FORM CARD */}
        <div
          className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl max-h-[75vh] overflow-y-auto animate-in zoom-in-95 duration-200 custom-scrollbar"
          style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system' }}
        >

          <form onSubmit={handleSubmit} className="p-6">

            <div className="space-y-6">

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ticket Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={`w-full px-4 py-2.5 bg-white/60 backdrop-blur-sm border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/80 ${errors.title ? 'border-red-400 bg-red-50/50' : 'border-slate-300/60'
                    }`}
                  placeholder="Brief description of the issue or request"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Row 1: Department, Priority, Floor (3 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">To Department *</label>
                  <GlassSelect
                    value={formData.category}
                    onChange={(val) => handleChange('category', String(val))}
                    options={categories.map(cat => ({ label: cat, value: cat }))}
                    placeholder="Select department"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority *</label>
                  <GlassSelect
                    value={formData.priority}
                    onChange={(val) => handleChange('priority', String(val))}
                    options={priorities.map(p => ({ label: p, value: p }))}
                    placeholder="Select priority"
                    colorMap={{
                      'Low': 'text-green-600',
                      'Medium': 'text-yellow-600',
                      'High': 'text-orange-600',
                      'Critical': 'text-red-600'
                    }}
                  />
                </div>

                {/* Floor */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Floor </label>
                  <GlassSelect
                    value={formData.floor}
                    onChange={(val) => handleChange('floor', String(val))}
                    options={floor.map(f => ({ label: f, value: f }))}
                    placeholder="Select floor"
                  />
                </div>

              </div>

              {/* Row 2: Room Number, Bed Number (3 columns - 1:2 ratio) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Room */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Room </label>
                  <GlassSelect
                    value={formData.room}
                    onChange={(val) => handleChange('room', String(val))}
                    options={room.map(r => ({ label: r, value: r }))}
                    placeholder="Select room"
                  />
                </div>

                {/* Bed Number */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bed Number</label>
                  <input
                    type="text"
                    value={formData.Bed}
                    onChange={(e) => handleChange('Bed', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-white/60 backdrop-blur-sm border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/80 ${errors.Bed ? 'border-red-400 bg-red-50/50' : 'border-slate-300/60'
                      }`}
                    placeholder="Enter bed number if applicable"
                  />
                  {errors.Bed && <p className="text-red-500 text-sm mt-1">{errors.Bed}</p>}
                </div>

              </div>

              {/* Description + Action Buttons Row (3 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-2.5 bg-white/60 backdrop-blur-sm border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/80 resize-none ${errors.description ? 'border-red-400 bg-red-50/50' : 'border-slate-300/60'
                      }`}
                    placeholder="Provide detailed description..."
                  />
                </div>

                {/* Action Buttons Column */}
                <div className="flex flex-col gap-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 invisible">
                    Actions
                  </label>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full px-6 py-2.5 border border-slate-300/60 text-slate-700 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold"
                  >
                    Create Ticket
                  </button>
                </div>

              </div>

            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default AddTicketModal;
