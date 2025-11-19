import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "~/components/providers/auth-provider";
import { ThemeProvider } from "~/components/providers/theme-provider";
import { PlayerContainer } from "~/components/player/player-container";

export const metadata: Metadata = {
  title: "E-Radio - Discover Radio Stations",
  description: "Discover and listen to radio stations from around the world",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <PlayerContainer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
