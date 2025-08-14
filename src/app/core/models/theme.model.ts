// Design Tokens interfaces following DTCG/W3C standards
// Reference: https://design-tokens.github.io/community-group/format/

export interface ThemeValue<T = string> {
  $value: T;
  $type?: string;
  $description?: string;
  $extensions?: Record<string, unknown>;
}

export interface ColorTokens {
  // Semantic color tokens
  primary: {
    50: ThemeValue;
    100: ThemeValue;
    200: ThemeValue;
    300: ThemeValue;
    400: ThemeValue;
    500: ThemeValue;
    600: ThemeValue;
    700: ThemeValue;
    800: ThemeValue;
    900: ThemeValue;
    950: ThemeValue;
  };
  secondary: {
    50: ThemeValue;
    100: ThemeValue;
    200: ThemeValue;
    300: ThemeValue;
    400: ThemeValue;
    500: ThemeValue;
    600: ThemeValue;
    700: ThemeValue;
    800: ThemeValue;
    900: ThemeValue;
    950: ThemeValue;
  };
  success: {
    50: ThemeValue;
    500: ThemeValue;
    600: ThemeValue;
  };
  warning: {
    50: ThemeValue;
    500: ThemeValue;
    600: ThemeValue;
  };
  error: {
    50: ThemeValue;
    500: ThemeValue;
    600: ThemeValue;
  };
  info: {
    50: ThemeValue;
    500: ThemeValue;
    600: ThemeValue;
  };
  // Neutral tokens
  neutral: {
    0: ThemeValue;
    50: ThemeValue;
    100: ThemeValue;
    200: ThemeValue;
    300: ThemeValue;
    400: ThemeValue;
    500: ThemeValue;
    600: ThemeValue;
    700: ThemeValue;
    800: ThemeValue;
    900: ThemeValue;
    950: ThemeValue;
    1000: ThemeValue;
  };
  // Surface tokens
  surface: {
    background: ThemeValue;
    foreground: ThemeValue;
    card: ThemeValue;
    popover: ThemeValue;
    muted: ThemeValue;
    'muted-foreground': ThemeValue;
    accent: ThemeValue;
    'accent-foreground': ThemeValue;
    border: ThemeValue;
    ring: ThemeValue;
  };
}

export interface RadiusTokens {
  none: ThemeValue;
  sm: ThemeValue;
  md: ThemeValue;
  lg: ThemeValue;
  xl: ThemeValue;
  '2xl': ThemeValue;
  '3xl': ThemeValue;
  full: ThemeValue;
}

export interface FontTokens {
  family: {
    sans: ThemeValue;
    serif: ThemeValue;
    mono: ThemeValue;
  };
  size: {
    xs: ThemeValue;
    sm: ThemeValue;
    base: ThemeValue;
    lg: ThemeValue;
    xl: ThemeValue;
    '2xl': ThemeValue;
    '3xl': ThemeValue;
    '4xl': ThemeValue;
    '5xl': ThemeValue;
    '6xl': ThemeValue;
    '7xl': ThemeValue;
    '8xl': ThemeValue;
    '9xl': ThemeValue;
  };
  weight: {
    thin: ThemeValue<number>;
    extralight: ThemeValue<number>;
    light: ThemeValue<number>;
    normal: ThemeValue<number>;
    medium: ThemeValue<number>;
    semibold: ThemeValue<number>;
    bold: ThemeValue<number>;
    extrabold: ThemeValue<number>;
    black: ThemeValue<number>;
  };
  lineHeight: {
    none: ThemeValue<number>;
    tight: ThemeValue<number>;
    snug: ThemeValue<number>;
    normal: ThemeValue<number>;
    relaxed: ThemeValue<number>;
    loose: ThemeValue<number>;
  };
}

export interface SpacingTokens {
  0: ThemeValue;
  1: ThemeValue;
  2: ThemeValue;
  3: ThemeValue;
  4: ThemeValue;
  5: ThemeValue;
  6: ThemeValue;
  7: ThemeValue;
  8: ThemeValue;
  9: ThemeValue;
  10: ThemeValue;
  11: ThemeValue;
  12: ThemeValue;
  14: ThemeValue;
  16: ThemeValue;
  20: ThemeValue;
  24: ThemeValue;
  28: ThemeValue;
  32: ThemeValue;
  36: ThemeValue;
  40: ThemeValue;
  44: ThemeValue;
  48: ThemeValue;
  52: ThemeValue;
  56: ThemeValue;
  60: ThemeValue;
  64: ThemeValue;
  72: ThemeValue;
  80: ThemeValue;
  96: ThemeValue;
}

export interface ComponentTokens {
  button: {
    height: {
      sm: ThemeValue;
      md: ThemeValue;
      lg: ThemeValue;
    };
    padding: {
      sm: ThemeValue;
      md: ThemeValue;
      lg: ThemeValue;
    };
    fontSize: {
      sm: ThemeValue;
      md: ThemeValue;
      lg: ThemeValue;
    };
  };
  input: {
    height: ThemeValue;
    padding: ThemeValue;
    borderWidth: ThemeValue;
    fontSize: ThemeValue;
  };
  card: {
    padding: ThemeValue;
    borderWidth: ThemeValue;
    shadowColor: ThemeValue;
    shadowBlur: ThemeValue;
    shadowOffset: ThemeValue;
  };
  modal: {
    backdropColor: ThemeValue;
    maxWidth: ThemeValue;
    padding: ThemeValue;
  };
  navigation: {
    height: ThemeValue;
    padding: ThemeValue;
    itemPadding: ThemeValue;
  };
  sidebar: {
    width: ThemeValue;
    collapsedWidth: ThemeValue;
    padding: ThemeValue;
  };
}

export interface ThemeTokens {
  $schema?: string;
  $version?: string;
  $description?: string;
  color: ColorTokens;
  radius: RadiusTokens;
  font: FontTokens;
  spacing: SpacingTokens;
  component: ComponentTokens;
}

// Type utilities for theme consumption
export type FlattenedTokens = Record<string, string>;

export interface ThemeConfig {
  name: string;
  version: string;
  tokens: ThemeTokens;
}

export interface ThemeMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * A simplified theme structure for previewing color changes.
 * This is used by the ThemePreviewService and is intentionally
 * decoupled from the more complex ThemeTokens structure.
 */
export interface PreviewThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
}