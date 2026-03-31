// app/admin/login/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: 'You do not have the required Discord role to access this panel.',
  invalid_state: 'Authentication failed due to an invalid state. Please try again.',
  server_error: 'A server error occurred. Please try again.',
  missing_code: 'Discord did not return an authorisation code. Please try again.',
  access_denied: 'You cancelled the Discord authorisation.',
};

function LoginContent() {
  const searchParams = useSearchParams();
  const errorKey = searchParams.get('error');
  const errorMsg = errorKey ? (ERROR_MESSAGES[errorKey] ?? 'An unknown error occurred.') : null;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Logo / title */}
        <div className="text-center mb-10">
          <p className="text-sm font-semibold tracking-widest text-[#E066FF] uppercase mb-2">
            Innovation Hacks
          </p>
          <h1 className="text-5xl font-bold text-white">
            Admin Panel
          </h1>
          <p className="mt-3 text-white/60 text-base">
            Authorised organisers only — sign in with Discord.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10">
          {errorMsg && (
            <div className="mb-6 rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {errorMsg}
            </div>
          )}

          <a
            href="/api/auth/discord"
            className="flex items-center justify-center gap-3 w-full rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold py-4 px-6 transition-colors duration-150 text-base"
          >
            {/* Discord logo SVG */}
            <svg width="20" height="20" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M60.1 4.9A58.5 58.5 0 0 0 45.6.4a.2.2 0 0 0-.2.1 40.8 40.8 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.8 37.8 0 0 0 25.6.5a.2.2 0 0 0-.2-.1A58.3 58.3 0 0 0 10.9 4.9a.2.2 0 0 0-.1.1C1.6 18.2-.9 31.1.3 43.8a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 9 .2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4c.4-.3.7-.6 1.1-.8a.2.2 0 0 1 .2 0c11.6 5.3 24.1 5.3 35.6 0a.2.2 0 0 1 .2 0c.4.3.7.6 1.1.9a.2.2 0 0 1 0 .4 36 36 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.1 47.1 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.8-9 .2.2 0 0 0 .1-.2C73 29.2 69.4 16.4 60.2 5a.2.2 0 0 0-.1-.1ZM23.7 36.2c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 3.9-2.8 7.2-6.4 7.2Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 3.9-2.8 7.2-6.4 7.2Z" fill="currentColor"/>
            </svg>
            Sign in with Discord
          </a>

          <p className="mt-5 text-center text-xs text-white/40">
            You must be a member of the AI Society server with the correct organiser role.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
