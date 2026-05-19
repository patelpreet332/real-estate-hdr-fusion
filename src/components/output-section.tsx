"use client"

import React from "react"
import { Download, Copy, Share2, Check, Loader2, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useImageStore } from "@/store/use-image-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export function OutputSection() {
  const { resultImage, isGenerating } = useImageStore()
  const [copied, setCopied] = React.useState(false)
  const [isDownloading, setIsDownloading] = React.useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isPreviewOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPreviewOpen(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isPreviewOpen])

  const handleCopy = () => {
    if (resultImage) {
      navigator.clipboard.writeText(resultImage)
      setCopied(true)
      toast.success("Link copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = async () => {
    if (resultImage) {
      try {
        setIsDownloading(true)
        toast.info("Preparing download...")
        const response = await fetch(resultImage)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement("a")
        link.href = url
        link.download = "ai-generated-image.jpg"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast.success("Download started")
      } catch (error) {
        console.error("Download failed:", error)
        toast.error("Failed to download image. Try right-clicking and 'Save Image As'")
      } finally {
        setIsDownloading(false)
      }
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center space-y-6 py-20"
          >
            <div className="relative h-32 w-32">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
              <div className="absolute inset-0 rounded-full border-t-4 border-purple-500 animate-spin" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold">Dreaming up your result...</h3>
              <p className="text-muted-foreground mt-2">This usually takes about 15-30 seconds</p>
            </div>
          </motion.div>
        ) : resultImage ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Generated Result</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleCopy} className="rounded-xl border-white/10 bg-white/5">
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl border-white/10 bg-white/5">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleDownload} 
                  disabled={isDownloading}
                  className="gap-2 rounded-xl bg-white text-black hover:bg-white/90 min-w-[120px]"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>{isDownloading ? "Saving..." : "Download"}</span>
                </Button>
              </div>
            </div>

            <Card className="group relative overflow-hidden rounded-[3rem] border-white/10 bg-white/5 p-4 shadow-2xl transition-all duration-500 hover:shadow-purple-500/10">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[2.5rem]">
                <img
                  src={resultImage}
                  alt="AI Result"
                  className="h-full w-full cursor-zoom-in object-cover transition-transform duration-1000 group-hover:scale-105"
                  onClick={() => setIsPreviewOpen(true)}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              
              <div className="absolute -top-24 -right-24 h-48 w-48 bg-purple-600/20 blur-[80px]" />
              <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-blue-600/20 blur-[80px]" />
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/[0.02] py-32 text-center"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5">
              <Sparkles className="h-10 w-10 text-white/20" />
            </div>
            <h3 className="text-xl font-medium text-white/40">Your synthesized result will appear here</h3>
            <p className="mt-2 max-w-sm text-sm text-white/20">
              Upload photos from different perspectives above and let AI merge them into one perfect shot.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPreviewOpen && resultImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full bg-black/70 p-0 text-white hover:bg-black"
              >
                <span className="text-lg leading-none">x</span>
              </Button>
              <img
                src={resultImage}
                alt="AI Result Full Preview"
                className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
