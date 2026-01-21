import { Geist, Geist_Mono } from "next/font/google";
import ConvexClientProvider from "@/core/providers/ConvexClientProvider";
import "../../app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Project ECHO",
  description: "The social network that forgets.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark"> 
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
