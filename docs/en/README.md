<a id="translations"></a>
[CAT](/README.md) | **ENG** | [ESP](/docs/es/README.md)

<div align="center">
  <img width="200" src="https://raw.githubusercontent.com/GerardEst/moootbot/5f67d158453d6adbf42446fc138680f4f1f431c6/docs/moootbot_L.png" alt="Foto de perfil de moootbot">
</div>

# moootbot

**_Compete in monthly [Mooot](https://mooot.cat) leagues with friends._**

This bot transforms any Telegram group into an [Mooot](https://mooot.cat) competition, with a monthly leaderboard updated daily, awards for the best players, guest characters from Catalan culture, interesting data about the word...

[Add moootbot to a chat](https://t.me/moootbot?startgroup=true), but first, it's advisable to check the [data usage](#data-usage).

<br>

## How it works

Add moootbot to an existing chat by clicking the link: [Add moootbot to a chat](https://t.me/moootbot?startgroup=true)

or:

1. Create a Telegram group with the people you want to share games with
2. Add the "moootbot" bot _(Add member -> search "moootbot")_

<br>

**_The bot will start working in the background, turning the group into a league and adding the following features:_**

<br>

### 📊 Monthly player leaderboard

Whenever a chat member shares their game, _they are given a score ranging from 0_ (if they didn't find the word) _to 6_ (if they found it on the first try). This way _a leaderboard is generated with all chat members_. At the end of each month, awards are distributed to members who finished in the top 3 and a new league begins with scores reset to 0.

> The leaderboard can be checked at any time with the /classificacio command

<br>

### 🏆 Virtual awards and trophies system

On the last day of the month, trophies are awarded to the three best players. Trophies vary depending on the current league, with references to Catalan culture, and are independent between different leagues - that is, if you participate in several leagues, you only have the trophies within the chat of the league where you won them.

> Chat trophies can be checked at any time with the /premis command

<br>

### 🥸 Famous extras

Famous characters can be added who will play autonomously each day and score more or less depending on their skill - Jacint Verdaguer has a skill of 8/10 and will be very difficult to beat, while Rovelló will always be at the bottom of the leaderboard because after all, he's a dog.

> Characters can be added with the /extres command

<br>

### Global top

At any time you can check the _top 3_ of the current league among all participants from all chats.

> Can be checked with the /top command

<br>

### Automatic reactions to scores

When a game is shared, the bot reacts with an emoji to the message that varies depending on how good or bad the game is to give visual confirmation that the game has been registered correctly

<br>

## Available commands

- `/classificacio` - Shows the current league leaderboard
- `/puntatge` - Shows the points table
- `/extres` - Options to add characters to the game
- `/premis` - Check virtual trophies won and those at stake
- `/top` - Shows the top 3 players from all leagues

<br>

## Data usage

When adding the bot to a group, it is given access to all messages shared from that moment on. **If this weren't the case, it couldn't react or save the games shared with it.**

In any case, despite having theoretical access, **no message that is not a shared game or a bot command is consulted or saved**, as you can see in the source code.
