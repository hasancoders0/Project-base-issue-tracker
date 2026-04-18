import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import BackgroundParticles from "@/components/BackgroundParticles";

export const metadata = {
  title: "Project Base Issue Tracker",
  description: "Project and issue tracker app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="relative">
        <BackgroundParticles />

        <div className="relative z-10">
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </body>
    </html>
  );
}