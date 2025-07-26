"use client"

import { WalletProvider } from "@/components/wallet-provider"
import { VotingApp } from "@/components/voting-app"

export default function Home() {
  return (
    <WalletProvider>
      <VotingApp />
    </WalletProvider>
  )
}
