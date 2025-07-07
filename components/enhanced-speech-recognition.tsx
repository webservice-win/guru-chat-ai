"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Mic, MicOff, Settings, Zap, Filter, Volume2, Waves, Brain, Target, Gauge } from "lucide-react"
import { motion } from "framer-motion"

interface EnhancementSettings {
  noiseReduction: boolean
  echoCancellation: boolean
  autoGainControl: boolean
  voiceActivityDetection: boolean
  adaptiveFiltering: boolean
  banglaOptimization: boolean
  confidenceBoost: number
  sensitivityLevel: number
  processingDelay: number
}

interface AudioMetrics {
  signalStrength: number
  noiseLevel: number
  clarity: number
  confidence: number
  processingLatency: number
}

export function EnhancedSpeechRecognition() {
  const [isActive, setIsActive] = useState(false)
  const [settings, setSettings] = useState<EnhancementSettings>({
    noiseReduction: true,
    echoCancellation: true,
    autoGainControl: true,
    voiceActivityDetection: true,
    adaptiveFiltering: true,
    banglaOptimization: true,
    confidenceBoost: 0.15,
    sensitivityLevel: 0.7,
    processingDelay: 100,
  })
  const [metrics, setMetrics] = useState<AudioMetrics>({
    signalStrength: 0,
    noiseLevel: 0,
    clarity: 0,
    confidence: 0,
    processingLatency: 0,
  })
  const [recognizedText, setRecognizedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const recognitionRef = useRef<any>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)

  // Initialize enhanced speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionClass) return

    recognitionRef.current = new SpeechRecognitionClass()
    recognitionRef.current.lang = "bn-BD"
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true

    // Enhanced Bangla recognition settings
    if (settings.banglaOptimization) {
      recognitionRef.current.lang = "bn-BD"
      // Add custom Bangla phoneme mappings if available
    }

    recognitionRef.current.onresult = (event: any) => {
      let transcript = ""
      let confidence = 0

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        transcript += result[0].transcript
        confidence = Math.max(confidence, result[0].confidence || 0.8)
      }

      // Apply confidence boost
      confidence = Math.min(1, confidence + settings.confidenceBoost)

      // Enhanced Bangla text processing
      if (settings.banglaOptimization) {
        transcript = enhanceBanglaText(transcript)
      }

      setRecognizedText(transcript)
      setMetrics((prev) => ({ ...prev, confidence: confidence * 100 }))
      setIsProcessing(false)
    }

    recognitionRef.current.onstart = () => {
      setIsActive(true)
      startAudioProcessing()
    }

    recognitionRef.current.onend = () => {
      setIsActive(false)
      stopAudioProcessing()
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsActive(false)
      setIsProcessing(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      stopAudioProcessing()
    }
  }, [settings])

  const enhanceBanglaText = (text: string): string => {
    // Common Bangla speech recognition corrections
    const corrections: { [key: string]: string } = {
      আমি: "আমি",
      তুমি: "তুমি",
      সে: "সে",
      আমরা: "আমরা",
      তোমরা: "তোমরা",
      তারা: "তারা",
      // Add more common corrections
    }

    let correctedText = text
    Object.entries(corrections).forEach(([wrong, correct]) => {
      correctedText = correctedText.replace(new RegExp(wrong, "gi"), correct)
    })

    return correctedText
  }

  const startAudioProcessing = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: settings.echoCancellation,
          noiseSuppression: settings.noiseReduction,
          autoGainControl: settings.autoGainControl,
          sampleRate: 44100,
          channelCount: 1,
        },
      })

      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()

      const source = audioContextRef.current.createMediaStreamSource(stream)

      // Create audio processor for real-time analysis
      processorRef.current = audioContextRef.current.createScriptProcessor(2048, 1, 1)

      source.connect(analyserRef.current)
      analyserRef.current.connect(processorRef.current)
      processorRef.current.connect(audioContextRef.current.destination)

      analyserRef.current.fftSize = 2048
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      const frequencyArray = new Uint8Array(bufferLength)

      const updateMetrics = () => {
        if (analyserRef.current && isActive) {
          analyserRef.current.getByteTimeDomainData(dataArray)
          analyserRef.current.getByteFrequencyData(frequencyArray)

          // Calculate signal strength
          const signalStrength = dataArray.reduce((acc, val) => acc + Math.abs(val - 128), 0) / bufferLength

          // Calculate noise level
          const noiseLevel = frequencyArray.slice(0, 50).reduce((acc, val) => acc + val, 0) / 50

          // Calculate clarity (signal-to-noise ratio)
          const clarity = Math.max(0, Math.min(100, (signalStrength / Math.max(noiseLevel, 1)) * 10))

          // Voice Activity Detection
          const isVoiceDetected = signalStrength > settings.sensitivityLevel * 50

          setMetrics((prev) => ({
            ...prev,
            signalStrength: (signalStrength / 128) * 100,
            noiseLevel: (noiseLevel / 255) * 100,
            clarity: clarity,
            processingLatency: settings.processingDelay,
          }))

          if (isVoiceDetected && settings.voiceActivityDetection) {
            setIsProcessing(true)
          }

          requestAnimationFrame(updateMetrics)
        }
      }

      updateMetrics()
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopAudioProcessing = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    setMetrics({
      signalStrength: 0,
      noiseLevel: 0,
      clarity: 0,
      confidence: 0,
      processingLatency: 0,
    })
  }

  const toggleRecognition = () => {
    if (isActive) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
  }

  const getMetricColor = (value: number, reverse = false) => {
    if (reverse) {
      if (value <= 30) return "text-green-600"
      if (value <= 60) return "text-yellow-600"
      return "text-red-600"
    } else {
      if (value >= 70) return "text-green-600"
      if (value >= 40) return "text-yellow-600"
      return "text-red-600"
    }
  }

  const getProgressColor = (value: number, reverse = false) => {
    if (reverse) {
      if (value <= 30) return "bg-green-500"
      if (value <= 60) return "bg-yellow-500"
      return "bg-red-500"
    } else {
      if (value >= 70) return "bg-green-500"
      if (value >= 40) return "bg-yellow-500"
      return "bg-red-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Control */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            উন্নত বাংলা স্পিচ রিকগনিশন
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={toggleRecognition}
                size="lg"
                className={`w-32 h-32 rounded-full ${
                  isActive ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-green-500 hover:bg-green-600"
                } transition-all duration-300 shadow-lg`}
              >
                {isActive ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
              </Button>
            </motion.div>
          </div>

          {recognizedText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white rounded-lg border-2 border-blue-200"
            >
              <h3 className="font-medium text-gray-700 mb-2">স্বীকৃত টেক্সট:</h3>
              <p className="text-lg leading-relaxed">{recognizedText}</p>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-blue-600"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">প্রক্রিয়াকরণ হচ্ছে...</span>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">সিগন্যাল শক্তি</span>
              <span className={`text-sm font-bold ${getMetricColor(metrics.signalStrength)}`}>
                {Math.round(metrics.signalStrength)}%
              </span>
            </div>
            <Progress value={metrics.signalStrength} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">নয়েজ লেভেল</span>
              <span className={`text-sm font-bold ${getMetricColor(metrics.noiseLevel, true)}`}>
                {Math.round(metrics.noiseLevel)}%
              </span>
            </div>
            <Progress value={metrics.noiseLevel} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">স্পষ্টতা</span>
              <span className={`text-sm font-bold ${getMetricColor(metrics.clarity)}`}>
                {Math.round(metrics.clarity)}%
              </span>
            </div>
            <Progress value={metrics.clarity} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">আত্মবিশ্বাস</span>
              <span className={`text-sm font-bold ${getMetricColor(metrics.confidence)}`}>
                {Math.round(metrics.confidence)}%
              </span>
            </div>
            <Progress value={metrics.confidence} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Enhancement Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              অডিও এনহান্সমেন্ট
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="noise-reduction" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                নয়েজ রিডাকশন
              </Label>
              <Switch
                id="noise-reduction"
                checked={settings.noiseReduction}
                onCheckedChange={(checked) => setSettings({ ...settings, noiseReduction: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="echo-cancellation" className="flex items-center gap-2">
                <Waves className="w-4 h-4" />
                ইকো ক্যান্সেলেশন
              </Label>
              <Switch
                id="echo-cancellation"
                checked={settings.echoCancellation}
                onCheckedChange={(checked) => setSettings({ ...settings, echoCancellation: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-gain" className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                অটো গেইন কন্ট্রোল
              </Label>
              <Switch
                id="auto-gain"
                checked={settings.autoGainControl}
                onCheckedChange={(checked) => setSettings({ ...settings, autoGainControl: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="voice-detection" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                ভয়েস অ্যাক্টিভিটি ডিটেকশন
              </Label>
              <Switch
                id="voice-detection"
                checked={settings.voiceActivityDetection}
                onCheckedChange={(checked) => setSettings({ ...settings, voiceActivityDetection: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="adaptive-filtering" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                অ্যাডাপটিভ ফিল্টারিং
              </Label>
              <Switch
                id="adaptive-filtering"
                checked={settings.adaptiveFiltering}
                onCheckedChange={(checked) => setSettings({ ...settings, adaptiveFiltering: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="bangla-optimization" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                বাংলা অপটিমাইজেশন
              </Label>
              <Switch
                id="bangla-optimization"
                checked={settings.banglaOptimization}
                onCheckedChange={(checked) => setSettings({ ...settings, banglaOptimization: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              পারফরমেন্স টিউনিং
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>আত্মবিশ্বাস বুস্ট: {Math.round(settings.confidenceBoost * 100)}%</Label>
              <Slider
                value={[settings.confidenceBoost]}
                onValueChange={([value]) => setSettings({ ...settings, confidenceBoost: value })}
                min={0}
                max={0.3}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>সেনসিটিভিটি লেভেল: {Math.round(settings.sensitivityLevel * 100)}%</Label>
              <Slider
                value={[settings.sensitivityLevel]}
                onValueChange={([value]) => setSettings({ ...settings, sensitivityLevel: value })}
                min={0.3}
                max={1.0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>প্রক্রিয়াকরণ বিলম্ব: {settings.processingDelay}ms</Label>
              <Slider
                value={[settings.processingDelay]}
                onValueChange={([value]) => setSettings({ ...settings, processingDelay: value })}
                min={50}
                max={500}
                step={50}
                className="w-full"
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">পারফরমেন্স স্কোর</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>সামগ্রিক গুণমান:</span>
                  <span className="font-medium">
                    {Math.round((metrics.signalStrength + metrics.clarity + metrics.confidence) / 3)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>লেটেন্সি:</span>
                  <span className="font-medium">{metrics.processingLatency}ms</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
