"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CountdownProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function TeamCountdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!targetDate) {
      setExpired(true);
      return;
    }

    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units: Array<{ label: string; value: number }> = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  if (expired) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-6 py-12 text-center"
      >
        <h1 className="text-3xl font-bold text-white">
          Team registration is now{" "}
          <span className="text-[#E066FF]">open!</span>
        </h1>
        <p className="text-white/60 text-base">Refresh the page to register your team.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center gap-8 py-12 text-center"
    >
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-3xl font-bold text-white">
          Team registration opens{" "}
          <span className="text-[#E066FF]">Friday at 6:30 PM</span>
        </h1>
        <p className="text-white/55 text-base max-w-md">
          Get your team ready — you&apos;ll be able to register and select your
          track preferences as soon as the timer hits zero.
        </p>
      </div>

      <div
        className="flex gap-3 sm:gap-4"
        role="timer"
        aria-label="Time until team registration opens"
      >
        {units.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center bg-white/10 rounded-xl p-4 min-w-[72px] sm:min-w-[80px] border border-white/10"
          >
            <span
              className="text-4xl font-bold text-[#E066FF] tabular-nums"
              aria-label={`${value} ${label}`}
            >
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-xs text-white/60 mt-1 uppercase tracking-wide font-medium">
              {label}
            </span>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-white/35 text-sm"
      >
        Innovation Hacks 2.0 &middot; April 3–5, 2026 &middot; ASU
      </motion.div>
    </motion.div>
  );
}
