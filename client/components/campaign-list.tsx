"use client"

import { useState, useEffect } from "react"
import { useConnection } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Calendar, User, TrendingUp, Vote } from "lucide-react"
import { toast } from "sonner"
import { getAllCampaigns } from "@/lib/solana-utils"
import useProgram from "@/hooks/use-program"

interface Campaign {
  address: string
  description: string
  creator: string
  polls: Array<{
    description: string
    votes: number
  }>
  createdAt: number
  endsAt: number
}

export function CampaignList() {
  const { connection } = useConnection()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const {getAllCampaigns: getCampaignsFromContract} = useProgram();

  const loadCampaigns = async () => {
    setIsLoading(true)
    try {
      const campaignData = await getAllCampaigns(connection)
      setCampaigns(campaignData)
      await getCampaignsFromContract();
    
      toast.success("Success! Campaigns loaded. ✨")
    } catch (error) {
      console.error("Error loading campaigns:", error)
      toast.error("Oops! Failed to load campaigns. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [connection])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const isExpired = (endsAt: number) => {
    return Date.now() / 1000 > endsAt
  }

  const getTotalVotes = (polls: Campaign["polls"]) => {
    return polls.reduce((total, poll) => total + poll.votes, 0)
  }

  const getWinningOption = (polls: Campaign["polls"]) => {
    if (polls.length === 0) return null
    return polls.reduce((winner, current) => (current.votes > winner.votes ? current : winner))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Active Campaigns</h2>
        <Button
          onClick={loadCampaigns}
          disabled={isLoading}
          variant="outline"
          className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="text-center py-20 shadow-sm border-0">
          <CardContent>
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Vote className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">No campaigns available</h3>
            <p className="text-muted-foreground text-lg">Be the first to create a voting campaign</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const totalVotes = getTotalVotes(campaign.polls)
            const winningOption = getWinningOption(campaign.polls)
            const expired = isExpired(campaign.endsAt)

            return (
              <Card key={campaign.address} className="h-full shadow-sm border-0">
                <CardHeader className="pb-6">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-xl line-clamp-2 leading-tight">{campaign.description}</CardTitle>
                    <Badge variant={expired ? "destructive" : "default"} className="shrink-0">
                      {expired ? "Ended" : "Active"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="font-mono">
                      {campaign.creator.slice(0, 8)}...{campaign.creator.slice(-8)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(campaign.createdAt)} - {formatDate(campaign.endsAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    <span className="font-medium">{totalVotes} total votes</span>
                  </div>

                  {winningOption && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="text-sm font-medium text-primary mb-2">Leading Option:</div>
                      <div className="text-sm">
                        "{winningOption.description}" ({winningOption.votes} votes)
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="text-sm font-medium">All Options:</div>
                    <div className="space-y-3">
                      {campaign.polls.map((poll, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="line-clamp-1 flex-1 mr-3">{poll.description}</span>
                          <Badge variant="secondary">{poll.votes}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-xs text-muted-foreground font-mono break-all">{campaign.address}</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
