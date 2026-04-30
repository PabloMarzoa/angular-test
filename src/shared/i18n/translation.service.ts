import { inject, Injectable, signal, computed, LOCALE_ID } from '@angular/core';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  SupportedLocale,
  Translations,
} from './translation.types';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly localeId = inject(LOCALE_ID);

  /** Currently active locale. */
  readonly locale = signal<SupportedLocale>(this.resolveInitialLocale());

  /** The loaded translation dictionary for the active locale. */
  private readonly translations = signal<Translations>({});

  /** Whether the translations are currently being loaded. */
  readonly loading = signal(false);

  /** Reactive locale label for display purposes. */
  readonly localeLabel = computed(() =>
    this.locale() === 'es' ? 'Español' : 'English',
  );

  constructor() {
    this.load(this.locale());
  }

  /**
   * Switch to a different locale, persisting the preference to localStorage.
   */
  async setLocale(locale: SupportedLocale): Promise<void> {
    if (this.locale() === locale) return;
    this.locale.set(locale);
    localStorage.setItem('locale', locale);
    await this.load(locale);
  }

  /**
   * Resolve a dot-notation key like `'common.save'` to its translated string.
   * Falls back to the key itself if not found.
   */
  translate(key: string, params?: Record<string, string | number>): string {
    const value = this.getNestedValue(this.translations(), key);
    if (value === undefined) return key;

    let result = String(value);
    if (params) {
      for (const [param, replacement] of Object.entries(params)) {
        result = result.replaceAll(`{{${param}}}`, String(replacement));
      }
    }
    return result;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async load(locale: SupportedLocale): Promise<void> {
    this.loading.set(true);
    try {
      const response = await fetch(`/i18n/${locale}.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as Translations;
      this.translations.set(data);
    } catch (err) {
      console.error(`[i18n] Failed to load locale "${locale}":`, err);
    } finally {
      this.loading.set(false);
    }
  }

  private resolveInitialLocale(): SupportedLocale {
    // 1. Persisted user preference
    const stored = localStorage.getItem('locale');
    if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) {
      return stored as SupportedLocale;
    }
    // 2. Angular LOCALE_ID (e.g. 'es-ES' → 'es')
    const angularLocale = this.localeId?.split('-')[0] as SupportedLocale;
    if (SUPPORTED_LOCALES.includes(angularLocale)) return angularLocale;
    // 3. Browser language
    const browserLocale = navigator.language?.split('-')[0] as SupportedLocale;
    if (SUPPORTED_LOCALES.includes(browserLocale)) return browserLocale;
    // 4. Hard default
    return DEFAULT_LOCALE;
  }

  private getNestedValue(obj: Translations, key: string): unknown {
    return key.split('.').reduce<unknown>((current, segment) => {
      if (current !== null && typeof current === 'object') {
        return (current as Record<string, unknown>)[segment];
      }
      return undefined;
    }, obj);
  }
}
