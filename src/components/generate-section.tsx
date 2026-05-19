"use client"

import React from "react"
import { Wand2, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useImageStore } from "@/store/use-image-store"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { synthesizeImages } from "@/lib/gemini"
import { generateOpenAIImage } from "@/lib/openai"
import { generateFluxImageAction } from "@/app/actions/flux"

export function GenerateSection({ variant = "default" }: { variant?: "default" | "toolbar" | "vertical" }) {
  const { images, isGenerating, selectedAgent, setGenerating, setResult } = useImageStore()

  const handleGenerate = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image")
      return
    }

    setGenerating(true)
    
    try {
      toast.info(`Step 1: ${selectedAgent} is analyzing your shots...`)
      
      const isOpenAI = selectedAgent === "gpt image-5"
      let synthesisResult;
      if (!isOpenAI) {
        synthesisResult = await synthesizeImages(images)
      }
      
      if (!isOpenAI && !synthesisResult.success) {
        toast.error(synthesisResult.error || "Failed to generate synthesis prompt")
        setGenerating(false)
        return
      }

      
      const generationResult = isOpenAI 
        ? await generateOpenAIImage(images)
        : await generateFluxImageAction(synthesisResult.prompt!)
      
      if (!generationResult.success) {
        toast.error(generationResult.error || "Synthesis failed")
        setGenerating(false)
        return
      }

      setResult(generationResult.url!)
      toast.success("Masterpiece successfully synthesized!")
    } catch (error) {
      console.error("Workflow failed:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  if (variant === "toolbar") {
    return (
      <Button
        onClick={handleGenerate}
        disabled={images.length === 0 || isGenerating}
        className={`h-9 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
          images.length > 0 
            ? "bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20" 
            : "bg-white/5 opacity-50"
        }`}
      >
        {isGenerating ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            <span>Generate Image</span>
          </div>
        )}
      </Button>
    )
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-center px-4">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full max-w-md"
      >
        <Button
          onClick={handleGenerate}
          disabled={images.length === 0 || isGenerating}
          className={`h-16 w-full rounded-2xl text-xl font-bold transition-all duration-500 ${
            images.length > 0 
              ? "bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]" 
              : "bg-white/5 opacity-50"
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Generating Magic...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Wand2 className="h-6 w-6" />
              <span>Generate Image</span>
            </div>
          )}
        </Button>
      </motion.div>
      
      {images.length > 0 && !isGenerating && (
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">
          Ready to merge {images.length} angles
        </p>
      )}
    </div>
  )
}
