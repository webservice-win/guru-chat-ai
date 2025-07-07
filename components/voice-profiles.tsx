"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Plus, Edit, Trash2, Play, Copy, Crown, Volume2, Clock, Star, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface VoiceProfile {
  id: string
  name: string
  description: string
  settings: {
    rate: number
    pitch: number
    volume: number
    voice: string
  }
  isPremium: boolean
  isDefault: boolean
  isActive: boolean
  createdAt: Date
  lastUsed?: Date
  usageCount: number
  tags: string[]
}

const defaultProfiles: VoiceProfile[] = [
  {
    id: "default",
    name: "স্ট্যান্ডার্ড",
    description: "সাধারণ ব্যবহারের জন্য আদর্শ কণ্ঠস্বর",
    settings: { rate: 1.0, pitch: 1.0, volume: 1.0, voice: "bn-BD" },
    isPremium: false,
    isDefault: true,
    isActive: true,
    createdAt: new Date(),
    usageCount: 0,
    tags: ["সাধারণ", "দৈনন্দিন"],
  },
  {
    id: "news",
    name: "সংবাদ উপস্থাপক",
    description: "পেশাদার সংবাদ উপস্থাপনার জন্য",
    settings: { rate: 0.9, pitch: 1.0, volume: 1.0, voice: "bn-BD" },
    isPremium: false,
    isDefault: true,
    isActive: false,
    createdAt: new Date(),
    usageCount: 0,
    tags: ["সংবাদ", "পেশাদার"],
  },
  {
    id: "storyteller",
    name: "গল্পকার",
    description: "গল্প বলার জন্য আবেগময় কণ্ঠস্বর",
    settings: { rate: 0.8, pitch: 1.1, volume: 0.9, voice: "bn-BD" },
    isPremium: true,
    isDefault: true,
    isActive: false,
    createdAt: new Date(),
    usageCount: 0,
    tags: ["গল্প", "আবেগময়"],
  },
  {
    id: "commercial",
    name: "বিজ্ঞাপন",
    description: "বিজ্ঞাপন এবং প্রচারণার জন্য",
    settings: { rate: 1.1, pitch: 1.2, volume: 1.0, voice: "bn-BD" },
    isPremium: true,
    isDefault: true,
    isActive: false,
    createdAt: new Date(),
    usageCount: 0,
    tags: ["বিজ্ঞাপন", "উৎসাহী"],
  },
]

export function VoiceProfiles() {
  const [profiles, setProfiles] = useState<VoiceProfile[]>(defaultProfiles)
  const [selectedTab, setSelectedTab] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<VoiceProfile | null>(null)
  const [newProfile, setNewProfile] = useState<Partial<VoiceProfile>>({
    name: "",
    description: "",
    settings: { rate: 1.0, pitch: 1.0, volume: 1.0, voice: "bn-BD" },
    tags: [],
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isPlaying, setIsPlaying] = useState<string | null>(null)

  // Load profiles from localStorage on mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem("voice-profiles")
    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles)
        setProfiles([...defaultProfiles, ...parsed.filter((p: VoiceProfile) => !p.isDefault)])
      } catch (error) {
        console.error("Error loading profiles:", error)
      }
    }
  }, [])

  // Save profiles to localStorage
  const saveProfiles = useCallback((updatedProfiles: VoiceProfile[]) => {
    const customProfiles = updatedProfiles.filter((p) => !p.isDefault)
    localStorage.setItem("voice-profiles", JSON.stringify(customProfiles))
  }, [])

  const createProfile = useCallback(() => {
    if (!newProfile.name?.trim()) {
      toast.error("প্রোফাইলের নাম দিন")
      return
    }

    const profile: VoiceProfile = {
      id: Date.now().toString(),
      name: newProfile.name,
      description: newProfile.description || "",
      settings: newProfile.settings || { rate: 1.0, pitch: 1.0, volume: 1.0, voice: "bn-BD" },
      isPremium: false,
      isDefault: false,
      isActive: false,
      createdAt: new Date(),
      usageCount: 0,
      tags: newProfile.tags || [],
    }

    const updatedProfiles = [...profiles, profile]
    setProfiles(updatedProfiles)
    saveProfiles(updatedProfiles)
    setIsCreateDialogOpen(false)
    setNewProfile({
      name: "",
      description: "",
      settings: { rate: 1.0, pitch: 1.0, volume: 1.0, voice: "bn-BD" },
      tags: [],
    })
    toast.success("নতুন প্রোফাইল তৈরি হয়েছে")
  }, [newProfile, profiles, saveProfiles])

  const updateProfile = useCallback(
    (updatedProfile: VoiceProfile) => {
      const updatedProfiles = profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p))
      setProfiles(updatedProfiles)
      saveProfiles(updatedProfiles)
      setEditingProfile(null)
      toast.success("প্রোফাইল আপডেট হয়েছে")
    },
    [profiles, saveProfiles],
  )

  const deleteProfile = useCallback(
    (profileId: string) => {
      const profile = profiles.find((p) => p.id === profileId)
      if (profile?.isDefault) {
        toast.error("ডিফল্ট প্রোফাইল মুছে ফেলা যাবে না")
        return
      }

      const updatedProfiles = profiles.filter((p) => p.id !== profileId)
      setProfiles(updatedProfiles)
      saveProfiles(updatedProfiles)
      toast.success("প্রোফাইল মুছে ফেলা হয়েছে")
    },
    [profiles, saveProfiles],
  )

  const duplicateProfile = useCallback(
    (profile: VoiceProfile) => {
      const duplicated: VoiceProfile = {
        ...profile,
        id: Date.now().toString(),
        name: `${profile.name} (কপি)`,
        isDefault: false,
        isActive: false,
        createdAt: new Date(),
        usageCount: 0,
      }

      const updatedProfiles = [...profiles, duplicated]
      setProfiles(updatedProfiles)
      saveProfiles(updatedProfiles)
      toast.success("প্রোফাইল কপি করা হয়েছে")
    },
    [profiles, saveProfiles],
  )

  const activateProfile = useCallback(
    (profileId: string) => {
      const updatedProfiles = profiles.map((p) => ({
        ...p,
        isActive: p.id === profileId,
        lastUsed: p.id === profileId ? new Date() : p.lastUsed,
        usageCount: p.id === profileId ? p.usageCount + 1 : p.usageCount,
      }))
      setProfiles(updatedProfiles)
      saveProfiles(updatedProfiles)
      toast.success("প্রোফাইল সক্রিয় করা হয়েছে")
    },
    [profiles, saveProfiles],
  )

  const playPreview = useCallback((profile: VoiceProfile) => {
    if ("speechSynthesis" in window) {
      setIsPlaying(profile.id)
      const utterance = new SpeechSynthesisUtterance("এটি একটি ভয়েস প্রিভিউ। আপনার কণ্ঠস্বর এরকম শোনাবে।")
      utterance.lang = profile.settings.voice
      utterance.rate = profile.settings.rate
      utterance.pitch = profile.settings.pitch
      utterance.volume = profile.settings.volume
      utterance.onend = () => setIsPlaying(null)
      speechSynthesis.speak(utterance)
    }
  }, [])

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.description.toLowerCase().includes(searchQuery.toLowerCase())

    switch (selectedTab) {
      case "active":
        return matchesSearch && profile.isActive
      case "custom":
        return matchesSearch && !profile.isDefault
      case "premium":
        return matchesSearch && profile.isPremium
      default:
        return matchesSearch
    }
  })

  const ProfileCard = ({ profile }: { profile: VoiceProfile }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group"
    >
      <Card
        className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
          profile.isActive ? "ring-2 ring-blue-500 bg-blue-50" : "bg-white hover:bg-gray-50"
        }`}
      >
        {profile.isPremium && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              প্রিমিয়াম
            </Badge>
          </div>
        )}

        {profile.isActive && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-green-500 text-white animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              সক্রিয়
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-gray-900">{profile.name}</CardTitle>
              <p className="text-sm text-gray-600">{profile.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {profile.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Voice Settings Preview */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center p-2 bg-gray-100 rounded-lg">
              <div className="font-semibold text-gray-900">{profile.settings.rate}x</div>
              <div className="text-gray-600">গতি</div>
            </div>
            <div className="text-center p-2 bg-gray-100 rounded-lg">
              <div className="font-semibold text-gray-900">{profile.settings.pitch}</div>
              <div className="text-gray-600">পিচ</div>
            </div>
            <div className="text-center p-2 bg-gray-100 rounded-lg">
              <div className="font-semibold text-gray-900">{Math.round(profile.settings.volume * 100)}%</div>
              <div className="text-gray-600">ভলিউম</div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {profile.usageCount} বার ব্যবহৃত
            </div>
            {profile.lastUsed && <div>শেষ ব্যবহার: {profile.lastUsed.toLocaleDateString("bn-BD")}</div>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={profile.isActive ? "default" : "outline"}
              onClick={() => activateProfile(profile.id)}
              className="flex-1"
            >
              {profile.isActive ? (
                <>
                  <Star className="w-3 h-3 mr-1" />
                  সক্রিয়
                </>
              ) : (
                "ব্যবহার করুন"
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => playPreview(profile)}
              disabled={isPlaying === profile.id}
            >
              {isPlaying === profile.id ? <Volume2 className="w-3 h-3 animate-pulse" /> : <Play className="w-3 h-3" />}
            </Button>

            <Button size="sm" variant="outline" onClick={() => duplicateProfile(profile)}>
              <Copy className="w-3 h-3" />
            </Button>

            {!profile.isDefault && (
              <>
                <Button size="sm" variant="outline" onClick={() => setEditingProfile(profile)}>
                  <Edit className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteProfile(profile.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ভয়েস প্রোফাইল</h2>
          <p className="text-gray-600">আপনার কাস্টম কণ্ঠস্বর সেটিংস পরিচালনা করুন</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              নতুন প্রোফাইল
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>নতুন ভয়েস প্রোফাইল তৈরি করুন</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">নাম</Label>
                <Input
                  id="name"
                  value={newProfile.name || ""}
                  onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                  placeholder="প্রোফাইলের নাম"
                />
              </div>

              <div>
                <Label htmlFor="description">বিবরণ</Label>
                <Textarea
                  id="description"
                  value={newProfile.description || ""}
                  onChange={(e) => setNewProfile({ ...newProfile, description: e.target.value })}
                  placeholder="প্রোফাইলের বিবরণ"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label>গতি: {newProfile.settings?.rate || 1.0}x</Label>
                  <Slider
                    value={[newProfile.settings?.rate || 1.0]}
                    onValueChange={([value]) =>
                      setNewProfile({
                        ...newProfile,
                        settings: { ...newProfile.settings!, rate: value },
                      })
                    }
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>পিচ: {newProfile.settings?.pitch || 1.0}</Label>
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
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>ভলিউম: {Math.round((newProfile.settings?.volume || 1.0) * 100)}%</Label>
                  <Slider
                    value={[newProfile.settings?.volume || 1.0]}
                    onValueChange={([value]) =>
                      setNewProfile({
                        ...newProfile,
                        settings: { ...newProfile.settings!, volume: value },
                      })
                    }
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={createProfile} className="flex-1">
                  তৈরি করুন
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  বাতিল
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="প্রোফাইল খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 md:w-auto">
            <TabsTrigger value="all">সব</TabsTrigger>
            <TabsTrigger value="active">সক্রিয়</TabsTrigger>
            <TabsTrigger value="custom">কাস্টম</TabsTrigger>
            <TabsTrigger value="premium">প্রিমিয়াম</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredProfiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </AnimatePresence>
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">কোনো প্রোফাইল পাওয়া যায়নি</h3>
          <p className="text-gray-600 mb-4">আপনার অনুসন্ধান অনুযায়ী কোনো প্রোফাইল খুঁজে পাওয়া যায়নি।</p>
          <Button onClick={() => setSearchQuery("")} variant="outline">
            সব প্রোফাইল দেখুন
          </Button>
        </div>
      )}

      {/* Edit Profile Dialog */}
      {editingProfile && (
        <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>প্রোফাইল সম্পাদনা করুন</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">নাম</Label>
                <Input
                  id="edit-name"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-description">বিবরণ</Label>
                <Textarea
                  id="edit-description"
                  value={editingProfile.description}
                  onChange={(e) => setEditingProfile({ ...editingProfile, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label>গতি: {editingProfile.settings.rate}x</Label>
                  <Slider
                    value={[editingProfile.settings.rate]}
                    onValueChange={([value]) =>
                      setEditingProfile({
                        ...editingProfile,
                        settings: { ...editingProfile.settings, rate: value },
                      })
                    }
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>পিচ: {editingProfile.settings.pitch}</Label>
                  <Slider
                    value={[editingProfile.settings.pitch]}
                    onValueChange={([value]) =>
                      setEditingProfile({
                        ...editingProfile,
                        settings: { ...editingProfile.settings, pitch: value },
                      })
                    }
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>ভলিউম: {Math.round(editingProfile.settings.volume * 100)}%</Label>
                  <Slider
                    value={[editingProfile.settings.volume]}
                    onValueChange={([value]) =>
                      setEditingProfile({
                        ...editingProfile,
                        settings: { ...editingProfile.settings, volume: value },
                      })
                    }
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => updateProfile(editingProfile)} className="flex-1">
                  সংরক্ষণ করুন
                </Button>
                <Button variant="outline" onClick={() => setEditingProfile(null)}>
                  বাতিল
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
