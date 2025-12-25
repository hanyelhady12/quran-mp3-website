'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2, Repeat, Shuffle, List } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

interface Surah {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  revelationType: string
  ayahs: number
}

interface Reciter {
  id: string
  name: string
  url: string
}

const reciters: Reciter[] = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', url: 'https://everyayah.com/data/Alafasy_128kbps' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', url: 'https://everyayah.com/data/Husary_128kbps' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq El-Minshawi', url: 'https://everyayah.com/data/Minshawi_128kbps' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)', url: 'https://everyayah.com/data/Abdul_Basit_Murattal_128kbps' },
  { id: 'ar.sudais', name: 'Abdur-Rahman As-Sudais', url: 'https://everyayah.com/data/Sudais_128kbps' },
  { id: 'ar.shatri', name: 'Abu Bakr Ash-Shatri', url: 'https://everyayah.com/data/Shatri_128kbps' },
  { id: 'ar.abdurrahmaanassudais', name: 'Saad Al-Ghamdi', url: 'https://everyayah.com/data/Ghamadi_128kbps' },
  { id: 'ar.mahermuaiqly', name: 'Maher Al-Muaiqly', url: 'https://everyayah.com/data/Muaiqly_128kbps' },
]

export default function QuranPlayer() {
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(reciters[0])
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null)
  const [currentAyah, setCurrentAyah] = useState<number>(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, durationSet] = useState(0)
  const [volume, setVolume] = useState([75])
  const [repeatSurah, setRepeatSurah] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    fetchSurahs()
  }, [])

  const fetchSurahs = async () => {
    try {
      const response = await fetch('/api/quran/surahs')
      const data = await response.json()
      setSurahs(data)
    } catch (error) {
      console.error('Error fetching surahs:', error)
    }
  }

  const getAudioUrl = (surahNumber: number, ayahNumber: number) => {
    const paddedSurah = String(surahNumber).padStart(3, '0')
    const paddedAyah = String(ayahNumber).padStart(3, '0')
    return `${selectedReciter.url}/${paddedSurah}${paddedAyah}.mp3`
  }

  const playSurah = (surah: Surah) => {
    setSelectedSurah(surah)
    setCurrentAyah(1)
    setIsLoading(true)
    setIsPlaying(false)

    if (audioRef.current) {
      audioRef.current.src = getAudioUrl(surah.number, 1)
      audioRef.current.load()
    }
  }

  const playAyah = (surah: Surah, ayah: number) => {
    setSelectedSurah(surah)
    setCurrentAyah(ayah)
    setIsLoading(true)
    setIsPlaying(false)

    if (audioRef.current) {
      audioRef.current.src = getAudioUrl(surah.number, ayah)
      audioRef.current.load()
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const playPrevious = () => {
    if (selectedSurah) {
      if (currentAyah > 1) {
        playAyah(selectedSurah, currentAyah - 1)
      } else if (selectedSurah.number > 1) {
        playSurah(surahs[selectedSurah.number - 2])
      }
    }
  }

  const playNext = () => {
    if (selectedSurah) {
      if (currentAyah < selectedSurah.ayahs) {
        playAyah(selectedSurah, currentAyah + 1)
      } else if (selectedSurah.number < 114) {
        if (repeatSurah) {
          playSurah(selectedSurah)
        } else {
          playSurah(surahs[selectedSurah.number])
        }
      }
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      durationSet(audioRef.current.duration)
      setIsLoading(false)
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url('/quran-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b bg-white/90 backdrop-blur-md sticky top-0 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-emerald-900">القرآن الكريم</h1>
              <p className="text-sm text-muted-foreground mt-1">Noble Quran - Listen with Multiple Reciters</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 md:w-64">
                <label className="text-sm font-medium text-emerald-700 block mb-2">Select Reciter</label>
                <Select value={selectedReciter.id} onValueChange={(value) => {
                  const reciter = reciters.find(r => r.id === value)
                  if (reciter) {
                    setSelectedReciter(reciter)
                    if (selectedSurah) {
                      playAyah(selectedSurah, currentAyah)
                    }
                  }
                }}>
                  <SelectTrigger className="bg-white border-emerald-200">
                    <SelectValue placeholder="Choose a reciter" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {reciters.map((reciter) => (
                      <SelectItem key={reciter.id} value={reciter.id}>
                        {reciter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Surah List */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-emerald-200">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="text-emerald-900 flex items-center gap-2">
                  <List className="h-5 w-5" />
                  114 Surahs
                </CardTitle>
                <CardDescription>Click on a surah to play from the beginning</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="divide-y divide-emerald-100">
                    {surahs.length === 0 ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                      </div>
                    ) : (
                      surahs.map((surah) => (
                        <button
                          key={surah.number}
                          onClick={() => playSurah(surah)}
                          className={`w-full p-4 text-left hover:bg-emerald-50 transition-colors flex items-center gap-4
                            ${selectedSurah?.number === surah.number ? 'bg-emerald-100 border-r-4 border-emerald-600' : ''}`}
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {surah.number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-emerald-900">{surah.name}</h3>
                                <p className="text-sm text-muted-foreground">{surah.englishName}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-medium text-emerald-700">{surah.ayahs} Ayahs</p>
                                <p className="text-xs text-muted-foreground">{surah.revelationType}</p>
                              </div>
                              {selectedSurah?.number === surah.number && isPlaying && (
                                <div className="flex-shrink-0">
                                  <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Current Playing Info */}
          <div className="lg:col-span-1">
            <Card className="bg-white/95 backdrop-blur-md shadow-2xl sticky top-24 border-emerald-200">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="text-emerald-900">Now Playing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {selectedSurah ? (
                  <>
                    <div className="text-center space-y-3">
                      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-bold text-white">{selectedSurah.number}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-emerald-900">{selectedSurah.name}</h3>
                        <p className="text-muted-foreground">{selectedSurah.englishName}</p>
                        <p className="text-lg font-semibold text-emerald-700 mt-2">
                          Ayah {currentAyah} of {selectedSurah.ayahs}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedSurah.revelationType}
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Volume2 className="h-4 w-4" />
                        <span>{selectedReciter.name}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={1}
                        onValueChange={handleSeek}
                        className="cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Player Controls */}
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={playPrevious}
                        disabled={!selectedSurah || (selectedSurah.number === 1 && currentAyah === 1)}
                        className="rounded-full border-emerald-200 hover:bg-emerald-50"
                      >
                        <SkipBack className="h-5 w-5 text-emerald-700" />
                      </Button>
                      <Button
                        size="icon"
                        onClick={togglePlayPause}
                        disabled={!selectedSurah || isLoading}
                        className="rounded-full w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg"
                      >
                        {isLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        ) : isPlaying ? (
                          <Pause className="h-6 w-6 text-white" />
                        ) : (
                          <Play className="h-6 w-6 text-white ml-1" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={playNext}
                        disabled={!selectedSurah || (selectedSurah.number === 114 && currentAyah === selectedSurah.ayahs)}
                        className="rounded-full border-emerald-200 hover:bg-emerald-50"
                      >
                        <SkipForward className="h-5 w-5 text-emerald-700" />
                      </Button>
                    </div>

                    {/* Repeat Button */}
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant={repeatSurah ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRepeatSurah(!repeatSurah)}
                        className={`rounded-full gap-2 ${repeatSurah ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-200 hover:bg-emerald-50'}`}
                      >
                        <Repeat className="h-4 w-4" />
                        <span>Repeat Surah</span>
                      </Button>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-3 px-4">
                      <Volume2 className="h-4 w-4 text-emerald-700 flex-shrink-0" />
                      <Slider
                        value={volume}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right">{volume[0]}%</span>
                    </div>

                    {/* Ayah Quick Navigation */}
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-emerald-700 mb-3">Quick Jump to Ayah</p>
                      <ScrollArea className="h-32">
                        <div className="grid grid-cols-7 gap-2">
                          {selectedSurah && Array.from({ length: Math.min(selectedSurah.ayahs, 50) }, (_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => playAyah(selectedSurah, i + 1)}
                              className={`p-2 text-sm rounded-lg transition-colors ${
                                currentAyah === i + 1
                                  ? 'bg-emerald-600 text-white font-bold'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                          {selectedSurah && selectedSurah.ayahs > 50 && (
                            <div className="col-span-7 text-center text-xs text-muted-foreground">
                              And {selectedSurah.ayahs - 50} more ayahs...
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Play className="h-16 w-16 mx-auto mb-4 text-emerald-200" />
                    <p className="text-lg">Select a surah to begin</p>
                    <p className="text-sm mt-2">Choose from 114 chapters of the Holy Quran</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Footer */}
      <footer className="relative z-10 border-t bg-white/90 backdrop-blur-md mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p className="font-medium text-emerald-900">Quran MP3 Player • Complete Quran with Multiple Renowned Reciters</p>
          <p className="mt-2">Listen to the Holy Quran with beautiful recitations • Full audio support for all 114 surahs</p>
        </div>
      </footer>
    </div>
  )
}
