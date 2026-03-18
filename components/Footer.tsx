"use client";
import React from "react";
import Image from "next/image";
import { FaDiscord, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const SOCIALS = {
  // Innovation Hacks
  ih_discord: "https://discord.gg/7Eq2zmvYgQ",
  // SoDA
  soda_instagram: "https://instagram.com/soda.asu",
  soda_discord:
    "https://discord.gg/the-software-developers-association-762811961238618122",
  // GDG ASU
  gdsc_instagram: "https://www.instagram.com/asu.dsc/",
  gdsc_discord: "https://discord.gg/jE224Skdvx",
  // AI Society
  ai_instagram: "https://www.instagram.com/theaisociety.asu/",
  ai_discord: "https://discord.gg/dCWm6xBGtM",
  // General
  email: "mailto:help@innovationhacks.dev",
  mlh_coc: "https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md",
};

interface OrgCardProps {
  name: string;
  logoSrc: string;
  discordHref: string;
  instagramHref: string;
  logoWidth: number;
  logoHeight: number;
}

const OrgCard: React.FC<OrgCardProps> = ({ name, logoSrc, discordHref, instagramHref, logoWidth, logoHeight }) => (
  <div
    className="group flex flex-col items-center rounded-2xl px-6 py-4 transition-all duration-300"
    style={{
      background: "rgba(15, 10, 30, 0.65)",
      border: "1px solid rgba(255, 255, 255, 0.10)",
      backdropFilter: "blur(14px) saturate(160%)",
      WebkitBackdropFilter: "blur(14px) saturate(160%)",
      minWidth: 140,
      gap: 0,
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.border =
        "1px solid rgba(224, 102, 255, 0.30)";
      (e.currentTarget as HTMLDivElement).style.boxShadow =
        "0 0 24px rgba(224, 102, 255, 0.08)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.border =
        "1px solid rgba(255, 255, 255, 0.08)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Image
        src={logoSrc}
        alt={`${name} logo`}
        width={logoWidth}
        height={logoHeight}
        style={{ objectFit: "contain", width: "100%", height: "100%" }}
      />
    </div>
    <span
      className="text-sm font-semibold tracking-wide text-center"
      style={{
        color: "rgba(255, 255, 255, 0.80)",
        fontFamily: "Space Grotesk, sans-serif",
        marginTop: 8,
        marginBottom: 12,
      }}
    >
      {name}
    </span>

    <div className="flex items-center gap-4">
      <a
        href={discordHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${name} Discord`}
        className="transition-colors duration-200"
        style={{ color: "rgba(255, 255, 255, 0.45)" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.color = "#E066FF")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.color =
            "rgba(255, 255, 255, 0.45)")
        }
      >
        <FaDiscord className="text-xl" />
      </a>

      <div
        style={{
          width: "1px",
          height: "14px",
          background: "rgba(255, 255, 255, 0.12)",
        }}
      />

      <a
        href={instagramHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${name} Instagram`}
        className="transition-colors duration-200"
        style={{ color: "rgba(255, 255, 255, 0.45)" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.color = "#E066FF")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.color =
            "rgba(255, 255, 255, 0.45)")
        }
      >
        <FaInstagram className="text-xl" />
      </a>
    </div>
  </div>
);

const Footer: React.FC = () => (
  <footer
    className="mt-24"
    style={{
      background: "#0a0614",
    }}
  >
    <div className="mx-auto max-w-4xl px-6 py-10 flex flex-col items-center gap-8">

      {/* Org pill cards */}
      <div className="flex flex-wrap justify-center gap-4">
        <OrgCard
          name="The AI Society"
          logoSrc="/assets/images/AI_Society.png"
          logoWidth={48}
          logoHeight={48}
          discordHref={SOCIALS.ai_discord}
          instagramHref={SOCIALS.ai_instagram}
        />
        <OrgCard
          name="GDG ASU"
          logoSrc="/assets/images/gdsc.svg"
          logoWidth={48}
          logoHeight={48}
          discordHref={SOCIALS.gdsc_discord}
          instagramHref={SOCIALS.gdsc_instagram}
        />
        <OrgCard
          name="SoDA"
          logoSrc="/assets/images/soda.svg"
          logoWidth={56}
          logoHeight={22}
          discordHref={SOCIALS.soda_discord}
          instagramHref={SOCIALS.soda_instagram}
        />
      </div>

      {/* Copyright */}
      <p
        className="text-center text-sm leading-relaxed font-medium"
        style={{ color: "rgba(255, 255, 255, 0.70)" }}
      >
        © 2026 Innovation Hacks. Presented by The AI Society × GDG ASU × SoDA.
      </p>

      {/* Utility links */}
      <div className="flex items-center gap-6 text-sm" style={{ color: "rgba(255, 255, 255, 0.60)" }}>
        <a
          href={SOCIALS.email}
          className="transition-colors duration-200 hover:text-white"
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "#E066FF")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              "rgba(255, 255, 255, 0.45)")
          }
        >
          Contact Us
        </a>

        <div
          style={{
            width: "1px",
            height: "12px",
            background: "rgba(255, 255, 255, 0.15)",
          }}
        />

        <a
          href={SOCIALS.ih_discord}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 transition-colors duration-200"
          aria-label="Join the Innovation Hacks Discord"
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "#E066FF")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              "rgba(255, 255, 255, 0.45)")
          }
        >
          <FaDiscord aria-hidden="true" style={{ fontSize: "1rem" }} />
          Discord
        </a>

        <div
          style={{
            width: "1px",
            height: "12px",
            background: "rgba(255, 255, 255, 0.15)",
          }}
        />

        <a
          href={SOCIALS.mlh_coc}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-200"
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "#E066FF")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              "rgba(255, 255, 255, 0.45)")
          }
        >
          MLH Code of Conduct
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
