"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";

type EventType =
  | "logistics"
  | "ceremony"
  | "hacking"
  | "food"
  | "workshop"
  | "judging"
  | "networking";

interface ScheduleEvent {
  time: string;
  title: string;
  description: string;
  day: 1 | 2 | 3;
  date: string;
  type: EventType;
}

const SCHEDULE: ScheduleEvent[] = [
  { time: "6:30 PM MST", title: "Check-in & Welcome", description: "Registration opens. Pick up your badge, swag bag, and get settled in.", day: 1, date: "Friday, April 3", type: "logistics" },
  { time: "7:00 PM MST", title: "Introduction & Opening Remarks", description: "Welcome from organizers. Hackathon rules, tracks, and judging criteria explained.", day: 1, date: "Friday, April 3", type: "ceremony" },
  { time: "7:30 PM MST", title: "Team Formation & Mixer", description: "Find your teammates. Network with participants, sponsors, and mentors.", day: 1, date: "Friday, April 3", type: "networking" },
  { time: "8:00 PM MST", title: "Info Session", description: "Deep dive into tracks, available APIs, sponsor tools, and mentor office hours.", day: 1, date: "Friday, April 3", type: "workshop" },
  { time: "9:00 PM MST", title: "Hacking Begins", description: "The clock starts. Build something incredible.", day: 1, date: "Friday, April 3", type: "hacking" },
  { time: "10:30 AM MST", title: "Morning & Breakfast", description: "First meal. Fuel up and keep building.", day: 2, date: "Saturday, April 4", type: "food" },
  { time: "1:30 PM MST", title: "Lunch", description: "Second meal. Take a break and push through the afternoon.", day: 2, date: "Saturday, April 4", type: "food" },
  { time: "8:00 PM MST", title: "Dinner", description: "Third meal. Final stretch — projects due tomorrow.", day: 2, date: "Saturday, April 4", type: "food" },
  { time: "10:30 AM MST", title: "Submission Deadline", description: "All projects must be submitted. Wrap up your code and demo.", day: 3, date: "Sunday, April 5", type: "logistics" },
  { time: "11:00 AM MST", title: "Judging Begins", description: "Judges visit each team. 3-minute demo and Q&A.", day: 3, date: "Sunday, April 5", type: "judging" },
  { time: "1:30 PM MST", title: "Finalist Presentations", description: "Top teams present to all judges and attendees.", day: 3, date: "Sunday, April 5", type: "ceremony" },
  { time: "2:30 PM MST", title: "Prize Distribution & Closing", description: "Winners announced. Prizes awarded. Thank you from the organizers.", day: 3, date: "Sunday, April 5", type: "ceremony" },
  { time: "3:00 PM MST", title: "Hackathon Ends", description: "Pack up and say goodbye. See you next year.", day: 3, date: "Sunday, April 5", type: "logistics" },
];

const TYPE_COLOR: Record<EventType, string> = {
  logistics:  "#60A5FA",
  ceremony:   "#A78BFA",
  hacking:    "#34D399",
  food:       "#FB923C",
  workshop:   "#38BDF8",
  judging:    "#F472B6",
  networking: "#FBBF24",
};

const DAY_LABELS: Record<1 | 2 | 3, string> = {
  1: "Day 1 · Fri Apr 3",
  2: "Day 2 · Sat Apr 4",
  3: "Day 3 · Sun Apr 5",
};

const DAY_FULL_LABELS: Record<1 | 2 | 3, string> = {
  1: "Friday, April 3",
  2: "Saturday, April 4",
  3: "Sunday, April 5",
};

const DAY_COLORS: Record<1 | 2 | 3, string> = {
  1: "#E066FF",
  2: "#41CDDF",
  3: "#FE893E",
};

// ─── Liquid-glass tab toggle ──────────────────────────────────────────────────

interface DayToggleProps {
  selectedDay: 1 | 2 | 3;
  onSelect: (day: 1 | 2 | 3) => void;
}

function DayToggle({ selectedDay, onSelect }: DayToggleProps) {
  const sharedStyle: React.CSSProperties = {
    padding: "10px 24px",
    borderRadius: 100,
    fontSize: "0.85rem",
    fontFamily: "Space Grotesk, sans-serif",
    cursor: "pointer",
    transition: "all 0.25s ease",
    position: "relative",
    overflow: "hidden",
    WebkitBackdropFilter: "blur(16px)",
  };

  const activeStyle: React.CSSProperties = {
    ...sharedStyle,
    background: "rgba(160, 80, 255, 0.22)",
    border: "1px solid rgba(255,255,255,0.22)",
    borderTop: "1px solid rgba(255,255,255,0.45)",
    backdropFilter: "blur(16px)",
    boxShadow:
      "0 0 0 0.5px rgba(255,255,255,0.07) inset, 0 4px 24px rgba(160,80,255,0.35), 0 2px 8px rgba(0,0,0,0.3)",
    color: "white",
    fontWeight: 600,
  };

  const inactiveStyle: React.CSSProperties = {
    ...sharedStyle,
    background: "rgba(255, 255, 255, 0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderTop: "1px solid rgba(255,255,255,0.20)",
    backdropFilter: "blur(16px)",
    boxShadow:
      "0 0 0 0.5px rgba(255,255,255,0.04) inset, 0 4px 20px rgba(0,0,0,0.25)",
    color: "rgba(255,255,255,0.6)",
    fontWeight: 500,
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        marginBottom: 40,
      }}
    >
      {([1, 2, 3] as const).map((day) => {
        const isActive = selectedDay === day;
        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            style={isActive ? activeStyle : inactiveStyle}
            aria-pressed={isActive}
            aria-label={`Show ${DAY_LABELS[day]}`}
          >
            {/* Specular highlight line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "15%",
                right: "15%",
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                pointerEvents: "none",
              }}
            />
            {DAY_LABELS[day]}
          </button>
        );
      })}
    </div>
  );
}

// ─── Mobile schedule ──────────────────────────────────────────────────────────

interface MobileScheduleProps {
  selectedDay: 1 | 2 | 3;
  onSelectDay: (day: 1 | 2 | 3) => void;
}

function MobileSchedule({ selectedDay, onSelectDay }: MobileScheduleProps) {
  const dayEvents = SCHEDULE.filter((e) => e.day === selectedDay);

  return (
    <div style={{ padding: "0 1rem 4rem" }}>
      <DayToggle selectedDay={selectedDay} onSelect={onSelectDay} />
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          {dayEvents.map((event, i) => {
            const color = TYPE_COLOR[event.type];
            const isOdd = i % 2 !== 0;
            return (
              <motion.div
                key={`${event.day}-${event.time}-${event.title}`}
                initial={{ opacity: 0, x: isOdd ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                style={{
                  background: "rgba(15,10,30,0.65)",
                  backdropFilter: "blur(14px) saturate(160%)",
                  borderLeft: `3px solid ${color}`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      color,
                      fontWeight: 700,
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    {event.time}
                  </span>
                  <p style={{ color: "white", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 3px" }}>
                    {event.title}
                  </p>
                  <p style={{ color: "rgba(148,163,184,0.85)", fontSize: "0.78rem", margin: "0 0 8px" }}>
                    {event.description}
                  </p>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      background: `${color}18`,
                      border: `1px solid ${color}44`,
                      borderRadius: 999,
                      color,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.12em",
                      fontFamily: "monospace",
                    }}
                  >
                    {event.type}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Desktop scroll card ──────────────────────────────────────────────────────

interface WipeCardProps {
  event: ScheduleEvent;
  index: number;
}

function ScrollCard({ event, index }: WipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const color = TYPE_COLOR[event.type];

  useEffect(() => {
    const card = cardRef.current;
    const line = lineRef.current;
    if (!card || !line) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            end: "top 70%",
            scrub: 0.7,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: (index % 5) * 0.06 }}
      style={{
        position: "relative",
        width: "100%",
        height: 180,
        marginBottom: 2,
        overflow: "visible",
      }}
    >
      {/* Left accent line */}
      <div
        ref={lineRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 3,
          height: "100%",
          background: `linear-gradient(to bottom, ${color}, ${color}55)`,
          borderRadius: 2,
          transformOrigin: "top center",
          transform: "scaleY(0)",
          zIndex: 5,
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15,10,30,0.65)",
          backdropFilter: "blur(14px) saturate(160%)",
          WebkitBackdropFilter: "blur(14px) saturate(160%)",
          borderLeft: `3px solid ${color}`,
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "0 28px",
        }}
      >
        {/* Left: colored dot */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: 48 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 8px ${color}88`,
              flexShrink: 0,
            }}
          />
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 80, background: `${color}33`, flexShrink: 0 }} />

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.7rem",
              color,
              fontWeight: 700,
              display: "block",
              marginBottom: 6,
              letterSpacing: "0.08em",
            }}
          >
            {event.time}
          </span>
          <p style={{ color: "white", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 6px", lineHeight: 1.25 }}>
            {event.title}
          </p>
          <p style={{ color: "rgba(148,163,184,0.8)", fontSize: "0.82rem", margin: 0, lineHeight: 1.55 }}>
            {event.description}
          </p>
        </div>

        {/* Type badge */}
        <div style={{ flexShrink: 0 }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              background: `${color}18`,
              border: `1px solid ${color}44`,
              borderRadius: 999,
              color,
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.12em",
              fontFamily: "monospace",
            }}
          >
            {event.type}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function TimelineV10Schedule() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDay, setSelectedDay] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (spineRef.current && sectionRef.current) {
        gsap.fromTo(
          spineRef.current,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 60%",
              end: "bottom 40%",
              scrub: 1,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  const dayEvents = SCHEDULE.filter((e) => e.day === selectedDay);
  const dc = DAY_COLORS[selectedDay];

  return (
    <div
      ref={sectionRef}
      style={{
        background: "transparent",
        position: "relative",
        paddingBottom: "6rem",
      }}
    >
      {/* Section heading */}
      <div style={{ textAlign: "center", padding: "5rem 1rem 3rem", position: "relative", zIndex: 2 }}>
        <h2 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, color: "white", margin: "0 0 10px" }}>
          Event Schedule
        </h2>
      </div>

      {/* Mobile layout */}
      {isMobile && (
        <MobileSchedule selectedDay={selectedDay} onSelectDay={setSelectedDay} />
      )}

      {/* Desktop layout */}
      {!isMobile && (
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 2rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Day toggle */}
          <DayToggle selectedDay={selectedDay} onSelect={setSelectedDay} />

          {/* Spine */}
          <div
            style={{
              position: "absolute",
              left: "2rem",
              top: 0,
              bottom: 0,
              width: 3,
              background: "rgba(224,102,255,0.08)",
              borderRadius: 2,
            }}
          >
            <div
              ref={spineRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(to bottom, #7B61FF, #E066FF)",
                borderRadius: 2,
                boxShadow: "0 0 16px rgba(224,102,255,0.5)",
                transformOrigin: "top center",
              }}
            />
          </div>

          {/* Day header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              paddingLeft: 20,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: `${dc}18`,
                border: `2px solid ${dc}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: dc,
                fontWeight: 800,
                fontSize: "0.85rem",
                fontFamily: "monospace",
                flexShrink: 0,
              }}
            >
              {selectedDay}
            </div>
            <div>
              <p
                style={{
                  color: dc,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  margin: 0,
                  fontFamily: "monospace",
                }}
              >
                Day {selectedDay}
              </p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: 0 }}>
                {DAY_FULL_LABELS[selectedDay]}
              </p>
            </div>
          </div>

          {/* Animated events list */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 3 }}
            >
              {dayEvents.map((event) => {
                const globalIndex = SCHEDULE.indexOf(event);
                return <ScrollCard key={globalIndex} event={event} index={globalIndex} />;
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
