'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  type = 'danger'
}: ConfirmModalProps) {
  
  const colors = {
    danger: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100',
    info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
  };

  const icons = {
    danger: '⚠️',
    warning: '🔔',
    info: 'ℹ️'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-10 text-center">
              <div className="text-5xl mb-6">{icons[type]}</div>
              <h3 className="text-2xl font-black text-slate-800 mb-3">{title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-10">
                {message}
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`w-full py-4 rounded-2xl text-white font-black transition-all shadow-xl active:scale-95 ${colors[type]}`}
                >
                  {confirmText}
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
