"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RotateCcw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-center text-white">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h1 className="mb-2 text-3xl font-bold">Something went wrong</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        We encountered an unexpected error while processing your request. 
        This might be due to a temporary connection issue.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="gap-2 bg-white text-black hover:bg-white/90"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-white/10"
        >
          Refresh Page
        </Button>
      </div>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-12 max-w-2xl overflow-auto rounded-xl bg-white/5 p-4 text-left text-xs text-red-400">
          {error.message}
        </pre>
      )}
    </div>
  )
}
