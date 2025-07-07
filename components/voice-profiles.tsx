"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, Play, Pause, Plus, Volume2, Star, Crown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface VoiceProfile {
  id: string
  name: string
  description: string
  avatar: string
  settings: {
    rate: number
    pitch: number
    volume: number
    tone: "formal" | "casual" | "friendly" | "professional"
    accent: "dhaka" | "chittagong" | "sylhet" | "standard"
    emotion: "neutral" | "happy" | "calm" | "energetic"
  }
  isPremium: boolean
  isActive: boolean
  usageCount: number
  rating: number
}

const defaultProfiles: VoiceProfile[] = [
  {
    id: "1",
    name: "রহিমা আপা",
    description: "বন্ধুত্বপূর্ণ এবং সহায়ক কণ্ঠস্বর",
    avatar: "👩‍🏫",
    settings: {
      rate: 0.9,
      pitch: 1.1,
      volume: 0.9,
      tone: "friendly",
      accent: "standard",
      emotion: "happy",
    },
    isPremium: false,
    isActive: true,
    usageCount: 156,
    rating: 4.8,
  },
  {
    id: "2",
    name: "করিম ভাই",
    description: "পেশাদার সংবাদ উপস্থাপক",
    avatar: "👨‍💼",
    settings: {
      rate: 0.85,
      pitch: 0.9,
      volume: 1.0,
      tone: "professional",
      accent: "dhaka",
      emotion: "neutral",
    },
    isPremium: true,
    isActive: false,
    usageCount: 89,
    rating: 4.9,
  },
  {
    id: "3",
    name: "ফাতিমা",
    description: "গল্প বলার জন্য আদর্শ কণ্ঠ",
    avatar: "👧",
    settings: {
      rate: 0.8,
      pitch: 1.2,
      volume: 0.85,
      tone: "casual",
      accent: "sylhet",
      emotion: "calm",
    },
    isPremium: true,
    isActive: false,
    usageCount: 234,
    rating: 4.7,
  },
]

export function VoiceProfiles() {
  const [profiles, setProfiles] = useState<VoiceProfile[]>(defaultProfiles)
  const [selectedProfile, setSelectedProfile] = useState<VoiceProfile | null>(null)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProfile, setNewProfile] = useState<Partial<VoiceProfile>>({
    name: "",
    description: "",
    avatar: "👤",
    settings: {
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0,
      tone: "friendly",
      accent: "standard",
      emotion: "neutral",
    },
  })

  const activateProfile = (profileId: string) => {
    setProfiles(
      profiles.map((p) => ({
        ...p,
        isActive: p.id === profileId,
      })),
    )
  }

  const playVoicePreview = (profile: VoiceProfile) => {
    if (isPlaying === profile.id) {
      speechSynthesis.cancel()
      setIsPlaying(null)
      return
    }

    setIsPlaying(profile.id)
    const utterance = new SpeechSynthesisUtterance(`নমস্কার, আমি ${profile.name}। আমি আপনার ${profile.description}।`)
    utterance.lang = "bn-BD"
    utterance.rate = profile.settings.rate
    utterance.pitch = profile.settings.pitch
    utterance.volume = profile.settings.volume
    utterance.onend = () => setIsPlaying(null)
    speechSynthesis.speak(utterance)
  }

  const createProfile = () => {
    if (!newProfile.name || !newProfile.description) return

    const profile: VoiceProfile = {
      id: Date.now().toString(),
      name: newProfile.name,
      description: newProfile.description,
      avatar: newProfile.avatar || "👤",
      settings: newProfile.settings!,
      isPremium: false,
      isActive: false,
      usageCount: 0,
      rating: 0,
    }

    setProfiles([...profiles, profile])
    setIsCreateDialogOpen(false)
    setNewProfile({
      name: "",
      description: "",
      avatar: "👤",
      settings: {
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0,
        tone: "friendly",
        accent: "standard",
        emotion: "neutral",
      },
    })
  }

  const getToneLabel = (tone: string) => {
    const labels = {
      formal: "আনুষ্ঠানিক",
      casual: "অনানুষ্ঠানিক",
      friendly: "বন্ধুত্বপূর্ণ",
      professional: "পেশাদার",
    }
    return labels[tone as keyof typeof labels] || tone
  }

  const getAccentLabel = (accent: string) => {
    const labels = {
      dhaka: "ঢাকাইয়া",
      chittagong: "চট্টগ্রামী",
      sylhet: "সিলেটি",
      standard: "প্রমিত",
    }
    return labels[accent as keyof typeof labels] || accent
  }

  const getEmotionLabel = (emotion: string) => {
    const labels = {
      neutral: "নিরপেক্ষ",
      happy: "খুশি",
      calm: "শান্ত",
      energetic: "উৎসাহী",
    }
    return labels[emotion as keyof typeof labels] || emotion
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">ভয়েস প্রোফাইল</h2>
          <p className="text-gray-600">আপনার পছন্দের কণ্ঠস্বর নির্বাচন করুন</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              নতুন প্রোফাইল
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>নতুন ভয়েস প্রোফাইল তৈরি করুন</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>নাম</Label>
                  <Input
                    value={newProfile.name}
                    onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                    placeholder="প্রোফাইলের নাম"
                  />
                </div>
                <div className="space-y-2">
                  <Label>অবতার</Label>
                  <Select
                    value={newProfile.avatar}
                    onValueChange={(value) => setNewProfile({ ...newProfile, avatar: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="👤">👤 ডিফল্ট</SelectItem>
                      <SelectItem value="👩‍🏫">👩‍🏫 শিক্ষিকা</SelectItem>
                      <SelectItem value="👨‍💼">👨‍💼 পেশাদার</SelectItem>
                      <SelectItem value="👧">👧 তরুণী</SelectItem>
                      <SelectItem value="👦">👦 তরুণ</SelectItem>
                      <SelectItem value="👩‍⚕️">👩‍⚕️ ডাক্তার</SelectItem>
                      <SelectItem value="👨‍🎓">👨‍🎓 ছাত্র</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>বিবরণ</Label>
                <Textarea
                  value={newProfile.description}
                  onChange={(e) => setNewProfile({ ...newProfile, description: e.target.value })}
                  placeholder="এই প্রোফাইলের বিবরণ লিখুন"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>গতি: {newProfile.settings?.rate.toFixed(1)}x</Label>
                  <Slider
                    value={[newProfile.settings?.rate || 0.9]}
                    onValueChange={([value]) =>
                      setNewProfile({
                        ...newProfile,
                        settings: { ...newProfile.settings!, rate: value },
                      })
                    }
                    min={0.5}
                    max={2.0}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>পিচ: {newProfile.settings?.pitch.toFixed(1)}</Label>
                  <Slider
                    value={[newProfile.settings?.pitch || 1.0]}
                    onValueChange={([value]) =>
                      setNewProfile({
                        ...newProfile,
                        settings: { ...newProfile.settings!, pitch: value },
                      })
                    }
                    min={0.5}
                    max={2.0}
                    step={0.1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>টোন</Label>
                  <Select
                    value={newProfile.settings?.tone}
                    onValueChange={(value) =>
                      setNewProfile({
                        ...newProfile,
                        settings: { ...newProfile.settings!, tone: value as any },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">আনুষ্ঠানিক</SelectItem>
                      <SelectItem value="casual">অনানুষ্ঠানিক</SelectItem>
                      <SelectItem value="friendly">বন্ধুত্বপূর্ণ</SelectItem>
                      <SelectItem value="professional">পেশাদার</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>উচ্চারণ</Label>
                  <Select
                    value={newProfile.settings?.accent}
                    onValueChange={(value) =>
                      setNewProfile({
                        ...newProfile,
                        settings: { ...newProfile.settings!, accent: value as any },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">প্রমিত</SelectItem>
                      <SelectItem value="dhaka">ঢাকাইয়া</SelectItem>
                      <SelectItem value="chittagong">চট্টগ্রামী</SelectItem>
                      <SelectItem value="sylhet">সিলেটি</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>আবেগ</Label>
                  <Select
                    value={newProfile.settings?.emotion}
                    onValueChange={(value) =>
                      setNewProfile({
                        ...newProfile,
                        settings: { ...newProfile.settings!, emotion: value as any },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neutral">নিরপেক্ষ</SelectItem>
                      <SelectItem value="happy">খুশি</SelectItem>
                      <SelectItem value="calm">শান্ত</SelectItem>
                      <SelectItem value="energetic">উৎসাহী</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button onClick={createProfile}>তৈরি করুন</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {profiles.map((profile) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <Card
                className={`cursor-pointer transition-all duration-300 ${
                  profile.isActive
                    ? "ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-purple-50"
                    : "hover:shadow-lg"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{profile.avatar}</div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {profile.name}
                          {profile.isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{profile.description}</p>
                      </div>
                    </div>
                    {profile.isActive && <Badge className="bg-green-500">সক্রিয়</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Settings Preview */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">টোন:</span>
                      <span>{getToneLabel(profile.settings.tone)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">উচ্চারণ:</span>
                      <span>{getAccentLabel(profile.settings.accent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">আবেগ:</span>
                      <span>{getEmotionLabel(profile.settings.emotion)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ব্যবহার:</span>
                      <span>{profile.usageCount}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(profile.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">{profile.rating}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => playVoicePreview(profile)} className="flex-1">
                      {isPlaying === profile.id ? (
                        <Pause className="w-3 h-3 mr-1" />
                      ) : (
                        <Play className="w-3 h-3 mr-1" />
                      )}
                      {isPlaying === profile.id ? "থামান" : "শুনুন"}
                    </Button>
                    {!profile.isActive && (
                      <Button size="sm" onClick={() => activateProfile(profile.id)} className="flex-1">
                        <User className="w-3 h-3 mr-1" />
                        ব্যবহার করুন
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Active Profile Details */}
      {profiles.find((p) => p.isActive) && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              সক্রিয় প্রোফাইল সেটিংস
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const activeProfile = profiles.find((p) => p.isActive)!
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label>গতি: {activeProfile.settings.rate.toFixed(1)}x</Label>
                    <Slider
                      value={[activeProfile.settings.rate]}
                      onValueChange={([value]) => {
                        setProfiles(
                          profiles.map((p) =>
                            p.id === activeProfile.id ? { ...p, settings: { ...p.settings, rate: value } } : p,
                          ),
                        )
                      }}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>পিচ: {activeProfile.settings.pitch.toFixed(1)}</Label>
                    <Slider
                      value={[activeProfile.settings.pitch]}
                      onValueChange={([value]) => {
                        setProfiles(
                          profiles.map((p) =>
                            p.id === activeProfile.id ? { ...p, settings: { ...p.settings, pitch: value } } : p,
                          ),
                        )
                      }}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>ভলিউম: {Math.round(activeProfile.settings.volume * 100)}%</Label>
                    <Slider
                      value={[activeProfile.settings.volume]}
                      onValueChange={([value]) => {
                        setProfiles(
                          profiles.map((p) =>
                            p.id === activeProfile.id ? { ...p, settings: { ...p.settings, volume: value } } : p,
                          ),
                        )
                      }}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                    />
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
