// app/team/page.tsx — Server Component shell
// Reads REGISTRATION_OPEN_AT env var; renders countdown or form accordingly.

import { type Metadata } from "next";
import { TeamCountdown } from "./TeamCountdown";
import { TeamRegistrationForm } from "./TeamRegistrationForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team Registration | Innovation Hacks",
};

export default function TeamPage() {
  const rawDate = process.env.REGISTRATION_OPEN_AT ?? "";
  const openAt = rawDate ? new Date(rawDate).getTime() : 0;
  // In dev: always show the form. In prod: enforce the timestamp.
  const isOpen = process.env.NODE_ENV === "development" || openAt === 0 || Date.now() >= openAt;

  // Pass a stable ISO string to the client component for the countdown timer.
  const targetDate = openAt > 0 ? new Date(openAt).toISOString() : "";

  return (
    <>
      {/* Fixed background — identical to /register */}
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

      <main className="register-page-wrapper">
        <div className="register-card">
          <section className="hero-glass-panel">
            <div className="glass-panel-inner">
              {isOpen ? (
                <TeamRegistrationForm />
              ) : (
                <TeamCountdown targetDate={targetDate} />
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
