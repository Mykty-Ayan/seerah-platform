import { useEffect, useRef } from "react"

interface CloudflarePlayerProps {
  videoUid: string
  autoplay?: boolean
  muted?: boolean
  onEnded?: () => void
}

export function CloudflarePlayer({
  videoUid,
  autoplay = false,
  muted = false,
  onEnded,
}: CloudflarePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous iframe
    containerRef.current.innerHTML = ""

    // Create Cloudflare Stream iframe
    const iframe = document.createElement("iframe")
    iframe.src = `https://customer-49dae848c6685c6b4d74b39fc6b602a7.cloudflarestream.com/${videoUid}/iframe?autoplay=${autoplay}&muted=${muted}`
    iframe.style.width = "100%"
    iframe.style.aspectRatio = "16/9"
    iframe.style.border = "none"
    iframe.allow = "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
    iframe.allowFullscreen = true

    containerRef.current.appendChild(iframe)

    // Listen for video ended event
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "videocomplete" && onEnded) {
        onEnded()
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [videoUid, autoplay, muted, onEnded])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden shadow-lg"
    />
  )
}
