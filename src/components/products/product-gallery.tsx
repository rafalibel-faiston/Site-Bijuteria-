"use client"

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }

  const goNext = () => setActiveIndex((prev) => (prev + 1) % images.length)
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-dark-800 cursor-zoom-in group"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex]}
              alt={`${productName} - imagem ${activeIndex + 1}`}
              fill
              className={`object-cover transition-transform duration-300 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              style={isZoomed ? {
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              } : undefined}
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom hint */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-dark-900/70 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
            <ZoomIn className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-white text-xs">Zoom</span>
          </div>
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-dark-900/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-dark-700 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-dark-900/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-dark-700 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-6 h-2 bg-gold-500'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? 'border-gold-500'
                  : 'border-dark-700 hover:border-dark-500'
              }`}
            >
              <Image
                src={img}
                alt={`${productName} - miniatura ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
