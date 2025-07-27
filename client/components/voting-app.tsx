"use client"

import { useState, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateCampaignForm } from "@/components/create-campaign-form"
import { CastVoteForm } from "@/components/cast-vote-form"
import { CampaignList } from "@/components/campaign-list"
import { ThemeToggle } from "@/components/theme-toggle"
import { Vote, Plus, List } from "lucide-react"
import { toast } from "sonner"

export function VotingApp() {
  const { connected, publicKey } = useWallet()
  const { connection } = useConnection()
  const [activeTab, setActiveTab] = useState<"create" | "vote" | "campaigns">("campaigns")

  useEffect(() => {
    if (connected && publicKey) {
      toast.success("Success! Your wallet is connected. ✨", {
        description: `Connected as ${publicKey.toString().slice(0, 8)}...${publicKey.toString().slice(-8)}`,
      })
    }
  }, [connected, publicKey])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Vote className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-1">uwuVote</h1>
              <p className="text-muted-foreground text-lg">Solana Voting Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-lg !font-medium !text-primary-foreground !border-0 !px-6 !py-3" />
          </div>
        </div>

        {!connected ? (
          <div className="max-w-lg mx-auto">
            <Card className="shadow-sm border-0">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Vote className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-semibold mb-2">Connect Your Wallet</CardTitle>
                <p className="text-muted-foreground text-lg">
                  Connect your Solana wallet to start creating and participating in voting campaigns.
                </p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-muted/30 rounded-lg p-6">
                  <p className="text-sm text-muted-foreground">Supported wallets: Phantom and Solflare</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Navigation Tabs */}
            <div className="flex justify-center">
              <div className="flex bg-card rounded-lg p-2 border shadow-sm">
                <Button
                  variant={activeTab === "campaigns" ? "default" : "ghost"}
                  onClick={() => setActiveTab("campaigns")}
                  className="flex items-center gap-3 px-6 py-3"
                >
                  <List className="w-5 h-5" />
                  Campaigns
                </Button>
                <Button
                  variant={activeTab === "create" ? "default" : "ghost"}
                  onClick={() => setActiveTab("create")}
                  className="flex items-center gap-3 px-6 py-3"
                >
                  <Plus className="w-5 h-5" />
                  Create
                </Button>
                <Button
                  variant={activeTab === "vote" ? "default" : "ghost"}
                  onClick={() => setActiveTab("vote")}
                  className="flex items-center gap-3 px-6 py-3"
                >
                  <Vote className="w-5 h-5" />
                  Vote
                </Button>
              </div>
            </div>

            {/* Content */}
            {activeTab === "campaigns" && <CampaignList />}
            {activeTab === "create" && <CreateCampaignForm />}
            {activeTab === "vote" && <CastVoteForm />}
          </div>
        )}
      </div>
    </div>
  )
}
