const path = require('path');

const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  swcMinify: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  images: {
    domains: ['img.pokemondb.net', 'firebasestorage.googleapis.com', 'app.poslix.com'],
  },
};

module.exports = nextConfig;
