"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Clock, Users, Activity, Target, Award, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"

interface VoiceAnalytics {
  totalSessions: number
  totalDuration: number
  averageSessionLength: number
  recognitionAccuracy: number
  mostUsedFeatures: string[]
  dailyUsage: Array<{ date: string; sessions: number; duration: number }>
  languageDistribution: Array<{ language: string; percentage: number; color: string }>
  voiceQualityMetrics: {
    clarity: number
    volume: number
    speed: number
    pronunciation: number
  }
}

const mockAnalytics: VoiceAnalytics = {
  totalSessions: 247,
  totalDuration: 1840, // minutes
  averageSessionLength: 7.4,
  recognitionAccuracy: 94.2,
  mostUsedFeatures: ["রিয়েলটাইম চ্যাট", "গল্প তৈরি", "সংবাদ উপস্থাপন", "কবিতা রচনা"],
  dailyUsage: [
    { date: "সোম", sessions: 35, duration: 280 },
    { date: "মঙ্গল", sessions: 42, duration: 320 },
    { date: "বুধ", sessions: 38, duration: 290 },
    { date: "বৃহ", sessions: 45, duration: 350 },
    { date: "শুক্র", sessions: 52, duration: 380 },
    { date: "শনি", sessions: 28, duration: 180 },
    { date: "রবি", sessions: 25, duration: 160 },
  ],
  languageDistribution: [
    { language: "বাংলা", percentage: 85, color: "#10B981" },
    { language: "ইংরেজি", percentage: 12, color: "#3B82F6" },
    { language: "মিশ্র", percentage: 3, color: "#F59E0B" },
  ],
  voiceQualityMetrics: {
    clarity: 92,
    volume: 88,
    speed: 85,
    pronunciation: 90,
  },
}

export function VoiceAnalytics() {
  const [analytics, setAnalytics] = useState<VoiceAnalytics>(mockAnalytics)
  const [selectedPeriod, setSelectedPeriod] = useState("week")

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}ঘ ${mins}মি`
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 80) return "text-yellow-500"
    return "text-red-500"
  }

  const getQualityBg = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">মোট সেশন</p>
                  <p className="text-2xl font-bold text-blue-900">{analytics.totalSessions}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">মোট সময়</p>
                  <p className="text-2xl font-bold text-green-900">{formatDuration(analytics.totalDuration)}</p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">গড় সেশন</p>
                  <p className="text-2xl font-bold text-purple-900">{analytics.averageSessionLength}মি</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">নির্ভুলতা</p>
                  <p className="text-2xl font-bold text-orange-900">{analytics.recognitionAccuracy}%</p>
                </div>
                <div className="p-3 bg-orange-500 rounded-full">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usage">ব্যবহার</TabsTrigger>
          <TabsTrigger value="quality">গুণমান</TabsTrigger>
          <TabsTrigger value="features">ফিচার</TabsTrigger>
          <TabsTrigger value="language">ভাষা</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                দৈনিক ব্যবহার পরিসংখ্যান
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "sessions" ? `${value} সেশন` : `${value} মিনিট`,
                      name === "sessions" ? "সেশন" : "সময়",
                    ]}
                  />
                  <Bar dataKey="sessions" fill="#3B82F6" name="sessions" />
                  <Bar dataKey="duration" fill="#10B981" name="duration" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                ভয়েস গুণমান মেট্রিক্স
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(analytics.voiceQualityMetrics).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {key === "clarity" ? "স্পষ্টতা" : key === "volume" ? "ভলিউম" : key === "speed" ? "গতি" : "উচ্চারণ"}
                    </span>
                    <span className={`text-sm font-bold ${getQualityColor(value)}`}>{value}%</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>জনপ্রিয় ফিচার</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.mostUsedFeatures.map((feature, index) => (
                  <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <span className="font-medium">{feature}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={90 - index * 15} className="w-20 h-2" />
                      <span className="text-sm text-gray-600">{90 - index * 15}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ভাষা বিতরণ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.languageDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="percentage"
                    label={({ language, percentage }) => `${language} ${percentage}%`}
                  >
                    {analytics.languageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
