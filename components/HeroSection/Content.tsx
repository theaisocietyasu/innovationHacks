"use client";
import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { FaDiscord } from "react-icons/fa";
import CountdownTimer from "./CountdownTimer";
import { IH_DISCORD_URL } from '@/lib/constants';
import Image from "next/image";

const Content: React.FC = () => {
  const panelVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    controls.start("visible");
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      className="glass-panel-inner"
      initial="hidden"
      animate={controls}
      variants={panelVariants}
    >
      {/* Org logos row */}
      <div className="org-logos-row">
        <Image
          src="/assets/images/clubs.png"
          alt="The AI Society x Google Developer Group x SoDA"
          width={900}
          height={160}
          style={{ width: "100%", maxWidth: "620px", height: "auto" }}
        />
      </div>

      {/* Title */}
      <h1 className="hero-title">INNOVATION HACKS 2.0</h1>

      {/* Subtitle */}
      <p className="hero-subtitle">
        <strong>April 3rd – 5th, 2026</strong>
        <br />
        ASU&apos;s largest Spring Hackathon
      </p>

      {/* Countdown */}
      <CountdownTimer />

      {/* CTA Buttons */}
      <div className="glass-buttons-row">
        <a
          href="/register"
          className="glass-button"
        >
          Register Now →
        </a>
        <a
          href={IH_DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-button glass-button--discord"
          aria-label="Join our Discord server"
        >
          <FaDiscord aria-hidden="true" style={{ fontSize: "1.15rem", flexShrink: 0 }} />
          Join Discord
        </a>
      </div>
    </motion.div>
  );
};

export default Content;
