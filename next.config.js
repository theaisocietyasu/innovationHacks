/** @type {import('next').NextConfig} */
const nextConfig = {
    // 'output: export' removed — static export is incompatible with API route handlers.
    // The registration API requires a Node.js server runtime (Vercel, self-hosted, etc.).
    images: {
        unoptimized: true,
        domains: [ 'res.cloudinary.com','t4.ftcdn.net','raw.githubusercontent.com'],
    },
    trailingSlash: true,
    experimental: {
        // @vercel/blob uses undici which contains private class field syntax (#field)
        // that webpack cannot parse — exclude from bundling so Node.js handles it natively.
        serverComponentsExternalPackages: ['@vercel/blob', 'mongoose'],
    },
    async headers() {
        const siteUrl = process.env.SITE_URL || '';
        return [
            {
                // Security headers for all routes.
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                ],
            },
            {
                // CORS for API routes — restrict to the configured site origin.
                source: '/api/(.*)',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: siteUrl },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, x-resume-token' },
                ],
            },
        ];
    },
}

module.exports = nextConfig
