import React, { useEffect, useState, useRef } from 'react';
import { Equipment } from '../types';
//import { Plus, Search, Filter, Edit, Trash2, Eye, Package, AlertTriangle, Wrench, Wrench, CheckCircle, CheckCircle } from 'lucide-react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Wrench,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import AddEquipmentModal from './AddEquipmentModal';
import ShowEquipmentModal from './ShowEquipmentModal';
import { axiosClient } from '../api/axiosClient';

interface EquipmentManagementProps {
  equipments: Equipment[];
  onAddEquipment: (equipment: Equipment) => void;
  onUpdateEquipment: (equipment: Equipment) => void;
  onDeleteEquipment: (id: string) => void;
  departmentFilter?: string;
  onClearDepartmentFilter?: () => void;
}

const EquipmentManagement: React.FC<EquipmentManagementProps> = ({
  equipments,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment,
  departmentFilter,
  onClearDepartmentFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [showEquipment, setShowEquipment] = useState<Equipment | null>(null);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredEquipments = equipments.filter((equipment) => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || equipment.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || equipment.category === categoryFilter;

    // Department filter logic
    let matchesDepartment = true;
    if (departmentFilter) {
      matchesDepartment = equipment.location.includes(departmentFilter) ||
        (departmentFilter === 'Emergency Medicine' && equipment.location.includes('Emergency')) ||
        (departmentFilter === 'Intensive Care Unit' && equipment.location.includes('ICU')) ||
        (departmentFilter === 'Operating Theater' && equipment.location.includes('Operating')) ||
        (departmentFilter === 'Blood Bank' && equipment.location.includes('Blood'));
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesDepartment;
  });

  const categories = Array.from(new Set(equipments.map(eq => eq.category)));
  const statuses = ['Active', 'Maintenance', 'Retired', 'Out of Order'];



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setShowAddModal(true);
  };
  const handleShow = (equipment: Equipment) => {
    setShowEquipment(equipment);
    setShowEquipmentModal(true);
  };
  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingEquipment(null);
  };
  const handleShowClose = () => {
    setShowEquipment(null);
    setShowEquipmentModal(false);
  };

  const handleModalSubmit = (equipment: Equipment) => {
    if (editingEquipment) {
      onUpdateEquipment(equipment);
    } else {
      onAddEquipment(equipment);
    }
    handleModalClose();
  };

  useEffect(() => {
    if (!showAddModal) {
      setEditingEquipment(null);
    }
  }, [showAddModal]);

  const [equipmentStats, setEquipmentStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    outOfOrder: 0,
    totalValue: 0,
  });

  // useEffect(() => {
  //   const unitId = equipments[0]?.unitId;
  //   if (!unitId) return;

  //   fetch(`api/equipments/stats?unitId=${unitId}`, {
  //     credentials: "include",
  //   })
  //     .then(res => res.json())
  //     .then(setEquipmentStats)
  //     .catch(console.error);
  // }, [equipments]);
  // useEffect(() => {
  //   const unitId = equipments[0]?.unitId;
  //   if (!unitId) return;

  //   fetch(`api/equipments/stats?unitId=${unitId}`, {
  //     credentials: "include",
  //   })
  //     .then(res => res.json())
  //     .then(setEquipmentStats)
  //     .catch(console.error);
  // }, [equipments]); 
  useEffect(() => {
    const unitId = equipments[0]?.unitId;
    if (!unitId) return;

    axiosClient
      .get("/equipments/stats", {
        params: { unitId },
      })
      .then(res => {
        setEquipmentStats(res.data);
      })
      .catch(err => {
        console.error("Stats fetch failed:", err);
      });
  }, [equipments]);

  const statCards = [
    {
      title: "Total Equipment",
      value: equipmentStats.total,
      icon: <Package className="w-6 h-6 text-blue-600" />,
      accent: "from-blue-500 to-blue-400",
    },
    {
      title: "Active Equipment",
      value: equipmentStats.active,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      accent: "from-green-500 to-green-400",
    },
    {
      title: "Under Maintenance",
      value: equipmentStats.maintenance,
      icon: <Wrench className="w-6 h-6 text-yellow-600" />,
      accent: "from-yellow-500 to-yellow-400",
    },
    {
      title: "Out of Order",
      value: equipmentStats.outOfOrder,
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      accent: "from-red-500 to-red-400",
    },
  ];

  //  
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="h-px w-8 bg-blue-500"></span>
                <p className="text-xs uppercase tracking-widest text-blue-600 font-bold">Asset Management</p>
              </div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                Equipment Management
                {departmentFilter && (
                  <span className="text-xl font-normal text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    {departmentFilter}
                  </span>
                )}
              </h1>
              <p className="text-slate-500 mt-2 max-w-2xl">
                {departmentFilter
                  ? `Viewing equipment for ${departmentFilter} department`
                  : 'Manage all hospital equipment and their maintenance schedules'
                }
              </p>

              {departmentFilter && onClearDepartmentFilter && (
                <button
                  onClick={onClearDepartmentFilter}
                  className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  ← Back to all equipment
                </button>
              )}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              <span>Add Equipment</span>
            </button>
          </div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-8">
            {statCards.map((card) => (
              <div
                key={card.title}
                className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative"
              >
                <div className="relative z-10 flex justify-start items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.accent} bg-opacity-10 text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300`}>
                    {React.cloneElement(card.icon as React.ReactElement, { className: "w-6 h-6 text-white" })}
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-wider h-10 flex items-center">{card.title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1 tracking-tight">{card.value}</p>
                  </div>
                </div>

                {/* Decorative gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${card.accent} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${card.accent} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
              </div>
            ))}
          </div>

          {/* Department Filter Alert */}
          {departmentFilter && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-blue-800 font-medium">
                    Showing equipment for: {departmentFilter}
                  </p>
                  <span className="text-blue-600 text-sm">
                    ({filteredEquipments.length} equipment{filteredEquipments.length !== 1 ? 's' : ''} found)
                  </span>
                </div>
                {onClearDepartmentFilter && (
                  <button
                    onClick={onClearDepartmentFilter}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          )}
          {/* Filters */}
          <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative group">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl w-full focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-700 placeholder:text-slate-400 hover:bg-white hover:border-slate-300 shadow-sm"
                />
              </div>

              <div className="relative group" ref={statusRef}>
                <Filter className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${isStatusOpen ? 'text-blue-500' : 'text-slate-400'}`} />
                <button
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className={`pl-12 pr-10 py-3 w-full text-left bg-white/50 border rounded-xl transition-all outline-none text-slate-700 cursor-pointer hover:bg-white hover:border-slate-300 shadow-sm flex items-center justify-between ${isStatusOpen ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white' : 'border-slate-200'
                    }`}
                >
                  <span className="truncate">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isStatusOpen ? 'rotate-180 text-blue-500' : ''}`} />
                </button>

                {isStatusOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white backdrop-blur-xl border border-white/50 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto py-1">
                      <button
                        onClick={() => {
                          setStatusFilter('all');
                          setIsStatusOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 hover:text-blue-600 ${statusFilter === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600'}`}
                      >
                        All Status
                      </button>
                      {statuses.map(status => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setIsStatusOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 hover:text-blue-600 ${statusFilter === status ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative group" ref={categoryRef}>
                <Filter className={`w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${isCategoryOpen ? 'text-blue-500' : 'text-slate-400'}`} />
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className={`pl-12 pr-10 py-3 w-full text-left bg-white/50 border rounded-xl transition-all outline-none text-slate-700 cursor-pointer hover:bg-white hover:border-slate-300 shadow-sm flex items-center justify-between ${isCategoryOpen ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white' : 'border-slate-200'
                    }`}
                >
                  <span className="truncate">{categoryFilter === 'all' ? 'All Categories' : categoryFilter}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180 text-blue-500' : ''}`} />
                </button>

                {isCategoryOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white backdrop-blur-xl border border-white/50 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto py-1">
                      <button
                        onClick={() => {
                          setCategoryFilter('all');
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 hover:text-blue-600 ${categoryFilter === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600'}`}
                      >
                        All Categories
                      </button>
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => {
                            setCategoryFilter(category);
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 hover:text-blue-600 ${categoryFilter === category ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600'}`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Equipment Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Next Maintenance</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEquipments.map((equipment) => (
                    <tr
                      key={equipment.id}
                      onClick={() => handleShow(equipment)}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{equipment.name}</p>
                          <p className="text-sm text-gray-500">{equipment.manufacturer} • {equipment.model}</p>
                          <p className="text-sm text-gray-400">S/N: {equipment.serialNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{equipment.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{equipment.location}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${equipment.status === 'Active' ? 'bg-green-100 text-green-700' :
                          equipment.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-700' :
                            equipment.status === 'Out of Order' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                          }`}>
                          {equipment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(equipment.nextMaintenance)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(equipment.cost)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View button removed, now row click */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(equipment);
                            }}
                            className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEquipment(equipment.id);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredEquipments.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {departmentFilter ? `No equipment found in ${departmentFilter}` : 'No equipment found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {departmentFilter
                  ? `There are currently no equipment items assigned to the ${departmentFilter} department.`
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          )}

          {/* Add/Edit Equipment Modal */}
          {showAddModal && (
            <AddEquipmentModal
              isOpen={showAddModal}
              onClose={handleModalClose}
              onSubmit={handleModalSubmit}
              equipment={editingEquipment}
            />
          )}
          {showEquipment && (
            <ShowEquipmentModal
              isOpen={showEquipmentModal}
              onClose={handleShowClose}
              equipment={showEquipment}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentManagement;