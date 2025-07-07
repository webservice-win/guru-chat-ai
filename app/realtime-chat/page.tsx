"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Mic, MicOff, Volume2, VolumeX, Send, ArrowLeft, Zap, Brain, Heart, User } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  emotion?: "happy" | "sad" | "neutral" | "excited"
  isGenerating?: boolean
}

const quickReplies = [
  "আপনার নাম কী?",
  "আজকের আবহাওয়া কেমন?",
  "একটি মজার গল্প বলুন",
  "বাংলাদেশ সম্পর্কে বলুন",
  "আমাকে একটি রেসিপি দিন",
  "কিছু পরামর্শ দিন",
]

export default function RealtimeChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "নমস্কার! আমি বাংলার গুরু AI। আমি আপনার সাথে রিয়েল-টাইমে কথা বলতে পারি এবং যেকোনো বিষয়ে সাহায্য করতে পারি। আপনার মন কেমন আছে আজ?",
      isUser: false,
      timestamp: new Date(),
      emotion: "happy",
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [userEmotion, setUserEmotion] = useState<"happy" | "sad" | "neutral" | "excited">("neutral")

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionClass) return

    recognitionRef.current = new SpeechRecognitionClass()
    recognitionRef.current.lang = "bn-BD"
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false

    recognitionRef.current.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setInputText(transcript)
      setIsListening(false)
      setTimeout(() => handleSendMessage(transcript), 300)
    }
    recognitionRef.current.onerror = () => setIsListening(false)
    recognitionRef.current.onend = () => setIsListening(false)
  }, [])

  const detectEmotion = (text: string): "happy" | "sad" | "neutral" | "excited" => {
    const happyWords = ["খুশি", "ভালো", "চমৎকার", "দারুণ", "অসাধারণ", "হাসি"]
    const sadWords = ["দুঃখ", "খারাপ", "কষ্ট", "বিরক্ত", "হতাশ"]
    const excitedWords = ["উত্তেজিত", "রোমাঞ্চিত", "আগ্রহী", "অধীর"]

    const lowerText = text.toLowerCase()

    if (happyWords.some((word) => lowerText.includes(word))) return "happy"
    if (sadWords.some((word) => lowerText.includes(word))) return "sad"
    if (excitedWords.some((word) => lowerText.includes(word))) return "excited"

    return "neutral"
  }

  const addMessage = (
    text: string,
    isUser: boolean,
    emotion?: "happy" | "sad" | "neutral" | "excited",
    isGenerating?: boolean,
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      emotion,
      isGenerating,
    }
    setMessages((prev) => [...prev, newMessage])
    return newMessage.id
  }

  const updateMessage = (id: string, text: string, isGenerating?: boolean) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, text, isGenerating } : msg)))
  }

  const generateAIResponse = async (userMessage: string, userEmotion: "happy" | "sad" | "neutral" | "excited") => {
    setIsGenerating(true)
    const messageId = addMessage("", false, "neutral", true)

    try {
      const systemPrompt = `আপনি বাংলার গুরু AI, একজন বন্ধুত্বপূর্ণ এবং সহায়ক বাংলা AI সহায়ক। 
      ব্যবহারকারীর আবেগ: ${userEmotion === "happy" ? "খুশি" : userEmotion === "sad" ? "দুঃখিত" : userEmotion === "excited" ? "উত্তেজিত" : "স্বাভাবিক"}
      
      এই আবেগ অনুযায়ী উপযুক্ত এবং সহানুভূতিশীল উত্তর দিন। 
      উত্তর সংক্ষিপ্ত কিন্তু সহায়ক হতে হবে।`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: userMessage,
      })

      // Detect AI response emotion
      const aiEmotion = detectEmotion(text)
      updateMessage(messageId, text, false)

      // Update the message with detected emotion
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, emotion: aiEmotion } : msg)))
    } catch (error) {
      console.error("AI generation error:", error)
      updateMessage(messageId, "দুঃখিত, কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।", false)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendMessage = (messageText?: string) => {
    const textToSend = messageText || inputText
    if (textToSend.trim()) {
      const emotion = detectEmotion(textToSend)
      setUserEmotion(emotion)
      addMessage(textToSend, true, emotion)
      setInputText("")

      // Generate AI response
      generateAIResponse(textToSend, emotion)
    }
  }

  const startSpeechRecognition = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "bn-BD"
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      utterance.onend = () => setIsSpeaking(false)
      speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const getEmotionIcon = (emotion?: "happy" | "sad" | "neutral" | "excited") => {
    switch (emotion) {
      case "happy":
        return "😊"
      case "sad":
        return "😢"
      case "excited":
        return "🤩"
      default:
        return "😐"
    }
  }

  const getEmotionColor = (emotion?: "happy" | "sad" | "neutral" | "excited") => {
    switch (emotion) {
      case "happy":
        return "text-green-400"
      case "sad":
        return "text-blue-400"
      case "excited":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        className="relative z-10 bg-gradient-to-r from-orange-900/90 to-red-900/90 backdrop-blur-xl border-b border-white/20 shadow-2xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4 p-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 transition-all duration-300">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-2xl shadow-xl">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">রিয়েলটাইম চ্যাট</h1>
            <p className="text-orange-200 text-sm">তাৎক্ষণিক AI সহায়তা পান</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white">
              <Zap className="w-3 h-3 mr-1" />
              অনলাইন
            </Badge>
            <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
              <Brain className="w-3 h-3 mr-1" />
              স্মার্ট AI
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
        {/* Quick Replies Sidebar */}
        <motion.div
          className="lg:col-span-1 space-y-6"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-orange-400" />
                দ্রুত প্রশ্ন
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickReplies.map((reply, index) => (
                <motion.div key={index} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    className="w-full text-left h-auto p-4 text-sm text-white/90 hover:bg-orange-500/20 hover:text-white transition-all duration-300 rounded-xl border border-white/10 hover:border-orange-400/50"
                    onClick={() => handleSendMessage(reply)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2 text-orange-400" />
                    {reply}
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Emotion Status */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Heart className="w-5 h-5 text-pink-400" />
                আবেগ স্ট্যাটাস
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl mb-2">{getEmotionIcon(userEmotion)}</div>
                <p className={`text-sm font-medium ${getEmotionColor(userEmotion)}`}>
                  {userEmotion === "happy"
                    ? "খুশি"
                    : userEmotion === "sad"
                      ? "দুঃখিত"
                      : userEmotion === "excited"
                        ? "উত্তেজিত"
                        : "স্বাভাবিক"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          className="lg:col-span-3"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="h-full flex flex-col bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            {/* Messages */}
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ y: 50, opacity: 0, scale: 0.9 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -50, opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, type: "spring" }}
                      className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex items-start gap-3 max-w-[85%]">
                        {!message.isUser && (
                          <motion.div
                            className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full flex-shrink-0 shadow-lg"
                            animate={{ rotate: message.isGenerating ? 360 : 0 }}
                            transition={{
                              duration: 2,
                              repeat: message.isGenerating ? Number.POSITIVE_INFINITY : 0,
                              ease: "linear",
                            }}
                          >
                            <MessageCircle className="w-5 h-5 text-white" />
                          </motion.div>
                        )}
                        {message.isUser && (
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full flex-shrink-0 shadow-lg order-2"
                            whileHover={{ scale: 1.1 }}
                          >
                            <User className="w-5 h-5 text-white" />
                          </motion.div>
                        )}
                        <div
                          className={`p-5 rounded-2xl shadow-xl relative ${
                            message.isUser
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                              : "bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm text-white border border-white/20"
                          }`}
                        >
                          {/* Emotion indicator */}
                          {message.emotion && (
                            <div className="absolute -top-2 -right-2 text-lg">{getEmotionIcon(message.emotion)}</div>
                          )}

                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                              {message.isUser ? "আপনি" : "বাংলার গুরু"}
                            </Badge>
                            {message.isGenerating && (
                              <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">
                                <Brain className="w-3 h-3 mr-1" />
                                চিন্তা করছি...
                              </Badge>
                            )}
                            <span className="text-xs text-white/60">
                              {message.timestamp.toLocaleTimeString("bn-BD")}
                            </span>
                          </div>

                          <p className="text-sm leading-relaxed">
                            {message.isGenerating ? "আমি আপনার জন্য উত্তর তৈরি করছি..." : message.text}
                          </p>

                          {!message.isUser && !message.isGenerating && (
                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs hover:bg-white/20 text-white/80 hover:text-white transition-all duration-300"
                                onClick={() => (isSpeaking ? stopSpeaking() : speakText(message.text))}
                              >
                                {isSpeaking ? (
                                  <VolumeX className="w-3 h-3 mr-1" />
                                ) : (
                                  <Volume2 className="w-3 h-3 mr-1" />
                                )}
                                {isSpeaking ? "থামান" : "শুনুন"}
                              </Button>
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
            <div className="p-6 border-t border-white/20 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="আপনার বার্তা লিখুন..."
                    className="flex-1 bg-white/10 border-white/20 focus:border-orange-400 text-white placeholder:text-white/60 backdrop-blur-sm"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    onClick={startSpeechRecognition}
                    disabled={isListening}
                    className={`p-3 ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 animate-pulse"
                        : "bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
                    } transition-all duration-300 shadow-lg`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isGenerating}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg disabled:opacity-50 px-6"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    পাঠান
                  </Button>
                </div>
                {isListening && (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-sm text-orange-200 animate-pulse flex items-center justify-center gap-2">
                      <Mic className="w-4 h-4" />
                      আপনার কথা শুনছি...
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
