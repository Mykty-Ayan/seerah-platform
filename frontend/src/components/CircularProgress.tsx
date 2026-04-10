import { cn } from "@/lib/utils"

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function CircularProgress({
  value,
  max = 100,
  size = 60,
  strokeWidth = 4,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500 ease-in-out"
        />
      </svg>
      {/* Percentage text */}
      <span className="absolute text-xs font-semibold text-primary">
        {Math.round(percentage)}%
      </span>
    </div>
  )
}
