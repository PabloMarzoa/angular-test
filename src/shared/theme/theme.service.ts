import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

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
    this.document.defaultView?.localStorage.setItem('theme', next);
  }

  private applyTheme(theme: Theme): void {
    this.document.body.style.colorScheme = theme;
  }

  private resolveInitialTheme(): Theme {
    const stored = this.document.defaultView?.localStorage.getItem('theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
