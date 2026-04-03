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
  { time: "6:30 PM MST", title: "Check-In & Welcome", description: "Registration opens. Pick up your badge, swag bag, and get settled in.", day: 1, date: "Friday, April 3", type: "logistics" },
  { time: "7:15 PM MST", title: "Opening Ceremony", description: "Welcome from organizers, sponsors, and partners.", day: 1, date: "Friday, April 3", type: "ceremony" },
  { time: "7:30 PM MST", title: "Problem Statement Announcement", description: "Problem statements revealed and team registration form opens at innovationhacks.dev/team.", day: 1, date: "Friday, April 3", type: "ceremony" },
  { time: "7:45 PM MST", title: "MLH Announcements", description: "Major League Hacking announcements and prizes revealed.", day: 1, date: "Friday, April 3", type: "ceremony" },
  { time: "8:00 PM MST", title: "Team Formation Mixer", description: "30-minute mixer - find your teammates, network with participants, sponsors, and mentors.", day: 1, date: "Friday, April 3", type: "networking" },
  { time: "8:45 PM MST", title: "Team Registration Closes", description: "Team registration form closes. Make sure your team is locked in. Only one person per team must register for the entire team.", day: 1, date: "Friday, April 3", type: "logistics" },
  { time: "9:00 PM MST", title: "Food Served", description: "Dinner starts at Engineering Center G. Food will only be served at ECG. But feel free to relocate after.", day: 1, date: "Friday, April 3", type: "food" },
  { time: "9:30 PM MST", title: "Hacking Begins", description: "Track assignments released at innovationhacks.dev/track - hacking starts! Available rooms: ECG101, ECG140-141, ECF120-122, ECG Common Area, Patio with b/w ECG & ECF, LSA 191, Noble Library (if open - check ASU's website for hours).", day: 1, date: "Friday, April 3", type: "hacking" },
  { time: "9:30 AM MST", title: "Morning & Breakfast", description: "First meal. Fuel up and keep building. Bagels for breakfast.", day: 2, date: "Saturday, April 4", type: "food" },
  { time: "12:00 PM to 1:00 PM MST", title: "Build an AI Travel Assistant with Google Cloud APIs", description: "Delivered by Brendan Stewart who is currently a software developer at Logitech and a core team member at Google Developer Group @ ASU.", day: 2, date: "Saturday, April 4", type: "workshop" },
  { time: "1:30 PM MST", title: "Lunch", description: "Second meal. Take a break and push through the afternoon. Enjoy Venezia's pizza.", day: 2, date: "Saturday, April 4", type: "food" },
  { time: "4:30 PM MST", title: "Snack Time", description: "Quick energy boost to keep you going.", day: 2, date: "Saturday, April 4", type: "food" },
  { time: "5:15 PM to 6:15 PM MST", title: "Building Backends with FastAPI", description: "Learn how to build robust APIs rapidly with FastAPI. Delivered by Aaditya Jindal who is an incoming intern at FOX Tech and currently works at ASU AI Cloud Innovation Center powered by AWS.", day: 2, date: "Saturday, April 4", type: "workshop" },
  { time: "8:00 PM MST", title: "Dinner", description: "Third meal. Final stretch, projects due tomorrow. Enjoy Butter Chicken, Noodles, Paneer masala, Naan & Rice.", day: 2, date: "Saturday, April 4", type: "food" },
  { time: "2:30 AM MST", title: "Post-Midnight Drinks", description: "Enjoy Drinks from Honey 2 A Bee Coffee & Crepes", day: 3, date: "Sunday, April 5", type: "food" },
  { time: "10:30 AM MST", title: "Submission Deadline", description: "All projects must be submitted. Wrap up your code and demo.", day: 3, date: "Sunday, April 5", type: "logistics" },
  { time: "11:00 AM MST", title: "Judging Begins", description: "Judges visit each team. 3-minute demo and Q&A.", day: 3, date: "Sunday, April 5", type: "judging" },
  { time: "12:30 PM MST", title: "Brunch Time", description: "Enjoy Ike's sandwiches for brunch before the final presentations.", day: 3, date: "Sunday, April 5", type: "food" },
  { time: "1:30 PM MST", title: "Finalist Presentations", description: "Teams demonstrate their projects to every stakeholder and attendees.", day: 3, date: "Sunday, April 5", type: "ceremony" },
  { time: "2:30 PM MST", title: "Prize Distribution & Closing", description: "Winners announced. Prizes awarded. Thank you from the organizers.", day: 3, date: "Sunday, April 5", type: "ceremony" },
  { time: "3:00 PM MST", title: "Hackathon Ends", description: "Pack up and say goodbye. See you next year.", day: 3, date: "Sunday, April 5", type: "logistics" },
];

const TYPE_COLOR: Record<EventType, string> = {
  logistics:  "#60A5FA",
  ceremony:   "#F87171",
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
            gap: 16,
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
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Top stripe */}
                <div style={{ height: 4, background: color, width: "100%" }} />

                {/* Inner content */}
                <div style={{ padding: "18px 22px" }}>
                  {/* Time + badge row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.78rem",
                        color,
                        fontWeight: 700,
                      }}
                    >
                      {event.time}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        background: `${color}18`,
                        border: `1px solid ${color}44`,
                        borderRadius: 999,
                        color,
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.12em",
                        fontFamily: "monospace",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {event.type}
                    </span>
                  </div>
                  <p style={{ color: "white", fontWeight: 700, fontSize: "1.08rem", margin: "6px 0 0" }}>
                    {event.title}
                  </p>
                  <p style={{ color: "rgba(148,163,184,0.8)", fontSize: "0.88rem", margin: "4px 0 0", lineHeight: 1.5 }}>
                    {event.description}
                  </p>
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

interface ScrollCardProps {
  event: ScheduleEvent;
  index: number;
}

function ScrollCard({ event, index }: ScrollCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<HTMLDivElement>(null);
  const color = TYPE_COLOR[event.type];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const card = cardRef.current;
    const stripe = stripeRef.current;
    if (!card || !stripe) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        stripe,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            end: "top 70%",
            scrub: 0.7,
          },
        }
      );
    }, card);

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
        background: "rgba(15,10,30,0.65)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Colored top stripe */}
      <div
        ref={stripeRef}
        style={{
          height: 4,
          background: color,
          width: "100%",
          transform: "scaleX(0)",
        }}
      />

      {/* Inner content */}
      <div style={{ padding: "18px 22px" }}>
        {/* Time + badge row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.78rem",
              color,
              fontWeight: 700,
            }}
          >
            {event.time}
          </span>
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              background: `${color}18`,
              border: `1px solid ${color}44`,
              borderRadius: 999,
              color,
              fontSize: "0.6rem",
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.12em",
              fontFamily: "monospace",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {event.type}
          </span>
        </div>

        <p style={{ color: "white", fontSize: "1.08rem", fontWeight: 700, margin: "6px 0 0" }}>
          {event.title}
        </p>
        <p style={{ color: "rgba(148,163,184,0.8)", fontSize: "0.88rem", margin: "4px 0 0", lineHeight: 1.5 }}>
          {event.description}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function TimelineV10Schedule() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDay, setSelectedDay] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const dayEvents = SCHEDULE.filter((e) => e.day === selectedDay);

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

          {/* Animated events list */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
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
