/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      // Temporary: allow existing seeded Supabase image URLs
      { protocol: 'https', hostname: 'wnaxppdlvfcfeluxlvxn.supabase.co' }
    ],
  },
  webpack: (config, { isServer }) => {
    // Suppress specific warnings from Stack Auth UI library
    config.ignoreWarnings = [
      { module: /node_modules\/@stackframe\/stack/ },
      { module: /node_modules\/@stackframe\/stack-ui/ },
    ];
    return config;
  },
  // Suppress specific build warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;