import "@/app/globals.css";
import { Inter } from "next/font/google";
import SupabaseProvider from "@/app/supabase-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vocabulary Quiz",
  description: "Real-time vocabulary quiz application",
};

export default function RootLayout({
  children,
}: {
    children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
