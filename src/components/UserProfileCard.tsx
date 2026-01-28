import React from 'react';
import { User } from 'lucide-react';

interface UserProfileCardProps {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        department: string;
        unitId?: number;
    } | null;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => {
    if (!user) return null;

    // Get role-based gradient colors
    const getRoleGradient = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'bg-gradient-to-br from-blue-500 to-blue-600';
            case 'manager':
                return 'bg-gradient-to-br from-purple-500 to-purple-600';
            case 'employee':
                return 'bg-gradient-to-br from-green-500 to-green-600';
            default:
                return 'bg-gradient-to-br from-slate-500 to-slate-600';
        }
    };

    // Get role badge color
    const getRoleBadgeColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'manager':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'employee':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div
            className="p-3 rounded-xl bg-white/50 backdrop-blur-md border border-white/50 shadow-lg hover:bg-white/70 hover:shadow-xl transition-all duration-200"
            style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system' }}
        >
            <div className="flex items-center gap-3">
                {/* Avatar with Initials */}
                <div
                    className={`w-11 h-11 rounded-full ${getRoleGradient(user.role)} flex items-center justify-center flex-shrink-0 shadow-md`}
                >
                    <User className="w-6 h-6 text-white" />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    {/* Name */}
                    <p className="font-semibold text-slate-800 text-sm truncate leading-tight">
                        {user.name}
                    </p>

                    {/* Role Badge */}
                    <span
                        className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border shadow-sm ${getRoleBadgeColor(user.role)}`}
                    >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                </div>
            </div>

            {/* Tooltip on Hover - Optional Enhancement */}
            <div className="mt-2 pt-2 border-t border-white/60 hidden group-hover:block">
                <div className="text-[10px] text-slate-600 space-y-0.5">
                    <p><strong>ID:</strong> #{user.id}</p>
                    <p><strong>Dept:</strong> {user.department}</p>
                    {user.unitId && <p><strong>Unit:</strong> {user.unitId}</p>}
                </div>
            </div>
        </div>
    );
};

export default UserProfileCard;
