import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, User2, Check } from 'lucide-react';
import { User } from '../types';

interface CustomSelectProps {
    value: string | number | null;
    onChange: (value: any) => void;
    options: User[];
    placeholder?: string;
    label?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder = "Select...", label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Loose comparison to handle string/number mismatch
    const selectedUser = options.find(u => u.id == value);

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

    return (
        <div className="relative" ref={containerRef}>
            {/* TRIGGER */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-blue-500 shadow-sm transition-transform group-active:scale-95">
                        <User2 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        {label && (
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                {label}
                            </span>
                        )}
                        <span className={`text-sm font-bold ${selectedUser ? 'text-slate-700' : 'text-slate-400'} font-sans`}>
                            {selectedUser ? `${selectedUser.name} (${selectedUser.role})` : placeholder}
                        </span>
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* DROPDOWN */}
            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full max-h-[250px] overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-100 z-50 p-2 animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
                    {options.map((user) => {
                        // Loose comparison here as well
                        const isSelected = user.id == value;
                        return (
                            <div
                                key={user.id}
                                onClick={() => {
                                    // Convert to number if the prop expects number, or keep as is.
                                    // Since Serviceslip uses Number(val), we should try to emit what matches the ID type if possible, 
                                    // but Serviceslip's state is number|null. User.id is string.
                                    // We will emit the raw User.id (string) and let the parent handle parsing if needed, 
                                    // OR since Serviceslip passes `setAssignedToId` which expects number|null, 
                                    // we should parse it here if we know the parent expects number. 
                                    // HOWEVER, `user.id` is string "1", "2" etc.
                                    // Let's safe cast.
                                    onChange(Number(user.id));
                                    setIsOpen(false);
                                }}
                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${isSelected
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                            >
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm">{user.name}</span>
                                    <span className="text-xs text-slate-400 font-medium">{user.role}</span>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                            </div>
                        );
                    })}

                    {options.length === 0 && (
                        <div className="p-4 text-center text-slate-400 text-sm font-medium">
                            No employees found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
