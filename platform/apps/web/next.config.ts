import path from 'node:path';
import type { NextConfig } from 'next';

/*
 * The API is proxied through this app rather than called directly from the browser.
 *
 * Web and API run on separate Render hostnames, and `onrender.com` is a public
 * suffix — so `dojo-hub-api.onrender.com` is a *different site* to the web app, and
 * the session cookie counts as third-party. Safari on iOS blocks third-party cookies
 * outright and mobile Chrome increasingly does too, so sign-in appeared to succeed
 * and then every following request arrived unauthenticated.
 *
 * Rewriting /api/* through this origin makes the cookie first-party, which every
 * browser accepts. It also removes CORS from the picture entirely.
 */
const API_TARGET = process.env.API_PROXY_TARGET ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_TARGET}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
