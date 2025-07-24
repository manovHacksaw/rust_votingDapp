import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatDate(timestamp?: number): string {
  if (!timestamp) return "Unknown date"
  try {
    const date = new Date(timestamp * 1000)
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch {
    return "Unknown date"
  }
}

export function getTimeRemaining(endsAt?: number): string {
  if (!endsAt) return "No deadline"
  const now = Math.floor(Date.now() / 1000)
  const remaining = endsAt - now

  if (remaining <= 0) return "Expired"

  const days = Math.floor(remaining / (24 * 3600))
  const hours = Math.floor((remaining % (24 * 3600)) / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h remaining`
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  return `${minutes}m remaining`
}

export function calculateTotalVotes(polls: { votes: number }[]): number {
  return polls.reduce((sum, poll) => sum + poll.votes, 0)
}

export function getPercentage(votes: number, totalVotes: number): number {
  return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
}

export function isExpired(endsAt?: number): boolean {
  if (!endsAt) return false
  return endsAt < Math.floor(Date.now() / 1000)
}
