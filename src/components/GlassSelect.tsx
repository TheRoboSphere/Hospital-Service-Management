import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
    label: string;
    value: string | number;
}

interface GlassSelectProps {
    value: string | number;
    onChange: (value: string | number) => void;
    options: Option[];
    placeholder?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export default function GlassSelect({
    value,
    onChange,
    options,
    placeholder = "Select",
    icon,
    disabled = false,
}: GlassSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedLabel = options.find((o) => o.value == value)?.label || placeholder;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val: string | number) => {
        if (disabled) return;
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Icon Wrapper */}
            {icon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                    {icon}
                </div>
            )}

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full pl-10 pr-10 py-3 text-left border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 flex items-center justify-between ${disabled
                    ? "bg-gray-100 border-gray-300 cursor-not-allowed text-gray-400"
                    : `bg-white/60 border-gray-300 hover:bg-white/80 text-[#303036] ${isOpen ? "ring-2 ring-[#3B82F6]/50 border-transparent" : ""
                    }`
                    }`}
            >
                <span className={`block truncate ${!value ? "text-gray-400" : ""}`}>
                    {selectedLabel}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border border-white/60 rounded-xl shadow-lg max-h-40 overflow-auto animate-fadeIn custom-scrollbar">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`px-4 py-2.5 cursor-pointer text-sm transition-colors duration-150 ${value == option.value
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {option.label}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                            No options
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
