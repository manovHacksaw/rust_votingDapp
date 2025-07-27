"use client"

import type React from "react"

import { useState } from "react"
import { PublicKey } from "@solana/web3.js"
import { useSolana } from "@/hooks/use-solana"
import { useProgram } from "@/hooks/use-program"
import { CampaignSelector } from "@/components/campaign-selector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Vote, Info } from "lucide-react"
import { toast } from "sonner"


export function CastVoteForm() {
  const { publicKey } = useSolana()
  const { castVote, hasVoted, isReady } = useProgram()
  const [isLoading, setIsLoading] = useState(false)
  const [checkingVote, setCheckingVote] = useState(false)
  const [alreadyVoted, setAlreadyVoted] = useState(false)
  const [formData, setFormData] = useState({
    campaignAddress: "",
    pollIndex: "",
  })
  const [selectedCampaignPolls, setSelectedCampaignPolls] = useState<Array<{description: string, votes: number}>>([])

  const validateForm = () => {
    if (!formData.campaignAddress.trim()) {
      toast.error("Oops! Campaign address is required.")
      return false
    }

    try {
      new PublicKey(formData.campaignAddress)
    } catch {
      toast.error("Oops! Invalid campaign address format.")
      return false
    }

    if (!formData.pollIndex) {
      toast.error("Oops! Please select a poll option.")
      return false
    }

    const pollIndexNum = Number.parseInt(formData.pollIndex)
    if (isNaN(pollIndexNum) || pollIndexNum < 0 || pollIndexNum > 255) {
      toast.error("Oops! Invalid poll index.")
      return false
    }

    return true
  }

  const handleCampaignSelect = async (campaignAddress: string, polls: Array<{description: string, votes: number}>) => {
    setFormData({ ...formData, campaignAddress, pollIndex: "" })
    setSelectedCampaignPolls(polls)

    // Check if user has already voted
    if (publicKey && isReady) {
      setCheckingVote(true)
      try {
        const voted = await hasVoted(new PublicKey(campaignAddress))
        setAlreadyVoted(voted)
        if (voted) {
          toast.info("You have already voted on this campaign")
        }
      } catch (error) {
        console.error("Error checking vote status:", error)
      } finally {
        setCheckingVote(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isReady) {
      toast.error("Oops! Please connect your wallet and wait for program to load.")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    toast.loading("Processing your vote...")

    try {
      const campaignPubkey = new PublicKey(formData.campaignAddress)
      const pollIndex = Number.parseInt(formData.pollIndex)

      const result = await castVote(campaignPubkey, pollIndex)

      toast.success("Success! Your vote has been cast. ✨", {
        description: `Transaction: ${result.signature.slice(0, 8)}...`,
      })

      // Reset form
      setFormData({
        campaignAddress: "",
        pollIndex: "",
      })
      setSelectedCampaignPolls([])
      setAlreadyVoted(false)
    } catch (error) {
      console.error("Error casting vote:", error)
      toast.error("Oops! Something went wrong. Please try again.", {
        description: error instanceof Error ? error.message : "Please check your connection and try again",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-sm border-0">
        <CardHeader className="pb-8">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Vote className="w-6 h-6 text-primary" />
            Cast Your Vote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Select Campaign
              </Label>
              <CampaignSelector
                onCampaignSelect={handleCampaignSelect}
                selectedCampaign={formData.campaignAddress}
              />
              {formData.campaignAddress && (
                <div className="text-xs text-muted-foreground font-mono break-all bg-muted/30 p-2 rounded">
                  Campaign Address: {formData.campaignAddress}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="pollIndex" className="text-base font-medium">
                Poll Option
              </Label>
              <Select
                value={formData.pollIndex}
                onValueChange={(value) => setFormData({ ...formData, pollIndex: value })}
                disabled={!formData.campaignAddress || selectedCampaignPolls.length === 0}
              >
                <SelectTrigger className="text-base">
                  <SelectValue placeholder={
                    !formData.campaignAddress ? "Select a campaign first" :
                    selectedCampaignPolls.length === 0 ? "No poll options available" :
                    "Select which option to vote for"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {selectedCampaignPolls.map((poll, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate max-w-[200px]">{poll.description}</span>
                        <span className="ml-2 text-xs text-muted-foreground">({poll.votes} votes)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {selectedCampaignPolls.length > 0 ?
                  `Choose from ${selectedCampaignPolls.length} available options` :
                  "Poll options will appear after selecting a campaign"
                }
              </p>
            </div>

            <div className="bg-muted/30 border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-5 h-5 text-secondary" />
                <span className="font-medium text-base">Important Information</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Ensure you have the correct campaign address</li>
                <li>• You can only vote once per campaign</li>
                <li>• Voting requires a small transaction fee</li>
                <li>• Your vote is permanent and recorded on the blockchain</li>
              </ul>
            </div>

            {alreadyVoted && (
              <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center gap-3 text-orange-800 dark:text-orange-200">
                  <Info className="w-5 h-5" />
                  <span className="font-medium">Already Voted</span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-2">
                  You have already cast your vote on this campaign. Each wallet can only vote once per campaign.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-6 text-base font-medium"
              disabled={isLoading || alreadyVoted || checkingVote}
            >
              {isLoading ? "Casting Vote..." :
               checkingVote ? "Checking vote status..." :
               alreadyVoted ? "Already Voted" :
               "Cast Vote"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
