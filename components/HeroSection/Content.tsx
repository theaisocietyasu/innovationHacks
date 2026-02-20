import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import CountdownTimer from "./CountdownTimer";
import { openRSVPModal } from "@/components/RSVPForm";
import Image from "next/image";
import dynamic from "next/dynamic";

const Grainient = dynamic(() => import("./Grainient"), { ssr: false });

const Content: React.FC = () => {

  const h1Variants = {
    hidden: { opacity: 0, x: 0, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        type: "easeInOut",
        duration: 1.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    controls.start("visible");
  }, [controls, isInView]);

  const handleRSVPClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Hero RSVP button clicked");
    openRSVPModal();
  };

  return (
    <div className="relative flex justify-center w-full min-h-screen overflow-hidden">
      {/* Grainient background — absolutely fills hero, no interaction with content */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Grainient
          color1="#e066ff"
          color2="#7b61ff"
          color3="#0d0d0d"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>
      <motion.div
        ref={ref}
        className="relative z-10 min-h-screen justify-center md:items-center px-8 gap-y-8 w-full max-w-6xl flex flex-col md:flex-row"
        initial="hidden"
        animate="visible"
        variants={h1Variants}
      >
      {/* Left Column: Hero Image and Time/Place */}
      <div className="flex flex-col items-center md:items-start w-full md:w-1/2 md:pr-8">
        <Image
          width={250}
          height={250}
          src="/assets/images/innovationhacks2.svg"
          alt="Innovation Hacks 2025"
          className="w-full max-w-md"
        />
        
        <motion.div className="flex flex-col w-full gap-1 text-white mt-4 text-center md:text-left">
          <motion.div className="flex flex-col rounded-3xl w-full text-2xl md:text-4xl">
            <h1>April 2026 — TBD</h1>
          </motion.div>

          <div className="flex flex-col rounded-3xl w-full text-2xl md:text-4xl">
            <h1>ECG + ECF, ASU Tempe</h1>
          </div>
        </motion.div>
      </div>
      
      {/* Right Column: Countdown and Buttons */}
      <motion.div className="flex flex-col items-center md:items-center w-full md:w-1/2 space-y-6 mt-6 md:mt-0 md:pl-4">
        <CountdownTimer />
        <div className="flex flex-col gap-4 md:gap-6 w-full max-w-md mx-auto md:max-w-none">
          <a
            href="https://innovationhacks-2026.devpost.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#003E54] w-full hover:bg-[#003E54] text-white py-2 px-4 md:py-3 md:px-6 rounded-2xl font-semibold shadow-lg transition duration-300 flex items-center justify-center"
          >
            <span>Devpost — Coming Soon</span>
          </a>
          <a
            href="https://discord.gg/bcs3bxaVbV"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#5865F2] w-full hover:bg-[#4752C4] text-white py-2 px-4 md:py-3 md:px-6 rounded-2xl font-semibold shadow-lg transition duration-300 flex items-center justify-center"
          >
            <span>Join Discord</span>
            <svg
              className="w-5 h-5 ml-2"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.02.06.03.09.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z"/>
            </svg>
          </a>
        </div>
        <motion.p
          className="text-white text-center mt-2 text-sm md:text-base opacity-80"
          variants={childVariants}
        >
          Note: Formal team formation (2-4 people) will be done at the event
        </motion.p>
      </motion.div>
    </motion.div>
  </div>
  );
};

export default Content;
