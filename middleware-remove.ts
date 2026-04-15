// import { NextResponse } from "next/server";
// import { Redis } from "@upstash/redis";
// import { Ratelimit } from "@upstash/ratelimit";

// // ۱️⃣ اتصال به Upstash Redis
// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });

// // ۲️⃣ تنظیم: ۲۰ درخواست در هر ۵ دقیقه
// const ratelimit = new Ratelimit({
//   redis,
//   limiter: Ratelimit.slidingWindow(10, "5 m"),
// });

// // ۳️⃣ اجرای محدودیت قبل از رسیدن درخواست به API
// export default async function middleware(req: Request) {

//   const pathname = new URL(req.url).pathname;
//    console.log("➡️ Middleware hit for:", pathname);

//   // فقط مسیر /api/livekit-token هدف است
//   if (!pathname.startsWith("/api/livekit-token")) {
//     return NextResponse.next();
//   }

//   // گرفتن IP از کاربر
//   const ip =
//     req.headers.get("x-forwarded-for")?.split(",")[0] ||
//     "anonymous";

//   const { success, limit, remaining, reset } = await ratelimit.limit(ip);

//   console.log(`[RateLimit] IP: ${ip}, Success: ${success}, Remaining: ${remaining}/${limit}`);

//   // هدرهای اطلاعاتی (اختیاری)
//   const headers = {
//     "X-RateLimit-Limit": limit.toString(),
//     "X-RateLimit-Remaining": remaining.toString(),
//     "X-RateLimit-Reset": reset.toString(),
//   };

//   // اگر از حد مجاز گذشت
//   if (!success) {
//     console.log(`[RateLimit] BLOCKED: Too many requests for IP: ${ip}`);
//     return new NextResponse(
//       JSON.stringify({
//         error: "Too many requests. Please wait before trying again.",
//       }),
//       {
//         status: 429,
//         headers: {
//           ...headers,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   }

//   // موفق بود → بفرست به API
//   console.log(`[RateLimit] ALLOWED: Request passed for IP: ${ip}`);
//   return NextResponse.next({ headers });
// }

// // ۴️⃣ مشخص کن کجا اعمال شود
// export const config = {
//   matcher: ["/api/livekit-token/:path*"],
// };
