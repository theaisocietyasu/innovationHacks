"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Create a more reliable modal trigger
let modalTriggerCallback: (() => void) | null = null;
let isModalOpenGlobal = false;

export const openRSVPModal = () => {
  console.log("openRSVPModal called");
  isModalOpenGlobal = true;
  
  // Try both methods for reliability
  if (modalTriggerCallback) {
    modalTriggerCallback();
  }
  
  // Also dispatch event as fallback
  try {
    const event = new CustomEvent('openRSVPModal');
    document.dispatchEvent(event);
  } catch (e) {
    console.error("Error dispatching event:", e);
  }
};

const RSVPForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Setup the callback reference
  useEffect(() => {
    console.log("Setting up modal trigger callback");
    modalTriggerCallback = () => {
      console.log("Modal trigger callback executed");
      setIsModalOpen(true);
    };
    
    // Check if modal should be open from global state
    if (isModalOpenGlobal) {
      setIsModalOpen(true);
      isModalOpenGlobal = false;
    }
    
    return () => {
      modalTriggerCallback = null;
    };
  }, []);

  useEffect(() => {
    // Listen for the custom event to open the modal
    const handleOpenModal = () => {
      console.log("openRSVPModal event received");
      setIsModalOpen(true);
    };
    
    document.addEventListener('openRSVPModal', handleOpenModal);

    return () => {
      document.removeEventListener('openRSVPModal', handleOpenModal);
    };
  }, []);

  useEffect(() => {
    // Set a timeout to hide the loading spinner after iframe should have loaded
    if (isModalOpen) {
      console.log("Modal opened, setting up loading timer");
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  // Close modal when ESC key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const closeModal = () => {
    console.log("Closing modal");
    setIsModalOpen(false);
    setLoading(true);
  };

  return (
    <section id="rsvp" className="w-full py-24 flex flex-col items-center">
      {/* Purple gradient in background */}
      <div className="absolute left-0 top-1/4 w-[300px] h-[300px] bg-purple-600/20 rounded-full filter blur-[100px] -z-10"></div>
      <div className="absolute right-0 bottom-1/4 w-[300px] h-[300px] bg-indigo-600/20 rounded-full filter blur-[100px] -z-10"></div>
      
      {/* <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container px-4 sm:px-6 md:px-8 w-full"
      >
        <h2 className="text-center text-white text-3xl sm:text-4xl md:text-4xl xl:text-5xl font-bold mb-8">
          RSVP <span className="text-[#f0abfc]">Now</span>
        </h2>
        <p className="text-center text-gray-300 max-w-2xl mx-auto mb-10 text-lg">
          Register for Innovation Hacks and join us for an amazing hackathon experience!
        </p>
        
        <div className="flex justify-center">
          <button
            onClick={() => {
              console.log("RSVP button clicked");
              setIsModalOpen(true);
            }}
            className="px-8 py-4 bg-[#E066FF] text-white font-bold rounded-lg hover:bg-[#D15FEF] transition-colors duration-300 shadow-lg shadow-[#f0abfc]/20"
          >
            Open RSVP Form
          </button>
        </div>
      </motion.div> */}

      {/* Modal - Moved outside the motion.div */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999]"
              onClick={closeModal}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, type: "spring", damping: 20 }}
              className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
            >
              <div className="w-full max-w-[95%] md:max-w-[90%] lg:max-w-[85%] max-h-[95vh] rounded-xl overflow-hidden border-2 border-[#f0abfc] shadow-lg shadow-[#f0abfc]/20 backdrop-blur-sm bg-black/90">
                {/* Header */}
                <div className="relative bg-[#18181b] rounded-t-xl px-4 py-3 flex items-center justify-center border-b border-[#f0abfc]/50">
                  <div className="flex space-x-2 absolute left-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <h3 className="text-center text-[#f0abfc] font-medium">Innovation Hacks RSVP Form</h3>
                  <button 
                    className="absolute right-4 text-white hover:text-[#f0abfc] transition-colors"
                    onClick={closeModal}
                  >
                    ✕
                  </button>
                </div>
                
                {/* Loading spinner */}
                {loading && (
                  <div className="flex justify-center items-center h-[700px] bg-black/30 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f0abfc]"></div>
                  </div>
                )}
                
                {/* Iframe with Notion RSVP form */}
                <div className={`${loading ? 'hidden' : 'block'} max-h-[85vh]`}>
                  <iframe 
                    src="https://innovationhacks.notion.site/ebd/1ce8867868b480b19869df71a158e637" 
                    width="100%" 
                    height="800" 
                    className="bg-transparent backdrop-blur-lg"
                    frameBorder="0" 
                    allowFullScreen
                    loading="lazy"
                    onLoad={() => setLoading(false)}
                  ></iframe>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default RSVPForm; 