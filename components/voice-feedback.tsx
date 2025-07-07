"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Volume2, Radio } from "lucide-react"

interface VoiceFeedbackProps {
  isListening?: boolean
  isSpeaking?: boolean
  isRecording?: boolean
  audioLevel?: number
  className?: string
}

export function VoiceFeedback({
  isListening = false,
  isSpeaking = false,
  isRecording = false,
  audioLevel = 0,
  className = "",
}: VoiceFeedbackProps) {
  const [visualLevel, setVisualLevel] = useState(0)

  useEffect(() => {
    if (isListening || isRecording) {
      // Simulate audio level changes for visual effect
      const interval = setInterval(() => {
        setVisualLevel(Math.random() * 100)
      }, 100)
      return () => clearInterval(interval)
    } else {
      setVisualLevel(0)
    }
  }, [isListening, isRecording])

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {(isListening || isRecording) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 -m-4"
          >
            {/* Outer pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/30 to-pink-500/30"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            {/* Middle pulse ring */}
            <motion.div
              className="absolute inset-2 rounded-full bg-gradient-to-r from-red-400/40 to-pink-400/40"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.2, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />

            {/* Inner pulse ring */}
            <motion.div
              className="absolute inset-4 rounded-full bg-gradient-to-r from-red-300/50 to-pink-300/50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.3, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.4,
              }}
            />
          </motion.div>
        )}

        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 -m-4"
          >
            {/* Speaking animation rings */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 to-cyan-500/30"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="absolute inset-3 rounded-full bg-gradient-to-r from-blue-400/40 to-cyan-400/40"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.2, 0.4],
              }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface VoiceWaveformProps {
  isActive?: boolean
  levels?: number[]
  className?: string
}

export function VoiceWaveform({ isActive = false, levels = [], className = "" }: VoiceWaveformProps) {
  const [animatedLevels, setAnimatedLevels] = useState<number[]>(Array(8).fill(0))

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setAnimatedLevels((prev) => prev.map(() => Math.random() * 100))
      }, 150)
      return () => clearInterval(interval)
    } else {
      setAnimatedLevels(Array(8).fill(0))
    }
  }, [isActive])

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {animatedLevels.map((level, index) => (
        <motion.div
          key={index}
          className="w-1 bg-gradient-to-t from-emerald-500 to-green-400 rounded-full"
          animate={{
            height: isActive ? `${Math.max(level * 0.4, 8)}px` : "4px",
          }}
          transition={{
            duration: 0.1,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}

interface VoiceStatusProps {
  status: "idle" | "listening" | "speaking" | "processing"
  className?: string
}

export function VoiceStatus({ status, className = "" }: VoiceStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "listening":
        return {
          icon: Mic,
          text: "শুনছি...",
          color: "text-red-400",
          bgColor: "bg-red-500/20",
          borderColor: "border-red-400/50",
        }
      case "speaking":
        return {
          icon: Volume2,
          text: "বলছি...",
          color: "text-blue-400",
          bgColor: "bg-blue-500/20",
          borderColor: "border-blue-400/50",
        }
      case "processing":
        return {
          icon: Radio,
          text: "প্রক্রিয়াকরণ...",
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/20",
          borderColor: "border-yellow-400/50",
        }
      default:
        return {
          icon: MicOff,
          text: "নিষ্ক্রিয়",
          color: "text-gray-400",
          bgColor: "bg-gray-500/20",
          borderColor: "border-gray-400/50",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <AnimatePresence>
      {status !== "idle" && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-sm border ${config.bgColor} ${config.borderColor} ${className}`}
        >
          <motion.div
            animate={
              status === "listening" || status === "processing"
                ? {
                    rotate: 360,
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: status === "listening" || status === "processing" ? Number.POSITIVE_INFINITY : 0,
              ease: "linear",
            }}
          >
            <Icon className={`w-4 h-4 ${config.color}`} />
          </motion.div>
          <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
          {status === "listening" && <VoiceWaveform isActive={true} className="ml-2" />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
