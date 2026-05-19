import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-center text-white">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 text-white/20">
        <Sparkles className="h-10 w-10" />
      </div>
      <h1 className="mb-2 text-4xl font-bold">404</h1>
      <h2 className="mb-4 text-xl font-medium">Page Not Found</h2>
      <p className="mb-8 max-w-sm text-muted-foreground">
        The page you are looking for doesn&apos;t exist or has been moved to another dimension.
      </p>
      <Link href="/">
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
          Back to Studio
        </Button>
      </Link>
    </div>
  )
}
