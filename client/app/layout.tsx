import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/providers/theme-provider"
import { Toaster } from "sonner"
import { WalletContextProvider } from "@/providers/wallet-context-provider"
import { Header } from "@/components/header"

export const metadata: Metadata = {
  title: "uwuVote - Kawaii Solana Voting",
  description: "The cutest decentralized voting platform on Solana ✨",
  keywords: ["solana", "voting", "blockchain", "kawaii", "democracy", "web3"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="light" storageKey="kawaii-theme">
          <WalletContextProvider>
            <div className="min-h-screen">
              <Header />
              <main>{children}</main>
            </div>
            <Toaster
              position="top-right"
              richColors
              closeButton
              theme="light"
              className="toaster-kawaii"
              toastOptions={{
                style: {
                  borderRadius: "1.5rem",
                },
              }}
            />
          </WalletContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
