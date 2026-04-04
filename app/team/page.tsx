// app/team/page.tsx — Server Component shell
// Reads teamRegistrationOpen flag from the Settings DB document (key: "main").
// Toggled from the admin panel — no hardcoded date required.

import { type Metadata } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";
import { TeamCountdown } from "./TeamCountdown";
import { TeamRegistrationForm } from "./TeamRegistrationForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team Registration | Innovation Hacks",
};

export default async function TeamPage() {
  let isOpen = false;
  try {
    await connectToDatabase();
    const settings = await Settings.findOne({ key: "main" });
    isOpen = settings?.teamRegistrationOpen === true;
  } catch {
    // DB error: fail safe — keep form hidden
    isOpen = false;
  }

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
                <TeamCountdown />
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
