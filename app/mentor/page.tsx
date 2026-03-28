"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/styles/globals.css";

export default function MentorPage() {
  return (
    <main className="overflow-x-hidden relative min-h-screen">
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

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar activeSection="" />

        <div className="flex-1 flex flex-col items-center px-4 pt-28 pb-16">
          {/* Page heading */}
          <div className="w-full max-w-5xl mb-8 text-center">
            <h1
              className="text-4xl md:text-5xl font-bold text-white mb-3"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Become a{" "}
              <span style={{ color: "#E066FF" }}>Mentor</span>
            </h1>
            <p className="text-white/60 text-base md:text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Sign up to mentor teams and help shape the next generation of innovators.
            </p>
          </div>

          {/* Glass panel containing the iframe */}
          <div
            className="w-full max-w-5xl"
            style={{
              borderRadius: "28px",
              overflow: "hidden",
              background: "rgba(15, 10, 30, 0.65)",
              backdropFilter: "blur(14px) saturate(160%)",
              WebkitBackdropFilter: "blur(14px) saturate(160%)",
              border: "1px solid rgba(255, 255, 255, 0.10)",
              borderTopColor: "rgba(255, 255, 255, 0.25)",
              boxShadow:
                "0 0 0 0.5px rgba(255,255,255,0.08) inset, 0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), 0 0 80px rgba(160,80,220,0.15), 0 0 120px rgba(80,140,255,0.1)",
              padding: "24px",
            }}
          >
            <iframe
              src="https://theaisociety.notion.site/ebd//a83e6941265e46d593670f781600cf4d"
              width="100%"
              height="600"
              frameBorder="0"
              allowFullScreen
              style={{ borderRadius: "12px", display: "block" }}
            />
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
