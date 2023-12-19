/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config) => {
    // eslint-disable-next-line no-param-reassign
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
