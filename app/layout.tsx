import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "赣榆婚礼管家 · 当天执行台",
  description: "面向婚礼管家的手机当天作战台：看板、流程、执行卡、联系人与可编辑口令。",
  openGraph: {
    title: "赣榆婚礼管家 · 当天执行台",
    description: "流程、物品、口令与联系人一页掌握。",
    images: [{ url: "/og.png", width: 1536, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "赣榆婚礼管家 · 当天执行台",
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
