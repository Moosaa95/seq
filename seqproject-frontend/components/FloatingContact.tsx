'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-16 sm:bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-3 sm:p-4 w-56 sm:w-64 mb-4"
          >
            <div className="space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Quick Contact</p>

              <a
                href="tel:+2348034567890"
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="bg-gray-100 p-1.5 sm:p-2 rounded-lg group-hover:bg-[#3a3a41] transition-colors flex-shrink-0">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#3a3a41] group-hover:text-white transition-colors" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">Call us</div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">+234 803 456 7890</div>
                </div>
              </a>

              <a
                href="mailto:info@seqprojects.com"
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="bg-gray-100 p-1.5 sm:p-2 rounded-lg group-hover:bg-[#3a3a41] transition-colors flex-shrink-0">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[#3a3a41] group-hover:text-white transition-colors" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">Email us</div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">info@seqprojects.com</div>
                </div>
              </a>

              <Link
                href="/contact"
                className="block w-full bg-[#3a3a41] text-white text-center py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-[#2a2a31] transition-colors text-xs sm:text-sm"
              >
                Contact Form
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-[#3a3a41] text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-gray-500/50 transition-all duration-300 hover:bg-[#2a2a31]"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
