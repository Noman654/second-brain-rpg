import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { StatsBar } from "@/components/StatsBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Second Brain RPG",
  description: "Gamified PARA Method",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased h-screen overflow-hidden flex bg-background`}>
        <Sidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <StatsBar />
          <div className="flex-1 overflow-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

