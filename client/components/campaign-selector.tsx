"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useProgram } from "@/hooks/use-program"
import { toast } from "sonner"

interface Campaign {
  publicKey: string
  account: {
    description: string
    creator: any
    polls: Array<{
      description: string
      votes: any
    }>
    createdAt: any
    endsAt: any
  }
}

interface CampaignSelectorProps {
  onCampaignSelect: (campaignAddress: string, polls: Array<{description: string, votes: number}>) => void
  selectedCampaign?: string
}

export function CampaignSelector({ onCampaignSelect, selectedCampaign }: CampaignSelectorProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { getAllCampaigns, isReady } = useProgram()

  const loadCampaigns = async () => {
    if (!isReady) return
    
    setIsLoading(true)
    try {
      const campaignData = await getAllCampaigns()
      setCampaigns(campaignData)
    } catch (error) {
      console.error("Error loading campaigns:", error)
      toast.error("Failed to load campaigns")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isReady) {
      loadCampaigns()
    }
  }, [isReady])

  const isExpired = (endsAt: any) => {
    return Date.now() / 1000 > endsAt.toNumber()
  }

  const activeCampaigns = campaigns.filter(campaign => !isExpired(campaign.account.endsAt))

  const handleCampaignSelect = (campaignAddress: string) => {
    const campaign = campaigns.find(c => c.publicKey === campaignAddress)
    if (campaign) {
      const polls = campaign.account.polls.map(poll => ({
        description: poll.description,
        votes: poll.votes.toNumber()
      }))
      onCampaignSelect(campaignAddress, polls)
    }
  }

  return (
    <div className="space-y-3">
      <Select
        value={selectedCampaign}
        onValueChange={handleCampaignSelect}
        disabled={isLoading || !isReady}
      >
        <SelectTrigger className="text-base">
          <SelectValue placeholder={
            isLoading ? "Loading campaigns..." : 
            !isReady ? "Connect wallet first..." :
            activeCampaigns.length === 0 ? "No active campaigns" :
            "Select a campaign to vote on"
          } />
        </SelectTrigger>
        <SelectContent>
          {activeCampaigns.map((campaign) => (
            <SelectItem key={campaign.publicKey} value={campaign.publicKey}>
              <div className="flex items-center justify-between w-full">
                <span className="truncate max-w-[200px]">
                  {campaign.account.description}
                </span>
                <Badge variant="secondary" className="ml-2">
                  {campaign.account.polls.length} options
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {activeCampaigns.length === 0 && isReady && !isLoading && (
        <p className="text-sm text-muted-foreground">
          No active campaigns available. Create one first!
        </p>
      )}
    </div>
  )
}
