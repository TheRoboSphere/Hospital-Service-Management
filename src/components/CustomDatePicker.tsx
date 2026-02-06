import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, CalendarClock, ChevronDown, Clock } from 'lucide-react';

interface CustomDatePickerProps {
    value: string;
    onChange: (date: string) => void;
    label?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, label = "Select Date" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse initial value or default to now
    const initialDate = value ? new Date(value) : new Date();

    // View state (for calendar navigation)
    const [viewDate, setViewDate] = useState(initialDate);
    const [selectedDate, setSelectedDate] = useState(initialDate);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Calendar Helpers
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(selectedDate);
        newDate.setFullYear(viewDate.getFullYear());
        newDate.setMonth(viewDate.getMonth());
        newDate.setDate(day);

        setSelectedDate(newDate);
        notifyChange(newDate);
    };

    const handleTimeChange = (type: 'hour' | 'minute', val: string) => {
        const newDate = new Date(selectedDate);
        if (type === 'hour') newDate.setHours(parseInt(val));
        if (type === 'minute') newDate.setMinutes(parseInt(val));

        setSelectedDate(newDate);
        notifyChange(newDate);
    };

    const notifyChange = (date: Date) => {
        // Format to YYYY-MM-DDTHH:mm (datetime-local format)
        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
        onChange(localISOTime);
    };

    // Render Calendar Grid
    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
        }

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const isSelected = selectedDate.getDate() === d &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

            const isToday = new Date().getDate() === d &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

            days.push(
                <button
                    key={d}
                    onClick={() => handleDateClick(d)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors
                    ${isSelected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-100 text-slate-700'}
                    ${!isSelected && isToday ? 'text-blue-600 font-bold bg-blue-50' : ''}
                `}
                >
                    {d}
                </button>
            );
        }
        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="relative" ref={containerRef}>
            {/* TRIGGER */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-blue-500 shadow-sm transition-transform group-active:scale-95">
                        <CalendarClock className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {label}
                        </span>
                        <span className="text-sm font-bold text-slate-700 font-mono">
                            {selectedDate.toLocaleString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', hour12: true
                            })}
                        </span>
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* DROPDOWN */}
            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full sm:w-[320px] bg-white rounded-2xl shadow-xl border border-slate-100 z-50 p-4 animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="font-bold text-slate-700">
                            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </span>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Week Days */}
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <span key={d} className="text-xs font-bold text-slate-400 uppercase">{d}</span>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4 place-items-center">
                        {renderCalendar()}
                    </div>

                    <hr className="border-slate-100 mb-4" />

                    {/* Time Picker */}
                    <div className="flex items-center gap-3 justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Time</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedDate.getHours()}
                                onChange={(e) => handleTimeChange('hour', e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-700 outline-none focus:border-blue-400"
                            >
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                                ))}
                            </select>
                            <span className="text-slate-400 font-bold">:</span>
                            <select
                                value={selectedDate.getMinutes()}
                                onChange={(e) => handleTimeChange('minute', e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-700 outline-none focus:border-blue-400"
                            >
                                {Array.from({ length: 60 }).map((_, i) => (
                                    <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
