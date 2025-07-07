"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Clock, Mic, Users, Download, RefreshCw, Activity, Zap, Target } from "lucide-react"
import { motion } from "framer-motion"

interface AnalyticsData {
  totalSessions: number
  totalDuration: number
  averageAccuracy: number
  activeUsers: number
  dailyUsage: Array<{ date: string; sessions: number; duration: number }>
  topFeatures: Array<{ name: string; usage: number; growth: number }>
  voiceMetrics: {
    clarity: number
    speed: number
    pronunciation: number
    fluency: number
  }
}

export function VoiceAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalSessions: 0,
    totalDuration: 0,
    averageAccuracy: 0,
    activeUsers: 0,
    dailyUsage: [],
    topFeatures: [],
    voiceMetrics: {
      clarity: 0,
      speed: 0,
      pronunciation: 0,
      fluency: 0,
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("7d")

  useEffect(() => {
    // Simulate loading analytics data
    const loadData = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockData: AnalyticsData = {
        totalSessions: 1247,
        totalDuration: 18420, // minutes
        averageAccuracy: 94.2,
        activeUsers: 342,
        dailyUsage: [
          { date: "2024-01-01", sessions: 45, duration: 320 },
          { date: "2024-01-02", sessions: 52, duration: 380 },
          { date: "2024-01-03", sessions: 38, duration: 290 },
          { date: "2024-01-04", sessions: 61, duration: 420 },
          { date: "2024-01-05", sessions: 48, duration: 350 },
          { date: "2024-01-06", sessions: 55, duration: 390 },
          { date: "2024-01-07", sessions: 67, duration: 480 },
        ],
        topFeatures: [
          { name: "রিয়েলটাইম চ্যাট", usage: 45, growth: 12 },
          { name: "গল্প ও কবিতা", usage: 32, growth: 8 },
          { name: "সংবাদ উপস্থাপন", usage: 28, growth: 15 },
          { name: "ভয়েস ওভার", usage: 18, growth: 22 },
        ],
        voiceMetrics: {
          clarity: 92,
          speed: 88,
          pronunciation: 95,
          fluency: 89,
        },
      }

      setData(mockData)
      setIsLoading(false)
    }

    loadData()
  }, [selectedPeriod])

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}ঘ ${mins}মি`
  }

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`}
        />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {trend && (
              <Badge className={`${trend > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} border-0`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {trend > 0 ? "+" : ""}
                {trend}%
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const MetricBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}%</span>
      </div>
      <div className="relative">
        <Progress value={value} className="h-2" />
        <motion.div
          className={`absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"
            />
            <p className="text-gray-600 font-medium">অ্যানালিটিক্স লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ভয়েস অ্যানালিটিক্স</h2>
          <p className="text-gray-600">আপনার ভয়েস পারফরম্যান্স এবং ব্যবহারের বিস্তারিত পরিসংখ্যান</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {["7d", "30d", "90d"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={`${
                  selectedPeriod === period ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
                } transition-all duration-200`}
              >
                {period === "7d" ? "৭ দিন" : period === "30d" ? "৩০ দিন" : "৯০ দিন"}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            এক্সপোর্ট
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <RefreshCw className="w-4 h-4" />
            রিফ্রেশ
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="মোট সেশন"
          value={data.totalSessions.toLocaleString()}
          icon={Activity}
          trend={12}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="মোট সময়"
          value={formatDuration(data.totalDuration)}
          icon={Clock}
          trend={8}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="গড় নির্ভুলতা"
          value={`${data.averageAccuracy}%`}
          icon={Target}
          trend={3}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="সক্রিয় ব্যবহারকারী"
          value={data.activeUsers.toLocaleString()}
          icon={Users}
          trend={15}
          color="from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Usage Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                দৈনিক ব্যবহার
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.dailyUsage.map((day, index) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(day.date).toLocaleDateString("bn-BD")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">{day.sessions} সেশন</span>
                      <span className="text-gray-600">{formatDuration(day.duration)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Voice Metrics */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mic className="w-5 h-5 text-purple-600" />
                ভয়েস মেট্রিক্স
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <MetricBar label="স্বচ্ছতা" value={data.voiceMetrics.clarity} color="from-blue-500 to-blue-600" />
              <MetricBar label="গতি" value={data.voiceMetrics.speed} color="from-green-500 to-green-600" />
              <MetricBar label="উচ্চারণ" value={data.voiceMetrics.pronunciation} color="from-purple-500 to-purple-600" />
              <MetricBar label="প্রবাহ" value={data.voiceMetrics.fluency} color="from-orange-500 to-orange-600" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-yellow-600" />
              জনপ্রিয় ফিচার
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.topFeatures.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{feature.name}</h4>
                    <Badge className="bg-green-100 text-green-700 text-xs">+{feature.growth}%</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">ব্যবহার</span>
                      <span className="text-sm font-bold text-gray-900">{feature.usage}%</span>
                    </div>
                    <Progress value={feature.usage} className="h-1.5" />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
