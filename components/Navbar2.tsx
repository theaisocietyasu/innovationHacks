"use client";
import React, { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";

import "@/styles/navbar.css";
import Image from "next/image";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { WiStormShowers } from "react-icons/wi";

const Navbar2 = (activeSection: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (isOpen && event.target.closest(".nav-dropdown") === null) {
        setIsOpen(false);
      }
    }
    // console.log(activeSection);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, activeSection]);

  useEffect(() => {
    // Handle changes to activeSection during scroll events
    // console.log("Active Section during scroll:", activeSection);
  }, [activeSection]);

  function toggleDropdown(event : any) {
    // event.preventDefault();
    setIsOpen(!isOpen);

    if( !isOpenMenu ) {
      setTimeout(() => {
        setIsOpenMenu(!isOpenMenu);
      }, 500);
    } else {
      setIsOpenMenu(!isOpenMenu);
    }
  }


  return (
    <section id="nav" className="mb-36">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 2000 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 2000 }}
          transition={{ duration: 0.5 }}
          className={"nav flex py-8 glassy-effect border-top mt-24 rounded-t-2xl h-screen w-screen fixed md:hidden"}
        />
      )}
      <div className="nav flex py-8 glassy-effect">
        <div className="sm:pl-7 mr-auto">
          <a href="https://duhacks.tech/#top">
            <img
              src="/assets/images/duhacks.png"
              alt="DU Hacks"
              width={50}
              height={50}
            />
          </a>
        </div>
        <div>
          <div className="hidden md:flex flex-wrap gap-5 text-white">
            <div
              className={`nav-titles nav-titles-ltr ${
activeSection === "about" ? "before:w-full bg-red-500" : "" }`}
            >
              <a href="https://duhacks.tech/#about">About</a>
            </div>

            <div
              className={`nav-titles nav-titles-ltr ${
                activeSection === "schedule" ? "before:w-full" : ""
              } `}
            >
              <a href="https://duhacks.tech/#schedule">Schedule</a>
            </div>
            <div
              className={`nav-titles nav-titles-ltr ${
                activeSection === "sponsors" ? "before:w-full" : ""
              } `}
            >
              <a href="https://duhacks.tech/#sponsors">Sponsors</a>
            </div>
            <div
              className={`nav-titles nav-titles-ltr ${
                activeSection === "prizes" ? "before:w-full" : ""
              } `}
            >
              <a href="https://duhacks.tech/#prizes">Prizes</a>
            </div>
            <div
              className={`nav-titles nav-titles-ltr ${
                activeSection === "team" ? "before:w-full" : ""
              } `}
            >
              <a href="https://duhacks.tech/#team">Team</a>
            </div>
            <div
              className={`nav-titles nav-titles-ltr ${
                activeSection === "faq" ? "before:w-full" : ""
              } `}
            >
              <a href="https://duhacks.tech/#faq">FAQs</a>
            </div>
          </div>

          <div className="relative ml-auto">
            {!isOpenMenu ? (
              <FaBars
                className="dropdown-toggle text-3xl md:hidden cursor-pointer"
                onClick={toggleDropdown}
              />
            ) : (
              <IoMdClose
                className="dropdown-toggle text-5xl md:hidden cursor-pointer "
                onClick={toggleDropdown}
              />
            )}
          </div>
        </div>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 2000 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2000 }}
            transition={{ duration: 0.5 }}
            className="xl:hidden nav-dropdown rounded-t-2xl bg-transparent md:hidden"
          >
            <h1 className="-mt-40 mb-10 text-sm flex gap-2 items-center"/>
              {/* <WiStormShowers className="text-2xl" /> */}
              {/* duhacks | gdg asu */}
            
            <a
              href="https://duhacks.tech/#about"
              className="nav-dropdown-titles hover:scale-20"
              onClick={toggleDropdown}
            >
              About
            </a>
            <a
              href="https://duhacks.tech/#schedule"
              className="nav-dropdown-titles hover:scale-20"
              onClick={toggleDropdown}
            >
              Schedule
            </a>
            <a
              href="https://duhacks.tech/#sponsors"
              className="nav-dropdown-titles hover:scale-20"
              onClick={toggleDropdown}
            >
              Sponsors
            </a>
            <a
              href="https://duhacks.tech/#prizes"
              className="nav-dropdown-titles hover:scale-20"
              onClick={toggleDropdown}
            >
              Prizes
            </a>
            <a
              href="https://duhacks.tech/#team"
              className="nav-dropdown-titles hover:scale-20"
              onClick={toggleDropdown}
            >
              Team
            </a>
            <a
              href="https://duhacks.tech/#faq"
              className="nav-dropdown-titles hover:scale-20"
              onClick={toggleDropdown}
            >
              FAQs
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Navbar2;
