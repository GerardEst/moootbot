export function getDaysRemainingInMonth() {
  const avui = new Date()
  const ultimDiaMes = new Date(
    avui.getFullYear(),
    avui.getMonth() + 1,
    0
  ).getDate()
  const diesRestants = ultimDiaMes - avui.getDate()

  return diesRestants
}

export function getCurrentMonth(): number {
  const now = new Date()
  return now.getMonth() + 1
}

export function isSummerTime() {
  const now = new Date()
  // Get the timezone offset for Spain at the current time
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Madrid',
    timeZoneName: 'longOffset',
  })
  const parts = formatter.formatToParts(now)
  const offset = parts.find((part) => part.type === 'timeZoneName')?.value

  // Summer time: GMT+02:00, Winter time: GMT+01:00
  return offset === 'GMT+02:00'
}

export function getSpainDateFromUTC(date: string) {
  // Convert UTC date to Spain date
  const utcDate = new Date(date)
  const hoursToAdd = isSummerTime() ? 2 : 1
  return new Date(utcDate.getTime() + hoursToAdd * 60 * 60 * 1000)
}

export function getPoints(message: string) {
  // Message format is "mooot 123\n🎯3/6\n⏱00:00:00\n"
  const tries = message.split('\n')[1]?.replace('🎯', '').split('/')[0].trim()

  if (tries === 'X') return 0

  const points = 6 - parseInt(tries)

  return points + 1
}

export function getTime(message: string) {
  // Message format is "mooot 123\n🎯3/6\n⏱00:00:00\n"
  const time = message.split('\n')[2]?.replace('⏱', '').trim()

  console.log('time: ' + time)

  if (!time || time.trim() === '') return 0

  const [hours, minutes, seconds] = time.split(':').map(Number)
  const totalSeconds = hours * 3600 + minutes * 60 + seconds

  return totalSeconds
}

export function getPointsForHability(hability: number) {
  const normalizedHability = hability / 10
  const rand = Math.random()
  const normalizedAction = normalizedHability * 0.7 + rand * 0.3

  if (normalizedAction < 0.1) {
    return 0
  } else if (normalizedAction < 0.3) {
    return 1
  } else if (normalizedAction < 0.5) {
    return 2
  } else if (normalizedAction < 0.7) {
    return 3
  } else if (normalizedAction < 0.9) {
    return 4
  } else if (normalizedAction < 0.98) {
    return 5
  } else {
    return 6
  }
}
