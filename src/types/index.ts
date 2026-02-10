export interface Equipment {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  purchaseDate: string;
  warrantyExpiry: string;
  location: string;
  status: 'Active' | 'Maintenance' | 'Retired' | 'Out of Order';
  lastMaintenance: string;
  nextMaintenance: string;
  cost: number;
  taxRate?: number;
  unitId: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface Hospital {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  totalEquipments: number;
  totalValue: number;
  departments: string[];
}

export interface Purchase {
  id: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  purchaseDate: string;
  vendorName: string;
  vendorContact: string;
  billNumber: string;
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'Cheque';
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  notes?: string;
  taxRate: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Verified' | 'Closed' | 'Approved' | 'Rejected';
  Floor?: string;
  unitId?: number;
  Room?: string;
  Bed?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedToId?: number;
  assignedToDepartment?: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  equipmentId?: string;
  department: string;
  attachments?: string[];
  createdBy?: string;
  comments?: TicketComment[];
  deadline?: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  author: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export interface BillData {
  billNumber: string;
  purchaseDate: string;
  vendorName: string;
  vendorContact: string;
  items: {
    equipmentName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
}