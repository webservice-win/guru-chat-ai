"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Newspaper, Mic, MicOff, Volume2, VolumeX, Send, ArrowLeft, Tv, Radio, Globe, Clock } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { VoiceFeedback, VoiceStatus, VoiceWaveform } from "@/components/voice-feedback"

interface NewsItem {
  id: string
  headline: string
  content: string
  category: "breaking" | "politics" | "sports" | "weather" | "business"
  timestamp: Date
  isGenerating?: boolean
}

const newsCategories = [
  { id: "breaking", name: "ব্রেকিং নিউজ", icon: "🚨", color: "from-red-500 to-orange-500" },
  { id: "politics", name: "রাজনীতি", icon: "🏛️", color: "from-blue-500 to-indigo-500" },
  { id: "sports", name: "খেলাধুলা", icon: "⚽", color: "from-green-500 to-emerald-500" },
  { id: "weather", name: "আবহাওয়া", icon: "🌤️", color: "from-cyan-500 to-blue-500" },
  { id: "business", name: "ব্যবসা", icon: "💼", color: "from-purple-500 to-pink-500" },
]

const newsPrompts = [
  "আজকের প্রধান সংবাদ তৈরি করুন",
  "বাংলাদেশের অর্থনৈতিক অবস্থা নিয়ে রিপোর্ট",
  "আবহাওয়ার পূর্ভাবাস প্রস্তুত করুন",
  "খেলাধুলার সর্বশেষ খবর",
  "আন্তর্জাতিক সংবাদ সংক্ষেপ",
  "স্বাস্থ্য বিষয়ক গুরুত্বপূর্ণ তথ্য",
]

export default function NewsPresenterPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([
    {
      id: "1",
      headline: "স্বাগতম সংবাদ উপস্থাপনা বিভাগে",
      content:
        "আমি আপনার AI সংবাদ উপস্থাপক। আমি পেশাদার সংবাদ তৈরি, রিপোর্ট লেখা এবং সংবাদ উপস্থাপনায় সাহায্য করতে পারি। আপনি কোন ধরনের সংবাদ তৈরি করতে চান?",
      category: "breaking",
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"breaking" | "politics" | "sports" | "weather" | "business">(
    "breaking",
  )
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [teleprompterMode, setTeleprompterMode] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "listening" | "speaking" | "processing">("idle")

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [newsItems])

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
      setVoiceStatus("processing")
      setTimeout(() => {
        setVoiceStatus("idle")
      }, 500)
    }
    recognitionRef.current.onerror = () => {
      setIsListening(false)
      setVoiceStatus("idle")
    }
    recognitionRef.current.onend = () => {
      setIsListening(false)
      if (voiceStatus === "listening") {
        setVoiceStatus("idle")
      }
    }
  }, [voiceStatus])

  const addNewsItem = (
    headline: string,
    content: string,
    category: "breaking" | "politics" | "sports" | "weather" | "business",
    isGenerating?: boolean,
  ) => {
    const newItem: NewsItem = {
      id: Date.now().toString(),
      headline,
      content,
      category,
      timestamp: new Date(),
      isGenerating,
    }
    setNewsItems((prev) => [...prev, newItem])
    return newItem.id
  }

  const updateNewsItem = (id: string, headline: string, content: string, isGenerating?: boolean) => {
    setNewsItems((prev) => prev.map((item) => (item.id === id ? { ...item, headline, content, isGenerating } : item)))
  }

  const generateNews = async (
    prompt: string,
    category: "breaking" | "politics" | "sports" | "weather" | "business",
  ) => {
    setIsGenerating(true)
    setVoiceStatus("processing")
    const itemId = addNewsItem("সংবাদ তৈরি হচ্ছে...", "", category, true)

    try {
      let systemPrompt = ""
      switch (category) {
        case "breaking":
          systemPrompt = "আপনি একজন পেশাদার সংবাদ উপস্থাপক। ব্রেকিং নিউজ স্টাইলে গুরুত্বপূর্ণ এবং তাৎক্ষণিক সংবাদ তৈরি করুন।"
          break
        case "politics":
          systemPrompt = "আপনি একজন রাজনৈতিক সংবাদদাতা। নিরপেক্ষ এবং তথ্যবহুল রাজনৈতিক সংবাদ তৈরি করুন।"
          break
        case "sports":
          systemPrompt = "আপনি একজন ক্রীড়া সংবাদদাতা। উত্তেজনাপূর্ণ এবং তথ্যবহুল খেলাধুলার সংবাদ তৈরি করুন।"
          break
        case "weather":
          systemPrompt = "আপনি একজন আবহাওয়াবিদ। সঠিক এবং বোধগম্য আবহাওয়ার পূর্বাভাস তৈরি করুন।"
          break
        case "business":
          systemPrompt = "আপনি একজন অর্থনৈতিক সংবাদদাতা। ব্যবসা ও অর্থনীতি বিষয়ক তথ্যবহুল সংবাদ তৈরি করুন।"
          break
      }

      const { text } = await generateText({
        model: openai("gpt-4o"),
        system:
          systemPrompt + " সংবাদের শিরোনাম এবং বিস্তারিত বিবরণ আলাদা করে দিন। শিরোনাম: [শিরোনাম] বিবরণ: [বিবরণ] ফরম্যাটে লিখুন।",
        prompt: prompt,
      })

      // Parse headline and content
      const headlineMatch = text.match(/শিরোনাম:\s*(.+?)(?=\s*বিবরণ:|$)/s)
      const contentMatch = text.match(/বিবরণ:\s*(.+)/s)

      const headline = headlineMatch ? headlineMatch[1].trim() : "নতুন সংবাদ"
      const content = contentMatch ? contentMatch[1].trim() : text

      updateNewsItem(itemId, headline, content, false)
      setVoiceStatus("idle")
    } catch (error) {
      console.error("News generation error:", error)
      updateNewsItem(itemId, "ত্রুটি", "দুঃখিত, সংবাদ তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", false)
      setVoiceStatus("idle")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateNews = () => {
    if (inputText.trim()) {
      generateNews(inputText, selectedCategory)
      setInputText("")
    }
  }

  const startSpeechRecognition = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      setVoiceStatus("listening")
      recognitionRef.current.start()
    }
  }

  const speakNews = (headline: string, content: string) => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(true)
      setVoiceStatus("speaking")
      const fullText = `${headline}। ${content}`
      const utterance = new SpeechSynthesisUtterance(fullText)
      utterance.lang = "bn-BD"
      utterance.rate = 0.85
      utterance.pitch = 1.0
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

  const getCategoryInfo = (category: string) => {
    return newsCategories.find((cat) => cat.id === category) || newsCategories[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 relative overflow-hidden font-bangla">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 5,
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
        className="relative z-10 bg-gradient-to-r from-emerald-900/90 to-green-900/90 backdrop-blur-xl border-b border-white/20 shadow-2xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-4 p-4 md:p-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 transition-all duration-300">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 rounded-2xl shadow-xl">
            <Newspaper className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-white truncate">সংবাদ উপস্থাপন</h1>
            <p className="text-emerald-200 text-xs md:text-sm">AI দিয়ে পেশাদার সংবাদ তৈরি করুন</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setTeleprompterMode(!teleprompterMode)}
              className={`${teleprompterMode ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} transition-all duration-300 text-xs md:text-sm`}
            >
              <Tv className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">{teleprompterMode ? "টেলিপ্রম্পটার বন্ধ" : "টেলিপ্রম্পটার চালু"}</span>
            </Button>
            <Badge className="bg-gradient-to-r from-red-400 to-orange-500 text-white text-xs">
              <Radio className="w-3 h-3 mr-1" />
              লাইভ
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto p-3 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 h-[calc(100vh-120px)]">
        {/* Categories & Prompts Sidebar */}
        <motion.div
          className="lg:col-span-1 space-y-4 md:space-y-6 order-2 lg:order-1"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Categories */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg flex items-center gap-2 text-white">
                <Globe className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                সংবাদ বিভাগ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3">
              {newsCategories.map((category) => (
                <motion.div key={category.id} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className={`w-full text-left h-auto p-3 md:p-4 text-xs md:text-sm transition-all duration-300 rounded-xl border border-white/10 ${
                      selectedCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                        : "text-white/90 hover:bg-emerald-500/20 hover:text-white hover:border-emerald-400/50"
                    }`}
                    onClick={() => setSelectedCategory(category.id as any)}
                  >
                    <span className="text-base md:text-lg mr-2 md:mr-3">{category.icon}</span>
                    <span className="truncate">{category.name}</span>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Prompts */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg flex items-center gap-2 text-white">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                দ্রুত প্রম্পট
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3">
              {newsPrompts.slice(0, 4).map((prompt, index) => (
                <motion.div key={index} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    className="w-full text-left h-auto p-3 text-xs md:text-sm text-white/90 hover:bg-green-500/20 hover:text-white transition-all duration-300 rounded-xl border border-white/10 hover:border-green-400/50"
                    onClick={() => setInputText(prompt)}
                  >
                    <span className="line-clamp-2">{prompt}</span>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* News Area */}
        <motion.div
          className="lg:col-span-3 order-1 lg:order-2"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="h-full flex flex-col bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            {/* News Items */}
            <ScrollArea className="flex-1 p-3 md:p-6" ref={scrollAreaRef}>
              <div className="space-y-4 md:space-y-6">
                <AnimatePresence>
                  {newsItems.map((item) => {
                    const categoryInfo = getCategoryInfo(item.category)
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ y: 50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -50, opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20 shadow-xl"
                      >
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className={`bg-gradient-to-r ${categoryInfo.color} p-2 rounded-lg shadow-lg`}>
                              <span className="text-base md:text-lg">{categoryInfo.icon}</span>
                            </div>
                            <div>
                              <Badge className={`bg-gradient-to-r ${categoryInfo.color} text-white text-xs`}>
                                {categoryInfo.name}
                              </Badge>
                              <p className="text-xs text-white/60 mt-1">{item.timestamp.toLocaleString("bn-BD")}</p>
                            </div>
                          </div>
                          {item.isGenerating && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse text-xs">
                              তৈরি হচ্ছে...
                            </Badge>
                          )}
                        </div>

                        <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 leading-tight">
                          {item.headline}
                        </h2>

                        {item.content && (
                          <div className="space-y-3 md:space-y-4">
                            <p className="text-white/90 leading-relaxed text-sm md:text-base">{item.content}</p>

                            {!item.isGenerating && (
                              <div className="flex gap-2 md:gap-3 pt-3 md:pt-4 border-t border-white/10">
                                <div className="relative">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 text-xs md:text-sm"
                                    onClick={() =>
                                      isSpeaking ? stopSpeaking() : speakNews(item.headline, item.content)
                                    }
                                  >
                                    {isSpeaking ? (
                                      <VolumeX className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                    ) : (
                                      <Volume2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                    )}
                                    {isSpeaking ? "থামান" : "উপস্থাপনা শুনুন"}
                                  </Button>
                                  <VoiceFeedback
                                    isSpeaking={isSpeaking}
                                    className="absolute inset-0 pointer-events-none"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 md:p-6 border-t border-white/20 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
              <div className="space-y-3 md:space-y-4">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="সংবাদের বিষয় বা প্রম্পট লিখুন..."
                  className="min-h-[80px] md:min-h-[100px] bg-white/10 border-white/20 focus:border-emerald-400 resize-none text-white placeholder:text-white/60 backdrop-blur-sm text-sm md:text-base"
                />
                <div className="flex gap-2 md:gap-3">
                  <div className="relative">
                    <Button
                      onClick={startSpeechRecognition}
                      disabled={isListening}
                      className={`p-2 md:p-3 ${
                        isListening
                          ? "bg-red-500 hover:bg-red-600 animate-pulse"
                          : "bg-gradient-to-r from-emerald-500 to-green-500 hover:opacity-90"
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
                    onClick={handleGenerateNews}
                    disabled={!inputText.trim() || isGenerating}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                    {isGenerating ? "সংবাদ তৈরি হচ্ছে..." : "সংবাদ তৈরি করুন"}
                  </Button>
                </div>
                {isListening && (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-xs md:text-sm text-emerald-200 animate-pulse flex items-center justify-center gap-2">
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
