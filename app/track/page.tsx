// app/track/page.tsx — Server Component
// Fetches track data server-side and renders the full track assignment grid.

import { type Metadata } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import TrackSlot from "@/lib/models/TrackSlot";
import Team from "@/lib/models/Team";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track Assignments | Innovation Hacks",
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface TrackTeam {
  teamName: string;
  leadName: string;
}

interface TrackInfo {
  name: string;
  currentCount: number;
  teams: TrackTeam[];
}

interface TrackData {
  revealed: boolean;
  tracks: TrackInfo[];
}

// Sponsor logo images
const TRACK_LOGOS: Record<string, string> = {
  "Anton RX": "/sponsors_logos/Anton Rx white only.svg",
  Google: "/sponsors_logos/google.png",
  Amazon: "/sponsors_logos/amazon.svg",
  Statefarm: "/sponsors_logos/statefarmm.png",
};

// Emoji fallback for tracks without a logo yet
const TRACK_EMOJIS: Record<string, string> = {};

const DEV_TRACKS: TrackInfo[] = [
  { name: "Anton RX", currentCount: 0, teams: [] },
  { name: "Google", currentCount: 0, teams: [] },
  { name: "Amazon", currentCount: 0, teams: [] },
  { name: "Statefarm", currentCount: 0, teams: [] },
];

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getTrackData(): Promise<TrackData> {
  if (process.env.NODE_ENV === "development" && !process.env.MONGODB_URI) {
    return { revealed: true, tracks: DEV_TRACKS };
  }

  try {
    await connectToDatabase();
    const slots = await TrackSlot.find().lean<{ name: string; currentCount: number }[]>();
    const teams = await Team.find({ status: "assigned" }).lean<{ teamName: string; leadName: string; assignedTrack: string }[]>();

    const tracks: TrackInfo[] = slots.map((slot) => ({
      name: slot.name,
      currentCount: slot.currentCount,
      teams: teams
        .filter((t) => t.assignedTrack === slot.name)
        .map((t) => ({ teamName: t.teamName, leadName: t.leadName })),
    }));

    return { revealed: true, tracks };
  } catch {
    return { revealed: true, tracks: DEV_TRACKS };
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────


function TrackGrid({ tracks }: { tracks: TrackInfo[] }) {
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: 700,
            color: "#ffffff",
            margin: "0 0 8px",
            letterSpacing: "-0.02em",
          }}
        >
          Track <span style={{ color: "#E066FF" }}>Assignments</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.50)", fontSize: "0.95rem" }}>
          Find your team below — good luck to everyone!
        </p>
      </div>

      {/* 4-col on large, 2-col on tablet, 1-col on mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {tracks.map((track) => (
          <div
            key={track.name}
            style={{
              background: "rgba(8, 6, 18, 0.72)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1.5px solid rgba(224, 102, 255, 0.18)",
              borderRadius: "16px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Track logo + name */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {TRACK_LOGOS[track.name] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={TRACK_LOGOS[track.name]}
                  alt={`${track.name} logo`}
                  style={{ height: 28, width: "auto", objectFit: "contain", flexShrink: 0 }}
                />
              ) : (
                <span style={{ fontSize: "1.5rem", lineHeight: 1 }} role="img" aria-label={track.name}>
                  {TRACK_EMOJIS[track.name] ?? "🏆"}
                </span>
              )}
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #E066FF, #7B61FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.01em",
                }}
              >
                {track.name}
              </h2>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.40)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 600,
              }}
            >
              {track.currentCount} team{track.currentCount !== 1 ? "s" : ""}
            </p>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: "rgba(255,255,255,0.08)",
                flexShrink: 0,
              }}
            />

            {/* Team list */}
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {track.teams.length === 0 ? (
                <li
                  style={{
                    color: "rgba(255,255,255,0.25)",
                    fontSize: "0.85rem",
                    fontStyle: "italic",
                  }}
                >
                  No teams assigned yet
                </li>
              ) : (
                track.teams.map((team) => (
                  <li
                    key={team.teamName}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "10px",
                      padding: "10px 12px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "#ffffff",
                      }}
                    >
                      {team.teamName}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      Lead: {team.leadName}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TrackPage() {
  const data = await getTrackData();

  return (
    <>
      {/* Fixed background — same as /register */}
      <div
        id="page-bg"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          backgroundImage: "url('/assets/images/newbg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />

      <main
        style={{
          minHeight: "100dvh",
          padding: "88px 16px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%", maxWidth: "1100px" }}>
          <TrackGrid tracks={data.tracks} />
        </div>
      </main>
    </>
  );
}
