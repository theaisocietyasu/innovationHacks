"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "../../styles/register.css";

// ── Constants ────────────────────────────────────────────────────────────────

const TRACKS = ["Anton RX", "Google", "Amazon", "Statefarm"] as const;
type Track = (typeof TRACKS)[number];

// ── Zod schema ───────────────────────────────────────────────────────────────

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  discord: z.string().min(2, "Discord username required"),
});

const formSchema = z
  .object({
    teamName: z.string().min(1, "Team name is required"),
    leadName: z.string().min(1, "Lead name is required"),
    leadEmail: z.string().email("Valid email required"),
    leadDiscord: z.string().min(2, "Discord username required"),
    memberCount: z.coerce.number().int().min(2).max(4),
    members: z.array(memberSchema),
    pref1: z.string().min(1, "First preference required") as z.ZodType<Track>,
    pref2: z.string().min(1, "Second preference required") as z.ZodType<Track>,
    pref3: z.string().min(1, "Third preference required") as z.ZodType<Track>,
  })
  .refine((d) => d.pref1 !== d.pref2, {
    message: "Preferences must all be different",
    path: ["pref2"],
  })
  .refine((d) => d.pref1 !== d.pref3, {
    message: "Preferences must all be different",
    path: ["pref3"],
  })
  .refine((d) => d.pref2 !== d.pref3, {
    message: "Preferences must all be different",
    path: ["pref3"],
  });

// z.coerce.number() in Zod v4 infers `unknown` as input type, which conflicts
// with react-hook-form's Resolver typing. Explicitly override memberCount to number.
type FormData = Omit<z.infer<typeof formSchema>, "memberCount"> & {
  memberCount: number;
  leadDiscord: string;
};

// ── Component ────────────────────────────────────────────────────────────────

export function TeamRegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [confirmedTeamName, setConfirmedTeamName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    // Cast needed: Zod v4 z.coerce.number() infers `unknown` as input type,
    // which conflicts with hookform's Resolver typing.
    resolver: zodResolver(formSchema) as Resolver<FormData>,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      memberCount: 2,
      members: [],
    },
  });

  const memberCount = watch("memberCount");
  // Additional member count = total - 1 (lead occupies one slot)
  const additionalCount = Math.max(0, Number(memberCount) - 1);

  // Render exactly additionalCount input rows, named members.{i}.*
  const memberSlots = Array.from({ length: additionalCount }, (_, i) => i);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Trim members array to exactly additionalCount entries
      const trimmedMembers = data.members.slice(0, additionalCount);

      const res = await fetch("/api/teams/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: data.teamName,
          leadName: data.leadName,
          leadEmail: data.leadEmail,
          leadDiscord: data.leadDiscord,
          memberCount: data.memberCount,
          members: trimmedMembers,
          preferences: [data.pref1, data.pref2, data.pref3],
        }),
      });

      type ApiResult =
        | { success: true; teamName: string }
        | { error: string | { message?: string; formErrors?: string[]; fieldErrors?: Record<string, string[]> } };

      const json = (await res.json()) as ApiResult;

      if (res.ok && "success" in json && json.success) {
        setConfirmedTeamName(data.teamName);
        setSubmitted(true);
        return;
      }

      if (res.status === 409) {
        setSubmitError("A team with this email is already registered.");
        return;
      }

      if ("error" in json) {
        const err = json.error;
        if (typeof err === "string") {
          setSubmitError(err);
        } else if (typeof err === "object" && err !== null) {
          if (err.message) {
            setSubmitError(err.message);
          } else if (err.formErrors && err.formErrors.length > 0) {
            setSubmitError(err.formErrors[0]);
          } else if (err.fieldErrors) {
            const firstField = Object.values(err.fieldErrors)[0];
            setSubmitError(firstField?.[0] ?? "Registration failed. Please try again.");
          } else {
            setSubmitError("Registration failed. Please try again.");
          }
        } else {
          setSubmitError("Registration failed. Please try again.");
        }
      } else {
        setSubmitError("Registration failed. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success state ─────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="register-success" aria-live="polite">
        <span style={{ fontSize: "4rem", lineHeight: 1 }} role="img" aria-label="Party popper">
          🎉
        </span>
        <h2
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
          }}
        >
          Team <span style={{ color: "#E066FF" }}>{confirmedTeamName}</span> registered!
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "1.05rem",
            margin: 0,
            maxWidth: 440,
            textAlign: "center",
          }}
        >
          Track assignments will be revealed tonight at the event!
        </p>
      </div>
    );
  }

  // ── Form state ────────────────────────────────────────────────────────────

  return (
    <>
      <h1
        className="hero-title"
        style={{
          fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
          marginBottom: "8px",
          textAlign: "center",
        }}
      >
        Team Registration
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "rgba(255,255,255,0.55)",
          marginBottom: "8px",
          fontSize: "0.95rem",
        }}
      >
        April 3–5, 2026 &middot; ASU
      </p>

      {submitError && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {submitError}
        </div>
      )}

      <form
        onSubmit={(e) => {
          handleSubmit(onSubmit)(e);
        }}
        noValidate
      >
        {/* ── Team Info ──────────────────────────────────────────────────── */}
        <p className="register-section-title">Team Info</p>

        <div>
          <label htmlFor="teamName" className="register-label">
            Team Name <span style={{ color: "#ff6b6b" }}>*</span>
          </label>
          <input
            id="teamName"
            type="text"
            className={`register-input${errors.teamName ? " error" : ""}`}
            placeholder="Team Awesome"
            aria-invalid={!!errors.teamName}
            aria-describedby={errors.teamName ? "teamName-error" : undefined}
            {...register("teamName")}
          />
          {errors.teamName && (
            <span id="teamName-error" className="register-error" role="alert">
              {errors.teamName.message}
            </span>
          )}
        </div>

        {/* ── Lead Info ──────────────────────────────────────────────────── */}
        <p className="register-section-title" style={{ marginTop: "20px" }}>
          Team Lead
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="leadName" className="register-label">
              Lead Name <span style={{ color: "#ff6b6b" }}>*</span>
            </label>
            <input
              id="leadName"
              type="text"
              className={`register-input${errors.leadName ? " error" : ""}`}
              placeholder="Jane Doe"
              autoComplete="name"
              aria-invalid={!!errors.leadName}
              aria-describedby={errors.leadName ? "leadName-error" : undefined}
              {...register("leadName")}
            />
            {errors.leadName && (
              <span id="leadName-error" className="register-error" role="alert">
                {errors.leadName.message}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="leadEmail" className="register-label">
              Lead Email <span style={{ color: "#ff6b6b" }}>*</span>
            </label>
            <input
              id="leadEmail"
              type="email"
              className={`register-input${errors.leadEmail ? " error" : ""}`}
              placeholder="jane@example.com"
              autoComplete="email"
              aria-invalid={!!errors.leadEmail}
              aria-describedby={errors.leadEmail ? "leadEmail-error" : undefined}
              {...register("leadEmail")}
            />
            {errors.leadEmail && (
              <span id="leadEmail-error" className="register-error" role="alert">
                {errors.leadEmail.message}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="leadDiscord" className="register-label">
            Lead Discord Username <span style={{ color: "#ff6b6b" }}>*</span>
          </label>
          <input
            id="leadDiscord"
            type="text"
            className={`register-input${errors.leadDiscord ? " error" : ""}`}
            placeholder="username (without #)"
            autoComplete="off"
            aria-invalid={!!errors.leadDiscord}
            aria-describedby={errors.leadDiscord ? "leadDiscord-error" : undefined}
            {...register("leadDiscord")}
          />
          {errors.leadDiscord && (
            <span id="leadDiscord-error" className="register-error" role="alert">
              {errors.leadDiscord.message}
            </span>
          )}
        </div>

        {/* ── Team Size ──────────────────────────────────────────────────── */}
        <div className="mt-4">
          <label htmlFor="memberCount" className="register-label">
            Number of Team Members <span style={{ color: "#ff6b6b" }}>*</span>
          </label>
          <select
            id="memberCount"
            className={`register-select${errors.memberCount ? " error" : ""}`}
            aria-invalid={!!errors.memberCount}
            {...register("memberCount")}
          >
            {[2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {errors.memberCount && (
            <span className="register-error" role="alert">
              {errors.memberCount.message}
            </span>
          )}
        </div>

        {/* ── Additional Members ─────────────────────────────────────────── */}
        {additionalCount > 0 && (
          <>
            <p className="register-section-title" style={{ marginTop: "20px" }}>
              Additional Members ({additionalCount})
            </p>
            {memberSlots.map((i) => (
              <div key={i} className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`members.${i}.name`} className="register-label">
                      Member {i + 1} Name <span style={{ color: "#ff6b6b" }}>*</span>
                    </label>
                    <input
                      id={`members.${i}.name`}
                      type="text"
                      className={`register-input${errors.members?.[i]?.name ? " error" : ""}`}
                      placeholder={`Member ${i + 1}`}
                      aria-invalid={!!errors.members?.[i]?.name}
                      aria-describedby={errors.members?.[i]?.name ? `members-${i}-name-error` : undefined}
                      {...register(`members.${i}.name`)}
                    />
                    {errors.members?.[i]?.name && (
                      <span id={`members-${i}-name-error`} className="register-error" role="alert">
                        {errors.members[i]?.name?.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label htmlFor={`members.${i}.email`} className="register-label">
                      Member {i + 1} Email <span style={{ color: "#ff6b6b" }}>*</span>
                    </label>
                    <input
                      id={`members.${i}.email`}
                      type="email"
                      className={`register-input${errors.members?.[i]?.email ? " error" : ""}`}
                      placeholder={`member${i + 1}@example.com`}
                      aria-invalid={!!errors.members?.[i]?.email}
                      aria-describedby={errors.members?.[i]?.email ? `members-${i}-email-error` : undefined}
                      {...register(`members.${i}.email`)}
                    />
                    {errors.members?.[i]?.email && (
                      <span id={`members-${i}-email-error`} className="register-error" role="alert">
                        {errors.members[i]?.email?.message}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor={`members.${i}.discord`} className="register-label">
                    Member {i + 1} Discord Username <span style={{ color: "#ff6b6b" }}>*</span>
                  </label>
                  <input
                    id={`members.${i}.discord`}
                    type="text"
                    className={`register-input${errors.members?.[i]?.discord ? " error" : ""}`}
                    placeholder="username (without #)"
                    autoComplete="off"
                    aria-invalid={!!errors.members?.[i]?.discord}
                    aria-describedby={errors.members?.[i]?.discord ? `members-${i}-discord-error` : undefined}
                    {...register(`members.${i}.discord`)}
                  />
                  {errors.members?.[i]?.discord && (
                    <span id={`members-${i}-discord-error`} className="register-error" role="alert">
                      {errors.members[i]?.discord?.message}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── Track Preferences ──────────────────────────────────────────── */}
        <p className="register-section-title" style={{ marginTop: "20px" }}>
          Track Preferences
        </p>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", marginBottom: "12px" }}>
          Rank your top three track choices — all three must be different.
        </p>

        {(
          [
            { id: "pref1", label: "1st Preference", key: "pref1" },
            { id: "pref2", label: "2nd Preference", key: "pref2" },
            { id: "pref3", label: "3rd Preference", key: "pref3" },
          ] as const
        ).map(({ id, label, key }) => (
          <div key={id} className="mt-4">
            <label htmlFor={id} className="register-label">
              {label} <span style={{ color: "#ff6b6b" }}>*</span>
            </label>
            <select
              id={id}
              className={`register-select${errors[key] ? " error" : ""}`}
              aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? `${id}-error` : undefined}
              {...register(key)}
            >
              <option value="">Select a track…</option>
              {TRACKS.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </select>
            {errors[key] && (
              <span id={`${id}-error`} className="register-error" role="alert">
                {errors[key]?.message}
              </span>
            )}
          </div>
        ))}

        {/* ── Submit ─────────────────────────────────────────────────────── */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="hero-register-btn"
          >
            {isSubmitting ? "Submitting…" : "Register Team"}
          </button>
        </div>
      </form>
    </>
  );
}

