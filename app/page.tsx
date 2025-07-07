"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Mic,
  Newspaper,
  MessageCircle,
  Sparkles,
  Volume2,
  Bot,
  ArrowRight,
  Star,
  Zap,
  Brain,
  Headphones,
  Wand2,
  Globe,
  Heart,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

const aiModes = [
  {
    id: "story-poetry",
    title: "গল্প ও কবিতা তৈরি",
    description: "AI দিয়ে সৃজনশীল গল্প, কবিতা এবং সাহিত্য রচনা করুন",
    icon: BookOpen,
    gradient: "from-purple-600 via-pink-600 to-rose-500",
    bgGradient: "from-purple-50 to-pink-50",
    glowColor: "purple",
    features: ["স্মার্ট গল্প জেনারেশন", "কবিতা রচনা AI", "চরিত্র বিকাশ", "প্লট সাজেশন"],
    href: "/story-poetry",
    stats: "১০০+ টেমপ্লেট",
    particles: "purple",
  },
  {
    id: "voice-over",
    title: "ভয়েস ওভার স্টুডিও",
    description: "উন্নত AI ভয়েস সিনথেসিস দিয়ে পেশাদার অডিও তৈরি করুন",
    icon: Mic,
    gradient: "from-blue-600 via-cyan-600 to-teal-500",
    bgGradient: "from-blue-50 to-cyan-50",
    glowColor: "blue",
    features: ["HD ভয়েস কোয়ালিটি", "রিয়েল-টাইম প্রসেসিং", "মাল্টি-টোন সাপোর্ট", "অডিও এক্সপোর্ট"],
    href: "/voice-over",
    stats: "৯৯% নির্ভুলতা",
    particles: "blue",
  },
  {
    id: "news-presenter",
    title: "সংবাদ উপস্থাপন",
    description: "AI সহায়তায় পেশাদার সংবাদ উপস্থাপনা এবং রিপোর্টিং",
    icon: Newspaper,
    gradient: "from-emerald-600 via-green-600 to-teal-500",
    bgGradient: "from-emerald-50 to-green-50",
    glowColor: "emerald",
    features: ["স্মার্ট নিউজ রাইটিং", "টেলিপ্রম্পটার", "ফ্যাক্ট চেকিং", "লাইভ আপডেট"],
    href: "/news-presenter",
    stats: "২৪/৭ আপডেট",
    particles: "emerald",
  },
  {
    id: "realtime-chat",
    title: "রিয়েলটাইম চ্যাট",
    description: "উন্নত কনভার্সেশনাল AI দিয়ে তাৎক্ষণিক সহায়তা পান",
    icon: MessageCircle,
    gradient: "from-orange-600 via-red-600 to-pink-500",
    bgGradient: "from-orange-50 to-red-50",
    glowColor: "orange",
    features: ["ইনস্ট্যান্ট রেসপন্স", "কনটেক্সট মেমোরি", "ইমোশন ডিটেকশন", "মাল্টিমিডিয়া সাপোর্ট"],
    href: "/realtime-chat",
    stats: "<১ সেকেন্ড রেসপন্স",
    particles: "orange",
  },
]

const features = [
  {
    icon: Brain,
    title: "উন্নত AI ব্রেইন",
    description: "সর্বশেষ GPT প্রযুক্তি দিয়ে চালিত",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    icon: Volume2,
    title: "নেটিভ বাংলা ভয়েস",
    description: "প্রাকৃতিক বাংলা উচ্চারণ ও টোন",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Headphones,
    title: "স্পিচ রিকগনিশন",
    description: "উন্নত বাংলা ভাষা শনাক্তকরণ",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    icon: Zap,
    title: "রিয়েল-টাইম প্রসেসিং",
    description: "তাৎক্ষণিক AI রেসপন্স",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
]

const FloatingParticles = ({ color }: { color: string }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 bg-${color}-400 rounded-full opacity-30`}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, -100],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden font-bangla">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        {/* Multiple floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 4,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        className="relative z-10 glass-dark border-b border-white/10 shadow-2xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <motion.div
              className="flex justify-center items-center gap-4 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl animate-pulse-glow"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Bot className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 p-1 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-white animate-sparkle" />
                </motion.div>

                {/* Floating sparkles around the bot */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      top: `${20 + Math.sin(i * 60) * 30}px`,
                      left: `${20 + Math.cos(i * 60) * 30}px`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.h1
              className="text-6xl md:text-7xl font-bold bangla-heading mb-6"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent animate-gradient-shift">
                বাংলার গুরু AI
              </span>
            </motion.h1>

            <motion.p
              className="text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed bangla-text"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              অত্যাধুনিক কৃত্রিম বুদ্ধিমত্তা দিয়ে বাংলা ভাষায় সৃজনশীল কাজ করুন
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-4 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 text-sm font-medium bangla-text btn-glow">
                  <Star className="w-4 h-4 mr-2" />
                  প্রিমিয়াম AI টেকনোলজি
                </Badge>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 text-sm font-medium bangla-text btn-glow">
                  <Volume2 className="w-4 h-4 mr-2" />
                  নেটিভ বাংলা ভয়েস
                </Badge>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 text-sm font-medium bangla-text btn-glow">
                  <Headphones className="w-4 h-4 mr-2" />
                  স্পিচ রিকগনিশন
                </Badge>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* AI Modes Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {aiModes.map((mode, index) => {
            const IconComponent = mode.icon
            return (
              <motion.div
                key={mode.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onHoverStart={() => setHoveredCard(mode.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group relative"
              >
                <Card className="relative overflow-hidden glass border border-white/20 hover:border-white/40 transition-all duration-500 h-full card-hover">
                  {/* Floating particles */}
                  <AnimatePresence>
                    {hoveredCard === mode.id && <FloatingParticles color={mode.particles} />}
                  </AnimatePresence>

                  {/* Gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${mode.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  {/* Glow effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${mode.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
                    animate={hoveredCard === mode.id ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />

                  <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <motion.div
                        className={`p-4 rounded-2xl bg-gradient-to-r ${mode.gradient} shadow-2xl group-hover:shadow-3xl transition-shadow duration-500`}
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </motion.div>
                      <div className="text-right">
                        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                          <Badge variant="secondary" className="glass text-white border-white/30 mb-2 bangla-text">
                            {mode.stats}
                          </Badge>
                        </motion.div>
                        <motion.div
                          animate={{ x: hoveredCard === mode.id ? 5 : 0 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <ArrowRight className="w-6 h-6 text-white/60 group-hover:text-white transition-colors duration-300" />
                        </motion.div>
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white mb-3 bangla-heading">{mode.title}</CardTitle>
                    <CardDescription className="text-slate-300 text-base leading-relaxed bangla-text">
                      {mode.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {mode.features.map((feature, featureIndex) => (
                          <motion.div
                            key={featureIndex}
                            className="glass rounded-lg p-3 border border-white/20"
                            whileHover={{ scale: 1.05, y: -2 }}
                            transition={{ duration: 0.2 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ transitionDelay: `${featureIndex * 100}ms` }}
                          >
                            <span className="text-white/90 text-sm font-medium bangla-text">{feature}</span>
                          </motion.div>
                        ))}
                      </div>

                      <Link href={mode.href}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Button
                            className={`w-full bg-gradient-to-r ${mode.gradient} hover:opacity-90 transition-all duration-300 text-white font-semibold py-3 text-base shadow-xl hover:shadow-2xl btn-glow bangla-text`}
                          >
                            শুরু করুন
                            <motion.div
                              animate={{ x: hoveredCard === mode.id ? 5 : 0 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </motion.div>
                          </Button>
                        </motion.div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Enhanced Features Section */}
        <motion.div
          className="glass rounded-3xl p-12 border border-white/20 shadow-2xl relative overflow-hidden"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 animate-gradient-shift" />
          </div>

          <motion.h3
            className="text-4xl font-bold text-center text-white mb-12 bangla-heading"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            কেন বাংলার গুরু AI?
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <motion.div
                  key={index}
                  className="text-center group"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 2 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <div className="relative mb-6">
                    <motion.div
                      className={`glass w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-500 border border-white/20 ${feature.bgColor}/10`}
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <IconComponent
                        className={`w-10 h-10 ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                      />
                    </motion.div>

                    {/* Floating glow effect */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${feature.color.replace("text-", "from-")} to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                  </div>
                  <h4 className="font-bold text-white mb-3 text-lg bangla-heading">{feature.title}</h4>
                  <p className="text-slate-300 text-sm leading-relaxed bangla-text">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Enhanced Footer */}
      <motion.footer
        className="relative z-10 glass-dark border-t border-white/10 py-12 mt-20"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.4 }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            className="flex justify-center items-center gap-4 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Heart className="w-6 h-6 text-red-400 animate-pulse" />
            <Globe className="w-6 h-6 text-blue-400" />
            <Wand2 className="w-6 h-6 text-purple-400" />
          </motion.div>
          <p className="text-slate-300 text-lg bangla-text mb-2">বাংলার গুরু AI © ২০২৫ | আপনার বিশ্বস্ত কৃত্রিম বুদ্ধিমত্তা সহায়ক</p>
          <p className="text-slate-400 text-sm">Powered by Advanced AI Technology</p>
        </div>
      </motion.footer>
    </div>
  )
}
