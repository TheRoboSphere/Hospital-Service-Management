import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Equipment } from '../types';


interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment?: Equipment | null;
}

const ShowEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  isOpen,
  onClose,
  equipment
}) => {
  const [formData, setFormData] = useState<Omit<Equipment, 'id'>>({
    unitId: 0, // Changed to number
    name: '',
    category: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    purchaseDate: '',
    warrantyExpiry: '',
    location: '',
    status: 'Active',
    lastMaintenance: '',
    nextMaintenance: '',
    cost: 0
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name,
        unitId: equipment.unitId || 0, // Changed to number
        category: equipment.category,
        serialNumber: equipment.serialNumber,
        manufacturer: equipment.manufacturer,
        model: equipment.model,
        purchaseDate: equipment.purchaseDate,
        warrantyExpiry: equipment.warrantyExpiry,
        location: equipment.location,
        status: equipment.status,
        lastMaintenance: equipment.lastMaintenance,
        nextMaintenance: equipment.nextMaintenance,
        cost: equipment.cost
      });
    } else {
      setFormData({
        name: '',
        unitId: 0, // Changed to number
        category: '',
        serialNumber: '',
        manufacturer: '',
        model: '',
        purchaseDate: '',
        warrantyExpiry: '',
        location: '',
        status: 'Active',
        lastMaintenance: '',
        nextMaintenance: '',
        cost: 0
      });
    }
  }, [equipment, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/50 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white/50 sticky top-0 backdrop-blur-md z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Equipment Details
            </h2>
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {/* Equipment Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Equipment Name
              </label>
              <p className="text-slate-800 font-medium">
                {formData.name}
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Category
              </label>
              <p className="text-slate-800 font-medium">
                {formData.category}
              </p>
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Serial Number
              </label>
              <p className="text-slate-800 font-medium font-mono">
                {formData.serialNumber}
              </p>
            </div>

            {/* Manufacturer */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Manufacturer
              </label>
              <p className="text-slate-800 font-medium">
                {formData.manufacturer}
              </p>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Model
              </label>
              <p className="text-slate-800 font-medium">
                {formData.model}
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Location
              </label>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <span className={`w-2 h-2 rounded-full ${formData.location.includes('Emergency') ? 'bg-red-500' :
                  formData.location.includes('ICU') ? 'bg-blue-500' :
                    formData.location.includes('Operating') ? 'bg-green-500' :
                      'bg-purple-500'
                  }`} />
                {formData.location}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Status
              </label>
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${formData.status === 'Active' ? 'bg-green-100 text-green-700' :
                  formData.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-700' :
                    formData.status === 'Out of Order' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                  }`}>
                  {formData.status}
                </span>
              </div>
            </div>

            {/* Cost */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Cost (₹)
              </label>
              <p className="text-slate-800 font-medium">
                ₹{formData.cost.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Purchase Date
              </label>
              <p className="text-slate-800 font-medium">
                {formatDate(formData.purchaseDate)}
              </p>
            </div>

            {/* Warranty Expiry */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Warranty Expiry
              </label>
              <p className="text-slate-800 font-medium">
                {formatDate(formData.warrantyExpiry)}
              </p>
            </div>

            {/* Last Maintenance */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Last Maintenance
              </label>
              <p className="text-slate-800 font-medium">
                {formatDate(formData.lastMaintenance)}
              </p>
            </div>

            {/* Next Maintenance */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Next Maintenance
              </label>
              <p className="text-slate-800 font-medium">
                {formatDate(formData.nextMaintenance)}
              </p>
            </div>
          </div>
        </div>

        {/* <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {equipment ? 'Update Equipment' : 'Add Equipment'}
            </button>
          </div> */}
      </div>
    </div>,
    document.body
  );
};

export default ShowEquipmentModal;