"use client"

import { useState } from "react"
import { Moon, Sun, Wallet, LogOut, Menu, X, Vote, Heart } from "lucide-react"
import { useTheme } from "@/providers/theme-provider"
import { Button } from "@/components/ui/button"
import { useSolanaWallet } from "@/hooks/useWallet"
import { kawaiToast } from "@/lib/toast-config"
import { formatAddress } from "@/lib/utils"
import Link from "next/link"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { connected, connecting, walletAddress, connectWallet, disconnectWallet } = useSolanaWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleWalletAction = async () => {
    try {
      if (connected) {
        await disconnectWallet()
        kawaiToast.info("Wallet disconnected", "See you later! 👋")
      } else {
        await connectWallet()
        kawaiToast.success("Wallet connected!", "Ready to vote! 🗳️")
      }
    } catch (error) {
      kawaiToast.error("Wallet connection failed")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-kawaii-pink-200 dark:border-kawaii-lavender-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Vote className="h-8 w-8 text-kawaii-pink-500 group-hover:animate-wiggle" />
              <Heart className="absolute -top-1 -right-1 h-4 w-4 text-kawaii-lavender-400 animate-pulse" />
            </div>
            <span className="text-2xl font-cute font-bold bg-gradient-to-r from-kawaii-pink-500 to-kawaii-lavender-500 bg-clip-text text-transparent">
              uwuVote
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/campaigns"
              className="text-gray-700 dark:text-gray-300 hover:text-kawaii-pink-500 dark:hover:text-kawaii-pink-400 transition-colors font-medium"
            >
              Campaigns
            </Link>
            <Link
              href="/create-campaign"
              className="text-gray-700 dark:text-gray-300 hover:text-kawaii-lavender-500 dark:hover:text-kawaii-lavender-400 transition-colors font-medium"
            >
              Create
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full p-2"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Wallet Button */}
            <Button
              onClick={handleWalletAction}
              loading={connecting}
              variant={connected ? "secondary" : "primary"}
              size="md"
            >
              {connected ? (
                <div className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>{formatAddress(walletAddress)}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4" />
                  <WalletMultiButton/>
                </div>
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden rounded-full p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-kawaii-pink-200 dark:border-kawaii-lavender-800 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/campaigns"
                className="text-gray-700 dark:text-gray-300 hover:text-kawaii-pink-500 dark:hover:text-kawaii-pink-400 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Campaigns
              </Link>
              <Link
                href="/create-campaign"
                className="text-gray-700 dark:text-gray-300 hover:text-kawaii-lavender-500 dark:hover:text-kawaii-lavender-400 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Campaign
              </Link>

              <div className="flex items-center justify-between pt-4 border-t border-kawaii-pink-200 dark:border-kawaii-lavender-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="rounded-full p-2"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>

                <Button
                  onClick={handleWalletAction}
                  loading={connecting}
                  variant={connected ? "secondary" : "primary"}
                  size="sm"
                >
                  {connected ? (
                    <div className="flex items-center space-x-2">
                      <LogOut className="h-4 w-4" />
                      <span>{formatAddress(walletAddress)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4" />
                      <span>Connect</span>
                    </div>
                  )}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
