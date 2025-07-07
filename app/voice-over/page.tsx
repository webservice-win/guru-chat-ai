"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Mic,
  Play,
  Pause,
  Square,
  Download,
  ArrowLeft,
  Settings,
  AudioWaveformIcon as Waveform,
  Music,
  Volume2,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { VoiceFeedback, VoiceStatus, VoiceWaveform } from "@/components/voice-feedback"

interface Recording {
  id: string
  text: string
  timestamp: Date
  duration: number
  settings: VoiceSettings
}

interface VoiceSettings {
  rate: number
  pitch: number
  volume: number
  voice: string
}

const voicePresets = [
  { name: "সংবাদ উপস্থাপক", rate: 0.9, pitch: 1.0, volume: 1.0 },
  { name: "গল্প বলা", rate: 0.8, pitch: 1.1, volume: 0.9 },
  { name: "বিজ্ঞাপন", rate: 1.0, pitch: 1.2, volume: 1.0 },
  { name: "শিক্ষামূলক", rate: 0.85, pitch: 1.0, volume: 0.95 },
]

export default function VoiceOverPage() {
  const [text, setText] = useState("")
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentRecording, setCurrentRecording] = useState<string | null>(null)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
    voice: "bn-BD",
  })
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "listening" | "speaking" | "processing">("idle")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      setIsRecording(true)
      setVoiceStatus("listening")
      mediaRecorder.start(100)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        setIsRecording(false)
        setVoiceStatus("idle")

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const newRecording: Recording = {
          id: Date.now().toString(),
          text: text || "রেকর্ডিং",
          timestamp: new Date(),
          duration: 0, // Would be calculated from actual audio
          settings: { ...voiceSettings },
        }

        setRecordings((prev) => [...prev, newRecording])
        setText("")
      }
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setVoiceStatus("idle")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  const playText = () => {
    if ("speechSynthesis" in window && text.trim()) {
      setIsPlaying(true)
      setVoiceStatus("speaking")
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = voiceSettings.voice
      utterance.rate = voiceSettings.rate
      utterance.pitch = voiceSettings.pitch
      utterance.volume = voiceSettings.volume

      utterance.onend = () => {
        setIsPlaying(false)
        setVoiceStatus("idle")
      }
      utterance.onerror = () => {
        setIsPlaying(false)
        setVoiceStatus("idle")
      }

      speechSynthesis.speak(utterance)
    }
  }

  const stopPlaying = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      setIsPlaying(false)
      setVoiceStatus("idle")
    }
  }

  const applyPreset = (preset: (typeof voicePresets)[0]) => {
    setVoiceSettings((prev) => ({
      ...prev,
      rate: preset.rate,
      pitch: preset.pitch,
      volume: preset.volume,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 font-bangla">
      {/* Voice Status Overlay */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
        <VoiceStatus status={voiceStatus} />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="bg-white/20 p-2 rounded-full">
            <Mic className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-bold truncate">ভয়েস ওভার স্টুডিও</h1>
            <p className="text-blue-100 text-xs md:text-sm">পেশাদার অডিও কন্টেন্ট তৈরি করুন</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-3 md:p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Recording Area */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Text Input */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Waveform className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                স্ক্রিপ্ট লিখুন
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="আপনার ভয়েস ওভার স্ক্রিপ্ট এখানে লিখুন..."
                className="min-h-[100px] md:min-h-[120px] text-sm md:text-base leading-relaxed"
              />

              <div className="flex gap-2 md:gap-3">
                <div className="relative">
                  <Button
                    onClick={isPlaying ? stopPlaying : playText}
                    disabled={!text.trim()}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        <span className="hidden md:inline">থামান</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        <span className="hidden md:inline">প্রিভিউ</span>
                      </>
                    )}
                  </Button>
                  <VoiceFeedback isSpeaking={isPlaying} className="absolute inset-0 pointer-events-none" />
                </div>

                <div className="relative">
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`${
                      isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        <span className="hidden md:inline">রেকর্ডিং বন্ধ</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        <span className="hidden md:inline">রেকর্ড করুন</span>
                      </>
                    )}
                  </Button>
                  <VoiceFeedback isRecording={isRecording} className="absolute inset-0 pointer-events-none" />
                </div>
              </div>

              {(isRecording || isPlaying) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    {isRecording && <Mic className="w-4 h-4 text-red-500 animate-pulse" />}
                    {isPlaying && <Volume2 className="w-4 h-4 text-blue-500" />}
                    <span className="text-sm font-medium">{isRecording ? "রেকর্ড করা হচ্ছে..." : "প্লে করা হচ্ছে..."}</span>
                  </div>
                  <VoiceWaveform isActive={true} />
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Recordings List */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Music className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
                রেকর্ডিং সমূহ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px] md:h-[300px]">
                {recordings.length === 0 ? (
                  <div className="text-center text-gray-500 py-6 md:py-8">
                    <Mic className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-gray-300" />
                    <p className="text-sm md:text-base">এখনো কোনো রেকর্ডিং নেই</p>
                    <p className="text-xs md:text-sm">উপরে স্ক্রিপ্ট লিখে রেকর্ড করুন</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recordings.map((recording) => (
                      <motion.div
                        key={recording.id}
                        className="p-3 md:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm md:text-base truncate">
                            {recording.text.substring(0, 50)}...
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {recording.timestamp.toLocaleTimeString("bn-BD")}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs bg-transparent">
                            <Play className="w-3 h-3 mr-1" />
                            চালান
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs bg-transparent">
                            <Download className="w-3 h-3 mr-1" />
                            ডাউনলোড
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4 md:space-y-6">
          {/* Voice Presets */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Settings className="w-4 h-4 md:w-5 md:h-5 text-teal-600" />
                ভয়েস প্রিসেট
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3">
              {voicePresets.map((preset, index) => (
                <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent text-sm"
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.name}
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Voice Controls */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">ভয়েস কন্ট্রোল</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">গতি: {voiceSettings.rate.toFixed(1)}x</label>
                <Slider
                  value={[voiceSettings.rate]}
                  onValueChange={([value]) => setVoiceSettings((prev) => ({ ...prev, rate: value }))}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">পিচ: {voiceSettings.pitch.toFixed(1)}</label>
                <Slider
                  value={[voiceSettings.pitch]}
                  onValueChange={([value]) => setVoiceSettings((prev) => ({ ...prev, pitch: value }))}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  ভলিউম: {Math.round(voiceSettings.volume * 100)}%
                </label>
                <Slider
                  value={[voiceSettings.volume]}
                  onValueChange={([value]) => setVoiceSettings((prev) => ({ ...prev, volume: value }))}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio Enhancement */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">অডিও এনহান্সমেন্ট</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">নয়েজ রিডাকশন</span>
                <Badge variant="secondary" className="text-xs">
                  চালু
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ইকো ক্যান্সেলেশন</span>
                <Badge variant="secondary" className="text-xs">
                  চালু
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">অটো গেইন</span>
                <Badge variant="secondary" className="text-xs">
                  চালু
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
