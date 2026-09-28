import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
            },
            error: {
              bg: 'bg-rose-50 text-rose-900 border-rose-300',
              icon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
            },
            warning: {
              bg: 'bg-amber-50 text-amber-900 border-amber-300',
              icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
            },
            info: {
              bg: 'bg-sky-50 text-sky-900 border-sky-300',
              icon: <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />,
            },
          }[toast.type] || {
            bg: 'bg-slate-50 text-slate-900 border-slate-300',
            icon: <Info className="w-5 h-5 text-slate-600 flex-shrink-0" />,
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${typeConfig.bg}`}
              role="alert"
            >
              {typeConfig.icon}
              <div className="flex-1 text-sm font-medium leading-snug break-words">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg -mr-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
