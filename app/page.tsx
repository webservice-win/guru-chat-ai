"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  BookOpen,
  Newspaper,
  Mic,
  BarChart3,
  User,
  Settings,
  Sparkles,
  Zap,
  Brain,
  FileText,
  Globe,
  Star,
  Crown,
  AudioWaveformIcon as Waveform,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { VoiceAnalytics } from "@/components/voice-analytics"
import { VoiceProfiles } from "@/components/voice-profiles"
import { RealTimeTranscription } from "@/components/real-time-transcription"
import { EnhancedSpeechRecognition } from "@/components/enhanced-speech-recognition"

const features = [
  {
    id: "realtime-chat",
    title: "রিয়েলটাইম চ্যাট",
    description: "তাৎক্ষণিক AI সহায়তা পান",
    icon: MessageCircle,
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50",
    href: "/realtime-chat",
    premium: false,
  },
  {
    id: "story-poetry",
    title: "গল্প ও কবিতা",
    description: "সৃজনশীল সাহিত্য রচনা করুন",
    icon: BookOpen,
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50",
    href: "/story-poetry",
    premium: false,
  },
  {
    id: "news-presenter",
    title: "সংবাদ উপস্থাপন",
    description: "পেশাদার সংবাদ তৈরি করুন",
    icon: Newspaper,
    color: "from-emerald-500 to-green-500",
    bgColor: "from-emerald-50 to-green-50",
    href: "/news-presenter",
    premium: false,
  },
  {
    id: "voice-over",
    title: "ভয়েস ওভার স্টুডিও",
    description: "অডিও কন্টেন্ট তৈরি করুন",
    icon: Mic,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
    href: "/voice-over",
    premium: true,
  },
]

const professionalFeatures = [
  {
    id: "analytics",
    title: "ভয়েস অ্যানালিটিক্স",
    description: "বিস্তারিত ব্যবহার পরিসংখ্যান",
    icon: BarChart3,
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "profiles",
    title: "ভয়েস প্রোফাইল",
    description: "কাস্টম কণ্ঠস্বর সেটিংস",
    icon: User,
    color: "from-teal-500 to-cyan-500",
  },
  {
    id: "transcription",
    title: "রিয়েল-টাইম ট্রান্সক্রিপশন",
    description: "লাইভ টেক্সট রূপান্তর",
    icon: FileText,
    color: "from-rose-500 to-pink-500",
  },
  {
    id: "enhancement",
    title: "স্পিচ এনহান্সমেন্ট",
    description: "উন্নত বাংলা স্বীকৃতি",
    icon: Waveform,
    color: "from-amber-500 to-orange-500",
  },
]

export default function HomePage() {
  const [selectedTab, setSelectedTab] = useState("features")
  const [stats, setStats] = useState({
    totalUsers: 12547,
    totalSessions: 89234,
    accuracy: 94.2,
    languages: 3,
  })

  // Animate stats on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        totalUsers: 12547,
        totalSessions: 89234,
        accuracy: 94.2,
        languages: 3,
      })
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const renderTabContent = () => {
    switch (selectedTab) {
      case "analytics":
        return <VoiceAnalytics />
      case "profiles":
        return <VoiceProfiles />
      case "transcription":
        return <RealTimeTranscription />
      case "enhancement":
        return <EnhancedSpeechRecognition />
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="relative group"
                >
                  <Link href={feature.href}>
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:shadow-2xl bg-gradient-to-br ${feature.bgColor} border-0 overflow-hidden`}
                    >
                      {feature.premium && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            <Crown className="w-3 h-3 mr-1" />
                            প্রিমিয়াম
                          </Badge>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <CardHeader className="relative z-10">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <feature.icon className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                          {feature.description}
                        </p>
                        <div className="mt-4 flex items-center text-sm text-gray-500">
                          <Sparkles className="w-4 h-4 mr-1" />
                          AI পাওয়ার্ড
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg mb-8"
            >
              <Brain className="w-6 h-6" />
              বাংলার গুরু AI
              <Sparkles className="w-5 h-5" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              উন্নত বাংলা
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                AI চ্যাটবট
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              গল্প, কবিতা, সংবাদ এবং ভয়েস ওভার তৈরি করুন। রিয়েল-টাইম ট্রান্সক্রিপশন এবং উন্নত স্পিচ রিকগনিশন সহ।
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stats.totalUsers.toLocaleString()}+
                </div>
                <div className="text-gray-600">ব্যবহারকারী</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                  {stats.totalSessions.toLocaleString()}+
                </div>
                <div className="text-gray-600">সেশন</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">{stats.accuracy}%</div>
                <div className="text-gray-600">নির্ভুলতা</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">{stats.languages}+</div>
                <div className="text-gray-600">ভাষা</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-2">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "features", label: "মূল ফিচার", icon: Zap },
              { id: "analytics", label: "অ্যানালিটিক্স", icon: BarChart3 },
              { id: "profiles", label: "ভয়েস প্রোফাইল", icon: User },
              { id: "transcription", label: "ট্রান্সক্রিপশন", icon: FileText },
              { id: "enhancement", label: "স্পিচ এনহান্সমেন্ট", icon: Settings },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={selectedTab === tab.id ? "default" : "ghost"}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex-1 min-w-0 ${
                  selectedTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                } transition-all duration-300`}
              >
                <tab.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Professional Features Section */}
      {selectedTab === "features" && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">পেশাদার ফিচারসমূহ</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              উন্নত AI প্রযুক্তি এবং রিয়েল-টাইম প্রক্রিয়াকরণ সহ সম্পূর্ণ ভয়েস সলিউশন
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {professionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group cursor-pointer"
                onClick={() => setSelectedTab(feature.id)}
              >
                <Card className="h-full bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">বাংলার গুরু</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                বাংলা ভাষায় সবচেয়ে উন্নত AI চ্যাটবট। গল্প, কবিতা, সংবাদ এবং ভয়েস প্রযুক্তির সাথে আপনার সৃজনশীলতা বাড়ান।
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-green-500">
                  <Globe className="w-3 h-3 mr-1" />
                  অনলাইন
                </Badge>
                <Badge className="bg-blue-500">
                  <Star className="w-3 h-3 mr-1" />
                  4.9/5 রেটিং
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">ফিচারসমূহ</h4>
              <ul className="space-y-2 text-gray-300">
                <li>রিয়েলটাইম চ্যাট</li>
                <li>গল্প ও কবিতা</li>
                <li>সংবাদ উপস্থাপন</li>
                <li>ভয়েস ওভার</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">প্রো ফিচার</h4>
              <ul className="space-y-2 text-gray-300">
                <li>ভয়েস অ্যানালিটিক্স</li>
                <li>কাস্টম প্রোফাইল</li>
                <li>রিয়েল-টাইম ট্রান্সক্রিপশন</li>
                <li>স্পিচ এনহান্সমেন্ট</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; ২০২৪ বাংলার গুরু। সকল অধিকার সংরক্ষিত।</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
