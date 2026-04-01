// app/admin/page.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// ─── Discord icon ─────────────────────────────────────────────────────────────

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.034.053a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

// ─── PDF icon ─────────────────────────────────────────────────────────────────

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
      <line x1="9" y1="9" x2="11" y2="9" />
    </svg>
  );
}

// ─── Resume PDF Modal ─────────────────────────────────────────────────────────

interface ViewingResume {
  id: string;
  name: string;
  url: string;
}

function ResumePdfModal({
  viewing,
  onClose,
}: {
  viewing: ViewingResume;
  onClose: () => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Auto-focus close button when modal opens
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Fetch the PDF and create a blob URL so the iframe can render it without
  // being blocked by the global X-Frame-Options: DENY header in next.config.js.
  // A blob: URL is created in the browser and is not subject to that header.
  useEffect(() => {
    let revoked = false;
    let objectUrl = '';

    (async () => {
      try {
        const res = await fetch(viewing.url);
        if (!res.ok) {
          setFetchError(true);
          return;
        }
        const blob = await res.blob();
        if (revoked) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch {
        if (!revoked) setFetchError(true);
      }
    })();

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [viewing.url]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Resume — ${viewing.name}`}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0a0614] border border-white/10 rounded-2xl overflow-hidden w-[90vw] max-w-5xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#171721] border-b border-white/10 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <p className="text-white font-semibold text-sm truncate pr-4">
            Resume — {viewing.name}
          </p>
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close resume viewer"
              className="text-white/50 hover:text-white transition-colors leading-none text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="relative flex-1 min-h-0">
          {!blobUrl && !fetchError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/40 text-sm">Loading PDF…</span>
            </div>
          )}
          {fetchError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-red-400 text-sm">Failed to load PDF. Try opening in a new tab.</span>
            </div>
          )}
          {blobUrl && (
            <iframe
              src={blobUrl}
              title={`Resume — ${viewing.name}`}
              className="w-full h-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = 'waitlisted' | 'accepted' | 'rejected' | 'checked-in';

interface Registration {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  school: string;
  levelOfStudy: string;
  yearOfStudy?: string;
  gender: string;
  raceEthnicity: string;
  countryOfResidence: string;
  linkedinUrl?: string;
  githubUrl: string;
  resumeUrl: string;
  resumeFileName: string;
  registeredAt: string;
  status: Status;
}

interface Stats {
  total: number;
  waitlisted: number;
  accepted: number;
  rejected: number;
  'checked-in': number;
}

interface ApiResponse {
  registrations: Registration[];
  total: number;
  page: number;
  totalPages: number;
  stats: Stats;
}

// ─── Status config ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Status, { label: string; classes: string }> = {
  waitlisted:  { label: 'Waitlisted',  classes: 'bg-yellow-500/20 text-yellow-400' },
  accepted:    { label: 'Accepted',    classes: 'bg-green-500/20 text-green-400' },
  rejected:    { label: 'Rejected',    classes: 'bg-red-500/20 text-red-400' },
  'checked-in': { label: 'Checked In', classes: 'bg-[#E066FF]/20 text-[#E066FF]' },
};

// Status pill button config (filter UI)
type StatusFilterValue = '' | Status;
interface StatusPill {
  value: StatusFilterValue;
  label: string;
  activeClasses: string;
}
const STATUS_PILLS: StatusPill[] = [
  { value: '',           label: 'All',        activeClasses: 'bg-[#E066FF]/10 border-[#E066FF]/40 text-[#E066FF]' },
  { value: 'waitlisted', label: 'Waitlisted', activeClasses: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' },
  { value: 'accepted',   label: 'Accepted',   activeClasses: 'bg-green-500/20 border-green-500/40 text-green-400' },
  { value: 'rejected',   label: 'Rejected',   activeClasses: 'bg-red-500/20 border-red-500/40 text-red-400' },
  { value: 'checked-in', label: 'Checked In', activeClasses: 'bg-[#E066FF]/20 border-[#E066FF]/40 text-[#E066FF]' },
];

// Sort options
interface SortOption {
  label: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}
const SORT_OPTIONS: SortOption[] = [
  { label: 'Registered (newest)', sortBy: 'registeredAt', sortDir: 'desc' },
  { label: 'Registered (oldest)', sortBy: 'registeredAt', sortDir: 'asc' },
  { label: 'Name (A–Z)', sortBy: 'firstName', sortDir: 'asc' },
];


// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 px-6 py-5">
      <p className="text-sm font-semibold text-white/50 uppercase tracking-wide">{label}</p>
      <p className={`text-4xl font-bold mt-1 ${accent ?? 'text-white'}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['waitlisted'];
  const { label, classes } = config;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${classes}`}>
      {label}
    </span>
  );
}

// ─── Resume button (mobile cards) ────────────────────────────────────────────

function ResumeButton({
  resumeUrl,
  firstName,
  lastName,
  onOpenModal,
}: {
  resumeUrl: string;
  firstName: string;
  lastName: string;
  onOpenModal: (v: ViewingResume) => void;
}) {
  const fileId = resumeUrl.split('/').pop() ?? '';
  const adminResumeUrl = `/api/admin/resume/${fileId}`;

  return (
    <button
      type="button"
      onClick={() =>
        onOpenModal({ id: fileId, name: `${firstName} ${lastName}`, url: adminResumeUrl })
      }
      title="View resume"
      className="inline-flex items-center gap-1.5 bg-[#E066FF]/10 hover:bg-[#E066FF]/20 text-[#E066FF] text-xs px-2.5 py-1 rounded-lg border border-[#E066FF]/20 transition-colors whitespace-nowrap"
    >
      <PdfIcon className="h-3.5 w-3.5 flex-shrink-0" />
      Resume
    </button>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters / sort
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('registeredAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Updating status
  const [updating, setUpdating] = useState<string | null>(null);

  // PDF viewer modal
  const [viewingResume, setViewingResume] = useState<ViewingResume | null>(null);

  // Close modal on Escape
  useEffect(() => {
    if (!viewingResume) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewingResume(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [viewingResume]);

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  // Session check
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) { router.push('/admin/login'); return; }
        const json = (await res.json()) as { user: { username: string } };
        setUser(json.user);
        setIsAuthenticated(true);
      } catch {
        router.push('/admin/login');
      }
    })();
  }, [router]);

  // Fetch registrations
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        sortBy,
        sortDir,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/admin/registrations?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch registrations');
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, page, sortBy, sortDir, debouncedSearch, statusFilter]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const handleStatusChange = async (id: string, newStatus: Status) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          registrations: prev.registrations.map((r) =>
            r._id === id ? { ...r, status: newStatus } : r,
          ),
        };
      });
    } catch {
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white/40 text-sm">Checking authentication…</div>
      </div>
    );
  }

  const SortIcon = ({ field }: { field: string }) => (
    <span className="ml-1 text-[#E066FF]/60 text-xs">
      {sortBy === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  // Derived active filter tags
  const activeFilterTags: Array<{ key: string; label: string; clear: () => void }> = [];
  if (statusFilter) {
    const pill = STATUS_PILLS.find((p) => p.value === statusFilter);
    activeFilterTags.push({
      key: 'status',
      label: `Status: ${pill?.label ?? statusFilter}`,
      clear: () => { setStatusFilter(''); setPage(1); },
    });
  }


  const currentSortKey = `${sortBy}__${sortDir}`;

  // Desktop table columns — Age, Country, and Level of Study removed
  const TABLE_COLUMNS: Array<{ label: string; field: string }> = [
    { label: 'Name', field: 'firstName' },
    { label: 'Email', field: 'email' },
    { label: 'School', field: 'school' },
    { label: 'Registered', field: 'registeredAt' },
    { label: 'Status', field: 'status' },
  ];

  return (
    <div className="min-h-screen">
      {/* Resume PDF modal */}
      {viewingResume && (
        <ResumePdfModal viewing={viewingResume} onClose={() => setViewingResume(null)} />
      )}

      {/* Nav */}
      <nav className="bg-gradient-to-b from-[#171721] to-[#0a0614] sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Left — brand */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-base tracking-tight select-none">
              Innovation Hacks{' '}
              <span className="text-[#E066FF]">Admin</span>
            </span>
          </div>

          {/* Right — user + sign out */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-white/50">
                <DiscordIcon className="h-4 w-4 text-[#7B61FF]" />
                <span className="font-medium text-white/70">{user.username}</span>
              </div>
            )}
            <button
              onClick={() => {
                void fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
                  window.location.href = '/';
                });
              }}
              className="text-sm text-white/50 hover:text-red-400 transition-colors font-medium px-3 py-1.5 rounded-lg border border-transparent hover:border-red-500/20 hover:bg-red-500/10"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
      {/* Glow separator */}
      <div className="h-px bg-gradient-to-r from-[#E066FF]/30 via-[#7B61FF]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Registrations
        </h1>
        {user && (
          <p className="text-base text-white/40 mt-1">
            Signed in as <span className="font-medium text-white/70">@{user.username}</span>
          </p>
        )}
      </div>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <StatCard label="Total"      value={data.stats.total}             accent="text-[#E066FF]" />
          <StatCard label="Waitlisted" value={data.stats.waitlisted}        accent="text-yellow-400" />
          <StatCard label="Accepted"   value={data.stats.accepted}          accent="text-green-400" />
          <StatCard label="Rejected"   value={data.stats.rejected}          accent="text-red-400" />
          <StatCard label="Checked In" value={data.stats['checked-in']}     accent="text-[#E066FF]" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-3 space-y-4">
        {/* Row 1 — search + level + sort */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search first name, last name, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-56 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E066FF]/50"
          />
          <select
            value={currentSortKey}
            onChange={(e) => {
              const opt = SORT_OPTIONS.find((o) => `${o.sortBy}__${o.sortDir}` === e.target.value);
              if (opt) { setSortBy(opt.sortBy); setSortDir(opt.sortDir); setPage(1); }
            }}
            className="rounded-lg border border-white/10 bg-[#0f0820] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E066FF]/50"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={`${opt.sortBy}__${opt.sortDir}`} value={`${opt.sortBy}__${opt.sortDir}`} className="bg-[#0a0614]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2 — status pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/40 font-medium uppercase tracking-wide mr-1">Status</span>
          {STATUS_PILLS.map((pill) => {
            const isActive = statusFilter === pill.value;
            return (
              <button
                key={pill.value}
                type="button"
                onClick={() => { setStatusFilter(pill.value); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                  isActive
                    ? pill.activeClasses
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active filter tags */}
      {activeFilterTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {activeFilterTags.map((tag) => (
            <span
              key={tag.key}
              className="bg-white/10 text-white/70 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
            >
              {tag.label}
              <button
                type="button"
                onClick={tag.clear}
                aria-label={`Remove filter: ${tag.label}`}
                className="text-white/40 hover:text-white transition-colors leading-none"
              >
                ×
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => { setStatusFilter(''); setPage(1); }}
            className="text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Result count */}
      {data && !loading && (
        <p className="text-xs text-white/40 mb-3">
          Showing {data.total === 0 ? '0' : `${((data.page - 1) * 50) + 1}–${Math.min(data.page * 50, data.total)}`} of {data.total} result{data.total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ── Desktop table (hidden on mobile) ─────────────────────────────────── */}
      <div className="hidden sm:block bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                {TABLE_COLUMNS.map(({ label, field }) => (
                  <th
                    key={label}
                    onClick={() => field && handleSort(field)}
                    className={`px-5 py-4 text-left text-sm font-semibold text-white/50 uppercase tracking-wide whitespace-nowrap ${field ? 'cursor-pointer hover:text-[#E066FF] select-none' : ''}`}
                  >
                    {label}
                    {field && <SortIcon field={field} />}
                  </th>
                ))}
                {/* Resume header */}
                <th className="px-5 py-4 text-left text-sm font-semibold text-white/50 uppercase tracking-wide whitespace-nowrap">
                  Resume
                </th>
                {/* Sticky Actions header */}
                <th className="px-5 py-4 text-left text-sm font-semibold text-white/50 uppercase tracking-wide whitespace-nowrap sticky right-0 bg-[#0a0614] z-10 border-l border-white/5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-base text-white/40">
                    Loading…
                  </td>
                </tr>
              ) : data?.registrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-base text-white/40">
                    No registrations found.
                  </td>
                </tr>
              ) : (
                data?.registrations.map((r) => (
                  <tr key={r._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 text-base font-medium text-white whitespace-nowrap">
                      {r.firstName} {r.lastName}
                    </td>
                    <td className="px-5 py-4 text-base text-white/60 max-w-48 truncate">
                      <a href={`mailto:${r.email}`} className="hover:text-[#E066FF]">{r.email}</a>
                    </td>
                    <td className="px-5 py-4 text-base text-white/70 max-w-48 truncate" title={r.school}>{r.school}</td>
                    <td className="px-5 py-4 text-base text-white/40 whitespace-nowrap">
                      {new Date(r.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    {/* Resume cell */}
                    <td className="px-5 py-4">
                      {(() => {
                        const fileId = r.resumeUrl.split('/').pop() ?? '';
                        const adminResumeUrl = `/api/admin/resume/${fileId}`;
                        return (
                          <button
                            type="button"
                            aria-label={`View resume for ${r.firstName} ${r.lastName}`}
                            title="View resume"
                            onClick={() =>
                              setViewingResume({
                                id: r._id,
                                name: `${r.firstName} ${r.lastName}`,
                                url: adminResumeUrl,
                              })
                            }
                            className="inline-flex items-center justify-center text-white/50 hover:text-[#E066FF] transition-colors"
                          >
                            <PdfIcon className="h-4 w-4" />
                          </button>
                        );
                      })()}
                    </td>
                    {/* Sticky Actions cell */}
                    <td className="px-5 py-4 sticky right-0 bg-[#0a0614] z-10 border-l border-white/5">
                      <select
                        value={r.status ?? 'waitlisted'}
                        disabled={updating === r._id}
                        onChange={(e) => void handleStatusChange(r._id, e.target.value as Status)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E066FF]/50 disabled:opacity-50"
                      >
                        <option value="waitlisted"  className="bg-[#0a0614]">Waitlisted</option>
                        <option value="accepted"    className="bg-[#0a0614]">Accepted</option>
                        <option value="rejected"    className="bg-[#0a0614]">Rejected</option>
                        <option value="checked-in"  className="bg-[#0a0614]">Checked In</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
            <p className="text-sm text-white/40">
              Showing {((data.page - 1) * 50) + 1}–{Math.min(data.page * 50, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page === 1}
                className="px-4 py-2 text-sm rounded-lg border border-white/10 text-white/60 disabled:opacity-40 hover:bg-white/5 transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={data.page === data.totalPages}
                className="px-4 py-2 text-sm rounded-lg border border-white/10 text-white/60 disabled:opacity-40 hover:bg-white/5 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile card list (visible only below sm) ──────────────────────────── */}
      <div className="block sm:hidden space-y-3">
        {loading ? (
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-16 text-center text-base text-white/40">
            Loading…
          </div>
        ) : data?.registrations.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-16 text-center text-base text-white/40">
            No registrations found.
          </div>
        ) : (
          data?.registrations.map((r) => (
            <div key={r._id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 space-y-3">
              {/* Row 1: name + badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-white text-base leading-tight">
                  {r.firstName} {r.lastName}
                </span>
                <StatusBadge status={r.status} />
              </div>

              {/* Row 2: school */}
              <div className="text-white/60 text-xs leading-relaxed">
                <span className="block truncate" title={r.school}>{r.school}</span>
              </div>

              {/* Row 3: actions */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <select
                  value={r.status ?? 'waitlisted'}
                  disabled={updating === r._id}
                  onChange={(e) => void handleStatusChange(r._id, e.target.value as Status)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E066FF]/50 disabled:opacity-50"
                >
                  <option value="waitlisted"  className="bg-[#0a0614]">Waitlisted</option>
                  <option value="accepted"    className="bg-[#0a0614]">Accepted</option>
                  <option value="rejected"    className="bg-[#0a0614]">Rejected</option>
                  <option value="checked-in"  className="bg-[#0a0614]">Checked In</option>
                </select>
                <ResumeButton
                  resumeUrl={r.resumeUrl}
                  firstName={r.firstName}
                  lastName={r.lastName}
                  onOpenModal={setViewingResume}
                />
              </div>
            </div>
          ))
        )}

        {/* Mobile pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-white/40">
              Page {data.page} of {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page === 1}
                className="px-4 py-2 text-sm rounded-lg border border-white/10 text-white/60 disabled:opacity-40 hover:bg-white/5 transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={data.page === data.totalPages}
                className="px-4 py-2 text-sm rounded-lg border border-white/10 text-white/60 disabled:opacity-40 hover:bg-white/5 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      </div>

    </div>
  );
}
