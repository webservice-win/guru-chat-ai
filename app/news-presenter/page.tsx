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
    }
    recognitionRef.current.onerror = () => setIsListening(false)
    recognitionRef.current.onend = () => setIsListening(false)
  }, [])

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
    } catch (error) {
      console.error("News generation error:", error)
      updateNewsItem(itemId, "ত্রুটি", "দুঃখিত, সংবাদ তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", false)
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
      recognitionRef.current.start()
    }
  }

  const speakNews = (headline: string, content: string) => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(true)
      const fullText = `${headline}। ${content}`
      const utterance = new SpeechSynthesisUtterance(fullText)
      utterance.lang = "bn-BD"
      utterance.rate = 0.85
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

  const getCategoryInfo = (category: string) => {
    return newsCategories.find((cat) => cat.id === category) || newsCategories[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 relative overflow-hidden">
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

      {/* Header */}
      <motion.div
        className="relative z-10 bg-gradient-to-r from-emerald-900/90 to-green-900/90 backdrop-blur-xl border-b border-white/20 shadow-2xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-4 p-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 transition-all duration-300">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 rounded-2xl shadow-xl">
            <Newspaper className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">সংবাদ উপস্থাপন</h1>
            <p className="text-emerald-200 text-sm">AI দিয়ে পেশাদার সংবাদ তৈরি করুন</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              onClick={() => setTeleprompterMode(!teleprompterMode)}
              className={`${teleprompterMode ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} transition-all duration-300`}
            >
              <Tv className="w-4 h-4 mr-2" />
              {teleprompterMode ? "টেলিপ্রম্পটার বন্ধ" : "টেলিপ্রম্পটার চালু"}
            </Button>
            <Badge className="bg-gradient-to-r from-red-400 to-orange-500 text-white">
              <Radio className="w-3 h-3 mr-1" />
              লাইভ
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
        {/* Categories & Prompts Sidebar */}
        <motion.div
          className="lg:col-span-1 space-y-6"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Categories */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Globe className="w-5 h-5 text-emerald-400" />
                সংবাদ বিভাগ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {newsCategories.map((category) => (
                <motion.div key={category.id} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className={`w-full text-left h-auto p-4 text-sm transition-all duration-300 rounded-xl border border-white/10 ${
                      selectedCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                        : "text-white/90 hover:bg-emerald-500/20 hover:text-white hover:border-emerald-400/50"
                    }`}
                    onClick={() => setSelectedCategory(category.id as any)}
                  >
                    <span className="text-lg mr-3">{category.icon}</span>
                    {category.name}
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Prompts */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Clock className="w-5 h-5 text-green-400" />
                দ্রুত প্রম্পট
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {newsPrompts.map((prompt, index) => (
                <motion.div key={index} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    className="w-full text-left h-auto p-3 text-sm text-white/90 hover:bg-green-500/20 hover:text-white transition-all duration-300 rounded-xl border border-white/10 hover:border-green-400/50"
                    onClick={() => setInputText(prompt)}
                  >
                    {prompt}
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* News Area */}
        <motion.div
          className="lg:col-span-3"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="h-full flex flex-col bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            {/* News Items */}
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
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
                        className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`bg-gradient-to-r ${categoryInfo.color} p-2 rounded-lg shadow-lg`}>
                              <span className="text-lg">{categoryInfo.icon}</span>
                            </div>
                            <div>
                              <Badge className={`bg-gradient-to-r ${categoryInfo.color} text-white`}>
                                {categoryInfo.name}
                              </Badge>
                              <p className="text-xs text-white/60 mt-1">{item.timestamp.toLocaleString("bn-BD")}</p>
                            </div>
                          </div>
                          {item.isGenerating && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">
                              তৈরি হচ্ছে...
                            </Badge>
                          )}
                        </div>

                        <h2 className="text-xl font-bold text-white mb-4 leading-tight">{item.headline}</h2>

                        {item.content && (
                          <div className="space-y-4">
                            <p className="text-white/90 leading-relaxed text-base">{item.content}</p>

                            {!item.isGenerating && (
                              <div className="flex gap-3 pt-4 border-t border-white/10">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
                                  onClick={() => (isSpeaking ? stopSpeaking() : speakNews(item.headline, item.content))}
                                >
                                  {isSpeaking ? (
                                    <VolumeX className="w-4 h-4 mr-2" />
                                  ) : (
                                    <Volume2 className="w-4 h-4 mr-2" />
                                  )}
                                  {isSpeaking ? "থামান" : "উপস্থাপনা শুনুন"}
                                </Button>
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
            <div className="p-6 border-t border-white/20 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
              <div className="space-y-4">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="সংবাদের বিষয় বা প্রম্পট লিখুন..."
                  className="min-h-[100px] bg-white/10 border-white/20 focus:border-emerald-400 resize-none text-white placeholder:text-white/60 backdrop-blur-sm"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={startSpeechRecognition}
                    disabled={isListening}
                    className={`p-3 ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 animate-pulse"
                        : "bg-gradient-to-r from-emerald-500 to-green-500 hover:opacity-90"
                    } transition-all duration-300 shadow-lg`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                  <Button
                    onClick={handleGenerateNews}
                    disabled={!inputText.trim() || isGenerating}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg disabled:opacity-50"
                  >
                    <Send className="w-5 h-5 mr-2" />
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
                    <p className="text-sm text-emerald-200 animate-pulse flex items-center justify-center gap-2">
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
