/**
 * Type declarations for Telegram Mini App WebApp API.
 * Ref: https://core.telegram.org/bots/webapps
 */

interface TelegramWebAppBackButton {
  isVisible: boolean;
  show(): void;
  hide(): void;
  onClick(cb: () => void): void;
  offClick(cb: () => void): void;
}

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  colorScheme: "dark" | "light";
  themeParams: Record<string, string>;
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    auth_date?: number;
    hash?: string;
  };
  BackButton: TelegramWebAppBackButton;
  onEvent(eventType: string, eventHandler: () => void): void;
  offEvent(eventType: string, eventHandler: () => void): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export {};
