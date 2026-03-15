"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

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
  { time: "6:30 PM", title: "Check-in & Welcome", description: "Registration opens. Pick up your badge, swag bag, and get settled in.", day: 1, date: "Friday, April 3", type: "logistics" },
  { time: "7:00 PM", title: "Introduction & Opening Remarks", description: "Welcome from organizers. Hackathon rules, tracks, and judging criteria explained.", day: 1, date: "Friday, April 3", type: "ceremony" },
  { time: "7:30 PM", title: "Team Formation & Mixer", description: "Find your teammates. Network with participants, sponsors, and mentors.", day: 1, date: "Friday, April 3", type: "networking" },
  { time: "8:00 PM", title: "Info Session", description: "Deep dive into tracks, available APIs, sponsor tools, and mentor office hours.", day: 1, date: "Friday, April 3", type: "workshop" },
  { time: "9:00 PM", title: "Hacking Begins", description: "The clock starts. Build something incredible.", day: 1, date: "Friday, April 3", type: "hacking" },
  { time: "10:30 AM", title: "Morning & Breakfast", description: "First meal. Fuel up and keep building.", day: 2, date: "Saturday, April 4", type: "food" },
  { time: "1:30 PM", title: "Lunch", description: "Second meal. Take a break and push through the afternoon.", day: 2, date: "Saturday, April 4", type: "food" },
  { time: "8:00 PM", title: "Dinner", description: "Third meal. Final stretch — projects due tomorrow.", day: 2, date: "Saturday, April 4", type: "food" },
  { time: "10:30 AM", title: "Submission Deadline", description: "All projects must be submitted. Wrap up your code and demo.", day: 3, date: "Sunday, April 5", type: "logistics" },
  { time: "11:00 AM", title: "Judging Begins", description: "Judges visit each team. 3-minute demo and Q&A.", day: 3, date: "Sunday, April 5", type: "judging" },
  { time: "1:30 PM", title: "Finalist Presentations", description: "Top teams present to all judges and attendees.", day: 3, date: "Sunday, April 5", type: "ceremony" },
  { time: "2:30 PM", title: "Prize Distribution & Closing", description: "Winners announced. Prizes awarded. Thank you from the organizers.", day: 3, date: "Sunday, April 5", type: "ceremony" },
  { time: "3:00 PM", title: "Hackathon Ends", description: "Pack up and say goodbye. See you next year.", day: 3, date: "Sunday, April 5", type: "logistics" },
];

const TYPE_COLOR: Record<EventType, string> = {
  logistics: "#41CDDF",
  ceremony: "#E066FF",
  hacking: "#41CDDF",
  food: "#FE893E",
  workshop: "#41CDDF",
  judging: "#FE893E",
  networking: "#FE893E",
};

const TYPE_EMOJI: Record<EventType, string> = {
  logistics: "📋",
  ceremony: "🚀",
  hacking: "⌨️",
  food: "🍕",
  workshop: "🎓",
  judging: "⚖️",
  networking: "🤝",
};

function MobileSchedule() {
  return (
    <div style={{ padding: "2rem 1rem 4rem", display: "flex", flexDirection: "column", gap: 14, maxWidth: 480, margin: "0 auto" }}>
      {SCHEDULE.map((event, i) => {
        const color = TYPE_COLOR[event.type];
        const isOdd = i % 2 !== 0;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: isOdd ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.04 }}
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
            <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{TYPE_EMOJI[event.type]}</span>
            <div>
              <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color, fontWeight: 700, display: "block", marginBottom: 4 }}>
                Day {event.day} · {event.time}
              </span>
              <p style={{ color: "white", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 3px" }}>{event.title}</p>
              <p style={{ color: "rgba(148,163,184,0.85)", fontSize: "0.78rem", margin: 0 }}>{event.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

interface WipeCardProps {
  event: ScheduleEvent;
  index: number;
}

function ScrollCard({ event, index }: WipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const color = TYPE_COLOR[event.type];

  // Keep the per-card left accent line draw via GSAP (unchanged)
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

      {/* Card — always visible, liquid glass */}
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
        {/* Left: icon + day badge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0, width: 80 }}>
          <span style={{ fontSize: "2rem" }}>{TYPE_EMOJI[event.type]}</span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.65rem",
              color,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.08em",
              background: `${color}15`,
              padding: "2px 8px",
              borderRadius: 999,
              border: `1px solid ${color}33`,
              whiteSpace: "nowrap" as const,
            }}
          >
            Day {event.day}
          </span>
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

export default function TimelineV10Schedule() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <div
      ref={sectionRef}
      style={{
        background: "transparent",
        position: "relative",
        paddingBottom: "6rem",
      }}
    >

      <div style={{ textAlign: "center", padding: "5rem 1rem 3rem", position: "relative", zIndex: 2 }}>
        <h2 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, color: "white", margin: "0 0 10px" }}>
          Event Schedule
        </h2>
      </div>

      {isMobile && <MobileSchedule />}

      {!isMobile && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 2rem", position: "relative", zIndex: 2 }}>
          <div style={{ position: "absolute", left: "2rem", top: 0, bottom: 0, width: 3, background: "rgba(224,102,255,0.08)", borderRadius: 2 }}>
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

          {([1, 2, 3] as const).map((day) => {
            const dayEvents = SCHEDULE.filter((e) => e.day === day);
            const dayColors: Record<1 | 2 | 3, string> = { 1: "#E066FF", 2: "#41CDDF", 3: "#FE893E" };
            const dayLabel: Record<1 | 2 | 3, string> = { 1: "Friday, April 3", 2: "Saturday, April 4", 3: "Sunday, April 5" };
            const dc = dayColors[day];

            return (
              <div key={day} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, paddingLeft: 20, marginBottom: 8, paddingTop: day === 1 ? 0 : 32 }}>
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: `${dc}18`, border: `2px solid ${dc}55`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: dc, fontWeight: 800, fontSize: "0.85rem", fontFamily: "monospace", flexShrink: 0,
                    }}
                  >
                    {day}
                  </div>
                  <div>
                    <p style={{ color: dc, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", margin: 0, fontFamily: "monospace" }}>
                      Day {day}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: 0 }}>{dayLabel[day]}</p>
                  </div>
                </div>

                <div style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 3 }}>
                  {dayEvents.map((event) => {
                    const globalIndex = SCHEDULE.indexOf(event);
                    return <ScrollCard key={globalIndex} event={event} index={globalIndex} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
