import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import PageTransition from "@/components/PageTransition";
import ThemeProvider from "@/components/ThemeProvider";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "FuelReady — AI Workout Readiness Coach",
  description: "Know exactly when your body is ready to train. AI-powered nutrition timing for peak performance.",
  keywords: ["workout", "nutrition", "fitness", "AI", "training readiness"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#080B12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full antialiased overflow-x-hidden">
        <ThemeProvider>
          <div className="relative min-h-full max-w-md mx-auto">
            <PageTransition>{children}</PageTransition>
          </div>
        </ThemeProvider>
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
