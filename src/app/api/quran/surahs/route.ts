import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://api.alquran.cloud/v1/surah')
    if (!response.ok) {
      throw new Error('Failed to fetch surahs')
    }

    const data = await response.json()

    const surahs = data.data.map((surah: any) => ({
      number: surah.number,
      name: surah.name,
      englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      revelationType: surah.revelationType,
      ayahs: surah.numberOfAyahs,
    }))

    return NextResponse.json(surahs)
  } catch (error) {
    console.error('Error fetching surahs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch surahs' },
      { status: 500 }
    )
  }
}
