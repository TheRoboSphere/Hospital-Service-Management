import React, { useState } from 'react';
import { Ticket, TicketComment } from '../types';

import {
  MessageSquare,
} from 'lucide-react';

interface TicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onUpdate: (ticket: Ticket) => void;
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onUpdate
}) => {

  const [newComment, setNewComment] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    const priorityLower = priority.toLowerCase();
    switch (priorityLower) {
      case 'critical': return 'bg-red-50 text-red-700 border border-red-200';
      case 'high': return 'bg-red-50 text-red-700 border border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border border-green-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-purple-100 text-purple-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Resolved': return 'bg-green-100 text-green-700';
      case 'Closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const comments = ticket.comments ?? [];

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: TicketComment = {
      id: Date.now().toString(),
      ticketId: ticket.id,
      author: ticket.createdBy || 'Unknown',
      content: newComment,
      createdAt: new Date().toISOString(),
      isInternal: false,
    };

    onUpdate({
      ...ticket,
      comments: [...comments, comment], // ✅ SAFE
      updatedAt: new Date().toISOString(),
    });

    setNewComment('');
  };







  /* ---------------- BODY SCROLL LOCK ---------------- */
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Ticket Details</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">#{ticket.id}</span>
          </div>
        </div>

        <div className="p-8 space-y-8">

          {/* TITLE & META */}
          <div className="space-y-4">
            {/* Row 1: Title + Created */}
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-bold text-slate-900">{ticket.title}</h3>
              <span className="text-slate-500 text-sm mt-1">
                {formatDate(ticket.createdAt)}
              </span>
            </div>

            {/* Row 2: Priority + Category + Status */}
            <div className="flex items-center gap-3 text-sm">
              <span className={`px-3 py-1 rounded-full font-semibold ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority.toLowerCase()} Priority
              </span>

              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-semibold">
                {ticket.category}
              </span>

              <span className={`px-3 py-1 rounded-full font-semibold ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
          </div>

          {/* ASSIGNED TO & DESCRIPTION (Swapped) */}
          <div className="flex items-start gap-6">
            <div className="space-y-2 shrink-0 w-1/3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Assigned To</h4>
              <div className="flex items-center justify-start gap-2">
                {ticket.assignedToDepartment ? (
                  <div>
                    <span className="block font-medium text-slate-900">{ticket.assignedToDepartment}</span>
                    <span className="block text-xs text-slate-500">{ticket.assignedTo || 'Unassigned'}</span>
                  </div>
                ) : (
                  <span className="font-medium text-slate-900">{ticket.assignedTo || 'Unassigned'}</span>
                )}
              </div>
            </div>

            <div className="space-y-2 flex-1 border-l border-slate-100 pl-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Description</h4>
              <p className="text-slate-700 leading-relaxed text-sm">{ticket.description}</p>
            </div>
          </div>

          {/* SEPARATOR */}
          <div className="h-px bg-slate-200/60" />

          {/* COMMENTS */}
          <div>
            {/* COMMENTS HEADER ROW */}
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide">
                <MessageSquare className="w-4 h-4" />
                Comments ({comments.length})
              </h4>

              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:bg-slate-300 disabled:cursor-not-allowed transition shadow-sm"
              >
                Add Comment
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {comments.map(comment => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-xl ${comment.isInternal
                    ? 'bg-yellow-50/80 border-l-4 border-yellow-400'
                    : 'bg-white border border-slate-200 shadow-sm'
                    }`}
                >
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {comment.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-semibold text-sm text-slate-900">{comment.author}</span>
                      {comment.isInternal && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-semibold">
                          Internal
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{getTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed ml-8">{comment.content}</p>
                </div>
              ))}
            </div>

            {/* ADD COMMENT INPUT */}
            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm shadow-sm"
                rows={4}
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default TicketDetailsModal;
