import { createTokens, createTamagui } from 'tamagui';
import { config } from '@tamagui/config/v2';
import { shorthands } from '@tamagui/shorthands';

const color = {
  amber50: '#fffbeb',
  amber100: '#fef3c6',
  amber200: '#fee685',
  amber500: '#f59e0b',
  amber600: '#d97706',
  amber700: '#bb4d00',
  orange100: '#fef3c6',
  orange50: '#fff7ed',
  orange500: '#f97316',
  white: '#ffffff',
  gray800: '#1f2937',
  gray600: '#4b5563',
  gray200: '#e5e7eb',
  green700: '#008236',
  green100: '#dcfce7',
  red700: '#c10007',
  red100: '#ffe2e2',
  buttonGreen: '#2ecc71',
  buttonRed: '#fb2c36',
};

const tokens = createTokens({
  ...config.tokens,
  color,
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
  animations: config.animations,
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