import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "通用婚礼管家 · 客户与执行工作台",
  description: "通用婚礼管家的客户、档期、风俗、工作人员、手机看板与当天执行工作台。",
  openGraph: {
    title: "通用婚礼管家 · 客户与执行工作台",
    description: "流程、物品、口令与联系人一页掌握。",
    images: [{ url: "/og.png", width: 1536, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "通用婚礼管家 · 客户与执行工作台",
    description: "流程、物品、口令与联系人一页掌握。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
