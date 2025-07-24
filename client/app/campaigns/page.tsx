"use client"

import { useEffect, useState } from "react"
import { Search, Users, Vote, ArrowRight, Plus, Clock, Trophy, Loader2, ServerCrash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useProgram } from "@/hooks/useProgram"
import type { CampaignData } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { calculateTotalVotes, formatAddress, getTimeRemaining, isExpired } from "@/lib/utils"

export default function CampaignsPage() {
  const router = useRouter()
  const { program, fetchCampaigns, campaigns } = useProgram()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (program) {
      setLoading(true)
      fetchCampaigns()
        .then(() => {
          setError(null)
        })
        .catch((err) => {
          console.error("Failed to fetch campaigns:", err)
          setError("Could not load campaigns. Please check your connection uwu")
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [program])

  const filteredCampaigns = campaigns
    .map((campaign) => ({
      ...campaign,
      totalVotes: calculateTotalVotes(campaign.polls),
    }))
    .filter(
      (campaign) =>
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.polls.some((poll) => poll.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => b.totalVotes - a.totalVotes)

  const getLeadingOption = (campaign: CampaignData & { totalVotes: number }) => {
    if (campaign.polls.length === 0) return { description: "N/A", votes: 0 }
    return campaign.polls.reduce((max, poll) => (poll.votes > max.votes ? poll : max))
  }

  const totalVotesAllCampaigns = campaigns.reduce((sum, c) => sum + calculateTotalVotes(c.polls), 0)
  const activeCampaigns = campaigns.filter((c) => !isExpired(c.endsAt)).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-kawaii-lavender-500 mx-auto mb-4" />
            <h3 className="text-xl font-cute font-medium text-gray-900 dark:text-gray-100 mb-2">
              Loading Campaigns...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Fetching data from the blockchain uwu ✨</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center max-w-md">
            <ServerCrash className="h-12 w-12 text-kawaii-pink-500 mx-auto mb-4" />
            <h3 className="text-xl font-cute font-medium text-kawaii-pink-600 dark:text-kawaii-pink-400 mb-2">
              Oopsie! Something went wrong 😭
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Button
              onClick={() => {
                setError(null)
                setLoading(true)
                fetchCampaigns()
                  .then(() => setError(null))
                  .catch((err) => {
                    console.error("Failed to fetch campaigns:", err)
                    setError("Could not load campaigns. Please check your connection uwu")
                  })
                  .finally(() => setLoading(false))
              }}
              variant="primary"
            >
              Try Again 🔄
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-cute font-bold bg-gradient-to-r from-kawaii-pink-600 to-kawaii-lavender-600 bg-clip-text text-transparent">
          Voting Campaigns ✨
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover and participate in the cutest decentralized voting campaigns on Solana uwu
        </p>
      </div>

      {/* Search and Create */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kawaii-pink-400" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search campaigns by title or option... 🔍"
                className="pl-10"
              />
            </div>
            <Button onClick={() => router.push("/create-campaign")} variant="primary">
              <Plus className="h-5 w-5 mr-2" />
              Create Campaign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center group hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="inline-flex p-4 bg-kawaii-lavender-100 dark:bg-kawaii-lavender-900/30 rounded-full mb-4 group-hover:animate-bounce-cute">
              <Vote className="h-6 w-6 text-kawaii-lavender-500" />
            </div>
            <p className="text-2xl font-bold text-kawaii-lavender-600 dark:text-kawaii-lavender-400 mb-1">
              {campaigns.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Campaigns</p>
          </CardContent>
        </Card>

        <Card className="text-center group hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="inline-flex p-4 bg-kawaii-blue-100 dark:bg-kawaii-blue-900/30 rounded-full mb-4 group-hover:animate-bounce-cute">
              <Users className="h-6 w-6 text-kawaii-blue-500" />
            </div>
            <p className="text-2xl font-bold text-kawaii-blue-600 dark:text-kawaii-blue-400 mb-1">
              {totalVotesAllCampaigns}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Votes Cast</p>
          </CardContent>
        </Card>

        <Card className="text-center group hover:scale-105 transition-transform">
          <CardContent className="p-6">
            <div className="inline-flex p-4 bg-kawaii-mint-100 dark:bg-kawaii-mint-900/30 rounded-full mb-4 group-hover:animate-bounce-cute">
              <Clock className="h-6 w-6 text-kawaii-mint-500" />
            </div>
            <p className="text-2xl font-bold text-kawaii-mint-600 dark:text-kawaii-mint-400 mb-1">{activeCampaigns}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active Campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <Card>
            <CardContent className="p-12 max-w-md mx-auto">
              <Vote className="h-16 w-16 text-kawaii-pink-300 mx-auto mb-4" />
              <h3 className="text-xl font-cute font-medium text-gray-900 dark:text-gray-100 mb-2">
                No campaigns found 😢
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm ? "Try adjusting your search terms uwu" : "Be the first to create a kawaii campaign!"}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push("/create-campaign")} variant="primary">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Campaign
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCampaigns.map((campaign) => {
            const leadingOption = getLeadingOption(campaign)
            const leadingPercentage =
              campaign.totalVotes > 0 ? Math.round((leadingOption.votes / campaign.totalVotes) * 100) : 0
            const expired = isExpired(campaign.endsAt)
            const timeRemaining = getTimeRemaining(campaign.endsAt)

            return (
              <Card
                key={campaign.address}
                className="group hover:scale-105 hover:shadow-kawaii-hover transition-all cursor-pointer"
                onClick={() => router.push(`/campaign/${campaign.address}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-kawaii-lavender-600 dark:group-hover:text-kawaii-lavender-400 transition-colors">
                          {campaign.description}
                        </h3>
                        {expired && <Badge variant="error">Expired</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        By {formatAddress(campaign.creator)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeRemaining}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-kawaii-lavender-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-kawaii-lavender-50 dark:bg-kawaii-lavender-900/20 rounded-kawaii p-3">
                      <p className="text-sm text-kawaii-lavender-600 dark:text-kawaii-lavender-400 font-medium">
                        Total Votes
                      </p>
                      <p className="text-2xl font-bold text-kawaii-lavender-700 dark:text-kawaii-lavender-300">
                        {campaign.totalVotes}
                      </p>
                    </div>
                    <div className="bg-kawaii-blue-50 dark:bg-kawaii-blue-900/20 rounded-kawaii p-3">
                      <p className="text-sm text-kawaii-blue-600 dark:text-kawaii-blue-400 font-medium">Options</p>
                      <p className="text-2xl font-bold text-kawaii-blue-700 dark:text-kawaii-blue-300">
                        {campaign.polls.length}
                      </p>
                    </div>
                  </div>

                  {campaign.totalVotes > 0 ? (
                    <div className="bg-gradient-to-r from-kawaii-mint-50 to-kawaii-mint-100 dark:from-kawaii-mint-900/20 dark:to-kawaii-mint-800/20 rounded-kawaii p-4 border border-kawaii-mint-200 dark:border-kawaii-mint-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-kawaii-mint-600 dark:text-kawaii-mint-400" />
                          <p className="text-sm font-medium text-kawaii-mint-700 dark:text-kawaii-mint-300">
                            Leading Option
                          </p>
                        </div>
                        <span className="text-sm font-bold text-kawaii-mint-800 dark:text-kawaii-mint-200">
                          {leadingPercentage}%
                        </span>
                      </div>
                      <p
                        className="text-kawaii-mint-900 dark:text-kawaii-mint-100 font-medium truncate mb-2"
                        title={leadingOption.description}
                      >
                        {leadingOption.description}
                      </p>
                      <div className="w-full bg-kawaii-mint-200 dark:bg-kawaii-mint-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-kawaii-mint-500 to-kawaii-mint-600 h-2 rounded-full transition-all"
                          style={{ width: `${leadingPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-kawaii p-4 border border-gray-200 dark:border-gray-700 text-center">
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        No votes yet - be the first to vote! 🗳️✨
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
