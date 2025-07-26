"use client"

import type React from "react"

import { useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, FileText } from "lucide-react"
import { toast } from "sonner"
import { createCampaign } from "@/lib/solana-utils"

export function CreateCampaignForm() {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    pollDescriptions: ["", ""],
    durationHours: 24,
  })

  const addPollOption = () => {
    if (formData.pollDescriptions.length < 10) {
      setFormData({
        ...formData,
        pollDescriptions: [...formData.pollDescriptions, ""],
      })
    } else {
      toast.error("Oops! Maximum 10 poll options allowed.")
    }
  }

  const removePollOption = (index: number) => {
    if (formData.pollDescriptions.length > 2) {
      const newPollDescriptions = formData.pollDescriptions.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        pollDescriptions: newPollDescriptions,
      })
    } else {
      toast.error("Oops! Minimum 2 poll options required.")
    }
  }

  const updatePollDescription = (index: number, value: string) => {
    const newPollDescriptions = [...formData.pollDescriptions]
    newPollDescriptions[index] = value
    setFormData({
      ...formData,
      pollDescriptions: newPollDescriptions,
    })
  }

  const validateForm = () => {
    if (!formData.description.trim()) {
      toast.error("Oops! Campaign description is required.")
      return false
    }

    if (formData.pollDescriptions.some((desc) => !desc.trim())) {
      toast.error("Oops! All poll options must have descriptions.")
      return false
    }

    if (formData.durationHours < 1) {
      toast.error("Oops! Campaign must last at least 1 hour.")
      return false
    }

    if (formData.durationHours > 8760) {
      toast.error("Oops! Campaign duration cannot exceed 1 year.")
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
    toast.loading("Processing your campaign...")

    try {
      const durationInSeconds = formData.durationHours * 3600

      await createCampaign(
        connection,
        publicKey,
        signTransaction,
        formData.description,
        formData.pollDescriptions.filter((desc) => desc.trim()),
        durationInSeconds,
      )

      toast.success("Success! Your campaign has been created. ✨", {
        description: "Your voting campaign is now live",
      })

      // Reset form
      setFormData({
        description: "",
        pollDescriptions: ["", ""],
        durationHours: 24,
      })
    } catch (error) {
      console.error("Error creating campaign:", error)
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
            <FileText className="w-6 h-6 text-primary" />
            Create New Campaign
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="description" className="text-base font-medium">
                Campaign Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what you're voting on..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[140px] text-base"
                required
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Poll Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPollOption}
                  disabled={formData.pollDescriptions.length >= 10}
                  className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-4">
                {formData.pollDescriptions.map((description, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={description}
                      onChange={(e) => updatePollDescription(index, e.target.value)}
                      className="text-base"
                      required
                    />
                    {formData.pollDescriptions.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removePollOption(index)}
                        className="shrink-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="duration" className="text-base font-medium">
                Duration (hours)
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="8760"
                value={formData.durationHours}
                onChange={(e) => setFormData({ ...formData, durationHours: Number.parseInt(e.target.value) || 1 })}
                className="text-base"
                required
              />
              <p className="text-sm text-muted-foreground">How long should voting remain open? (1 hour to 1 year)</p>
            </div>

            <Button type="submit" className="w-full py-6 text-base font-medium" disabled={isLoading}>
              {isLoading ? "Creating Campaign..." : "Create Campaign"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
