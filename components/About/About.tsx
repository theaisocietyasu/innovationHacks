"use client";
import React, { useRef } from "react";
import "@/styles/about/about.css";
import CountUp from "react-countup";
import "../../styles/about/background.css";
import { motion, useInView } from "framer-motion";
import "../../styles/colors.css";

const glass: React.CSSProperties = {
  background: "rgba(15, 10, 30, 0.65)",
  border: "1px solid rgba(255,255,255,0.10)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

const divider: React.CSSProperties = {
  width: 1,
  alignSelf: "stretch",
  background: "rgba(255,255,255,0.12)",
  margin: "0 24px",
  flexShrink: 0,
};

const About = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInView = useInView(mapRef, { once: false });

  return (
    <div
      style={{
        width: "100%",
        paddingLeft: "clamp(16px, 5vw, 80px)",
        paddingRight: "clamp(16px, 5vw, 80px)",
        paddingTop: 96,
        paddingBottom: 96,
      }}
    >
      <div style={{ maxWidth: "min(95vw, 1080px)", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
            fontWeight: 700,
            textAlign: "center",
            color: "#fff",
            marginBottom: 24,
          }}
        >
          What is Innovation Hacks?
        </h1>

        {/* 2-sentence description — above stats */}
        <p
          style={{
            color: "rgba(148,163,184,0.85)",
            fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
            lineHeight: 1.65,
            textAlign: "center",
            maxWidth: 620,
            margin: "0 auto 28px",
          }}
        >
          48 hours of building, competing for $10K+ in prizes at ASU.
          Free food, mentors, and workshops. All skill levels welcome.
        </p>

        {/* Single-pill stat bar */}
        <div
          style={{
            ...glass,
            borderRadius: 20,
            padding: "20px 32px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {/* Stat 1 */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <p
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                color: "#60A5FA",
                margin: 0,
                lineHeight: 1,
              }}
            >
              <CountUp start={0} end={5} duration={3} enableScrollSpy />+
            </p>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "6px 0 0",
              }}
            >
              Prize categories
            </p>
          </div>

          <div style={divider} />

          {/* Stat 2 */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <p
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                color: "#E066FF",
                margin: 0,
                lineHeight: 1,
              }}
            >
              <CountUp start={0} end={48} duration={3} enableScrollSpy />+
            </p>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "6px 0 0",
              }}
            >
              Hours of hacking
            </p>
          </div>

          <div style={divider} />

          {/* Stat 3 */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <p
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                color: "#FB923C",
                margin: 0,
                lineHeight: 1,
              }}
            >
              <CountUp start={100} end={300} duration={3} enableScrollSpy />+
            </p>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "6px 0 0",
              }}
            >
              Participants
            </p>
          </div>
        </div>

        {/* Map — full width, shorter */}
        <div
          ref={mapRef}
          style={{
            ...glass,
            borderRadius: 16,
            padding: 10,
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            height: 380,
            overflow: "hidden",
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            initial="hidden"
            animate={mapInView ? "visible" : "hidden"}
            transition={{ duration: 1.2 }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1533.942374807188!2d-111.93243103640856!3d33.41990739788714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b08dc507ef7f9%3A0x9fd35bed67dbe087!2sEngineering%20Center%2C%20Tempe%2C%20AZ%2085281!5e0!3m2!1sen!2sus!4v1744646749016!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{
                border: 0,
                filter: "invert(90%) hue-rotate(180deg) brightness(90%)",
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Event location map"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
