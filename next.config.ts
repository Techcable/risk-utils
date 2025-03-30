import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    distDir: "build",
    typescript: {
        tsconfigPath: "./tsconfig-primary.json",
    },
};

export default nextConfig;
