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
}

module.exports = nextConfig
