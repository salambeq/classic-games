// Фасад для работы с Telegram Mini App WebApp API
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  openTelegramLink: (url: string) => void;
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

class TelegramService {
  private get tg(): TelegramWebApp | undefined {
    return typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
  }

  public isAvailable(): boolean {
    return Boolean(this.tg);
  }

  public init() {
    if (this.tg) {
      try {
        this.tg.ready();
        this.tg.expand();
        this.tg.setHeaderColor('#121417');
        this.tg.setBackgroundColor('#121417');
      } catch (e) {
        console.warn('Telegram WebApp init error:', e);
      }
    }
  }

  public getUser(): TelegramUser | null {
    return this.tg?.initDataUnsafe?.user || null;
  }

  public getInitData(): string {
    return this.tg?.initData || '';
  }

  public getStartParam(): string | undefined {
    return this.tg?.initDataUnsafe?.start_param;
  }

  public hapticImpact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
    if (this.tg?.HapticFeedback) {
      try {
        this.tg.HapticFeedback.impactOccurred(style);
      } catch (e) {
        // Fallback игнорируем
      }
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(style === 'heavy' ? 30 : style === 'medium' ? 15 : 8);
      } catch (_) {}
    }
  }

  public hapticNotification(type: 'error' | 'success' | 'warning') {
    if (this.tg?.HapticFeedback) {
      try {
        this.tg.HapticFeedback.notificationOccurred(type);
      } catch (e) {}
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(type === 'error' ? [40, 30, 40] : [20, 20]);
      } catch (_) {}
    }
  }

  public hapticSelection() {
    if (this.tg?.HapticFeedback) {
      try {
        this.tg.HapticFeedback.selectionChanged();
      } catch (e) {}
    }
  }

  public showBackButton(onClick: () => void) {
    if (this.tg?.BackButton) {
      this.tg.BackButton.show();
      this.tg.BackButton.onClick(onClick);
    }
  }

  public hideBackButton() {
    if (this.tg?.BackButton) {
      this.tg.BackButton.hide();
    }
  }

  public shareScore(gameName: string, score: number) {
    const text = `🐍 Мой рекорд в ${gameName}: ${score} очков!\nСможешь побить его на кнопочном телефоне?`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me')}&text=${encodeURIComponent(text)}`;
    if (this.tg?.openTelegramLink) {
      this.tg.openTelegramLink(shareUrl);
    } else if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank');
    }
  }
}

export const tma = new TelegramService();
