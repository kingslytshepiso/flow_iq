import { AuthProvider } from "@/lib/auth/AuthContext";
import { AppProvider } from "@/lib/context/AppContext";
import { CashFlowProvider } from "@/lib/context/CashFlowContext";
import { InventoryProvider } from "@/lib/context/InventoryContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LanguageProvider } from "../lib/i18n/LanguageContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowIQ - Business Management System",
  description:
    "A comprehensive business management system for small businesses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <CashFlowProvider>
              <InventoryProvider>
                <AppProvider>{children}</AppProvider>
              </InventoryProvider>
            </CashFlowProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
