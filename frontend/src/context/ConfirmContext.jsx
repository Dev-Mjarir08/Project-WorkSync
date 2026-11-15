import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  AlertTriangle,
  Trash2,
  AlertCircle,
  HelpCircle,
  X,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger', // 'danger' | 'warning' | 'info'
    resolve: null
  });

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure you want to proceed? This action cannot be undone.',
        confirmText: options.confirmText || (options.type === 'danger' || !options.type ? 'Delete' : 'Confirm'),
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'danger',
        resolve
      });
    });
  }, []);

  const handleClose = useCallback((result = false) => {
    if (dialogState.resolve) {
      dialogState.resolve(result);
    }
    setDialogState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [dialogState]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && dialogState.isOpen) {
        handleClose(false);
      }
    };
    if (dialogState.isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogState.isOpen, handleClose]);

  const getTheme = () => {
    switch (dialogState.type) {
      case 'danger':
        return {
          icon: Trash2,
          iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
          confirmBtn: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 shadow-rose-600/30 text-white',
          glow: 'bg-rose-600/10'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
          confirmBtn: 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 shadow-amber-600/30 text-white',
          glow: 'bg-amber-600/10'
        };
      case 'info':
      default:
        return {
          icon: HelpCircle,
          iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25',
          confirmBtn: 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-indigo-600/30 text-white',
          glow: 'bg-indigo-600/10'
        };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.icon;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {/* Confirmation Popup Modal */}
      {dialogState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          {/* Backdrop Click */}
          <div
            className="absolute inset-0"
            onClick={() => handleClose(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-[#0d1322] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 overflow-hidden transform transition-all animate-scaleUp">
            {/* Ambient Background Glow */}
            <div className={`absolute -top-24 -left-24 w-48 h-48 ${theme.glow} rounded-full blur-3xl pointer-events-none`} />

            {/* Close Button */}
            <button
              onClick={() => handleClose(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content Header */}
            <div className="flex items-start gap-4">
              <div className={`p-3.5 rounded-2xl ${theme.iconBg} shrink-0 shadow-lg`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div className="pr-4 pt-1">
                <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                  {dialogState.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {dialogState.message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-7 flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-semibold border border-slate-800 transition-all cursor-pointer"
              >
                {dialogState.cancelText}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => handleClose(true)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition-all cursor-pointer ${theme.confirmBtn}`}
              >
                {dialogState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export default ConfirmProvider;
