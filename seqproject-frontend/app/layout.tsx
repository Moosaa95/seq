import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { AuthInitializer } from "@/components/AuthInitializer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Sequoia Projects Ltd - Premier Real Estate Services in Abuja",
  description: "Your premier destination for comprehensive real estate services in Abuja, Nigeria. Property management, construction, consultancy, and short-let services since 2017.",
  keywords: "real estate abuja, property management nigeria, luxury apartments abuja, short let abuja, property consultancy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth overflow-x-hidden">
      <body className={`${inter.variable} font-sans antialiased bg-white overflow-x-hidden`} suppressHydrationWarning>
        <StoreProvider>
          <AuthInitializer>
            <main className="min-h-screen overflow-x-hidden">{children}</main>
          </AuthInitializer>
        </StoreProvider>
      </body>
    </html>
  );
}
