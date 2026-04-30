export type SupportedLocale = 'en' | 'es';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'es'];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

/** Flat object of translation strings, keyed by dot-notation path. */
export type Translations = Record<string, unknown>;
