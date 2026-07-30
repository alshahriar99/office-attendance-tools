import type { NextConfig } from "next";

// Sanitize environment variables globally at server startup
if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.trim().replace(/^["']|["']$/g, "");
}
if (process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DIRECT_URL.trim().replace(/^["']|["']$/g, "");
} else if (process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL.replace(":6543", ":5432").replace(/[?&]pgbouncer=true/g, "");
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
