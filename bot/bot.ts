import { Bot, InlineKeyboard } from 'grammy';
import dotenv from 'dotenv';

dotenv.config();

// Читаем токен из окружения или хранилища
const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || '';
const webAppUrl = process.env.WEBAPP_URL || 'https://classic-games.pages.dev';

if (!token) {
  console.warn('⚠️ Внимание: TELEGRAM_BOT_TOKEN не задан. Бот готов к запуску после указания токена.');
}

export const bot = new Bot(token || 'dummy_token');

// Команда /start
bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .webApp('🕹️ Играть в Retro Arcade', webAppUrl)
    .row()
    .webApp('🐍 Snake II (3310)', `${webAppUrl}?startapp=game_snake2`)
    .webApp('🚀 Space Impact', `${webAppUrl}?startapp=game_space_impact`)
    .row()
    .webApp('📦 Stack Attack', `${webAppUrl}?startapp=game_stack_attack`)
    .webApp('⚪ Rapid Roll', `${webAppUrl}?startapp=game_rapid_roll`);

  const welcomeText = `
👋 **Добро пожаловать в Retro Cell Arcade!**

Полноценный музей и эмулятор легендарных игр эпохи кнопочных телефонов прямо в твоем Telegram:

📱 **Мокапы телефонов:**
• Nokia 3310 (легендарный синий корпус)
• Nokia 1100 (силиконовая клавиатура и фонарик)
• Siemens C45 (оранжевый круглый экран)
• Sony Ericsson T610 (джойстик и цветной TFT)

🎮 **Доступные игры:**
• 🐍 **Snake I & Snake II** (с лабиринтами и жуками!)
• 🐍 **Snake Xenzia** (классика Nokia 1100)
• 🐍 **Snake EX** (цветная змейка с фруктами)
• 🚀 **Space Impact** (лазеры, ракеты и боссы)
• ⚪ **Rapid Roll** (прыжки по платформам с шипами)
• 📦 **Stack Attack** (грузчик на складе Siemens)

Жми кнопку ниже, чтобы начать играть!
  `.trim();

  await ctx.reply(welcomeText, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

// Команда /games
bot.command('games', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .webApp('🎮 Открыть все игры', webAppUrl);

  await ctx.reply(
    '🕹️ **Все игры кнопочных телефонов:**\n\n' +
    '1. **Snake II** (Nokia 3310) — лабиринты и насекомые\n' +
    '2. **Snake I** (Nokia 6110) — классика 1997 года\n' +
    '3. **Snake Xenzia** (Nokia 1100) — фирменная сетка\n' +
    '4. **Snake EX** — цветная эволюция\n' +
    '5. **Space Impact** — космический шутер\n' +
    '6. **Rapid Roll** — падение шарика\n' +
    '7. **Stack Attack** — складской тетрис Siemens',
    { parse_mode: 'Markdown', reply_markup: keyboard }
  );
});

// Команда /help
bot.command('help', async (ctx) => {
  await ctx.reply(
    '🕹️ **Управление в играх:**\n\n' +
    '• **2, 4, 6, 8** — вверх, влево, вправо, вниз\n' +
    '• **5 / Navi-Key** — действие / огонь / старт\n' +
    '• **C** — сброс / выход\n' +
    '• В аркадном режиме доступны свайпы пальцем по экрану и экранный джойстик!',
    { parse_mode: 'Markdown' }
  );
});

if (token && process.env.NODE_ENV !== 'test') {
  bot.start({
    onStart: (botInfo) => {
      console.log(`🤖 Telegram-бот @${botInfo.username} успешно запущен!`);
    }
  });
}
