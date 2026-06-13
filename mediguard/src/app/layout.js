import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "MediGuard | Medicine Verification System",
  description: "Pharmaceutical authenticity verification platform. Verify your medicines in seconds.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MediGuard",
  },
};

export const viewport = {
  themeColor: "#5B46FF",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5B46FF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </head>
      <body>
        <Navbar />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
