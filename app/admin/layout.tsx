// app/admin/layout.tsx
import type { ReactNode } from 'react';

export const metadata = { title: 'Admin — Innovation Hacks' };

// Bare dark wrapper only — nav lives in the dashboard page so the login page
// doesn't inherit it.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0614]">
      {/* Hide the global MLH trust badge — it overlaps the admin nav on mobile */}
      <style>{`#mlh-trust-badge { display: none !important; }`}</style>
      {children}
    </div>
  );
}
