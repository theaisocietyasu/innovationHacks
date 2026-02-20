"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Timeline from "@/components/Timeline/Timeline";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection/HeroSection";
import BackGround from "@/components/BackGround";
import PrizeSection from "@/components/PrizeSection/PrizeSection";
import Faq from "@/components/Faq/Faq";
import FlareCursor from "@/components/FlareCursor";
import Themes from "@/components/ThemesSection/Themes";
import PreLoader from "@/components/PreLoader";
import TeamSection from "@/components/TeamSection/TeamSection";
import SponsorsSection from "@/components/SponsorsSection/SponsorsSection";
import Timeline2 from "@/components/Timeline/Timeline2";
import TweetFeed from "@/components/Tweets/TweetFeed";
import About from "@/components/About/About";
import LoadingScreen from "@/components/LoadingScreen";
import SponsorsSection2 from "@/components/SponsorsSection/SponsorsSection2";
import RSVPForm from "@/components/RSVPForm";

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");

  const handleScrollSection = (
    about: number,
    themes: number,
    schedule: number,
    sponsors: number,
    prizes: number,
    team: number,
    rsvp: number,
    faq: number
  ) => {
    const scrollPosition = window.scrollY;

    if (scrollPosition >= 0 && scrollPosition < about) {
      setActiveSection("home");
    } else if (scrollPosition >= about && scrollPosition < themes) {
      setActiveSection("about");
    } else if (scrollPosition >= themes && scrollPosition < schedule) { 
      setActiveSection("themes");
    } else if (scrollPosition >= schedule && scrollPosition < sponsors) {
      setActiveSection("schedule");
    } else if (scrollPosition >= sponsors && scrollPosition < prizes) {
      setActiveSection("sponsors");
    } else if (scrollPosition >= prizes && scrollPosition < team) {
      setActiveSection("prizes");
    } else if (scrollPosition >= team && scrollPosition < rsvp) {
      setActiveSection("team");
    } else if (scrollPosition >= rsvp && scrollPosition < faq) {
      setActiveSection("rsvp");
    } else if (scrollPosition >= faq) {
      setActiveSection("faq");
    } else {
      setActiveSection("");
    }

    // console.log(scrollPosition, about, themes, schedule, sponsors, prizes, team, faq);
  };

  useEffect(() => {
    const sectionIds = ["about", "themes", "schedule", "sponsors", "prizes", "team", "rsvp", "faq"];

    const handleScroll = () => {
      const offsets = sectionIds.map((id) => document.getElementById(id)?.offsetTop ?? Infinity);
      const [aboutOffset, themesOffset, scheduleOffset, sponsersOffset, prizesOffset, teamOffset, rsvpOffset, faqOffset] = offsets;

      if (offsets.some((o) => o !== Infinity)) {
        handleScrollSection(
          aboutOffset,
          themesOffset,
          scheduleOffset,
          sponsersOffset,
          prizesOffset,
          teamOffset,
          rsvpOffset,
          faqOffset
        );
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeSection]);

  return (
    <main className="overflow-x-hidden bg-[#0D0D0D] relative">
      {/* Main gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/30 via-[#0D0D0D] to-[#0D0D0D] pointer-events-none" />
      
      {/* Content container */}
      <div className="relative z-10">
        <Navbar activeSection={activeSection}/>
        <div className="">
          <HeroSection />
          <div id="about">
            <About />
          </div>

          {/* <div id="themes">
            <Themes /> 
          </div> */}

          <div id="schedule">
            <Timeline2 />
          </div>

          <div id="sponsors">
            <SponsorsSection2/>
          </div>

          {/*<div id="team">
            <TeamSection />
          </div> */}

          {/* <TweetFeed /> */}
          
          <div id="rsvp">
            <RSVPForm />
          </div>

          <div id="faq">
            <Faq />
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}
