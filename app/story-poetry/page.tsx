"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BookOpen,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  ArrowLeft,
  FileText,
  Heart,
  Sparkles,
  Wand2,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { VoiceFeedback, VoiceStatus, VoiceWaveform } from "@/components/voice-feedback"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  type?: "story" | "poetry" | "general"
  isGenerating?: boolean
}

const storyPrompts = [
  "একটি রহস্যময় গল্প লিখুন যেখানে একটি পুরানো বই থেকে চরিত্ররা বেরিয়ে আসে",
  "গ্রামের একটি ভূতুড়ে বাড়ির গল্প বলুন",
  "দুই বন্ধুর অ্যাডভেঞ্চার নিয়ে একটি গল্প তৈরি করুন",
  "ভবিষ্যতের বাংলাদেশ নিয়ে একটি কল্পবিজ্ঞান গল্প লিখুন",
  "একটি জাদুকরী বনের গল্প যেখানে পশুরা কথা বলতে পারে",
  "সময় ভ্রমণকারীর রোমাঞ্চকর অভিজ্ঞতার গল্প",
]

const poetryPrompts = [
  "প্রকৃতির সৌন্দর্য নিয়ে একটি কবিতা লিখুন",
  "মায়ের ভালোবাসা নিয়ে একটি আবেগময় কবিতা রচনা করুন",
  "স্বাধীনতা দিবস উপলক্ষে একটি দেশাত্মবোধক কবিতা লিখুন",
  "বর্ষাকাল নিয়ে একটি রোমান্টিক কবিতা তৈরি করুন",
  "শৈশবের স্মৃতি নিয়ে একটি নস্টালজিক কবিতা",
  "চাঁদনী রাতের সৌন্দর্য নিয়ে একটি কবিতা",
]

export default function StoryPoetryPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "নমস্কার! আমি আপনার সৃজনশীল সাহিত্য সহায়ক। আমি উন্নত AI প্রযুক্তি ব্যবহার করে গল্প, কবিতা, এবং অন্যান্য সাহিত্যকর্ম তৈরিতে সাহায্য করতে পারি। আপনি কী ধরনের সৃজনশীল কাজ করতে চান?",
      isUser: false,
      timestamp: new Date(),
      type: "general",
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [selectedType, setSelectedType] = useState<"story" | "poetry" | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "listening" | "speaking" | "processing">("idle")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)

  // Resolve the correct SpeechRecognition constructor at runtime
  type WebSpeechRecognition = typeof window extends { SpeechRecognition: infer T } ? T : any
  type WebSpeechEvent = typeof window extends { SpeechRecognitionEvent: infer E } ? E : any
  const SpeechRecognitionCtor =
    typeof window !== "undefined" ? window.SpeechRecognition || (window as any).webkitSpeechRecognition : undefined

  const recognitionRef = useRef<InstanceType<WebSpeechRecognition> | null>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Initialize Speech Recognition
  useEffect(() => {
    if (!SpeechRecognitionCtor) return

    const recognition = new SpeechRecognitionCtor() as InstanceType<WebSpeechRecognition>
    recognition.lang = "bn-BD"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (e: WebSpeechEvent) => {
      const transcript = (e.results[0][0] as SpeechRecognitionResult).transcript
      setInputText(transcript)
      setIsListening(false)
      setVoiceStatus("processing")
      setTimeout(() => {
        setVoiceStatus("idle")
      }, 500)
    }
    recognition.onerror = recognition.onend = () => {
      setIsListening(false)
      if (voiceStatus === "listening") {
        setVoiceStatus("idle")
      }
    }

    recognitionRef.current = recognition
  }, [voiceStatus])

  const addMessage = (text: string, isUser: boolean, type?: "story" | "poetry" | "general", isGenerating?: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      type,
      isGenerating,
    }
    setMessages((prev) => [...prev, newMessage])
    return newMessage.id
  }

  const updateMessage = (id: string, text: string, isGenerating?: boolean) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, text, isGenerating } : msg)))
  }

  const generateAIResponse = async (prompt: string, type: "story" | "poetry" | "general") => {
    setIsGenerating(true)
    setVoiceStatus("processing")
    const messageId = addMessage("", false, type, true)

    try {
      let systemPrompt = ""
      if (type === "story") {
        systemPrompt = "আপনি একজন দক্ষ বাংলা গল্পকার। সুন্দর, আকর্ষণীয় এবং সৃজনশীল গল্প লিখুন। গল্পে চরিত্র, কাহিনী এবং আবেগ থাকবে।"
      } else if (type === "poetry") {
        systemPrompt = "আপনি একজন দক্ষ বাংলা কবি। সুন্দর ছন্দ, অলংকার এবং আবেগময় কবিতা রচনা করুন।"
      } else {
        systemPrompt = "আপনি একজন সহায়ক বাংলা সাহিত্য সহায়ক। সৃজনশীল লেখায় সাহায্য করুন।"
      }

      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: prompt,
      })

      updateMessage(messageId, text, false)
      setVoiceStatus("idle")
    } catch (error) {
      console.error("AI generation error:", error)
      updateMessage(messageId, "দুঃখিত, কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।", false)
      setVoiceStatus("idle")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendMessage = () => {
    if (inputText.trim()) {
      addMessage(inputText, true)
      const userInput = inputText
      setInputText("")

      // Determine content type and generate AI response
      let contentType: "story" | "poetry" | "general" = "general"
      if (userInput.includes("গল্প") || userInput.includes("story") || selectedType === "story") {
        contentType = "story"
      } else if (userInput.includes("কবিতা") || userInput.includes("poetry") || selectedType === "poetry") {
        contentType = "poetry"
      }

      generateAIResponse(userInput, contentType)
    }
  }

  const handlePromptClick = (prompt: string, type: "story" | "poetry") => {
    setSelectedType(type)
    setInputText(prompt)
  }

  const startSpeechRecognition = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      setVoiceStatus("listening")
      recognitionRef.current.start()
    }
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(true)
      setVoiceStatus("speaking")
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "bn-BD"
      utterance.rate = 0.8
      utterance.pitch = 1.1
      utterance.volume = 1.0
      utterance.onend = () => {
        setIsSpeaking(false)
        setVoiceStatus("idle")
      }
      speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
      setVoiceStatus("idle")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 relative overflow-hidden font-bangla">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Voice Status Overlay */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
        <VoiceStatus status={voiceStatus} />
      </div>

      {/* Header */}
      <motion.div
        className="relative z-10 bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-xl border-b border-white/20 shadow-2xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4 p-4 md:p-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 transition-all duration-300">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl shadow-xl">
            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-white truncate">গল্প ও কবিতা তৈরি</h1>
            <p className="text-purple-200 text-xs md:text-sm">AI দিয়ে সৃজনশীল সাহিত্য রচনা করুন</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              AI পাওয়ার্ড
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto p-3 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 h-[calc(100vh-120px)]">
        {/* Prompts Sidebar */}
        <motion.div
          className="lg:col-span-1 space-y-4 md:space-y-6 order-2 lg:order-1"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg flex items-center gap-2 text-white">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                গল্পের আইডিয়া
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3">
              {storyPrompts.slice(0, 4).map((prompt, index) => (
                <motion.div key={index} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    className="w-full text-left h-auto p-3 md:p-4 text-xs md:text-sm text-white/90 hover:bg-purple-500/20 hover:text-white transition-all duration-300 rounded-xl border border-white/10 hover:border-purple-400/50"
                    onClick={() => handlePromptClick(prompt, "story")}
                  >
                    <Wand2 className="w-3 h-3 md:w-4 md:h-4 mr-2 text-purple-400 flex-shrink-0" />
                    <span className="line-clamp-2">{prompt}</span>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg flex items-center gap-2 text-white">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-400" />
                কবিতার বিষয়
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3">
              {poetryPrompts.slice(0, 4).map((prompt, index) => (
                <motion.div key={index} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    className="w-full text-left h-auto p-3 md:p-4 text-xs md:text-sm text-white/90 hover:bg-pink-500/20 hover:text-white transition-all duration-300 rounded-xl border border-white/10 hover:border-pink-400/50"
                    onClick={() => handlePromptClick(prompt, "poetry")}
                  >
                    <Heart className="w-3 h-3 md:w-4 md:h-4 mr-2 text-pink-400 flex-shrink-0" />
                    <span className="line-clamp-2">{prompt}</span>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          className="lg:col-span-3 order-1 lg:order-2"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="h-full flex flex-col bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            {/* Messages */}
            <ScrollArea className="flex-1 p-3 md:p-6" ref={scrollAreaRef}>
              <div className="space-y-4 md:space-y-6">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -50, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex items-start gap-2 md:gap-3 max-w-[85%]">
                        {!message.isUser && (
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full flex-shrink-0 shadow-lg relative">
                            <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            {message.isGenerating && (
                              <VoiceWaveform
                                isActive={true}
                                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                              />
                            )}
                          </div>
                        )}
                        <div
                          className={`p-3 md:p-5 rounded-2xl shadow-xl ${
                            message.isUser
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                              : "bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm text-white border border-white/20"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2 md:mb-3">
                            {message.type && (
                              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                                {message.type === "story" ? "গল্প" : message.type === "poetry" ? "কবিতা" : "সাধারণ"}
                              </Badge>
                            )}
                            {message.isGenerating && (
                              <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">
                                <Sparkles className="w-3 h-3 mr-1" />
                                তৈরি হচ্ছে...
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs md:text-sm leading-relaxed whitespace-pre-line">
                            {message.isGenerating ? "AI আপনার জন্য কন্টেন্ট তৈরি করছে..." : message.text}
                          </p>
                          {!message.isUser && !message.isGenerating && (
                            <div className="flex gap-2 mt-3 md:mt-4">
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 md:h-8 px-2 md:px-3 text-xs hover:bg-white/20 text-white/80 hover:text-white transition-all duration-300"
                                  onClick={() => (isSpeaking ? stopSpeaking() : speakText(message.text))}
                                >
                                  {isSpeaking ? (
                                    <VolumeX className="w-3 h-3 mr-1" />
                                  ) : (
                                    <Volume2 className="w-3 h-3 mr-1" />
                                  )}
                                </Button>
                                <VoiceFeedback
                                  isSpeaking={isSpeaking}
                                  className="absolute inset-0 pointer-events-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 md:p-6 border-t border-white/20 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
              <div className="space-y-3 md:space-y-4">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="আপনার গল্প বা কবিতার বিষয় লিখুন..."
                  className="min-h-[80px] md:min-h-[100px] bg-white/10 border-white/20 focus:border-purple-400 resize-none text-white placeholder:text-white/60 backdrop-blur-sm text-sm md:text-base"
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                />
                <div className="flex gap-2 md:gap-3">
                  <div className="relative">
                    <Button
                      onClick={startSpeechRecognition}
                      disabled={isListening}
                      className={`p-2 md:p-3 ${
                        isListening
                          ? "bg-red-500 hover:bg-red-600 animate-pulse"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                      } transition-all duration-300 shadow-lg`}
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <Mic className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </Button>
                    <VoiceFeedback isListening={isListening} className="absolute inset-0 pointer-events-none" />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isGenerating}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                    {isGenerating ? "তৈরি হচ্ছে..." : "পাঠান"}
                  </Button>
                </div>
                {isListening && (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-xs md:text-sm text-purple-200 animate-pulse flex items-center justify-center gap-2">
                      <Mic className="w-3 h-3 md:w-4 md:h-4" />
                      আপনার কথা শুনছি...
                      <VoiceWaveform isActive={true} className="ml-2" />
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
