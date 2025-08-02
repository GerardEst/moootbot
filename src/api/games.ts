import { supabase } from '../lib/supabase.ts'
import { getSpainDateFromUTC } from '../bot/utils.ts'
import { getDateRangeForPeriod } from '../lib/timezones.ts'
import { Result, SBGameRecord, RankingEntry } from '../interfaces.ts'
import { createPlayerIfNotExist } from './players.ts'

export async function getAllUniqueGamesOfToday() {
  try {
    const { data, error } = await supabase.rpc(
      'get_all_user_punctuations_from_today'
    )

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error getting games', error)
    return []
  }
}

export async function getChatPunctuations(
  chatId: number,
  period: 'all' | 'month' | 'day',
  userId?: number
): Promise<SBGameRecord[]> {
  const dateRange = getDateRangeForPeriod(period)

  try {
    const { data, error } = userId
      ? await supabase
          .from('games_chats')
          .select(
            'user_id, users(name), character_id, characters(name), punctuation, time, created_at'
          )
          .eq('chat_id', chatId)
          .eq('user_id', userId)
          .gte('created_at', dateRange.from)
          .lte('created_at', dateRange.to)
          .order('punctuation', { ascending: false })
          .order('time', { ascending: true })
      : await supabase
          .from('games_chats')
          .select(
            'user_id, users(name), character_id, characters(name), punctuation, time, created_at'
          )
          .eq('chat_id', chatId)
          .gte('created_at', dateRange.from)
          .lte('created_at', dateRange.to)
          .order('punctuation', { ascending: false })
          .order('time', { ascending: true })

    if (error) throw error

    // SUPABASE BUG #01 - Selecting foreign keys expect an array of objects, but it is really returning a simple object
    return data as unknown as SBGameRecord[]
  } catch (error) {
    console.error('Error getting chat punctuations', error)
    return []
  }
}

export async function getChatRanking(
  chatId: number,
  period: 'all' | 'month' | 'day',
  userId?: number
) {
  const records = await getChatPunctuations(chatId, period, userId)
  return getCleanedRanking(records)
}

export async function createRecord({
  chatId,
  userId,
  userName,
  characterId,
  points,
  time,
}: {
  chatId: number
  userId?: number
  userName?: string
  characterId?: number
  points: number
  time: number
}) {
  if (userId)
    console.log(
      `Player ${userId}, ${userName} played on chat ${chatId} for +${points} points in ${time} seconds`
    )

  if (userId && userName) await createPlayerIfNotExist(userId, userName)

  try {
    const { error } = await supabase.from('games_chats').insert([
      {
        chat_id: chatId,
        user_id: userId || null,
        character_id: characterId || null,
        punctuation: points,
        time,
        game: 'mooot',
      },
    ])

    if (error) throw error
  } catch (error) {
    console.error('Error inserting new game', error)
  }
}

export async function getChats(): Promise<number[]> {
  try {
    const { data, error } = await supabase.rpc('get_unique_chat_ids')

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error getting unique chats', error)
    return []
  }
}

export async function getTopPlayersGlobal(): Promise<Result[]> {
  const dateRange = getDateRangeForPeriod('month')

  try {
    const { data, error } = await supabase
      .from('games_chats')
      .select('user_id, users(name), punctuation, time, created_at')
      .is('character_id', null)
      .gte('created_at', dateRange.from)
      .lte('created_at', dateRange.to)

    if (error) throw error

    // SUPABASE BUG #01
    const ranking = getCleanedRanking((data as unknown as SBGameRecord[]) || [])
    return ranking.slice(0, 3)
  } catch (error) {
    console.error('Error getting top players globally', error)
    return []
  }
}

export function getCleanedRanking(records: SBGameRecord[]): RankingEntry[] {
  const userPoints: Record<
    string,
    { id: number; name: string; total: number; totalTime: number }
  > = {}
  const processedUserDates: Record<string, Set<string>> = {}

  for (const record of records) {
    const userId = record.user_id || record.character_id
    const userName = record.users?.name || record.characters?.name
    const points = record.punctuation
    const time = record.time
    const recordInSpain = getSpainDateFromUTC(record.created_at)

    if (!userId || !userName) return []

    // Initialize user entry if it doesn't exist
    if (!userPoints[userId]) {
      userPoints[userId] = {
        id: userId,
        name: userName,
        total: 0,
        totalTime: 0,
      }
      processedUserDates[userId] = new Set()
    }

    const spainDateString = recordInSpain.toISOString().split('T')[0]

    // Only count this record if we haven't seen this Spain date for this user yet
    if (!processedUserDates[userId].has(spainDateString)) {
      userPoints[userId].total += points
      userPoints[userId].totalTime += time
      processedUserDates[userId].add(spainDateString)
    }
  }

  // Sort by points descending, then by total time ascending for tie-breaking
  const ranking = Object.values(userPoints).sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total
    }
    return a.totalTime - b.totalTime
  })

  // Remove totalTime from the final result to match RankingEntry interface
  return ranking.map(({ totalTime, ...entry }) => entry)
}
