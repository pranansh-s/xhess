/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // compress: true,
  output: 'standalone',
  // productionBrowserSourceMaps: false,
  // images: {
  //   formats: ['image/avif', 'image/webp'],
  //   dangerouslyAllowSVG: true,
  //   contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  // },
};

module.exports = nextConfig;
