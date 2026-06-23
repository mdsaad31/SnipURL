"use client";

import { Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onClear: () => void;
  loading: boolean;
}

export function BulkActionBar({
  selectedCount,
  onDelete,
  onActivate,
  onDeactivate,
  onClear,
  loading,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 fade-in duration-300 px-4 w-full max-w-sm md:max-w-none md:w-auto">
      <div className="flex items-center gap-3 px-5 py-3 bg-[#1A1410]/95 backdrop-blur-md border border-[#3D352C] rounded-[16px] shadow-2xl">
        {/* Count */}
        <span className="text-white/90 text-sm font-medium whitespace-nowrap">
          {selectedCount} link{selectedCount !== 1 ? "s" : ""} selected
        </span>

        {/* Divider */}
        <div className="w-px h-5 bg-white/20" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onActivate}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-btn transition-colors disabled:opacity-50"
            title="Activate selected"
          >
            <ToggleRight className="w-4 h-4" />
            <span className="hidden sm:inline">Activate</span>
          </button>
          <button
            onClick={onDeactivate}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-btn transition-colors disabled:opacity-50"
            title="Deactivate selected"
          >
            <ToggleLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Deactivate</span>
          </button>
          <button
            onClick={onDelete}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-500/15 rounded-btn transition-colors disabled:opacity-50"
            title="Delete selected"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/20" />

        {/* Clear */}
        <button
          onClick={onClear}
          className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-btn transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
