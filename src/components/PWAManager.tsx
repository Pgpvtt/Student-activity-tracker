import React, { useState, useEffect } from 'react';
import { Download, WifiOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PWAManager = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      // Show the install banner
      setShowInstallBanner(true);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setInstallPrompt(null);
    setShowInstallBanner(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md"
          >
            <div className="bg-danger text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border border-red-400/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <WifiOff size={18} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">You are offline</p>
                  <p className="text-[10px] font-bold opacity-90">Some features might be limited.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 z-[150]"
          >
            <div className="bg-card border border-primary/20 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                <button 
                  onClick={() => setShowInstallBanner(false)}
                  className="p-1 text-text-muted hover:text-text-main transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Download className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="font-black text-sm text-text-main">Install Dashboard</h4>
                  <p className="text-[10px] text-text-muted font-bold">Access tracker instantly from your home screen.</p>
                </div>
              </div>

              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 text-[10px] uppercase tracking-widest"
              >
                Install App
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PWAManager;
