import React, { useEffect, useMemo, useState } from 'react';
import { Ticket, } from '../types';
import { TICKET_CATEGORIES } from '../constants/category';
import { useParams } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import {
	Plus,
	Search,
	Eye,
	Clock,
	Calendar,
	AlertTriangle,
	CheckCircle,
	User,
	Tag,
	FileText,
	ChevronDown,
} from 'lucide-react';

import AddTicketModal from './AddTicketModal';
import TicketDetailsModal from './TicketDetailsModal';
import ServiceSlip from './Serviceslip';


interface TicketManagementProps {
	// tickets: Ticket[];
	// equipments: Equipment[];
	// onAddTicket: (ticket: Ticket) => void | Promise<void>;
	// onUpdateTicket: (ticket: Ticket) => void;
	// onSlip: (ticket: Ticket) => void;
}

const priorityOptions = ['all', 'Low', 'Medium', 'High', 'Critical'];


const filterToneClasses = {
	blue: 'bg-blue-50 text-blue-700 border-blue-100',
	red: 'bg-red-50 text-red-700 border-red-100',
	slate: 'bg-slate-50 text-slate-700 border-slate-100',
	green: 'bg-green-50 text-green-700 border-green-100',
} as const;

type FilterTone = keyof typeof filterToneClasses;

const TicketManagement: React.FC<TicketManagementProps> = ({
	// tickets,
	// equipments,
	// onAddTicket,
	// onUpdateTicket,
	// onSlip,
}) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [priorityFilter, setPriorityFilter] = useState<string>('all');
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [showAddModal, setShowAddModal] = useState(false);
	//const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);

	// Dropdown states
	const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
	const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);



	const [tickets, setTickets] = useState<Ticket[]>([]);

	//const [reviewTicket, setReviewTicket] = useState<Ticket | null>(null);
	const [showSlip, setShowSlip] = useState(false);
	const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
	// const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

	const handleAddTicket = async (ticket: Ticket) => {
		setTickets((prev) => [...prev, ticket]);
	};

	const handleUpdateTicket = async (updated: Ticket) => {
		setTickets((prev) =>
			prev.map((t) => (t.id === updated.id ? updated : t))
		);
	};



	const { unitId } = useParams();


	const handleSlip = (ticket: Ticket) => {
		setSelectedTicket(ticket);
		setShowSlip(true);
	};


	// useEffect(() => {



	//   const fetchTickets = async () => {
	// 	try {

	// 	  const res = await axiosClient.get("/tickets",{
	// 		params: {unitId:selectUnitId},
	// 	  });

	// 	  const tickets = res.data.tickets.map((t: any) => ({
	// 		...t,
	// 		comments: t.comments ?? [],
	// 		attachments: t.attachments ?? [],
	// 		assignedTo: t.assignedTo ?? null,
	// 	  }));

	// 	  setTickets(tickets);

	// 	} catch (err: any) {
	//   console.error("Failed to fetch tickets");
	//   console.error("STATUS:", err?.response?.status);
	//   console.error("DATA:", err?.response?.data);
	//   console.error("MESSAGE:", err?.message);
	// }
	//   };

	//   fetchTickets();
	// }, [ unitId]);
	useEffect(() => {
		if (!unitId) return;

		const fetchTickets = async () => {
			try {
				const res = await axiosClient.get(
					`/tickets/unit/${unitId}`
				);

				const normalized = res.data.tickets.map((t: any) => ({
					...t,
					comments: t.comments ?? [],
					attachments: t.attachments ?? [],
					assignedTo: t.assignedTo ?? null,
				}));

				setTickets(normalized);
			} catch (err: any) {
				console.error("Failed to fetch tickets", err?.response?.data);
			}
		};

		fetchTickets();
	}, [unitId]);


	const filteredTickets = useMemo(() => {
		return tickets.filter((ticket) => {
			const matchesSearch =
				ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
			const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
			const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;

			return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
		});
	}, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter]);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-IN', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const getTimeAgo = (dateString: string) => {
		const now = new Date();
		const date = new Date(dateString);
		const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

		if (diffInHours < 1) return 'Just now';
		if (diffInHours < 24) return `${diffInHours}h ago`;
		return `${Math.floor(diffInHours / 24)}d ago`;
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'Critical':
				return 'bg-red-100 text-red-700 border-red-200';
			case 'High':
				return 'bg-orange-100 text-orange-700 border-orange-200';
			case 'Medium':
				return 'bg-yellow-100 text-yellow-700 border-yellow-200';
			case 'Low':
				return 'bg-green-100 text-green-700 border-green-200';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	};

	const getStatusDotColor = (status: string) => {
		switch (status) {
			case 'Open':
				return 'bg-blue-500';
			case 'In Progress':
				return 'bg-purple-500';
			case 'pending':
				return 'bg-yellow-500';
			case 'Review Pending':
				return 'bg-yellow-500';
			case 'Resolved':
				return 'bg-green-500';
			case 'Closed':
				return 'bg-gray-400';
			default:
				return 'bg-gray-400';
		}
	};
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Open':
				return 'text-blue-700 bg-blue-50';
			case 'In Progress':
				return 'text-purple-700 bg-purple-50';
			case 'Pending':
			case 'Review Pending':
				return 'text-yellow-700 bg-yellow-50';
			case 'Resolved':
				return 'text-green-700 bg-green-50';
			case 'Closed':
				return 'text-gray-700 bg-gray-100';
			default:
				return 'text-gray-700 bg-gray-50';
		}
	};

	const statCards = [
		{
			title: 'Total Tickets',
			value: tickets.length,
			color: 'blue',
			icon: <Tag className="w-5 h-5" />,
			onClick: () => {
				setStatusFilter('all');
				setPriorityFilter('all');
				setCategoryFilter('all');
			},
		},
		{
			title: 'Open',
			value: tickets.filter((t) => t.status === 'Open').length,
			color: 'sky',
			icon: <Clock className="w-5 h-5" />,
			onClick: () => setStatusFilter('Open'),
		},
		{
			title: 'In Progress',
			value: tickets.filter((t) => t.status === 'In Progress').length,
			color: 'purple',
			icon: <Clock className="w-5 h-5" />,
			onClick: () => setStatusFilter('In Progress'),
		},
		{
			title: 'Pending',
			value: tickets.filter((t) => t.status === 'Pending').length,
			color: 'amber',
			icon: <Calendar className="w-5 h-5" />,
			onClick: () => setStatusFilter('Pending'),
		},
		{
			title: 'Resolved',
			value: tickets.filter((t) => t.status === 'Resolved').length,
			color: 'emerald',
			icon: <CheckCircle className="w-5 h-5" />,
			onClick: () => setStatusFilter('Resolved'),
		},
		{
			title: 'Closed',
			value: tickets.filter((t) => t.status === 'Closed').length,
			color: 'rose',
			icon: <AlertTriangle className="w-5 h-5" />,
			onClick: () => setStatusFilter('Closed'),
		},
	];

	const handleViewTicket = (ticket: Ticket | null) => {
		setSelectedTicket(ticket);
		setShowDetailsModal(Boolean(ticket));
	};


	const activeFilters = [
		statusFilter !== 'all' && { label: `Status: ${statusFilter}`, tone: 'blue' as FilterTone },
		priorityFilter !== 'all' && { label: `Priority: ${priorityFilter}`, tone: 'red' as FilterTone },
		categoryFilter !== 'all' && { label: `Category: ${categoryFilter}`, tone: 'slate' as FilterTone },
		searchTerm && { label: `Search: "${searchTerm}"`, tone: 'green' as FilterTone },
	].filter(Boolean) as { label: string; tone: FilterTone }[];

	return (
		<div className="min-h-screen  bg-gradient-to-b text-md from-slate-50 to-white py-10">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-glass rounded-3xl p-8 mb-6 relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 pointer-events-none"></div>
					<div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
						<div>
							<div className="flex items-center gap-2 mb-2">
								<span className="h-px w-8 bg-blue-500"></span>
								<p className="text-xs uppercase tracking-widest text-blue-600 font-bold">Operations Center</p>
							</div>
							<h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">Ticket Management</h1>
							<p className="text-slate-500 mt-3 max-w-2xl text-lg">Monitor incidents, triage requests, and ensure seamless hospital operations.</p>
						</div>

						<button
							onClick={() => setShowAddModal(true)}
							className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 px-8 py-4 text-white font-semibold shadow-[0_8px_30px_rgb(59,130,246,0.4)] transition-all duration-300 hover:shadow-[0_8px_40px_rgb(59,130,246,0.6)] hover:scale-105 active:scale-95"
						>
							<Plus className="w-5 h-5" />
							<span>Raise Ticket</span>
						</button>
					</div>
				</div>


				<div className="space-y-10 divide-y divide-slate-200">
					<section className="pt-2">
						<div className="bg-transparent pt-4">
							<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
								{statCards.map((card) => {
									const isActive = (card.title === 'Total Tickets' && statusFilter === 'all') || card.title === statusFilter;

									// Color mapping for dynamic classes
									const colorMap: Record<string, { bg: string, light: string, icon: string, ring: string }> = {
										blue: { bg: 'bg-blue-500', light: 'bg-blue-200', icon: 'bg-blue-500', ring: 'ring-blue-500' },
										sky: { bg: 'bg-sky-500', light: 'bg-sky-200', icon: 'bg-sky-500', ring: 'ring-sky-500' },
										purple: { bg: 'bg-purple-500', light: 'bg-purple-200', icon: 'bg-purple-500', ring: 'ring-purple-500' },
										amber: { bg: 'bg-amber-500', light: 'bg-amber-200', icon: 'bg-amber-500', ring: 'ring-amber-500' },
										emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-200', icon: 'bg-emerald-500', ring: 'ring-emerald-500' },
										rose: { bg: 'bg-rose-500', light: 'bg-rose-200', icon: 'bg-rose-500', ring: 'ring-rose-500' },
									};
									const colors = colorMap[card.color] || colorMap.blue;

									return (
										<button
											key={card.title}
											onClick={card.onClick}
											className={`relative w-full rounded-[24px] bg-white p-6 text-left shadow-[0_2px_15px_rgba(0,0,0,0.03)] border transition-all duration-300 overflow-hidden ${isActive ? `ring-2 ring-offset-2 ${colors.ring} border-transparent` : 'border-slate-100 hover:-translate-y-1 hover:shadow-lg group'}`}
										>
											{/* Decorative Circle */}
											<div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${isActive ? colors.bg : colors.light} opacity-50 transition-transform duration-500 group-hover:scale-125`} />

											{/* Icon */}
											<div className={`relative mb-6 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md ${colors.icon}`}>
												{card.icon}
											</div>

											{/* Content */}
											<div className="relative">
												<p className="text-3xl font-bold text-slate-800 tracking-tight">{card.value}</p>
												<p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{card.title}</p>
											</div>
										</button>
									);
								})}
							</div>
						</div>
					</section>

					<section className="pt-2">
						<div className="bg-white/80 backdrop-blur-md border border-white/60 shadow-lg shadow-slate-200/40 rounded-3xl p-6 relative overflow-visible z-20">
							<div className="flex flex-col gap-4">

								{/* Top Bar: Search + Dropdowns */}
								<div className="flex flex-col md:flex-row gap-4">
									{/* Search - Grows to fill space */}
									<div className="relative flex-1 group">
										<Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
										<input
											type="text"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											placeholder="Search tickets..."
											className="w-full rounded-2xl border border-slate-200 bg-white/50 pl-12 pr-4 py-3.5 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
										/>
									</div>

									{/* Priority Dropdown */}
									<div className="relative">
										<button
											onClick={() => {
												setShowPriorityDropdown(!showPriorityDropdown);
												setShowCategoryDropdown(false);
											}}
											className={`h-full px-5 py-3.5 rounded-2xl border flex items-center gap-3 transition-all duration-200 ${priorityFilter !== 'all' || showPriorityDropdown
												? 'bg-slate-800 text-white border-slate-800 shadow-md'
												: 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
												}`}
										>
											<span className="text-sm font-semibold">Priority</span>
											<ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showPriorityDropdown ? 'rotate-180' : ''}`} />
										</button>

										{/* Dropdown Menu */}
										{showPriorityDropdown && (
											<div className="absolute top-full right-0 mt-2 w-56 p-2 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 z-50 animate-in fade-in zoom-in-95 duration-200">
												<p className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400">Select Priority</p>
												{priorityOptions.map((option) => (
													<button
														key={option}
														onClick={() => {
															setPriorityFilter(option);
															setShowPriorityDropdown(false);
														}}
														className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${priorityFilter === option
															? 'bg-emerald-50 text-emerald-700'
															: 'text-slate-600 hover:bg-slate-50'
															}`}
													>
														{option === 'all' ? 'All Priorities' : option}
														{priorityFilter === option && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
													</button>
												))}
											</div>
										)}
									</div>

									{/* Category Dropdown */}
									<div className="relative">
										<button
											onClick={() => {
												setShowCategoryDropdown(!showCategoryDropdown);
												setShowPriorityDropdown(false);
											}}
											className={`h-full px-5 py-3.5 rounded-2xl border flex items-center gap-3 transition-all duration-200 ${categoryFilter !== 'all' || showCategoryDropdown
												? 'bg-slate-800 text-white border-slate-800 shadow-md'
												: 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
												}`}
										>
											<span className="text-sm font-semibold">Category</span>
											<ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
										</button>

										{/* Dropdown Menu */}
										{showCategoryDropdown && (
											<div className="absolute top-full right-0 mt-2 w-64 p-2 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-80 overflow-y-auto">
												<p className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400">Select Category</p>
												<button
													onClick={() => {
														setCategoryFilter('all');
														setShowCategoryDropdown(false);
													}}
													className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${categoryFilter === 'all'
														? 'bg-blue-50 text-blue-700'
														: 'text-slate-600 hover:bg-slate-50'
														}`}
												>
													All Categories
													{categoryFilter === 'all' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
												</button>
												{TICKET_CATEGORIES.map((category) => (
													<button
														key={category}
														onClick={() => {
															setCategoryFilter(category);
															setShowCategoryDropdown(false);
														}}
														className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${categoryFilter === category
															? 'bg-blue-50 text-blue-700'
															: 'text-slate-600 hover:bg-slate-50'
															}`}
													>
														{category}
														{categoryFilter === category && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
													</button>
												))}
											</div>
										)}
									</div>
								</div>

								{/* Active Filters Row */}
								<div className="flex items-center justify-between pt-2">
									<div className="flex flex-wrap items-center gap-3">
										<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active:</span>
										{activeFilters.length === 0 && <span className="text-xs text-slate-400 italic">No filters applied</span>}
										{activeFilters.map((filter) => (
											<span
												key={filter.label}
												className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border bg-white shadow-sm ${filterToneClasses[filter.tone]} animate-in fade-in zoom-in duration-300`}
											>
												{filter.label}
											</span>
										))}
									</div>

									{activeFilters.length > 0 && (
										<button
											onClick={() => {
												setStatusFilter('all');
												setPriorityFilter('all');
												setCategoryFilter('all');
												setSearchTerm('');
											}}
											className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline transition-all"
										>
											Clear All
										</button>
									)}
								</div>
							</div>
						</div>
					</section>

					<section className="pt-10 space-y-6">
						<div className="space-y-4 md:hidden">
							{filteredTickets.map((ticket) => (
								<div key={ticket.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
									<div className="flex flex-wrap items-start gap-3">
										<div className="flex-1">
											<p className="text-sm uppercase tracking-wide text-slate-400">{ticket.department}</p>
											<h3 className="text-lg font-semibold text-slate-900">{ticket.title}</h3>
											<p className="text-sm text-slate-500 mt-1">{ticket.description}</p>
										</div>
										<span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
											{ticket.priority}
										</span>
									</div>

									<div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
										<span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
											<Tag className="h-3.5 w-3.5" />
											{ticket.category}
										</span>
										<span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
											<User className="h-3.5 w-3.5" />
											{ticket.assignedTo || 'Unassigned'}
										</span>
										<span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${getStatusColor(ticket.status)} border border-slate-100`}>
											<span className={`h-2 w-2 rounded-full ${getStatusDotColor(ticket.status)}`} />
											{ticket.status}
										</span>
									</div>

									<div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
										<div>
											<p className="text-xs uppercase tracking-wide text-slate-400">Created</p>
											<p className="text-sm font-semibold text-slate-900">{getTimeAgo(ticket.createdAt)}</p>
											<p className="text-xs text-slate-400">{formatDate(ticket.createdAt)}</p>
										</div>
										<div className="flex flex-wrap items-center gap-2">
											<button
												onClick={() => handleViewTicket(ticket)}
												className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600"
											>
												<Eye className="h-4 w-4" />
												View
											</button>
											<button
												onClick={() => handleSlip(ticket)}
												className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-500 hover:text-blue-600 hover:border-blue-300"
												title="Service call slip"
											>
												<FileText className="h-4 w-4" />
												<span className="sr-only">Service call slip</span>
											</button>
										</div>
									</div>
								</div>
							))}
							{filteredTickets.length === 0 && (
								<div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
									No tickets match the current filters.
								</div>
							)}
						</div>

						<div className="hidden md:block">
							<div className="bg-white rounded-2xl border-2 border-slate-200 ring-1 ring-slate-100 shadow-sm overflow-x-auto">
								<table className="w-full table-auto">
									<thead>
										<tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
											<th className="px-6 py-4">Ticket</th>
											<th className="px-6 py-4">Category</th>
											<th className="px-6 py-4">Priority</th>
											<th className="px-6 py-4">Status</th>
											<th className="px-6 py-4">Assigned To</th>
											<th className="px-6 py-4">Created</th>
											<th className="px-6 py-4 text-right">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100">
										{filteredTickets.map((ticket) => (
											<tr key={ticket.id} className="hover:bg-slate-50/60 transition">
												<td className="px-6 py-4 align-top">
													<p className="font-semibold text-slate-900">{ticket.title}</p>
													<p className="text-sm text-slate-500 mt-1 line-clamp-2">{ticket.description}</p>
													<div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
														<User className="w-4 h-4" />

														<span className="text-slate-300">•</span>
														<span>{ticket.department}</span>
													</div>
												</td>
												<td className="px-6 py-4 align-top">
													<span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{ticket.category}</span>
												</td>
												<td className="px-6 py-4 align-top">
													<span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
														{ticket.priority}
													</span>
												</td>
												<td className="px-6 py-4 align-top">
													<div className="flex items-center gap-2">
														<span className={`w-2 h-2 rounded-full ${getStatusDotColor(ticket.status)}`} />
														<span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
															{ticket.status}
														</span>
													</div>
												</td>
												<td className="px-6 py-4 align-top">
													{ticket.assignedTo ? (
														<div className="flex items-center gap-3">
															<div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-semibold">
																{ticket.assignedTo
																	.split(' ')
																	.map((part) => part.charAt(0))
																	.join('')
																	.slice(0, 2)}
															</div>
															<div>
																<p className="text-sm font-semibold text-slate-900">{ticket.assignedTo}</p>
																<p className="text-xs text-slate-400">Owner</p>
															</div>
														</div>
													) : (
														<span className="text-slate-400 text-sm">Unassigned</span>
													)}
												</td>
												<td className="px-6 py-4 align-top">
													<p className="text-sm font-semibold text-slate-900">{getTimeAgo(ticket.createdAt)}</p>
													<p className="text-xs text-slate-400">{formatDate(ticket.createdAt)}</p>
												</td>
												<td className="px-6 py-4 align-top text-right">
													<div className="flex justify-end gap-3">
														<button
															onClick={() => handleViewTicket(ticket)}
															className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
														>
															<Eye className="w-4 h-4" />
															View
														</button>
														<button
															onClick={() => handleSlip(ticket)}
															className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-500 hover:text-blue-600 hover:border-blue-300"
															title="Service call slip"
														>
															<FileText className="w-4 h-4" />
															<span className="sr-only">Service call slip</span>
														</button>
													</div>
												</td>
											</tr>
										))}
										{filteredTickets.length === 0 && (
											<tr>
												<td colSpan={7} className="px-6 py-16 text-center text-slate-500">
													No tickets match the current filters.
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					</section>
				</div>

				{showAddModal && (
					<AddTicketModal
						isOpen={showAddModal}
						onClose={() => setShowAddModal(false)}
						onSubmit={handleAddTicket}
						equipments={[]}
					/>
				)}

				{showDetailsModal && selectedTicket && (
					<TicketDetailsModal
						isOpen={showDetailsModal}
						onClose={() => handleViewTicket(null)}
						ticket={selectedTicket}
						onUpdate={handleUpdateTicket}
						equipments={[]}
					/>
				)}
				{showSlip && selectedTicket && (
					<ServiceSlip
						ticket={selectedTicket}
						onClose={() => setShowSlip(false)}
						onAccept={handleUpdateTicket}
						onDecline={handleUpdateTicket}
					/>
				)}
			</div>
		</div>
	);
};

export default TicketManagement;

