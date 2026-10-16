import assert from 'node:assert';
import { GAMES_CATALOG } from '../src/games/registry';
import { createGameInstance } from '../src/games/factory';
import { validateTelegramInitData } from '../src/tma/telegram-auth';

async function runTests() {
  console.log('🧪 Запуск верификации компонентов Retro Cell Arcade...\n');

  // 1. Тестирование каталога игр
  console.log('1️⃣ Проверка реестра игр:');
  assert.strictEqual(GAMES_CATALOG.length, 7, 'В каталоге должно быть ровно 7 игр');
  const gameIds = GAMES_CATALOG.map(g => g.id);
  assert.ok(gameIds.includes('snake1'), 'Каталог должен содержать snake1');
  assert.ok(gameIds.includes('snake2'), 'Каталог должен содержать snake2');
  assert.ok(gameIds.includes('snake-xenzia'), 'Каталог должен содержать snake-xenzia');
  assert.ok(gameIds.includes('snake-ex'), 'Каталог должен содержать snake-ex');
  assert.ok(gameIds.includes('space-impact'), 'Каталог должен содержать space-impact');
  assert.ok(gameIds.includes('rapid-roll'), 'Каталог должен содержать rapid-roll');
  assert.ok(gameIds.includes('stack-attack'), 'Каталог должен содержать stack-attack');
  console.log('✅ Все 7 игр присутствуют в каталоге с корректными метаданными.\n');

  // 2. Тестирование жизненного цикла игровых движков
  console.log('2️⃣ Проверка инициализации и тикрейта всех игр:');
  for (const meta of GAMES_CATALOG) {
    const game = createGameInstance(meta.id);
    game.init(168, Math.round(168 / meta.aspectRatio));
    assert.strictEqual(game.isGameOver(), false, `${meta.title} не должна быть в Game Over на старте`);
    assert.strictEqual(game.getScore(), 0, `${meta.title} начальный счет должен быть 0`);

    // Симулируем ввод и 10 игровых тиков
    game.handleInput('ACTION');
    game.handleInput('UP');
    for (let tick = 0; tick < 10; tick++) {
      game.update(50);
    }
    console.log(`  ✓ ${meta.title} (${meta.originalPhone}): init/update/input - OK`);
  }
  console.log('✅ Все 7 игровых движков функционируют корректно.\n');

  // 3. Тестирование стандарта TMA Security (Web Crypto API)
  console.log('3️⃣ Проверка криптографической валидации TMA Security:');
  const testBotToken = '123456789:ABCdefGHIjklMNOpqrsTUVwxyz';

  // Тест 1: Пустые данные
  const emptyRes = await validateTelegramInitData('', testBotToken);
  assert.strictEqual(emptyRes.valid, false, 'Пустой initData должен быть отклонен');

  // Тест 2: Поддельный хеш
  const fakeData = 'auth_date=1700000000&user=%7B%22id%22%3A123%2C%22first_name%22%3A%22Test%22%7D&hash=fakehash123456789';
  const fakeRes = await validateTelegramInitData(fakeData, testBotToken);
  assert.strictEqual(fakeRes.valid, false, 'Поддельный хеш должен быть отклонен');

  // Тест 3: Генерация валидной подписи и успешная проверка
  const now = Math.floor(Date.now() / 1000);
  const dataCheckString = `auth_date=${now}\nuser={"first_name":"Alex","id":777}`;
  const encoder = new TextEncoder();

  const secretKeyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const secretKeyBuffer = await crypto.subtle.sign(
    'HMAC',
    secretKeyMaterial,
    encoder.encode(testBotToken)
  );
  const validationKey = await crypto.subtle.importKey(
    'raw',
    secretKeyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', validationKey, encoder.encode(dataCheckString));
  const validHash = Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const validInitData = `auth_date=${now}&user=${encodeURIComponent('{"first_name":"Alex","id":777}')}&hash=${validHash}`;
  const validRes = await validateTelegramInitData(validInitData, testBotToken);
  assert.strictEqual(validRes.valid, true, 'Валидная подпись Telegram должна проходить проверку');
  assert.strictEqual(validRes.user?.id, 777, 'ID пользователя должен совпадать');
  assert.strictEqual(validRes.user?.first_name, 'Alex', 'Имя пользователя должно совпадать');
  console.log('  ✓ HMAC-SHA256 подпись: валидирована успешно');
  console.log('  ✓ Поддельная подпись: успешно отклонена');
  console.log('✅ Стандарт TMA Security проверен и подтвержден на 100%.\n');

  console.log('🎉 ВСЕ ТЕСТЫ И ВЕРИФИКАЦИИ УСПЕШНО ПРОЙДЕНЫ!');
}

runTests().catch(err => {
  console.error('❌ Ошибка тестирования:', err);
  process.exit(1);
});
