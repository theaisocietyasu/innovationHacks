"use client";
import React, { useRef, useState, useEffect } from "react";
import { BsArrowRight } from "react-icons/bs";
import { FaDiscord } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { GrMenu, GrClose } from "react-icons/gr";
import Link from "next/link";
import "@/styles/navbar.css";
import { IH_DISCORD_URL } from "@/lib/constants";

interface NavbarProps {
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="navbar  py-4 px-8  fixed top-0 left-0 right-0 z-20 bg-gradient-to-b from-[#171721] from-40% ">
      <div className="container mx-auto flex items-center justify-between">
        <div className="logo">
          <a href="/" className="text-white text-base md:text-2xl font-bold">
            Innovation Hacks
          </a>
        </div>
        <div className="hidden md:flex items-center space-x-12">
          <a
            href="/#about"
            className={`text-white hover:text-[#E066FF] transition-colors duration-300 ${
              activeSection === "about" ? "text-[#E066FF]" : ""
            }`}
          >
            About
          </a>
          <a
            href="/#schedule"
            className={`text-white hover:text-[#E066FF] transition-colors duration-300 ${
              activeSection === "schedule" ? "text-[#E066FF]" : ""
            }`}
          >
            Schedule
          </a>
          <a
            href="/#sponsors"
            className={`text-white hover:text-[#E066FF] transition-colors duration-300 ${
              activeSection === "sponsors" ? "text-[#E066FF]" : ""
            }`}
          >
            Sponsors
          </a>
          <a
            href="/#faq"
            className={`text-white hover:text-[#E066FF] transition-colors duration-300 ${
              activeSection === "faq" ? "text-[#E066FF]" : ""
            }`}
          >
            FAQs
          </a>
          <a
            href={IH_DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join our Discord"
            className="text-white transition-opacity duration-200 hover:opacity-70"
          >
            <FaDiscord style={{ fontSize: "22px" }} />
          </a>
          <Link
            href="/register"
            className="hero-register-btn !text-sm !px-5 !py-2 !mt-0"
          >
            Register
          </Link>
        </div>
        <div className="block md:hidden">
          <button
            onClick={() => setIsOpenMenu(!isOpenMenu)}
            className="text-white"
          >
            {isOpenMenu ? (
              <GrClose className="text-2xl" />
            ) : (
              <GrMenu className="text-2xl" />
            )}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isOpenMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="block md:hidden bg-[#171721] mt-8 py-4"
          >
            <div className="flex flex-col space-y-4 items-center">
              <a
                href="/#about"
                className={`text-white hover:text-[#E066FF] transition-colors duration-300 ${
                  activeSection === "about" ? "text-[#E066FF]" : ""
                }`}
                onClick={() => setIsOpenMenu(false)}
              >
                About
              </a>
              <a
                href="/#schedule"
                className={`text-white hover:text-[#E066FF] transition-colors duration-300 ${
                  activeSection === "schedule" ? "text-[#E066FF]" : ""
                }`}
                onClick={() => setIsOpenMenu(false)}
              >
                Schedule
              </a>
              <a
                href="/#sponsors"
                className={`text-white hover:text-[#E066FF] transition-colors duration-300 ${
                  activeSection === "sponsors" ? "text-[#E066FF]" : ""
                }`}
                onClick={() => setIsOpenMenu(false)}
              >
                Sponsors
              </a>
              <a
                href="/#faq"
                className={`text-white hover:text-[#E066FF] transition-colors duration-300 ${
                  activeSection === "faq" ? "text-[#E066FF]" : ""
                }`}
                onClick={() => setIsOpenMenu(false)}
              >
                FAQs
              </a>
              <a
                href={IH_DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join our Discord"
                className="text-white transition-opacity duration-200 hover:opacity-70 flex items-center gap-2"
                onClick={() => setIsOpenMenu(false)}
              >
                <FaDiscord style={{ fontSize: "20px" }} />
                Discord
              </a>
              <Link
                href="/register"
                className="hero-register-btn !text-sm !px-5 !py-2 !mt-0"
                onClick={() => setIsOpenMenu(false)}
              >
                Register
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
