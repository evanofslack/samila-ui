/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [],
    },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                // destination: "http://localhost:8080/:path*", // Proxy to Backend
                destination: "https://samila-api.herokuapp.com/:path*", // Proxy to Backend
            },
        ];
    },
};

module.exports = nextConfig;
