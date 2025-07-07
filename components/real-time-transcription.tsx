"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Mic,
  MicOff,
  Download,
  Copy,
  Settings,
  AudioWaveformIcon as Waveform,
  Languages,
  Clock,
  FileText,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface TranscriptionSegment {
  id: string
  text: string
  confidence: number
  timestamp: Date
  duration: number
  language: "bn" | "en" | "mixed"
  speaker?: string
}

interface TranscriptionSettings {
  language: "bn-BD" | "en-US" | "auto"
  punctuation: boolean
  timestamps: boolean
  speakerDetection: boolean
  confidenceThreshold: number
}

export function RealTimeTranscription() {
  const [isListening, setIsListening] = useState(false)
  const [currentText, setCurrentText] = useState("")
  const [segments, setSegments] = useState<TranscriptionSegment[]>([])
  const [settings, setSettings] = useState<TranscriptionSettings>({
    language: "bn-BD",
    punctuation: true,
    timestamps: true,
    speakerDetection: false,
    confidenceThreshold: 0.7,
  })
  const [audioLevel, setAudioLevel] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionClass) return

    recognitionRef.current = new SpeechRecognitionClass()
    recognitionRef.current.lang = settings.language
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        const confidence = event.results[i][0].confidence

        if (event.results[i].isFinal) {
          finalTranscript += transcript

          // Add to segments
          const segment: TranscriptionSegment = {
            id: Date.now().toString(),
            text: transcript.trim(),
            confidence: confidence || 0.9,
            timestamp: new Date(),
            duration: 0,
            language: detectLanguage(transcript),
            speaker: settings.speakerDetection ? "Speaker 1" : undefined,
          }

          if (segment.confidence >= settings.confidenceThreshold) {
            setSegments((prev) => [...prev, segment])
          }
        } else {
          interimTranscript += transcript
        }
      }

      setCurrentText(interimTranscript)
      setIsProcessing(false)
    }

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      startAudioLevelMonitoring()
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
      setCurrentText("")
      stopAudioLevelMonitoring()
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
      setIsProcessing(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      stopAudioLevelMonitoring()
    }
  }, [settings])

  const detectLanguage = (text: string): "bn" | "en" | "mixed" => {
    const bengaliPattern = /[\u0980-\u09FF]/
    const englishPattern = /[a-zA-Z]/

    const hasBengali = bengaliPattern.test(text)
    const hasEnglish = englishPattern.test(text)

    if (hasBengali && hasEnglish) return "mixed"
    if (hasBengali) return "bn"
    return "en"
  }

  const startAudioLevelMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()

      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      analyserRef.current.fftSize = 256
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setAudioLevel(average)
          requestAnimationFrame(updateAudioLevel)
        }
      }

      updateAudioLevel()
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopAudioLevelMonitoring = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setAudioLevel(0)
  }

  const startTranscription = () => {
    if (recognitionRef.current) {
      setIsProcessing(true)
      recognitionRef.current.start()
    }
  }

  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const clearTranscription = () => {
    setSegments([])
    setCurrentText("")
  }

  const exportTranscription = () => {
    const text = segments
      .map((segment) => {
        let line = segment.text
        if (settings.timestamps) {
          line = `[${segment.timestamp.toLocaleTimeString("bn-BD")}] ${line}`
        }
        if (segment.speaker) {
          line = `${segment.speaker}: ${line}`
        }
        return line
      })
      .join("\n")

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transcription-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    const text = segments.map((s) => s.text).join(" ")
    navigator.clipboard.writeText(text)
  }

  const getLanguageLabel = (lang: "bn" | "en" | "mixed") => {
    const labels = { bn: "বাংলা", en: "English", mixed: "মিশ্র" }
    return labels[lang]
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600"
    if (confidence >= 0.7) return "text-yellow-600"
    return "text-red-600"
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [segments, currentText])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waveform className="w-5 h-5" />
            রিয়েল-টাইম ট্রান্সক্রিপশন
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={isListening ? stopTranscription : startTranscription}
              className={`${
                isListening ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
              } transition-all duration-300`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  থামান
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  শুরু করুন
                </>
              )}
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">অডিও লেভেল:</span>
              <Progress value={audioLevel} className="w-24 h-2" />
            </div>

            {isListening && (
              <Badge className="bg-red-500 animate-pulse">
                <Mic className="w-3 h-3 mr-1" />
                শুনছি...
              </Badge>
            )}

            {isProcessing && <Badge className="bg-yellow-500">প্রক্রিয়াকরণ...</Badge>}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearTranscription}>
              <FileText className="w-3 h-3 mr-1" />
              পরিষ্কার করুন
            </Button>
            <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={segments.length === 0}>
              <Copy className="w-3 h-3 mr-1" />
              কপি করুন
            </Button>
            <Button variant="outline" size="sm" onClick={exportTranscription} disabled={segments.length === 0}>
              <Download className="w-3 h-3 mr-1" />
              ডাউনলোড
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Transcription */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[500px]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>ট্রান্সক্রিপশন</span>
                <Badge variant="secondary">{segments.length} সেগমেন্ট</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
                <div className="space-y-3">
                  <AnimatePresence>
                    {segments.map((segment) => (
                      <motion.div
                        key={segment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {settings.timestamps && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {segment.timestamp.toLocaleTimeString("bn-BD")}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              <Languages className="w-3 h-3 mr-1" />
                              {getLanguageLabel(segment.language)}
                            </Badge>
                            {segment.speaker && (
                              <Badge variant="outline" className="text-xs">
                                {segment.speaker}
                              </Badge>
                            )}
                          </div>
                          <span className={`text-xs font-medium ${getConfidenceColor(segment.confidence)}`}>
                            {Math.round(segment.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{segment.text}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Current/Interim Text */}
                  {currentText && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-300"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-500 text-xs animate-pulse">লাইভ</Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-blue-800 italic">{currentText}</p>
                    </motion.div>
                  )}

                  {segments.length === 0 && !currentText && (
                    <div className="text-center py-12 text-gray-500">
                      <Mic className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>মাইক্রোফোন চালু করে কথা বলা শুরু করুন</p>
                      <p className="text-sm">আপনার কথা এখানে রিয়েল-টাইমে দেখা যাবে</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                সেটিংস
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ভাষা</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value as any })}
                >
                  <option value="bn-BD">বাংলা</option>
                  <option value="en-US">English</option>
                  <option value="auto">অটো ডিটেক্ট</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  আত্মবিশ্বাস থ্রেশহোল্ড: {Math.round(settings.confidenceThreshold * 100)}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.1"
                  value={settings.confidenceThreshold}
                  onChange={(e) => setSettings({ ...settings, confidenceThreshold: Number.parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.punctuation}
                    onChange={(e) => setSettings({ ...settings, punctuation: e.target.checked })}
                  />
                  <span className="text-sm">যতিচিহ্ন যোগ করুন</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.timestamps}
                    onChange={(e) => setSettings({ ...settings, timestamps: e.target.checked })}
                  />
                  <span className="text-sm">টাইমস্ট্যাম্প দেখান</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.speakerDetection}
                    onChange={(e) => setSettings({ ...settings, speakerDetection: e.target.checked })}
                  />
                  <span className="text-sm">স্পিকার সনাক্তকরণ</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>পরিসংখ্যান</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">মোট সেগমেন্ট:</span>
                <span className="font-medium">{segments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">মোট শব্দ:</span>
                <span className="font-medium">
                  {segments.reduce((acc, seg) => acc + seg.text.split(" ").length, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">গড় আত্মবিশ্বাস:</span>
                <span className="font-medium">
                  {segments.length > 0
                    ? Math.round((segments.reduce((acc, seg) => acc + seg.confidence, 0) / segments.length) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">বাংলা:</span>
                <span className="font-medium">
                  {Math.round(
                    (segments.filter((s) => s.language === "bn").length / Math.max(segments.length, 1)) * 100,
                  )}
                  %
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
