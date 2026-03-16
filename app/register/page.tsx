"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone, type FileRejection } from "react-dropzone";
import toast, { Toaster } from "react-hot-toast";
import Confetti from "react-confetti";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import "../../styles/hero.css";
import "../../styles/register.css";
import { countries } from "countries-list";
import { MLH_SCHOOLS } from "@/lib/schools";

// ── Static data ────────────────────────────────────────────────────────────

const countryOptions: [string, string][] = [
  ["US", "United States"],
  ...Object.entries(countries)
    .filter(([code]) => code !== "US")
    .sort(([, a], [, b]) =>
      (a as { name: string }).name.localeCompare((b as { name: string }).name)
    )
    .map(([code, data]) => [code, (data as { name: string }).name]),
] as [string, string][];

const LEVEL_OF_STUDY_OPTIONS = [
  "Less than Secondary / High School",
  "Secondary / High School",
  "Undergraduate University (2 year - community college or similar)",
  "Undergraduate University (3+ year)",
  "Graduate University (Masters, Professional, Doctoral, etc)",
  "Code School / Bootcamp",
  "Other Vocational / Trade Program or Apprenticeship",
  "Post Doctorate",
  "Other",
  "I'm not currently a student",
  "Prefer not to answer",
] as const;

// ── Zod schema ─────────────────────────────────────────────────────────────

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required").refine(
    (val) => {
      const domain = val.split("@")[1]?.toLowerCase() ?? "";
      return domain === "gmail.com" || domain.endsWith(".edu");
    },
    { message: "Please use your school (.edu) or Gmail email address." }
  ),
  phone: z.string()
    .min(1, "Phone number is required")
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length === 10;
      },
      { message: "Phone number must be exactly 10 digits" }
    ),
  age: z.coerce.number().int().min(16, "Must be 16+").max(99, "Must be 99 or under"),
  school: z.string().min(3, "School / University is required"),
  levelOfStudy: z.string().min(1, "Level of study is required"),
  yearOfStudy: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  raceEthnicity: z.string().min(1, "Race/Ethnicity is required"),
  countryOfResidence: z.string().min(1, "Country is required"),
  linkedinUrl: z.string().optional().refine(
    (val) => !val || /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]{3,100}\/?(\?[^\s]*)?$/.test(val),
    { message: "Please enter a valid LinkedIn profile URL (e.g. linkedin.com/in/yourname)" }
  ),
  githubUrl: z.string().min(1, "GitHub URL is required").regex(
    /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?\/?$/,
    "Please enter a valid GitHub profile URL (e.g. github.com/yourusername)"
  ),
  mlhCodeOfConduct: z.literal(true, {
    message: "You must agree to the MLH Code of Conduct",
  }),
  mlhDataSharing: z.literal(true, {
    message: "You must agree to MLH data sharing",
  }),
  mlhEmailConsent: z.boolean(),
  resume: z.custom<File>((val) => val instanceof File, {
    message: "Please upload your resume (PDF, max 5 MB)",
  }),
});

// z.coerce.number() in Zod v4 has `unknown` as input type, which conflicts with
// react-hook-form's Resolver typing. Explicitly pin `age` to `number`.
type FormData = Omit<z.infer<typeof schema>, "age"> & { age: number; yearOfStudy?: string };

// ── Page component ─────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [confetti, setConfetti] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    // Cast needed: Zod v4 z.coerce.number() infers `unknown` as input type,
    // which conflicts with hookform's resolver typing. The resolver correctly
    // coerces the select string to number at runtime.
    resolver: zodResolver(schema) as Resolver<FormData>,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      school: "",
      mlhEmailConsent: false,
    },
  });

  // ── School autocomplete ───────────────────────────────────────────────────

  const [schoolQuery, setSchoolQuery] = useState("");
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState<string[]>([]);
  const schoolRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (schoolQuery.length >= 3) {
      const q = schoolQuery.toLowerCase();
      setFilteredSchools(
        MLH_SCHOOLS.filter((s) => s.toLowerCase().includes(q)).slice(0, 20)
      );
      setShowSchoolDropdown(true);
    } else {
      setFilteredSchools([]);
      setShowSchoolDropdown(false);
    }
  }, [schoolQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (schoolRef.current && !schoolRef.current.contains(e.target as Node)) {
        setShowSchoolDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Dropzone ─────────────────────────────────────────────────────────────

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      toast.error("Please upload a PDF file only");
      return;
    }
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("resume" as keyof FormData, { message: "Resume must be under 5 MB" });
      return;
    }
    setResumeFile(file);
    setValue("resume", file, { shouldValidate: true });
    clearErrors("resume" as keyof FormData);
  }, [setError, clearErrors, setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  // ── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      (Object.entries(data) as [string, unknown][]).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (resumeFile) formData.append("resumeFile", resumeFile);

      const res = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as { success?: boolean; message?: string };

      if (res.ok && json.success) {
        setSubmitted(true);
        setConfetti(true);
        setTimeout(() => setConfetti(false), 6000);
      } else {
        toast.error(json.message ?? "Registration failed. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(15, 10, 35, 0.95)",
            color: "#ffffff",
            border: "1px solid rgba(160, 100, 255, 0.3)",
            backdropFilter: "blur(12px)",
            fontSize: "0.9rem",
          },
          error: {
            iconTheme: {
              primary: "#ff6b6b",
              secondary: "#ffffff",
            },
          },
        }}
      />

      {/* Fixed background — mirrors homepage */}
      <div
        id="page-bg"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          backgroundImage: "url('/assets/images/glassmorphbg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />

      <Navbar activeSection="" />

      <main className="register-page-wrapper">
        <div className="register-card">

          {/* ── Submitted / success state ─────────────────────────── */}
          {submitted ? (
            <section className="hero-glass-panel" aria-live="polite">
              <div className="glass-panel-inner">
                {confetti && (
                  <Confetti recycle={false} numberOfPieces={300} />
                )}
                <div className="register-success">
                  <span style={{ fontSize: "4rem", lineHeight: 1 }} role="img" aria-label="Check mark">
                    ✅
                  </span>
                  <h2
                    style={{
                      fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                      fontWeight: 700,
                      color: "#ffffff",
                      margin: 0,
                    }}
                  >
                    You&apos;re registered!
                  </h2>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      fontSize: "1.05rem",
                      margin: 0,
                      maxWidth: 440,
                    }}
                  >
                    See you at Innovation Hacks 2.0, April 3–5, 2026 at ASU!
                  </p>
                  <Link
                    href="/"
                    className="hero-register-btn"
                    style={{ width: "auto", padding: "12px 28px" }}
                  >
                    Back to homepage
                  </Link>
                </div>
              </div>
            </section>
          ) : (

            /* ── Registration form ─────────────────────────────────── */
            <section className="hero-glass-panel">
              <div className="glass-panel-inner">

                {/* Header */}
                <div className="org-logos-row">
                  <Image
                    src="/assets/images/clubs.png"
                    alt="Organising clubs: The AI Society, GDG ASU, SoDA"
                    width={320}
                    height={60}
                    style={{ objectFit: "contain", maxWidth: "100%" }}
                    priority
                  />
                </div>

                <h1
                  className="hero-title"
                  style={{
                    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                    marginBottom: "8px",
                    textAlign: "center",
                  }}
                >
                  Register for Innovation Hacks 2.0
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

                {/* Form */}
                <form
                  onSubmit={(e) => {
                    handleSubmit(onSubmit)(e);
                  }}
                  noValidate
                >

                  {/* ── Personal Info ──────────────────────────────── */}
                  <p className="register-section-title">Personal Info</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label htmlFor="firstName" className="register-label">
                        First Name <span style={{ color: "#ff6b6b" }}>*</span>
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        className="register-input"
                        placeholder="John"
                        autoComplete="given-name"
                        aria-invalid={!!errors.firstName}
                        aria-describedby={errors.firstName ? "firstName-error" : undefined}
                        {...register("firstName")}
                      />
                      {errors.firstName && (
                        <span id="firstName-error" className="register-error" role="alert">
                          {errors.firstName.message}
                        </span>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="lastName" className="register-label">
                        Last Name <span style={{ color: "#ff6b6b" }}>*</span>
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        className="register-input"
                        placeholder="Doe"
                        autoComplete="family-name"
                        aria-invalid={!!errors.lastName}
                        aria-describedby={errors.lastName ? "lastName-error" : undefined}
                        {...register("lastName")}
                      />
                      {errors.lastName && (
                        <span id="lastName-error" className="register-error" role="alert">
                          {errors.lastName.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mt-4">
                    <label htmlFor="email" className="register-label">
                      Email <span style={{ color: "#ff6b6b" }}>*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="register-input"
                      placeholder="ada@example.com"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      {...register("email")}
                    />
                    {errors.email && (
                      <span id="email-error" className="register-error" role="alert">
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="register-label">
                        Phone <span style={{ color: "#ff6b6b" }}>*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        className="register-input"
                        placeholder="e.g. 5550001234"
                        autoComplete="tel"
                        maxLength={10}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "phone-error" : undefined}
                        onKeyDown={(e) => {
                          const allowed = [
                            "Backspace", "Delete", "Tab",
                            "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
                            "Home", "End",
                          ];
                          if (
                            allowed.includes(e.key) ||
                            ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase()))
                          ) return;
                          if (!/^\d$/.test(e.key)) e.preventDefault();
                        }}
                        onInput={(e) => {
                          e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
                        }}
                        {...register("phone")}
                      />
                      {errors.phone && (
                        <span id="phone-error" className="register-error" role="alert">
                          {errors.phone.message}
                        </span>
                      )}
                    </div>

                    {/* Age */}
                    <div>
                      <label htmlFor="age" className="register-label">
                        Age <span style={{ color: "#ff6b6b" }}>*</span>
                      </label>
                      <input
                        id="age"
                        type="number"
                        className="register-input"
                        placeholder="e.g. 20"
                        min={16}
                        max={99}
                        aria-invalid={!!errors.age}
                        aria-describedby={errors.age ? "age-error" : undefined}
                        {...register("age")}
                      />
                      {errors.age && (
                        <span id="age-error" className="register-error" role="alert">
                          {errors.age.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="mt-4">
                    <label htmlFor="gender" className="register-label">
                      Gender <span style={{ color: "#ff6b6b" }}>*</span>
                    </label>
                    <select
                      id="gender"
                      className="register-select"
                      aria-invalid={!!errors.gender}
                      aria-describedby={errors.gender ? "gender-error" : undefined}
                      defaultValue=""
                      {...register("gender")}
                    >
                      <option value="" disabled>Select gender</option>
                      <option>Man</option>
                      <option>Woman</option>
                      <option>Non-Binary</option>
                      <option>Prefer to self-describe</option>
                      <option>Prefer Not to Answer</option>
                    </select>
                    {errors.gender && (
                      <span id="gender-error" className="register-error" role="alert">
                        {errors.gender.message}
                      </span>
                    )}
                  </div>

                  {/* Race / Ethnicity */}
                  <div className="mt-4">
                    <label htmlFor="raceEthnicity" className="register-label">
                      Race / Ethnicity <span style={{ color: "#ff6b6b" }}>*</span>
                    </label>
                    <select
                      id="raceEthnicity"
                      className="register-select"
                      aria-invalid={!!errors.raceEthnicity}
                      aria-describedby={errors.raceEthnicity ? "raceEthnicity-error" : undefined}
                      defaultValue=""
                      {...register("raceEthnicity")}
                    >
                      <option value="" disabled>Select race / ethnicity</option>
                      <option>Asian Indian</option>
                      <option>Black or African</option>
                      <option>Chinese</option>
                      <option>Filipino</option>
                      <option>Guamanian or Chamorro</option>
                      <option>Hispanic / Latino / Spanish Origin</option>
                      <option>Japanese</option>
                      <option>Korean</option>
                      <option>Middle Eastern</option>
                      <option>Native American or Alaskan Native</option>
                      <option>Native Hawaiian</option>
                      <option>Samoan</option>
                      <option>Vietnamese</option>
                      <option>White</option>
                      <option>Other Asian (Thai, Cambodian, etc)</option>
                      <option>Other Pacific Islander</option>
                      <option>Other (Please Specify)</option>
                      <option>Prefer Not to Answer</option>
                    </select>
                    {errors.raceEthnicity && (
                      <span id="raceEthnicity-error" className="register-error" role="alert">
                        {errors.raceEthnicity.message}
                      </span>
                    )}
                  </div>

                  {/* ── Academic Info ──────────────────────────────── */}
                  <p className="register-section-title">Academic Info</p>

                  {/* School */}
                  <div ref={schoolRef} style={{ position: "relative" }}>
                    <label htmlFor="school" className="register-label">
                      School / University <span style={{ color: "#ff6b6b" }}>*</span>
                    </label>
                    <input
                      id="school"
                      type="text"
                      className="register-input"
                      placeholder="Type at least 3 characters..."
                      autoComplete="off"
                      {...register("school")}
                      value={schoolQuery}
                      onChange={(e) => {
                        setSchoolQuery(e.target.value);
                        setValue("school", e.target.value);
                      }}
                      onFocus={() => {
                        if (schoolQuery.length >= 3) setShowSchoolDropdown(true);
                      }}
                      aria-invalid={!!errors.school}
                      aria-autocomplete="list"
                      aria-controls="school-listbox"
                    />
                    {showSchoolDropdown && filteredSchools.length > 0 && (
                      <ul id="school-listbox" className="school-dropdown" role="listbox" aria-label="School suggestions">
                        {filteredSchools.map((school) => (
                          <li
                            key={school}
                            className="school-dropdown-item"
                            role="option"
                            aria-selected={false}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSchoolQuery(school);
                              setValue("school", school, { shouldValidate: true });
                              setShowSchoolDropdown(false);
                            }}
                          >
                            {school}
                          </li>
                        ))}
                      </ul>
                    )}
                    {errors.school && (
                      <p className="register-error">{errors.school.message}</p>
                    )}
                  </div>

                  {/* Level of Study */}
                  <div className="mt-4">
                    <label htmlFor="levelOfStudy" className="register-label">
                      Level of Study <span style={{ color: "#ff6b6b" }}>*</span>
                    </label>
                    <select
                      id="levelOfStudy"
                      className="register-select"
                      aria-invalid={!!errors.levelOfStudy}
                      aria-describedby={errors.levelOfStudy ? "levelOfStudy-error" : undefined}
                      defaultValue=""
                      {...register("levelOfStudy")}
                    >
                      <option value="">Select level of study</option>
                      {LEVEL_OF_STUDY_OPTIONS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    {errors.levelOfStudy && (
                      <span id="levelOfStudy-error" className="register-error" role="alert">
                        {errors.levelOfStudy.message}
                      </span>
                    )}
                  </div>

                  {/* Year of Study (optional) */}
                  <div className="form-group mt-4">
                    <label htmlFor="yearOfStudy" className="register-label">
                      Year of Study{" "}
                      <span
                        className="register-optional"
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: "0.85em",
                          marginLeft: "4px",
                        }}
                      >
                        (optional)
                      </span>
                    </label>
                    <select
                      id="yearOfStudy"
                      className="register-select"
                      {...register("yearOfStudy")}
                    >
                      <option value="">Select your year</option>
                      <option value="Freshman (1st Year)">Freshman (1st Year)</option>
                      <option value="Sophomore (2nd Year)">Sophomore (2nd Year)</option>
                      <option value="Junior (3rd Year)">Junior (3rd Year)</option>
                      <option value="Senior (4th Year+)">Senior (4th Year+)</option>
                      <option value="Masters">Masters</option>
                      <option value="PhD / Doctoral">PhD / Doctoral</option>
                      <option value="Bootcamp / Non-traditional">Bootcamp / Non-traditional</option>
                      <option value="Prefer not to answer">Prefer not to answer</option>
                    </select>
                  </div>

                  {/* Country of Residence */}
                  <div className="mt-4">
                    <label htmlFor="countryOfResidence" className="register-label">
                      Country of Residence <span style={{ color: "#ff6b6b" }}>*</span>
                    </label>
                    <select
                      id="countryOfResidence"
                      className="register-select"
                      aria-invalid={!!errors.countryOfResidence}
                      aria-describedby={
                        errors.countryOfResidence ? "countryOfResidence-error" : undefined
                      }
                      defaultValue=""
                      {...register("countryOfResidence")}
                    >
                      <option value="" disabled>
                        Select country
                      </option>
                      {countryOptions.map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                    {errors.countryOfResidence && (
                      <span id="countryOfResidence-error" className="register-error" role="alert">
                        {errors.countryOfResidence.message}
                      </span>
                    )}
                  </div>

                  {/* ── Additional Info ────────────────────────────── */}
                  <p className="register-section-title">Additional Info</p>

                  {/* LinkedIn */}
                  <div>
                    <label htmlFor="linkedinUrl" className="register-label">
                      LinkedIn URL <span style={{ color: "rgba(160,100,255,0.7)", fontSize: "0.8em", marginLeft: "4px" }}>(recommended)</span>
                    </label>
                    <input
                      id="linkedinUrl"
                      type="url"
                      className="register-input"
                      placeholder="https://linkedin.com/in/yourname"
                      autoComplete="url"
                      aria-invalid={!!errors.linkedinUrl}
                      aria-describedby={errors.linkedinUrl ? "linkedinUrl-error" : undefined}
                      {...register("linkedinUrl")}
                    />
                    {errors.linkedinUrl && (
                      <span id="linkedinUrl-error" className="register-error" role="alert">
                        {errors.linkedinUrl.message}
                      </span>
                    )}
                  </div>

                  {/* GitHub */}
                  <div className="mt-4">
                    <label htmlFor="githubUrl" className="register-label">
                      GitHub URL <span style={{ color: "#ff6b6b" }}>*</span>
                    </label>
                    <input
                      id="githubUrl"
                      type="url"
                      className="register-input"
                      placeholder="https://github.com/yourusername"
                      autoComplete="url"
                      aria-invalid={!!errors.githubUrl}
                      aria-describedby={errors.githubUrl ? "githubUrl-error" : undefined}
                      {...register("githubUrl")}
                    />
                    {errors.githubUrl && (
                      <span id="githubUrl-error" className="register-error" role="alert">
                        {errors.githubUrl.message}
                      </span>
                    )}
                  </div>

                  {/* Resume dropzone */}
                  <div className="mt-4">
                    <label className="register-label">
                      Resume (PDF, max 5 MB){" "}
                      <span style={{ color: "#ff6b6b" }} aria-label="required">*</span>
                    </label>
                    <div
                      {...getRootProps()}
                      className={`register-dropzone${isDragActive ? " register-dropzone--active" : ""}`}
                      role="button"
                      tabIndex={0}
                      aria-label="Upload resume (required). Click or drag and drop a PDF"
                    >
                      <input {...getInputProps()} />
                      {resumeFile ? (
                        <div>
                          <p style={{ color: "rgba(160,80,255,0.9)", fontWeight: 600, margin: 0 }}>
                            {resumeFile.name}
                          </p>
                          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", marginTop: 4 }}>
                            Click or drag to replace
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p style={{ color: "rgba(255,255,255,0.55)", margin: 0 }}>
                            {isDragActive
                              ? "Drop your resume here…"
                              : "Drag & drop your resume, or click to browse"}
                          </p>
                          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", marginTop: 6 }}>
                            PDF only · max 5 MB
                          </p>
                        </div>
                      )}
                    </div>
                    {errors.resume && (
                      <p className="register-error" role="alert" style={{ marginTop: 8 }}>
                        {errors.resume.message as string}
                      </p>
                    )}
                  </div>

                  {/* ── MLH Agreements ─────────────────────────────── */}
                  <p className="register-section-title">MLH Agreements</p>

                  {/* Code of Conduct — required */}
                  <div className="mb-4">
                    <label className="register-checkbox-label">
                      <input
                        type="checkbox"
                        className="register-checkbox"
                        aria-invalid={!!errors.mlhCodeOfConduct}
                        aria-describedby={
                          errors.mlhCodeOfConduct ? "mlhCodeOfConduct-error" : undefined
                        }
                        {...register("mlhCodeOfConduct")}
                      />
                      <span>
                        I have read and agree to the{" "}
                        <a
                          href="https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-purple-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          MLH Code of Conduct
                        </a>
                        .{" "}
                        <span style={{ color: "#ff6b6b" }} aria-label="required">*</span>
                      </span>
                    </label>
                    {errors.mlhCodeOfConduct && (
                      <span id="mlhCodeOfConduct-error" className="register-error" role="alert">
                        {errors.mlhCodeOfConduct.message}
                      </span>
                    )}
                  </div>

                  {/* Data sharing — required */}
                  <div className="mb-4">
                    <label className="register-checkbox-label">
                      <input
                        type="checkbox"
                        className="register-checkbox"
                        aria-invalid={!!errors.mlhDataSharing}
                        aria-describedby={
                          errors.mlhDataSharing ? "mlhDataSharing-error" : undefined
                        }
                        {...register("mlhDataSharing")}
                      />
                      <span>
                        I authorize you to share my application/registration information with Major
                        League Hacking for event administration, ranking, and MLH administration
                        in-line with the{" "}
                        <a
                          href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-purple-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          MLH Privacy Policy
                        </a>
                        . I further agree to the terms of both the{" "}
                        <a
                          href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-purple-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          MLH Contest Terms and Conditions
                        </a>{" "}
                        and the{" "}
                        <a
                          href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-purple-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          MLH Privacy Policy
                        </a>
                        .{" "}
                        <span style={{ color: "#ff6b6b" }} aria-label="required">*</span>
                      </span>
                    </label>
                    {errors.mlhDataSharing && (
                      <span id="mlhDataSharing-error" className="register-error" role="alert">
                        {errors.mlhDataSharing.message}
                      </span>
                    )}
                  </div>

                  {/* Email consent — optional */}
                  <div className="mb-6">
                    <label className="register-checkbox-label">
                      <input
                        type="checkbox"
                        className="register-checkbox"
                        {...register("mlhEmailConsent")}
                      />
                      <span>
                        I authorize MLH to send me occasional emails about relevant events, career opportunities, and community announcements.
                      </span>
                    </label>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="hero-register-btn"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? "Submitting…" : "Register Now →"}
                  </button>
                </form>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
