import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root to this project so Turbopack doesn't get
    // confused by an unrelated package-lock.json higher up in the user's
    // home directory.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
