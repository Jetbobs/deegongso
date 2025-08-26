import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // canvas 모듈을 클라이언트에서만 사용하도록 설정
    if (isServer) {
      config.externals = [...config.externals, 'canvas'];
    }
    
    // konva 관련 모듈 처리
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    
    return config;
  },
};

export default nextConfig;
