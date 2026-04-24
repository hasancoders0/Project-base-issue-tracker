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
        {/* Background Image */}
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-8"
          style={{
            backgroundImage: "url('/root-background.png')",
          }}
        />

        {/* Particles */}
        <div className="fixed inset-0 z-10 pointer-events-none">
          <BackgroundParticles />
        </div>

        {/* Main Content */}
        <div className="relative z-20">
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </body>
    </html>
  );
}