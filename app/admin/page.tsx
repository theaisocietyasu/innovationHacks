// app/admin/page.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = 'pending' | 'accepted' | 'waitlisted' | 'rejected';

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
  pending: number;
  accepted: number;
  waitlisted: number;
  rejected: number;
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
  pending: { label: 'Pending', classes: 'bg-white/10 text-white/70' },
  accepted: { label: 'Accepted', classes: 'bg-green-500/20 text-green-400' },
  waitlisted: { label: 'Waitlisted', classes: 'bg-yellow-500/20 text-yellow-400' },
  rejected: { label: 'Rejected', classes: 'bg-red-500/20 text-red-400' },
};

const LEVEL_OPTIONS = [
  'Less than Secondary / High School',
  'Secondary / High School',
  'Undergraduate University (2 year - community college or similar)',
  'Undergraduate University (3+ year)',
  'Graduate University (Masters, Professional, Doctoral, etc)',
  'Code School / Bootcamp',
  'Other Vocational / Trade Program or Apprenticeship',
  'Post Doctorate',
  'Other',
  "I'm not currently a student",
  'Prefer not to answer',
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 px-5 py-4">
      <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent ?? 'text-white'}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const { label, classes } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {label}
    </span>
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
  const [resumeToken, setResumeToken] = useState<string>('');

  // Filters / sort
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [sortBy, setSortBy] = useState('registeredAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Updating status
  const [updating, setUpdating] = useState<string | null>(null);

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
        const tokenRes = await fetch('/api/admin/resume-token');
        if (tokenRes.ok) {
          const { token } = (await tokenRes.json()) as { token: string };
          setResumeToken(token);
        }
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
        ...(levelFilter && { levelOfStudy: levelFilter }),
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
  }, [isAuthenticated, page, sortBy, sortDir, debouncedSearch, statusFilter, levelFilter]);

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

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="bg-gradient-to-b from-[#171721] sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1 rounded-full bg-gradient-to-b from-[#E066FF] to-[#7B61FF]" />
            <span className="font-bold text-white text-sm tracking-tight">
              Innovation Hacks <span className="text-[#E066FF]">Admin</span>
            </span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-xs text-white/60 hover:text-red-400 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Registrations
        </h1>
        {user && (
          <p className="text-sm text-white/40 mt-1">
            Signed in as <span className="font-medium text-white/70">@{user.username}</span>
          </p>
        )}
      </div>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <StatCard label="Total" value={data.stats.total} accent="text-[#E066FF]" />
          <StatCard label="Pending" value={data.stats.pending} />
          <StatCard label="Accepted" value={data.stats.accepted} accent="text-green-400" />
          <StatCard label="Waitlisted" value={data.stats.waitlisted} accent="text-yellow-400" />
          <StatCard label="Rejected" value={data.stats.rejected} accent="text-red-400" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name, email, school…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E066FF]/50"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E066FF]/50"
        >
          <option value="" className="bg-[#0a0614]">All statuses</option>
          <option value="pending" className="bg-[#0a0614]">Pending</option>
          <option value="accepted" className="bg-[#0a0614]">Accepted</option>
          <option value="waitlisted" className="bg-[#0a0614]">Waitlisted</option>
          <option value="rejected" className="bg-[#0a0614]">Rejected</option>
        </select>
        <select
          value={levelFilter}
          onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E066FF]/50 max-w-xs"
        >
          <option value="" className="bg-[#0a0614]">All study levels</option>
          {LEVEL_OPTIONS.map((l) => (
            <option key={l} value={l} className="bg-[#0a0614]">{l}</option>
          ))}
        </select>
        <button
          onClick={() => { setSearch(''); setStatusFilter(''); setLevelFilter(''); setPage(1); }}
          className="px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                {[
                  { label: 'Name', field: 'firstName' },
                  { label: 'Email', field: 'email' },
                  { label: 'School', field: 'school' },
                  { label: 'Level', field: 'levelOfStudy' },
                  { label: 'Age', field: 'age' },
                  { label: 'Country', field: 'countryOfResidence' },
                  { label: 'Registered', field: 'registeredAt' },
                  { label: 'Status', field: 'status' },
                  { label: 'Actions', field: '' },
                ].map(({ label, field }) => (
                  <th
                    key={label}
                    onClick={() => field && handleSort(field)}
                    className={`px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wide whitespace-nowrap ${field ? 'cursor-pointer hover:text-[#E066FF] select-none' : ''}`}
                  >
                    {label}
                    {field && <SortIcon field={field} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-white/40">
                    Loading…
                  </td>
                </tr>
              ) : data?.registrations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-white/40">
                    No registrations found.
                  </td>
                </tr>
              ) : (
                data?.registrations.map((r) => (
                  <tr key={r._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                      {r.firstName} {r.lastName}
                    </td>
                    <td className="px-4 py-3 text-white/60 max-w-48 truncate">
                      <a href={`mailto:${r.email}`} className="hover:text-[#E066FF]">{r.email}</a>
                    </td>
                    <td className="px-4 py-3 text-white/70 max-w-48 truncate" title={r.school}>{r.school}</td>
                    <td className="px-4 py-3 text-white/60 max-w-40 truncate text-xs" title={r.levelOfStudy}>{r.levelOfStudy}</td>
                    <td className="px-4 py-3 text-white/60">{r.age}</td>
                    <td className="px-4 py-3 text-white/60">{r.countryOfResidence}</td>
                    <td className="px-4 py-3 text-white/40 whitespace-nowrap text-xs">
                      {new Date(r.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-nowrap">
                        {/* Status selector */}
                        <select
                          value={r.status}
                          disabled={updating === r._id}
                          onChange={(e) => void handleStatusChange(r._id, e.target.value as Status)}
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#E066FF]/50 disabled:opacity-50"
                        >
                          <option value="pending" className="bg-[#0a0614]">Pending</option>
                          <option value="accepted" className="bg-[#0a0614]">Accepted</option>
                          <option value="waitlisted" className="bg-[#0a0614]">Waitlisted</option>
                          <option value="rejected" className="bg-[#0a0614]">Rejected</option>
                        </select>

                        {/* Resume link */}
                        <a
                          href={resumeToken ? `${r.resumeUrl}?token=${encodeURIComponent(resumeToken)}` : r.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#E066FF] hover:text-[#7B61FF] font-medium whitespace-nowrap transition-colors"
                        >
                          Resume ↗
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-white/40">
              Showing {((data.page - 1) * 50) + 1}–{Math.min(data.page * 50, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/60 disabled:opacity-40 hover:bg-white/5 transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={data.page === data.totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/60 disabled:opacity-40 hover:bg-white/5 transition-colors"
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
