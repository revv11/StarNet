"use client"

import { useRef, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CreditsLimitPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function CreditsLimitPopup({ isOpen, onClose }: CreditsLimitPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-gray-900 text-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">Credits Limit Reached</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <p className="text-gray-400 mb-6">You've used all your available credits.</p>
        <div className="text-center">
          <p className="mb-4">
            Email to{" "}
            <a
              href="mailto:revvtech16@gmail.com?subject=update credits request"
              className="text-blue-400 hover:underline"
            >
              revvtech16@gmail.com
            </a>{" "}
            with subject "update credits request" to get 5 extra credits.
          </p>
          <Button variant="outline" onClick={onClose} className="mt-2">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

