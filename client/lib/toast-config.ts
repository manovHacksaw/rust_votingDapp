import { toast } from "sonner"

const successMessages = [
  "yay! ✨ mission accomplished uwu",
  "woohoo! 🎉 you did it!",
  "success! 💖 you're amazing",
  "hooray! 🌟 democracy achieved uwu",
  "fantastic! 🦄 vote sent to the blockchain",
  "uwu! ✨ transaction successful",
  "victory! 🎊 blockchain magic worked",
  "amazing! 💫 your vote counts",
]

const errorMessages = [
  "uh oh spaghetti-o 🍝",
  "oopsie woopsie 😭 something went wrong",
  "you goofed it 😅 but it's okay!",
  "whoopsie daisy 🌼 try again?",
  "oh noes! 😿 blockchain said no",
  "eek! 🙈 that didn't work",
  "bonk! 🔨 error detected",
  "yikes! 😬 something's not right",
]

const loadingMessages = [
  "working hard! 💪 please wait uwu",
  "blockchain magic happening ✨",
  "sending to the void 🌌",
  "cooking up something good 👨‍🍳",
  "talking to the robots 🤖",
  "casting spells ✨ please wait",
  "summoning blockchain spirits 👻",
  "processing your kawaii request 🎀",
]

const infoMessages = [
  "psst! 👀 here's some info",
  "heads up! 📢 important stuff",
  "fyi! 💡 just so you know",
  "btw! 🗨️ quick update",
  "note! 📝 something to remember",
]

export const kawaiToast = {
  success: (message: string, description?: string) => {
    const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)]
    toast.success(message, {
      description: description || randomMessage,
      duration: 4000,
    })
  },

  error: (message: string, description?: string) => {
    const randomMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)]
    toast.error(message, {
      description: description || randomMessage,
      duration: 5000,
    })
  },

  loading: (message: string, description?: string) => {
    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
    return toast.loading(message, {
      description: description || randomMessage,
    })
  },

  info: (message: string, description?: string) => {
    const randomMessage = infoMessages[Math.floor(Math.random() * infoMessages.length)]
    toast.info(message, {
      description: description || randomMessage,
      duration: 3000,
    })
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  },
}
