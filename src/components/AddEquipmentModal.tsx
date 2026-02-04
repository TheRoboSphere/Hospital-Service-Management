import React, { useState, useEffect } from 'react';
import { Equipment } from '../types';
import { X } from 'lucide-react';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (equipment: Equipment) => void;
  equipment?: Equipment | null;
}

const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipment
}) => {
  const [formData, setFormData] = useState<Omit<Equipment, 'id'>>({
    unitId: 0,
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (equipment) {
      setFormData({
        unitId: equipment.unitId || 0,
        name: equipment.name,
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
        unitId: 0,
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
    }
    setErrors({});
  }, [equipment, isOpen]);

  const categories = [
    'Imaging Equipment',
    'Life Support',
    'Emergency Equipment',
    'Surgical Equipment',
    'Laboratory Equipment',
    'Diagnostic Equipment',
    'Monitoring Equipment',
    'Rehabilitation Equipment',
    'Other'
  ];

  const locations = [
    'Emergency Department',
    'ICU Ward A',
    'ICU Ward B',
    'Operating Theater 1',
    'Operating Theater 2',
    'Radiology Department',
    'Laboratory',
    'Cardiology Department',
    'OB/GYN Department',
    'Pharmacy',
    'Physiotherapy',
    'Dialysis Unit',
    'Blood Bank',
    'General Ward'
  ];

  const statuses: Equipment['status'][] = ['Active', 'Maintenance', 'Retired', 'Out of Order'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Equipment name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Serial number is required';
    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (formData.cost <= 0) newErrors.cost = 'Cost must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newEquipment: Equipment = {
      ...formData,
      id: equipment?.id || Date.now().toString()
    };

    onSubmit(newEquipment);
  };

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white  max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {equipment ? 'Edit Equipment' : 'Add New Equipment'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Equipment Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter equipment name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial Number *
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.serialNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter serial number"
              />
              {errors.serialNumber && <p className="text-red-500 text-sm mt-1">{errors.serialNumber}</p>}
            </div>

            {/* Manufacturer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer *
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.manufacturer ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter manufacturer"
              />
              {errors.manufacturer && <p className="text-red-500 text-sm mt-1">{errors.manufacturer}</p>}
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model *
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.model ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter model"
              />
              {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">Select location</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as Equipment['status'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost (₹) *
              </label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => handleChange('cost', parseFloat(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.cost ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter cost"
                min="0"
                step="0.01"
              />
              {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost}</p>}
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Date *
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.purchaseDate ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.purchaseDate && <p className="text-red-500 text-sm mt-1">{errors.purchaseDate}</p>}
            </div>

            {/* Warranty Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warranty Expiry
              </label>
              <input
                type="date"
                value={formData.warrantyExpiry}
                onChange={(e) => handleChange('warrantyExpiry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Last Maintenance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Maintenance
              </label>
              <input
                type="date"
                value={formData.lastMaintenance}
                onChange={(e) => handleChange('lastMaintenance', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Next Maintenance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Maintenance
              </label>
              <input
                type="date"
                value={formData.nextMaintenance}
                onChange={(e) => handleChange('nextMaintenance', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEquipmentModal;