import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface GlassSelectProps {
    value: string | number;
    onChange: (value: string | number) => void;
    options: { label: string; value: string | number }[];
    placeholder?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    colorMap?: Record<string, string>;
}

export default function GlassSelect({
    value,
    onChange,
    options,
    placeholder = "Select an option",
    icon,
    disabled = false,
    colorMap
}: GlassSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((o) => o.value == value);
    const selectedLabel = selectedOption?.label || placeholder;
    const selectedColor = colorMap?.[value as string];

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
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full ${icon ? 'pl-10' : 'px-4'} pr-10 py-2 text-left border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 flex items-center justify-between ${disabled
                    ? "bg-gray-100 border-gray-300 cursor-not-allowed text-gray-400"
                    : `bg-white/60 border-gray-300 hover:bg-white/80 text-[#303036] ${isOpen ? "ring-2 ring-[#3B82F6]/50 border-transparent" : ""
                    }`
                    }`}
            >
                <span className={`block truncate ${selectedColor ? selectedColor : (!value ? "text-gray-400" : "")}`}>
                    {selectedLabel}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border border-white/60 rounded-xl shadow-lg max-h-48 overflow-auto animate-fadeIn custom-scrollbar">
                    {options.map((option) => {
                        const colorClass = colorMap?.[option.value as string];
                        return (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors duration-150 ${value == option.value
                                    ? "bg-blue-50 font-medium"
                                    : "hover:bg-gray-100"
                                    } ${colorClass || 'text-gray-700'}`}
                            >
                                {option.label}
                            </div>
                        );
                    })}
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
