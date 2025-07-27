"use client"

import type React from "react"

import { useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Vote, Info } from "lucide-react"
import { toast } from "sonner"
import { castVote } from "@/lib/solana-utils"

export function CastVoteForm() {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    campaignAddress: "",
    pollIndex: "",
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!publicKey || !signTransaction) {
      toast.error("Oops! Please connect your wallet.")
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

      await castVote(connection, publicKey, signTransaction, campaignPubkey, pollIndex)

      toast.success("Success! Your vote has been cast. ✨", {
        description: "Your vote is now recorded on the blockchain",
      })

      // Reset form
      setFormData({
        campaignAddress: "",
        pollIndex: "",
      })
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
              <Label htmlFor="campaignAddress" className="text-base font-medium">
                Campaign Address
              </Label>
              <Input
                id="campaignAddress"
                placeholder="Enter the campaign's public key address"
                value={formData.campaignAddress}
                onChange={(e) => setFormData({ ...formData, campaignAddress: e.target.value })}
                className="font-mono text-sm"
                required
              />
              <p className="text-sm text-muted-foreground">The Solana address of the campaign you want to vote on</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="pollIndex" className="text-base font-medium">
                Poll Option
              </Label>
              <Select
                value={formData.pollIndex}
                onValueChange={(value) => setFormData({ ...formData, pollIndex: value })}
              >
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Select which option to vote for" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      Option {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Choose which poll option you want to vote for (0-9)</p>
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

            <Button type="submit" className="w-full py-6 text-base font-medium" disabled={isLoading}>
              {isLoading ? "Casting Vote..." : "Cast Vote"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
