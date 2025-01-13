"use client"

import { cn } from "../../lib/utils"

interface ShineBorderProps {
  borderRadius?: number
  borderWidth?: number
  duration?: number
  color?: string
  className?: string
  children: React.ReactNode
}

export function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = "#ffffff",
  className,
  children,
}: ShineBorderProps) {
  return (
    <div
      className={cn(
        "relative inline-flex rounded-lg p-[2px]",
        className
      )}
      style={
        {
          "--border-radius": `${borderRadius}px`,
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          "--border-color": color,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "relative z-10 flex w-full items-center justify-center rounded-[calc(var(--border-radius)-2px)] bg-transparent p-3"
        )}
      >
        {children}
      </div>
      <div
        className="absolute inset-0 rounded-[--border-radius] p-[--border-width] 
        before:absolute before:inset-0 before:rounded-[--border-radius] before:bg-shine-size 
        before:bg-[conic-gradient(from_var(--border-angle),transparent_20%,var(--border-color),transparent_80%)] 
        before:opacity-0 before:transition-opacity before:duration-300 before:content-['']
        hover:before:opacity-100"
      />
    </div>
  )
}
