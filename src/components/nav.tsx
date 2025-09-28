'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuIcon, XIcon } from 'lucide-react';

const Navbar = () => {
  const [open, setOpen] = useState(false);

  // Disable/enable overflow when menu is open
  useEffect(() => {
    if (open) {
      // Disable overflow when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Enable overflow when menu is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function: enable overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <nav className="bg-white border-b border-neutral-200 relative z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <div className="text-2xl font-bold font-display text-neutral-900">
          DabSudoku
        </div>
        <div className="hidden sm:flex space-x-6">
          <div className="text-neutral-900 cursor-pointer">
            New Game
          </div>
          <div className="text-neutral-900 cursor-pointer">
            How to Play
          </div>
        </div>
        <div className="flex sm:hidden">
          {/* Mobile menu button */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="inline-flex items-center rounded-md p-2 text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 z-50 cursor-pointer"
            onClick={() => setOpen((v) => !v)}
          >
            {/* Hamburger icon */}
            {open ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden fixed inset-0 z-40 backdrop-blur-xl"
            aria-modal="true"
            role="dialog"
          >
            {/* Backdrop clickable area to close */}
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 cursor-default"
              onClick={() => setOpen(false)}
            />
            {/* Menu panel */}
            <div className="relative z-10 flex h-screen py-16">
              <div className="max-w-sm p-4">
                <div className="space-y-2">
                  <button
                    className="block w-full text-left text-neutral-900 font-bold text-xl font-display py-2 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    New Game
                  </button>
                  <button
                    className="block w-full text-left text-neutral-900 font-bold text-xl font-display py-2 cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    How to Play
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;