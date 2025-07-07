"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, Square, Settings } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface TranscriptionSegment {
  id: string
  text: string
  confidence: number
  timestamp: Date
  duration: number
  isInterim: boolean
}

interface TranscriptionSession {
  id: string
  name: string
  segments: TranscriptionSegment[]
  startTime: Date
  endTime?: Date
  totalDuration: number
  wordCount: number
  averageConfidence: number
}

export function RealTimeTranscription() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentSession, setCurrentSession] = useState<TranscriptionSession | null>(null)
  const [sessions, setSessions] = useState<TranscriptionSession[]>([])
  const [liveText, setLiveText] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState("bn-BD")
  const [autoSave, setAutoSave] = useState(true)

  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionClass) {
      toast.error("আপনার ব্রাউজার স্পিচ রিকগনিশন সাপোর্ট করে না")
      return
    }

    const recognition = new SpeechRecognitionClass()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = selectedLanguage
    recognition.maxAlternatives = 3

    recognition.onstart = () => {
      setIsRecording(true)
      setIsProcessing(false)
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        const confidence = event.results[i][0].confidence || 0.8

        if (event.results[i].isFinal) {
          finalTranscript += transcript
          addTranscriptionSegment(transcript, confidence, false)
        } else {
          interimTranscript += transcript
        }
      }

      setLiveText(interimTranscript)
      setConfidence(event.results[event.results.length - 1]?.[0]?.confidence * 100 || 80)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsRecording(false)
      setIsProcessing(false)
      toast.error("স্পিচ রিকগনিশনে সমস্যা হয়েছে")
    }

    recognition.onend = () => {
      setIsRecording(false)
      setIsProcessing(false)
      setLiveText("")
    }

    recognitionRef.current = recognition
  }, [selectedLanguage])

  // Audio level monitoring
  const startAudioMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 256
      microphone.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const updateAudioLevel = () => {
        if (!analyserRef.current) return

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)

        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        setAudioLevel(Math.min(100, (average / 128) * 100))

        animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
      }

      updateAudioLevel()
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast.error("মাইক্রোফোন অ্যাক্সেস করতে সমস্যা হয়েছে")
    }
  }, [])

  const stopAudioMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    setAudioLevel(0)
  }, [])

  const addTranscriptionSegment = useCallback(
    (text: string, confidence: number, isInterim: boolean) => {
      if (!currentSession) return

      const segment: TranscriptionSegment = {
        id: Date.now().toString(),
        text,
        confidence,
        timestamp: new Date(),
        duration: 0,
        isInterim,
      }

      setCurrentSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          segments: [...prev.segments, segment],
          wordCount: prev.wordCount + text.split(" ").length,
          averageConfidence: (prev.averageConfidence + confidence) / 2,
        }
      })
    },
    [currentSession],
  )

  const startRecording = useCallback(async () => {
    if (!recognitionRef.current) return

    const session: TranscriptionSession = {
      id: Date.now().toString(),
      name: `সেশন ${new Date().toLocaleString("bn-BD")}`,
      segments: [],
      startTime: new Date(),
      totalDuration: 0,
      wordCount: 0,
      averageConfidence: 0,
    }

    setCurrentSession(session)
    setIsProcessing(true)

    try {
      await startAudioMonitoring()
      recognitionRef.current.start()
    } catch (error) {
      console.error("Error starting recording:", error)
      setIsProcessing(false)
      toast.error("রেকর্ডিং শুরু করতে সমস্যা হয়েছে")
    }
  }, [startAudioMonitoring])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    stopAudioMonitoring()

    if (currentSession) {
      const endTime = new Date()
      const duration = endTime.getTime() - currentSession.startTime.getTime()

      const completedSession: TranscriptionSession = {
        ...currentSession,
        endTime,
        totalDuration: duration,
      }

      setSessions((prev) => [completedSession, ...prev])

      if (autoSave) {
        const savedSessions = localStorage.getItem("transcription-sessions")
        const existing = savedSessions ? JSON.parse(savedSessions) : []
        localStorage.setItem("transcription-sessions", JSON.stringify([completedSession, ...existing]))
      }

      setCurrentSession(null)
      toast.success("ট্রান্সক্রিপশন সংরক্ষিত হয়েছে")
    }
  }, [currentSession, autoSave, stopAudioMonitoring])

  const exportTranscription = useCallback((session: TranscriptionSession) => {
    const text = session.segments.map((s) => s.text).join(" ")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${session.name}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("ট্রান্সক্রিপশন ডাউনলোড হয়েছে")
  }, [])

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("ক্লিপবোর্ডে কপি হয়েছে")
  }, [])

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    return `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  const AudioVisualizer = () => (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
          animate={{
            height: isRecording ? `${Math.max(4, (audioLevel / 100) * 48 + Math.random() * 16)}px` : "4px",
          }}
          transition={{
            duration: 0.1,
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">রিয়েল-টাইম ট্রান্সক্রিপশন</h2>
          <p className="text-gray-600">লাইভ স্পিচ টু টেক্সট রূপান্তর এবং ট্রান্সক্রিপশন ম্যানেজমেন্ট</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="bn-BD">বাংলা (বাংলাদেশ)</option>
            <option value="bn-IN">বাংলা (ভারত)</option>
            <option value="en-US">English (US)</option>
            <option value="hi-IN">हिन्दी</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoSave(!autoSave)}
            className={autoSave ? "bg-green-50 text-green-700" : ""}
          >
            <Settings className="w-4 h-4 mr-2" />
            অটো সেভ {autoSave ? "চালু" : "বন্ধ"}
          </Button>
        </div>
      </div>

      {/* Recording Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Recording */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-600" />
              লাইভ রেকর্ডিং
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Audio Visualizer */}
            <div className="bg-gray-100 rounded-xl p-6">
              <AudioVisualizer />
            </div>

            {/* Recording Controls */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                } text-white shadow-lg px-8 py-4 text-lg`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    প্রস্তুত হচ্ছে...
                  </>
                ) : isRecording ? (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    রেকর্ডিং বন্ধ করুন
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    রেকর্ডিং শুরু করুন
                  </>
                )}
              </Button>
            </div>

            {/* Live Stats */}
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(confidence)}%</div>
                  <div className="text-sm text-gray-600">নির্ভুলতা</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">{Math.round(audioLevel)}%</div>
                  <div className="text-sm text-gray-600">অডিও লেভেল</div>
                </div>
              </motion.div>
            )}

            {/* Live Text */}
            {(liveText || isRecording) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500 text\
