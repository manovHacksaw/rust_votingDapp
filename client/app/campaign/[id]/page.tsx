"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Users,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  Trophy,
  Vote,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useProgram } from "@/hooks/useProgram"
import { useSolanaWallet } from "@/hooks/useWallet"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { kawaiToast } from "@/lib/toast-config"
import { formatAddress, formatDate, calculateTotalVotes, getPercentage, isExpired, getTimeRemaining } from "@/lib/utils"

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const {
    program,
    fetchCampaigns,
    campaigns,
    voteForProposal,
    checkIfUserVoted,
    loading: programLoading,
  } = useProgram()
  const { connected } = useSolanaWallet()

  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [voteSuccess, setVoteSuccess] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [campaignLoading, setCampaignLoading] = useState(true)

  const campaign = campaigns.find((c) => c.address === campaignId)

  useEffect(() => {
    if (program && !campaign) {
      setCampaignLoading(true)
      fetchCampaigns()
        .catch((err) => {
          console.error("Failed to fetch campaigns:", err)
          setError("Could not load campaign data uwu")
        })
        .finally(() => {
          setCampaignLoading(false)
        })
    } else if (campaign) {
      setCampaignLoading(false)
    }
  }, [program, fetchCampaigns, campaign])

  useEffect(() => {
    const checkVoteStatus = async () => {
      if (connected && campaign && !hasVoted) {
        try {
          const hasUserVoted = await checkIfUserVoted(campaignId)
          if (hasUserVoted) {
            setHasVoted(true)
            kawaiToast.info("Already voted!", "You have already voted on this campaign uwu")
          }
        } catch (error) {
          console.error("❌ Error checking vote status:", error)
        }
      }
    }

    checkVoteStatus()
  }, [connected, campaign, campaignId, checkIfUserVoted, hasVoted])

  const handleVote = async () => {
    if (!connected) {
      kawaiToast.error("Wallet not connected!", "Please connect your wallet to vote uwu")
      setError("Please connect your wallet to vote")
      return
    }

    if (selectedOption === null) {
      kawaiToast.error("No option selected!", "Please select an option to vote uwu")
      setError("Please select an option to vote")
      return
    }

    if (hasVoted) {
      kawaiToast.error("Already voted!", "You have already voted on this campaign uwu")
      setError("You have already voted on this campaign")
      return
    }

    if (campaign && isExpired(campaign.endsAt)) {
      kawaiToast.error("Campaign expired!", "This campaign has ended uwu")
      setError("This campaign has ended")
      return
    }

    try {
      setError("")
      setLoading(true)

      const alreadyVoted = await checkIfUserVoted(campaignId)
      if (alreadyVoted) {
        setHasVoted(true)
        kawaiToast.error("Already voted!", "You have already voted on this campaign uwu")
        setError("You have already voted on this campaign")
        return
      }

      await voteForProposal(campaignId, selectedOption)

      setHasVoted(true)
      setVoteSuccess(true)

      await fetchCampaigns()
    } catch (err: any) {
      console.error("❌ Voting error:", err)

      let errorMessage = "Failed to cast vote. Please try again uwu"

      if (err?.message) {
        if (err.message.includes("already voted") || err.message.includes("AlreadyVoted")) {
          errorMessage = "You have already voted on this campaign uwu"
          setHasVoted(true)
        } else if (err.message.includes("insufficient funds")) {
          errorMessage = "Insufficient SOL to pay for transaction fees"
        } else if (err.message.includes("User rejected")) {
          errorMessage = "Transaction was cancelled"
        } else if (err.message.includes("CampaignExpired")) {
          errorMessage = "This campaign has ended"
        } else {
          errorMessage = `Transaction failed: ${err.message}`
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (campaignLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="kawaii-spinner h-12 w-12 mx-auto mb-4"></div>
            <h3 className="text-xl font-cute font-medium text-gray-900 dark:text-gray-100 mb-2">Loading Campaign...</h3>
            <p className="text-gray-600 dark:text-gray-400">Fetching data from the blockchain uwu ✨</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-kawaii-pink-400 mx-auto mb-4" />
            <h3 className="text-xl font-cute font-medium text-gray-900 dark:text-gray-100 mb-2">Campaign Not Found 😢</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The campaign you're looking for doesn't exist or has been removed uwu
            </p>
            <Button onClick={() => router.push("/campaigns")} variant="primary">
              View All Campaigns
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalVotes = calculateTotalVotes(campaign.polls)
  const maxVotes = Math.max(...campaign.polls.map((poll) => poll.votes))
  const expired = isExpired(campaign.endsAt)
  const timeRemaining = getTimeRemaining(campaign.endsAt)

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-0">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/campaigns")}
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Campaigns
      </Button>

      {/* Success Message */}
      {voteSuccess && (
        <Card className="border-kawaii-mint-200 bg-kawaii-mint-50 dark:bg-kawaii-mint-900/20 dark:border-kawaii-mint-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-kawaii-mint-600 dark:text-kawaii-mint-400 flex-shrink-0" />
              <div>
                <h3 className="text-kawaii-mint-800 dark:text-kawaii-mint-200 font-semibold">
                  Vote Cast Successfully! ✨
                </h3>
                <p className="text-kawaii-mint-600 dark:text-kawaii-mint-400">
                  Your vote has been recorded on the blockchain uwu
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign Header */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl md:text-4xl font-cute font-bold text-gray-900 dark:text-gray-100">
                  {campaign.description}
                </h1>
                {expired && (
                  <Badge variant="error">
                    Expired
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Created by {formatAddress(campaign.creator)}</span>
                </div>
                {campaign.createdAt && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>{formatDate(campaign.createdAt)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>{totalVotes} votes cast</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span className={expired ? "text-kawaii-pink-500" : "text-kawaii-mint-500"}>{timeRemaining}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-kawaii-lavender-500 to-kawaii-lavender-600 rounded-kawaii p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-kawaii-lavender-100 text-sm">Total Votes</p>
                    <p className="text-2xl font-bold">{totalVotes}</p>
                  </div>
                  <Users className="h-6 w-6 text-kawaii-lavender-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-kawaii-blue-500 to-kawaii-blue-600 rounded-kawaii p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-kawaii-blue-100 text-sm">Options</p>
                    <p className="text-2xl font-bold">{campaign.polls.length}</p>
                  </div>
                  <Vote className="h-6 w-6 text-kawaii-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-kawaii-mint-500 to-kawaii-mint-600 rounded-kawaii p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-kawaii-mint-100 text-sm">Status</p>
                    <p className="text-2xl font-bold">{expired ? "Ended" : "Active"}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-kawaii-mint-200" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Voting Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-cute font-bold text-gray-900 dark:text-gray-100 mb-6">Cast Your Vote ✨</h2>

              {!connected && (
                <Card className="mb-6 border-kawaii-peach-200 bg-kawaii-peach-50 dark:bg-kawaii-peach-900/20 dark:border-kawaii-peach-800">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-kawaii-peach-600 dark:text-kawaii-peach-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-kawaii-peach-800 dark:text-kawaii-peach-200 font-medium">Wallet Required 💝</p>
                        <p className="text-kawaii-peach-600 dark:text-kawaii-peach-400 text-sm">
                          Connect your wallet to participate in voting uwu
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {expired && (
                <Card className="mb-6 border-kawaii-pink-200 bg-kawaii-pink-50 dark:bg-kawaii-pink-900/20 dark:border-kawaii-pink-800">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-kawaii-pink-600 dark:text-kawaii-pink-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-kawaii-pink-800 dark:text-kawaii-pink-200 font-medium">Campaign Ended 😢</p>
                        <p className="text-kawaii-pink-600 dark:text-kawaii-pink-400 text-sm">
                          This voting campaign has expired and no longer accepts votes
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {campaign.polls.map((poll, index) => {
                  const percentage = getPercentage(poll.votes, totalVotes)
                  const isWinning = poll.votes === maxVotes && poll.votes > 0

                  return (
                    <div
                      key={index}
                      className={`relative p-4 border-2 rounded-kawaii cursor-pointer transition-all ${
                        selectedOption === index
                          ? "border-kawaii-lavender-500 bg-kawaii-lavender-50 dark:bg-kawaii-lavender-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50"
                      } ${!connected || hasVoted || expired ? "cursor-not-allowed opacity-60" : ""}`}
                      onClick={() => {
                        if (connected && !hasVoted && !expired) {
                          setSelectedOption(index)
                          setError("")
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                              selectedOption === index
                                ? "border-kawaii-lavender-500 bg-kawaii-lavender-500"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {selectedOption === index && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{poll.description}</span>
                          {isWinning && (
                            <Badge variant="success">
                              <Trophy className="h-3 w-3 mr-1" />
                              Leading
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {poll.votes} votes ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="mt-2" />
                    </div>
                  )
                })}
              </div>

              {error && (
                <Card className="mt-4 border-kawaii-pink-200 bg-kawaii-pink-50 dark:bg-kawaii-pink-900/20 dark:border-kawaii-pink-800">
                  <CardContent className="p-4">
                    <p className="text-kawaii-pink-600 dark:text-kawaii-pink-400">{error}</p>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={handleVote}
                loading={loading || programLoading}
                disabled={!connected || hasVoted || selectedOption === null || expired}
                variant="primary"
                size="lg"
                className="w-full mt-6"
              >
                {hasVoted ? (
                  "Vote Cast ✨"
                ) : expired ? (
                  "Campaign Ended"
                ) : (
                  "Cast Vote 🗳️"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-cute font-bold text-gray-900 dark:text-gray-100 mb-4">Live Results 📊</h3>

              {totalVotes === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No votes yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to vote! ✨</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaign.polls
                    .map((poll, index) => ({ ...poll, index }))
                    .sort((a, b) => b.votes - a.votes)
                    .map((poll, rank) => {
                      const percentage = getPercentage(poll.votes, totalVotes)
                      const isWinning = rank === 0 && poll.votes > 0

                      return (
                        <div key={poll.index} className="flex items-center justify-between gap-4">
                          <div className="flex-grow">
                            <div className="flex items-center space-x-2">
                              {isWinning && <Trophy className="h-4 w-4 text-kawaii-gold-500 flex-shrink-0" />}
                              <p className="font-medium text-gray-800 dark:text-gray-200">{poll.description}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-gray-900 dark:text-gray-100">{poll.votes}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}