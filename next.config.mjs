/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. تنظیمات بهینه‌سازی تصاویر
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'social.ayand.cloud',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // 2. هدرهای امنیتی (CSP Fix)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              // -------------------------
              // 🛡️ تنظیمات پایه
              // -------------------------
              "default-src 'self'",
              
              // اسکریپت‌ها
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net",
              
              // استایل‌ها
              "style-src 'self' 'unsafe-inline'",
              
              // تصاویر: (مهم: social.ayand.cloud اینجا اضافه شد هرچند https: آن را پوشش می‌دهد، اما برای اطمینان)
              "img-src 'self' data: https: blob: https://social.ayand.cloud",
              
              // فونت‌ها
              "font-src 'self' data:",
              
              // اتصالات شبکه (CRITICAL FIX):
              // دامین social.ayand.cloud باید اینجا باشد تا fetch کار کند
              "connect-src 'self' https://api.openai.com https://api.anthropic.com https://unpkg.com https://cdn.jsdelivr.net https://*.livekit.cloud wss://*.livekit.cloud https://social.ayand.cloud",
              
              // مدیا و ورکرها
              "media-src 'self' blob:",
              "worker-src 'self' blob:",
              
              // تنظیمات فریم و بیس
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; ')
          },
          
          // -------------------------
          // 📦 سایر هدرهای امنیتی
          // -------------------------
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
        ],
      },
    ]
  },
};

export default nextConfig;
