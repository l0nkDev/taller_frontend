import { createTokens, createTamagui } from 'tamagui';
import { config } from '@tamagui/config/v3';
import { shorthands } from '@tamagui/shorthands';

const color = {
  amber50: '#fffbeb',
  amber200: '#fde68a',
  amber500: '#f59e0b',
  amber600: '#d97706',
  amber700: '#b45309',
  orange50: '#fff7ed',
  orange500: '#f97316',
  white: '#ffffff',
  gray800: '#1f2937',
  gray600: '#4b5563',
};

const tokens = createTokens({
  ...config.tokens,
  color, // Note: Use 'color' here, not 'colorTokens'
});

const themes = {
  light: {
    background: color.white,
    color: color.gray800,
    borderColor: color.amber200,
    bgGradientStart: color.amber50,
    bgGradientEnd: color.orange50,
    cardBg: color.white,
    cardBorder: color.amber200,
    primaryText: color.gray800,
    secondaryText: color.gray600,
    brandAccent: color.amber600,
    brandMain: color.amber500,
  },
  dark: {
    background: '#1a1a1a',
    color: '#f3f4f6',
    borderColor: '#333333',
    bgGradientStart: '#1a1a1a',
    bgGradientEnd: '#121212',
    cardBg: '#242424',
    cardBorder: '#333333',
    primaryText: '#f3f4f6',
    secondaryText: '#9ca3af',
    brandAccent: color.amber500,
    brandMain: color.orange500,
  }
};

const appConfig = createTamagui({
  ...config,
  tokens,
  shorthands,
  themes,
});

export type AppConfig = typeof appConfig;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig;