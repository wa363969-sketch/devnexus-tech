import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';

export default function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 520);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
          className="fixed inset-0 z-[100] bg-slate-50 dark:bg-navy-950 flex flex-col items-center justify-center gap-5 pointer-events-none"
          aria-hidden="true"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <BrandLogo size="lg" />
          </motion.div>
          <div className="w-48 h-1 rounded-full bg-slate-200 dark:bg-navy-800 overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full bg-gradient-to-r from-sky-500 via-electric-400 to-blue-600"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
