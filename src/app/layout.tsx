import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NFC Automator",
  description: "Gestiona les teves etiquetes intel·ligents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background min-h-screen pb-24 selection:bg-primary/30 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
