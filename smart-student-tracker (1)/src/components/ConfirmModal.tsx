import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-border relative overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDangerous ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
                {isDangerous ? <Trash2 size={24} /> : <AlertCircle size={24} />}
              </div>
              <div>
                <h3 className="text-xl font-black text-text-main leading-tight">{title}</h3>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Confirmation Required</p>
              </div>
            </div>

            <p className="text-sm text-text-muted font-medium mb-8 leading-relaxed">
              {message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 bg-background text-text-main border border-border font-bold rounded-xl text-sm hover:bg-slate-50 transition-all dark:hover:bg-white/5"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-3.5 text-white font-bold rounded-xl shadow-lg text-sm transition-all active:scale-95 ${
                  isDangerous ? 'bg-danger shadow-danger/20 hover:opacity-90' : 'bg-primary shadow-primary/20 hover:opacity-90'
                }`}
              >
                {confirmText}
              </button>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
