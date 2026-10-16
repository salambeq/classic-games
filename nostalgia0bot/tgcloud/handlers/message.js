import { api } from 'sdk';

const APP_URL = 'https://app8636499227.tgcloud.ai';

export default async function (message) {
  const chatId = message.chat.id;

  const welcomeText = `
👋 *Добро пожаловать в Retro Cell Arcade!*

Легендарные игры эпохи кнопочных телефонов прямо в твоем Telegram:

📱 *Интерактивные мокапы:*
• Nokia 3310 (легендарный темно-синий корпус)
• Nokia 1100 (силиконовая клавиатура и фонарик)
• Siemens C45 (круглый янтарно-оранжевый экран)
• Sony Ericsson T610 (джойстик и цветной TFT)

🎮 *Все вариации змеек и хитов:*
• 🐍 *Snake II* (с лабиринтами и ползающими жуками!)
• 🐍 *Snake I (1997)* (классика Nokia 6110 со смертельными стенами)
• 🐍 *Snake Xenzia* (культовая змейка Nokia 1100)
• 🐍 *Snake EX (Color)* (цветная змейка с фруктами и бонусами)
• 🚀 *Space Impact* (лазеры, торпеды, пришельцы и боссы)
• ⚪ *Rapid Roll* (прыжки по поднимающимся платформам)
• 📦 *Stack Attack* (складской тетрис Siemens)

Нажми кнопку ниже, чтобы запустить телефон в руках!
  `.trim();

  await api.sendMessage({
    chat_id: chatId,
    text: welcomeText,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🕹️ Открыть Retro Arcade', web_app: { url: APP_URL } }
        ],
        [
          { text: '🐍 Snake II (3310)', web_app: { url: `${APP_URL}?startapp=game_snake2` } },
          { text: '🚀 Space Impact', web_app: { url: `${APP_URL}?startapp=game_space_impact` } }
        ],
        [
          { text: '📦 Stack Attack (Siemens)', web_app: { url: `${APP_URL}?startapp=game_stack_attack` } },
          { text: '⚪ Rapid Roll', web_app: { url: `${APP_URL}?startapp=game_rapid_roll` } }
        ]
      ]
    }
  });
}
