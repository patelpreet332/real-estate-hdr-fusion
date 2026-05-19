"use client"
 
import React, { useCallback, useState } from "react"
import { Upload, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useImageStore } from "@/store/use-image-store"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
 
export function UploadZone({ variant = "default" }: { variant?: "default" | "minimal" | "minimal-button" | "grid-only" | "drop-only" }) {
  const { addImages, images, removeImage } = useImageStore()
  const [isDragging, setIsDragging] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
 
  React.useEffect(() => {
    if (!previewImage) return
 
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewImage(null)
      }
    }
 
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [previewImage])
 
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 10MB)`)
        return false
      }
      return file.type.startsWith('image/')
    })
 
    if (validFiles.length > 0) {
      addImages(validFiles)
      toast.success(`${validFiles.length} images added`)
    }
  }, [addImages])
 
  return (
    <div className="w-full">
      {variant === "minimal-button" && (
        <div className="relative">
          <input
            type="file"
            multiple
            className="absolute inset-0 z-10 h-full w-full opacity-0 cursor-pointer"
            onChange={(e) => e.target.files && onDrop(Array.from(e.target.files))}
            accept="image/*"
          />
          <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-10 rounded-lg">
            Upload images
          </Button>
        </div>
      )}

      {(variant === "default" || variant === "minimal" || variant === "drop-only") && (
        <div
          className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
            variant === "minimal" ? "h-12 w-12 flex items-center justify-center p-0" : 
            variant === "drop-only" ? "w-full py-16 px-10 bg-white/[0.02]" : "w-full py-8 px-6"
          } ${
            isDragging ? "border-purple-500 bg-purple-500/5" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
          }`}
          onDragOver={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDrop={() => setIsDragging(false)}
        >
          <input
            type="file"
            multiple
            className="absolute inset-0 z-10 h-full w-full opacity-0 cursor-pointer"
            onChange={(e) => e.target.files && onDrop(Array.from(e.target.files))}
            accept="image/*"
          />
          
          {variant === "minimal" ? (
             <Upload className="h-5 w-5 text-purple-400" />
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 shadow-inner transition-transform group-hover:scale-110">
                <Upload className="h-7 w-7 text-purple-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Upload Different Angles</h3>
              <p className="text-muted-foreground text-sm">
                Drop your shots from various perspectives here <br />
                <span className="text-xs opacity-60">(Minimum 3 images recommended)</span>
              </p>
            </div>
          )}
        </div>
      )}

      {(variant === "default" || variant === "grid-only") && (
        <AnimatePresence>
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={variant === "grid-only" ? "mt-0" : "mt-8"}
            >
              <div className={`grid gap-3 ${variant === "grid-only" ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}`}>
                {images.map((image) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/5"
                  >
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="h-full w-full cursor-zoom-in object-cover transition-transform duration-500 group-hover:scale-110"
                      onClick={() => setPreviewImage(image.preview)}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(image.id)
                      }}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive/80 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {previewImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreviewImage(null)}
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
                onClick={() => setPreviewImage(null)}
                className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full bg-black/70 p-0 text-white hover:bg-black"
              >
                <span className="text-lg leading-none">x</span>
              </Button>
              <img
                src={previewImage}
                alt="Uploaded Image Preview"
                className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
