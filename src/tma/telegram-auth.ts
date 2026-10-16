// Стандарт безопасности Telegram Mini App (TMA Security)
// Валидация подписи initData через Web Crypto API (crypto.subtle)

export interface ValidatedTelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  user?: ValidatedTelegramUser;
  auth_date?: number;
  error?: string;
}

/**
 * Валидация строки initData от Telegram WebApp
 * @param initData Raw query string from Telegram.WebApp.initData
 * @param botToken Секретный токен Telegram бота
 * @param maxAgeSeconds Максимальный возраст подписи (по умолчанию 24 часа = 86400 сек)
 */
export async function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds: number = 86400
): Promise<ValidationResult> {
  if (!initData || !botToken) {
    return { valid: false, error: 'Empty initData or botToken' };
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) {
      return { valid: false, error: 'Missing hash parameter' };
    }

    // Удаляем hash для формирования data-check-string
    urlParams.delete('hash');

    // Сортируем пары key=value в алфавитном порядке
    const items: string[] = [];
    urlParams.forEach((val, key) => {
      items.push(`${key}=${val}`);
    });
    items.sort();
    const dataCheckString = items.join('\n');

    const encoder = new TextEncoder();

    // 1. Создаем секретный ключ из botToken с использованием префикса "WebAppData"
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
      encoder.encode(botToken)
    );

    // 2. Создаем HMAC ключ из полученного секрета для проверки dataCheckString
    const validationKey = await crypto.subtle.importKey(
      'raw',
      secretKeyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      validationKey,
      encoder.encode(dataCheckString)
    );

    // 3. Конвертируем в hex
    const calculatedHash = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (calculatedHash.toLowerCase() !== hash.toLowerCase()) {
      return { valid: false, error: 'Invalid HMAC signature' };
    }

    // 4. Проверка времени auth_date (защита от replay-атак)
    const authDateStr = urlParams.get('auth_date');
    if (!authDateStr) {
      return { valid: false, error: 'Missing auth_date' };
    }

    const authDate = parseInt(authDateStr, 10);
    const now = Math.floor(Date.now() / 1000);

    if (now - authDate > maxAgeSeconds) {
      return { valid: false, error: 'Signature expired (older than 24h)' };
    }

    // 5. Парсинг данных пользователя
    const userJson = urlParams.get('user');
    let user: ValidatedTelegramUser | undefined;
    if (userJson) {
      try {
        user = JSON.parse(userJson);
      } catch (_) {}
    }

    return {
      valid: true,
      user,
      auth_date: authDate
    };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Validation failed' };
  }
}
