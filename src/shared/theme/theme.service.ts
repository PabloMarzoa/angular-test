import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from '../services/storage.service';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageService = inject(StorageService);

  readonly theme = signal<Theme>('light');

  constructor() {
    const initial = this.resolveInitialTheme();
    this.theme.set(initial);
    this.applyTheme(initial);
  }

  toggle(): void {
    const next: Theme = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    this.applyTheme(next);
    this.storageService.setCookie('theme', next);
    this.storageService.removeLocal('theme');
  }

  private applyTheme(theme: Theme): void {
    this.document.body.style.colorScheme = theme;
  }

  private resolveInitialTheme(): Theme {
    // 1. Cookie preferred
    const storedCookie = this.storageService.getCookie('theme') as Theme | null;
    if (storedCookie === 'light' || storedCookie === 'dark') return storedCookie;

    // 2. LocalStorage fallback
    const storedLocal = this.storageService.getLocal<Theme>('theme');
    if (storedLocal === 'light' || storedLocal === 'dark') return storedLocal;

    // 3. System preference
    const prefersDark = this.document.defaultView?.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    return prefersDark ? 'dark' : 'light';
  }
}
