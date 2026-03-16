"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection/HeroSection";
import Faq from "@/components/Faq/Faq";
import Schedule from "@/components/Timeline/Schedule";
import About from "@/components/About/About";
import SponsorsSection2 from "@/components/SponsorsSection/SponsorsSection2";

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");

  const handleScrollSection = (
    about: number,
    schedule: number,
    sponsors: number,
    faq: number
  ) => {
    const scrollPosition = window.scrollY;

    if (scrollPosition >= 0 && scrollPosition < about) {
      setActiveSection("home");
    } else if (scrollPosition >= about && scrollPosition < schedule) {
      setActiveSection("about");
    } else if (scrollPosition >= schedule && scrollPosition < sponsors) {
      setActiveSection("schedule");
    } else if (scrollPosition >= sponsors && scrollPosition < faq) {
      setActiveSection("sponsors");
    } else if (scrollPosition >= faq) {
      setActiveSection("faq");
    } else {
      setActiveSection("");
    }
  };

  useEffect(() => {
    const sectionIds = ["about", "schedule", "sponsors", "faq"];

    const handleScroll = () => {
      const offsets = sectionIds.map((id) => document.getElementById(id)?.offsetTop ?? Infinity);
      const [aboutOffset, scheduleOffset, sponsorsOffset, faqOffset] = offsets;

      if (offsets.some((o) => o !== Infinity)) {
        handleScrollSection(aboutOffset, scheduleOffset, sponsorsOffset, faqOffset);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeSection]);

  return (
    <main className="overflow-x-hidden relative">
      {/* Full-page background image */}
      <div
        id="page-bg"
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/assets/images/newbg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Content container */}
      <div className="relative z-10">
        <Navbar activeSection={activeSection} />
        <div>
          <HeroSection />
          <div id="about">
            <About />
          </div>
          <div id="schedule">
            <Schedule />
          </div>
          <div id="sponsors">
            <SponsorsSection2 />
          </div>
          <div id="faq">
            <Faq />
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -100,
              left: 0,
              right: 0,
              height: 100,
              background: "linear-gradient(to bottom, transparent, #0a0614)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <Footer />
        </div>
      </div>
    </main>
  );
}
