import * as api from './api/games.ts'
import * as awardsApi from './api/awards.ts'
import { sendCharactersActions, handleEndOfMonth } from './cronjobs/cronjobs.ts'
import { Bot } from 'https://deno.land/x/grammy/mod.ts'
import {
  buildFinalAdviseMessage,
  buildPunctuationTableMessage,
  buildRankingMessageFrom,
  buildAwardsMessage,
  buildCurrentAwardsMessage,
  buildTopMessage,
} from './bot/messages.ts'
import { sendWordInfo } from './scrapping/send-word-info.ts'

const DEV_CHAT_ID = parseInt(Deno.env.get('DEV_CHAT_ID')!)
const DEV_USER_ID = parseInt(Deno.env.get('DEV_USER_ID')!)

// CLI for sending specific messages to dev chat
// Specify the target chat ID in the first arg, if not specified, falls to DEV_CHAT_ID. This is which chat to take data from, it always will be sent to DEV_CHAT_ID.
if (import.meta.main) {
  const args = Deno.args
  const command = args[0]
  const bot = new Bot(Deno.env.get('TELEGRAM_TOKEN')!)

  if (command === 'send-classificacio') {
    const toChatId = parseInt(args[1]) || DEV_CHAT_ID

    const sendRanking = async (chatId: number) => {
      console.log(`Sending ranking of chat: ${chatId}`)
      const records = await api.getChatRanking(chatId, 'month')

      const message = buildRankingMessageFrom(records)

      await bot.api.sendMessage(DEV_CHAT_ID, message.text, {
        parse_mode: message.parse_mode,
      })
    }

    await takeAction(sendRanking, toChatId)
  }

  if (command === 'create-game-record') {
    const toChatId = parseInt(args[1]) || DEV_CHAT_ID

    let pointsPrompt = prompt('Points')
    if (!pointsPrompt) pointsPrompt = '1'
    const points = parseInt(pointsPrompt.trim())

    const createGameRecord = async (chatId: number) => {
      console.log(
        `Giving ${points} points to user ${DEV_USER_ID} in chat: ${chatId}`
      )

      await api.createRecord({ chatId, userId: DEV_USER_ID, points })
    }

    await takeAction(createGameRecord, toChatId)
  }

  if (command === 'send-llegenda') {
    console.log(`Sending punctuation table to dev chat: ${DEV_CHAT_ID}`)

    const sendPunctuationTable = async () => {
      const message = buildPunctuationTableMessage()

      await bot.api.sendMessage(DEV_CHAT_ID, message.text, {
        parse_mode: message.parse_mode,
      })
    }

    await sendPunctuationTable()
  }

  if (command === 'send-final-advise') {
    console.log(`Sending final advise to dev chat: ${DEV_CHAT_ID}`)

    const sendFinalAdvise = async () => {
      const message = buildFinalAdviseMessage()

      await bot.api.sendMessage(DEV_CHAT_ID, message.text, {
        parse_mode: message.parse_mode,
      })
    }

    await sendFinalAdvise()
  }

  if (command === 'give-award') {
    const toChatId = parseInt(args[1]) || DEV_CHAT_ID

    let trophyId = prompt('Trophy ID')
    if (!trophyId) trophyId = '1'
    trophyId = trophyId.trim()

    const giveAward = async (chatId: number) => {
      console.log(
        `Giving award ${trophyId} to user ${DEV_USER_ID} in dev chat: ${chatId}`
      )
      await awardsApi.giveAwardTo(chatId, DEV_USER_ID, parseInt(trophyId))
    }

    await takeAction(giveAward, toChatId)
  }

  if (command === 'check-group-awards') {
    const toChatId = parseInt(args[1]) || DEV_CHAT_ID

    const sendAwards = async (chatId: number) => {
      console.log(`Checking group awards of chat: ${chatId}`)
      const awards = await awardsApi.getAwardsOf(chatId)

      const message = buildAwardsMessage(awards)

      await bot.api.sendMessage(DEV_CHAT_ID, message.text, {
        parse_mode: message.parse_mode,
      })
    }

    await takeAction(sendAwards, toChatId)
  }

  if (command === 'send-current-awards') {
    const toChatId = parseInt(args[1]) || DEV_CHAT_ID

    const sendCurrentAwards = async (chatId: number) => {
      console.log(`Sending current awards to chat: ${chatId}`)
      const message = buildCurrentAwardsMessage()
      await bot.api.sendMessage(DEV_CHAT_ID, message.text, {
        parse_mode: message.parse_mode,
      })
    }

    await takeAction(sendCurrentAwards, toChatId)
  }

  if (command === 'send-top') {
    const topPlayers = await api.getTopPlayersGlobal()
    const message = buildTopMessage(topPlayers)
    await bot.api.sendMessage(DEV_CHAT_ID, message.text, {
      parse_mode: message.parse_mode,
    })
  }

  if (command === 'send-word-info') {
    const word = args[1]
    const toChatId = parseInt(args[2]) || DEV_CHAT_ID

    // If a word is specified, it will send info for that
    // If not, it will search for the last word
    sendWordInfo(word, toChatId)
  }

  if (command === 'send-word-info-prod') {
    const word = args[1]

    // If a word is specified, it will send info for that
    // If not, it will search for the last word
    sendWordInfo(word)
  }

  /*
   * CLI to simulate cronjobs
   *
   */

  if (command === 'simulate-end-of-month') {
    console.log(`Simulating end of month for dev chat: ${DEV_CHAT_ID}`)

    const simulateEndOfMonth = async () => {
      await handleEndOfMonth(bot, DEV_CHAT_ID)
    }

    await simulateEndOfMonth()
  }

  if (command === 'send-characters-actions') {
    console.log(`Sending characters actions to dev chat: ${DEV_CHAT_ID}`)

    await sendCharactersActions(bot, DEV_CHAT_ID)
  }

  if (command === 'send-characters-actions-prod') {
    const toChatId = parseInt(args[1])

    if (toChatId) {
      await sendCharactersActions(bot, toChatId)
    } else {
      console.log(`CAUTION: Sending characters actions to all chats`)

      //let continue = prompt('Are you sure?')

      await sendCharactersActions(bot)
    }
  }
}

function takeAction(
  action: (chatId: number) => Promise<void>,
  chatId: number | undefined
) {
  if (chatId) {
    return action(chatId)
  } else {
    console.log('Wrong chat ID, getting dev chat')
    return action(DEV_CHAT_ID)
  }
}
