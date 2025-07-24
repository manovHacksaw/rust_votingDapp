"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, X, Check, AlertCircle, Calendar, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { PublicKey } from "@solana/web3.js"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useProgram } from "@/hooks/useProgram"
import { useSolanaWallet } from "@/hooks/useWallet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { kawaiToast } from "@/lib/toast-config"

export default function CreateCampaignPage() {
  const router = useRouter()
  const { createCampaign, loading, program, wallet } = useProgram()
  const { connected } = useSolanaWallet()

  const [description, setDescription] = useState("")
  const [proposals, setProposals] = useState(["", ""])
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [success, setSuccess] = useState(false)

  const MIN_CAMPAIGN_DURATION_SECS = 60 * 60 // 1 hour
  const MAX_CAMPAIGN_DURATION_SECS = 60 * 60 * 24 * 365 // 1 year

  useEffect(() => {
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + MIN_CAMPAIGN_DURATION_SECS * 1000)
    setEndDate(oneHourLater)
  }, [])

  const addProposal = () => {
    if (proposals.length < 10) {
      setProposals([...proposals, ""])
    } else {
      kawaiToast.error("Too many options!", "Maximum 10 options allowed uwu")
    }
  }

  const removeProposal = (index: number) => {
    if (proposals.length > 2) {
      const newProposals = proposals.filter((_, i) => i !== index)
      setProposals(newProposals)
    } else {
      kawaiToast.error("Need at least 2 options!", "Democracy needs choices uwu")
    }
  }

  const updateProposal = (index: number, value: string) => {
    const newProposals = [...proposals]
    newProposals[index] = value
    setProposals(newProposals)

    if (errors[`proposal-${index}`]) {
      const newErrors = { ...errors }
      delete newErrors[`proposal-${index}`]
      setErrors(newErrors)
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    const now = new Date()

    if (!description.trim()) {
      newErrors.description = "Campaign description is required uwu"
    } else if (description.length > 100) {
      newErrors.description = "Description must be 100 characters or less"
    }

    const nonEmptyProposals = proposals.filter((p) => p.trim())
    if (nonEmptyProposals.length < 2) {
      newErrors.proposals = "At least 2 proposal options are required"
    }

    proposals.forEach((proposal, index) => {
      if (proposal.trim() && proposal.length > 80) {
        newErrors[`proposal-${index}`] = "Proposal must be 80 characters or less"
      }
    })

    const trimmedProposals = proposals.map((p) => p.trim()).filter((p) => p)
    const uniqueProposals = new Set(trimmedProposals)
    if (uniqueProposals.size !== trimmedProposals.length) {
      newErrors.proposals = "Proposals must be unique"
    }

    if (!endDate) {
      newErrors.endDate = "Campaign end time is required"
    } else {
      const durationInSeconds = Math.floor((endDate.getTime() - now.getTime()) / 1000)

      if (endDate <= now) {
        newErrors.endDate = "End time must be in the future"
      } else if (durationInSeconds < MIN_CAMPAIGN_DURATION_SECS) {
        newErrors.endDate = `Duration must be at least ${MIN_CAMPAIGN_DURATION_SECS / 3600} hour(s)`
      } else if (durationInSeconds > MAX_CAMPAIGN_DURATION_SECS) {
        newErrors.endDate = `Duration cannot exceed ${MAX_CAMPAIGN_DURATION_SECS / (3600 * 24 * 365)} year(s)`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!connected) {
      kawaiToast.error("Wallet not connected!", "Please connect your wallet first uwu")
      setErrors({ wallet: "Please connect your wallet first" })
      return
    }

    if (!validateForm()) {
      kawaiToast.error("Form validation failed!", "Please fix the errors below")
      return
    }

    try {
      const trimmedDescription = description.trim()
      const pollDescriptions = proposals.filter((p) => p.trim())
      const now = new Date()
      const durationInSeconds = Math.floor((endDate!.getTime() - now.getTime()) / 1000)

      await createCampaign(trimmedDescription, pollDescriptions, durationInSeconds)

      if (program && wallet) {
        const [campaignPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("campaign"), wallet.publicKey.toBuffer(), Buffer.from(trimmedDescription)],
          program.programId,
        )

        setSuccess(true)
        setTimeout(() => {
          router.push(`/campaign/${campaignPda.toBase58()}`)
        }, 2000)
      }
    } catch (error: any) {
      console.error("Error creating campaign:", error)
      let errorMessage = "Failed to create campaign. Please try again uwu"

      if (error.logs) {
        const customErrorLog = error.logs.find((log: string) => log.includes("CustomError"))
        if (customErrorLog) {
          const match = customErrorLog.match(/CustomError:\s*(.*)/)
          if (match && match[1]) {
            errorMessage = match[1].trim()
          }
        }
      }

      setErrors({ submit: errorMessage })
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center max-w-md animate-bounce-cute">
            <div className="inline-flex p-6 bg-kawaii-mint-100 dark:bg-kawaii-mint-900/30 rounded-full mb-6">
              <Check className="h-12 w-12 text-kawaii-mint-600" />
            </div>
            <h2 className="text-2xl font-cute font-bold text-kawaii-mint-600 dark:text-kawaii-mint-400 mb-4">
              Campaign Created! ✨
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Your kawaii voting campaign has been successfully created and deployed to the blockchain uwu
            </p>
            <p className="text-sm text-kawaii-mint-500 dark:text-kawaii-mint-400">Redirecting to campaign page... 🚀</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-cute font-bold bg-gradient-to-r from-kawaii-pink-600 to-kawaii-lavender-600 bg-clip-text text-transparent">
          Create Campaign ✨
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Set up a new kawaii decentralized voting campaign on Solana uwu
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-center">
        <Button variant="ghost" onClick={() => router.push("/campaigns")}>
          ← Back to Campaigns
        </Button>
      </div>

      {/* Wallet Connection Warning */}
      {!connected && (
        <Card className="border-kawaii-peach-200 bg-kawaii-peach-50 dark:bg-kawaii-peach-900/20 dark:border-kawaii-peach-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-kawaii-peach-600 dark:text-kawaii-peach-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-kawaii-peach-800 dark:text-kawaii-peach-200 font-medium">Wallet Required 💝</p>
                <p className="text-kawaii-peach-600 dark:text-kawaii-peach-400 text-sm">
                  Please connect your wallet to create a campaign uwu
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Description */}
        <Card>
          <CardContent className="p-6">
            <label htmlFor="description" className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Campaign Description ✨
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) {
                  const newErrors = { ...errors }
                  delete newErrors.description
                  setErrors(newErrors)
                }
              }}
              error={!!errors.description}
              rows={3}
              placeholder="What are you voting on? (e.g., 'Choose the best blockchain for DeFi') uwu"
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-2">
              {errors.description && (
                <p className="text-kawaii-pink-600 dark:text-kawaii-pink-400 text-sm">{errors.description}</p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">{description.length}/100 characters</p>
            </div>
          </CardContent>
        </Card>

        {/* Proposals */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <label className="text-lg font-semibold text-gray-900 dark:text-gray-100">Voting Options 🗳️</label>
              <Button type="button" onClick={addProposal} variant="ghost" size="sm" disabled={proposals.length >= 10}>
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>

            <div className="space-y-3">
              {proposals.map((proposal, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Input
                    type="text"
                    value={proposal}
                    onChange={(e) => updateProposal(index, e.target.value)}
                    error={!!errors[`proposal-${index}`]}
                    placeholder={`Option ${index + 1} uwu`}
                    maxLength={80}
                  />
                  {proposals.length > 2 && (
                    <Button
                      type="button"
                      onClick={() => removeProposal(index)}
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 p-2"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.proposals && (
                <p className="text-kawaii-pink-600 dark:text-kawaii-pink-400 text-sm">{errors.proposals}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* End Date Picker */}
        <Card>
          <CardContent className="p-6">
            <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Voting Deadline ⏰
            </label>
            <div className="flex items-center space-x-3">
              <Calendar className="text-kawaii-lavender-500 flex-shrink-0" />
              <DatePicker
                selected={endDate}
                onChange={(date: Date) => {
                  setEndDate(date)
                  if (errors.endDate) {
                    const newErrors = { ...errors }
                    delete newErrors.endDate
                    setErrors(newErrors)
                  }
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className={`kawaii-input w-full ${errors.endDate ? "kawaii-input-error" : ""}`}
                placeholderText="Select voting deadline uwu"
                minDate={new Date(new Date().getTime() + 60 * 60 * 1000)}
              />
            </div>
            {errors.endDate && (
              <p className="text-kawaii-pink-600 dark:text-kawaii-pink-400 text-sm mt-2">{errors.endDate}</p>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" loading={loading} disabled={!connected} variant="primary" size="lg">
            <Sparkles className="h-5 w-5 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Submission Error */}
        {errors.submit && (
          <Card className="border-kawaii-pink-200 bg-kawaii-pink-50 dark:bg-kawaii-pink-900/20 dark:border-kawaii-pink-800">
            <CardContent className="p-4">
              <p className="text-kawaii-pink-700 dark:text-kawaii-pink-300">{errors.submit}</p>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}
