import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, HelpCircle, X } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const getTheme = () => {
    switch (type) {
      case 'danger':
        return {
          icon: Trash2,
          iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
          confirmBtn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
          glow: 'bg-rose-600/10'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
          confirmBtn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
          glow: 'bg-amber-600/10'
        };
      case 'info':
      default:
        return {
          icon: HelpCircle,
          iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25',
          confirmBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30',
          glow: 'bg-indigo-600/10'
        };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.icon;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={!loading ? onClose : undefined} />
      <div className="relative w-full max-w-md bg-[#0d1322] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 overflow-hidden transform transition-all animate-scaleUp">
        <div className={`absolute -top-24 -left-24 w-48 h-48 ${theme.glow} rounded-full blur-3xl pointer-events-none`} />

        <button
          onClick={!loading ? onClose : undefined}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-2xl ${theme.iconBg} shrink-0 shadow-lg`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="pr-4 pt-1">
            <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
              {title}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-semibold border border-slate-800 transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            autoFocus
            disabled={loading}
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition-all cursor-pointer disabled:opacity-50 ${theme.confirmBtn}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
