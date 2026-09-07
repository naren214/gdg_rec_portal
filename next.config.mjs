/** @type {import('next').NextConfig} */
const nextConfig = {
    // Keep production builds stable on constrained local/CI machines.
    experimental: {
        cpus: 2,
    },
    turbopack: {
        root: process.cwd(),
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "avatar.vercel.sh",
            },
        ],
    },
};

export default nextConfig;
