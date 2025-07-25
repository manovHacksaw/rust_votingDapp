"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Vote, Users, Sparkles, Heart, Star, Zap, Shield, Palette, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useSolanaWallet } from "@/hooks/useWallet"
import { useProgram } from "@/hooks/useProgram"
import { calculateTotalVotes } from "@/lib/utils"

export default function HomePage() {
  const router = useRouter()
  const { connected } = useSolanaWallet()
  const { campaigns, fetchCampaigns } = useProgram()
  const [totalVotes, setTotalVotes] = useState(0)

  useEffect(() => {
    fetchCampaigns().catch(console.error)
  }, [])

  useEffect(() => {
    const total = campaigns.reduce((sum, campaign) => {
      return sum + calculateTotalVotes(campaign.polls)
    }, 0)
    setTotalVotes(total)
  }, [campaigns])

  return (
    <div className="min-h-screen kawaii-container">
      {/* Hero Section with modern CSS features */}
      <section className="relative overflow-hidden py-20 px-4 animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-r from-kawaii-pink-100/50 to-kawaii-lavender-100/50 dark:from-kawaii-pink-900/20 dark:to-kawaii-lavender-900/20 backdrop-blur-sm" />

        {/* Floating Elements with improved animations */}
        <div className="absolute top-20 left-10 animate-float">
          <Heart className="h-8 w-8 text-kawaii-pink-300 drop-shadow-lg" />
        </div>
        <div className="absolute top-32 right-20 animate-float" style={{ animationDelay: "1s" }}>
          <Star className="h-6 w-6 text-kawaii-lavender-300 drop-shadow-lg" />
        </div>
        <div className="absolute bottom-20 left-20 animate-float" style={{ animationDelay: "2s" }}>
          <Sparkles className="h-10 w-10 text-kawaii-mint-300 drop-shadow-lg" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-cute font-bold mb-6 text-balance">
              <span className="gradient-text-kawaii">uwuVote</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto text-pretty kawaii-responsive-text">
              The cutest way to make decisions on Solana! ✨ Create kawaii voting campaigns and let democracy be
              adorable uwu
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 kawaii-button-group">
            <Button onClick={() => router.push("/campaigns")} variant="primary" size="lg">
              <Vote className="mr-2 h-5 w-5" />
              Explore Campaigns
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button onClick={() => router.push("/create-campaign")} variant="secondary" size="lg" disabled={!connected}>
              <Sparkles className="mr-2 h-5 w-5" />
              Create Campaign
            </Button>
          </div>

          {!connected && (
            <Card className="max-w-md mx-auto kawaii-mixed-color">
              <CardContent className="p-6 text-center kawaii-responsive-card">
                <p className="text-kawaii-pink-600 dark:text-kawaii-pink-400 font-medium">
                  💝 Connect your wallet to start creating campaigns!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Stats Section with container queries */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto kawaii-container">
          <h2 className="text-3xl font-cute font-bold text-center mb-12 gradient-text-kawaii-blue text-balance">
            Community Stats ✨
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center group hover:scale-105 transition-transform kawaii-hover-effect">
              <CardContent className="p-8 kawaii-responsive-card">
                <div className="inline-flex p-4 bg-kawaii-pink-100 dark:bg-kawaii-pink-900/30 rounded-full mb-4 group-hover:animate-bounce-cute">
                  <Vote className="h-8 w-8 text-kawaii-pink-500" />
                </div>
                <h3 className="text-3xl font-bold text-kawaii-pink-600 dark:text-kawaii-pink-400 mb-2">
                  {campaigns.length}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Active Campaigns</p>
              </CardContent>
            </Card>

            <Card className="text-center group hover:scale-105 transition-transform kawaii-hover-effect">
              <CardContent className="p-8 kawaii-responsive-card">
                <div className="inline-flex p-4 bg-kawaii-lavender-100 dark:bg-kawaii-lavender-900/30 rounded-full mb-4 group-hover:animate-bounce-cute">
                  <Users className="h-8 w-8 text-kawaii-lavender-500" />
                </div>
                <h3 className="text-3xl font-bold text-kawaii-lavender-600 dark:text-kawaii-lavender-400 mb-2">
                  {totalVotes}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Total Votes Cast</p>
              </CardContent>
            </Card>

            <Card className="text-center group hover:scale-105 transition-transform kawaii-hover-effect">
              <CardContent className="p-8 kawaii-responsive-card">
                <div className="inline-flex p-4 bg-kawaii-mint-100 dark:bg-kawaii-mint-900/30 rounded-full mb-4 group-hover:animate-bounce-cute">
                  <Sparkles className="h-8 w-8 text-kawaii-mint-500" />
                </div>
                <h3 className="text-3xl font-bold text-kawaii-mint-600 dark:text-kawaii-mint-400 mb-2">100%</h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Kawaii Level</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section with improved grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-cute font-bold text-center mb-12 gradient-text-kawaii text-balance">
            Why uwuVote? 💖
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 kawaii-subgrid">
            <Card className="text-center kawaii-hover-effect">
              <CardContent className="p-6 kawaii-responsive-card">
                <div className="inline-flex p-4 bg-kawaii-blue-100 dark:bg-kawaii-blue-900/30 rounded-full mb-4">
                  <Shield className="h-8 w-8 text-kawaii-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-kawaii-blue-600 dark:text-kawaii-blue-400">
                  Decentralized & Secure
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-pretty">
                  Built on Solana blockchain for transparency and immutability uwu
                </p>
              </CardContent>
            </Card>

            <Card className="text-center kawaii-hover-effect">
              <CardContent className="p-6 kawaii-responsive-card">
                <div className="inline-flex p-4 bg-kawaii-mint-100 dark:bg-kawaii-mint-900/30 rounded-full mb-4">
                  <Zap className="h-8 w-8 text-kawaii-mint-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-kawaii-mint-600 dark:text-kawaii-mint-400">
                  Lightning Fast
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-pretty">
                  Solana's speed means your votes are counted instantly!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center kawaii-hover-effect">
              <CardContent className="p-6 kawaii-responsive-card">
                <div className="inline-flex p-4 bg-kawaii-pink-100 dark:bg-kawaii-pink-900/30 rounded-full mb-4">
                  <Palette className="h-8 w-8 text-kawaii-pink-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-kawaii-pink-600 dark:text-kawaii-pink-400">
                  Kawaii Design
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-pretty">
                  Democracy has never been this cute and user-friendly!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center kawaii-hover-effect">
              <CardContent className="p-6 kawaii-responsive-card">
                <div className="inline-flex p-4 bg-kawaii-lavender-100 dark:bg-kawaii-lavender-900/30 rounded-full mb-4">
                  <Moon className="h-8 w-8 text-kawaii-lavender-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-kawaii-lavender-600 dark:text-kawaii-lavender-400">
                  Dark Mode
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-pretty">
                  Vote comfortably in both light and dark themes
                </p>
              </CardContent>
            </Card>

            <Card className="text-center kawaii-hover-effect">
              <CardContent className="p-6 kawaii-responsive-card">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-3 text-kawaii-peach-600 dark:text-kawaii-peach-400">
                  Mobile Friendly
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-pretty">
                  Vote on the go with our responsive design
                </p>
              </CardContent>
            </Card>

            <Card className="text-center kawaii-hover-effect">
              <CardContent className="p-6 kawaii-responsive-card">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold mb-3 text-kawaii-cream-600 dark:text-kawaii-cream-400">
                  Fun Feedback
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-pretty">
                  Whimsical toast messages make every interaction delightful!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section with modern styling */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="kawaii-mixed-color">
            <CardContent className="p-12 kawaii-responsive-card">
              <h2 className="text-3xl font-cute font-bold mb-6 gradient-text-kawaii text-balance">
                Ready to Start Voting? 🗳️✨
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-pretty">
                Join the cutest democracy on Solana and make your voice heard uwu
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center kawaii-button-group">
                <Button onClick={() => router.push("/campaigns")} variant="primary" size="lg">
                  <Vote className="mr-2 h-5 w-5" />
                  Browse Campaigns
                </Button>

                {connected && (
                  <Button onClick={() => router.push("/create-campaign")} variant="secondary" size="lg">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Create Your Own
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
