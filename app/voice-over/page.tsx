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
} from "lucide-react"
import Link from "next/link"

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
      mediaRecorder.start(100)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        setIsRecording(false)

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
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = voiceSettings.voice
      utterance.rate = voiceSettings.rate
      utterance.pitch = voiceSettings.pitch
      utterance.volume = voiceSettings.volume

      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)

      speechSynthesis.speak(utterance)
    }
  }

  const stopPlaying = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      setIsPlaying(false)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="bg-white/20 p-2 rounded-full">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ভয়েস ওভার স্টুডিও</h1>
            <p className="text-blue-100 text-sm">পেশাদার অডিও কন্টেন্ট তৈরি করুন</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Recording Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Text Input */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waveform className="w-5 h-5 text-blue-600" />
                স্ক্রিপ্ট লিখুন
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="আপনার ভয়েস ওভার স্ক্রিপ্ট এখানে লিখুন..."
                className="min-h-[120px] text-base leading-relaxed"
              />

              <div className="flex gap-3">
                <Button
                  onClick={isPlaying ? stopPlaying : playText}
                  disabled={!text.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      থামান
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      প্রিভিউ
                    </>
                  )}
                </Button>

                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`${
                    isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      রেকর্ডিং বন্ধ
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      রেকর্ড করুন
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recordings List */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5 text-cyan-600" />
                রেকর্ডিং সমূহ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {recordings.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Mic className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>এখনো কোনো রেকর্ডিং নেই</p>
                    <p className="text-sm">উপরে স্ক্রিপ্ট লিখে রেকর্ড করুন</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recordings.map((recording) => (
                      <div key={recording.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{recording.text.substring(0, 50)}...</h4>
                          <Badge variant="secondary">{recording.timestamp.toLocaleTimeString("bn-BD")}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Play className="w-3 h-3 mr-1" />
                            চালান
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            ডাউনলোড
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Voice Presets */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-600" />
                ভয়েস প্রিসেট
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {voicePresets.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Voice Controls */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>ভয়েস কন্ট্রোল</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
              <CardTitle>অডিও এনহান্সমেন্ট</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">নয়েজ রিডাকশন</span>
                <Badge variant="secondary">চালু</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ইকো ক্যান্সেলেশন</span>
                <Badge variant="secondary">চালু</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">অটো গেইন</span>
                <Badge variant="secondary">চালু</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
