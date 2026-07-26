import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "婚礼管家 · 客户与执行工作台",
  description: "婚礼管家的客户、档期、风俗、工作人员、手机看板与当天执行工作台。",
  manifest: "/manifest.webmanifest",
  applicationName: "婚礼管家",
  themeColor: "#8d1f2d",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "婚礼管家",
  },
  icons: {
    icon: [
      { url: "/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "婚礼管家 · 客户与执行工作台",
    description: "流程、物品、口令与联系人一页掌握。",
    images: [{ url: "/og.png", width: 1536, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "婚礼管家 · 客户与执行工作台",
    description: "流程、物品、口令与联系人一页掌握。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <script src="./vendor/html2canvas.min.js" defer />
      </body>
    </html>
  );
}
