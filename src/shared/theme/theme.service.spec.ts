import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { ThemeService } from './theme.service';

if (typeof btoa === 'undefined') {
  (globalThis as any).btoa = (str: string) =>
    (globalThis as any).Buffer.from(str).toString('base64');
  (globalThis as any).atob = (str: string) =>
    (globalThis as any).Buffer.from(str, 'base64').toString();
}

const matchMediaStub =
  (matches: boolean) =>
  (_query: string): MediaQueryList =>
    ({
      matches,
      media: _query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;

describe('ThemeService', () => {
  let service: ThemeService;

  function configureModule(storedTheme?: string, prefersDark = false) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaStub(prefersDark),
    });

    if (storedTheme) {
      document.cookie = `theme=${btoa(storedTheme)}; path=/`;
    } else {
      document.cookie = 'theme=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  }

  afterEach(() => {
    document.cookie = 'theme=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.localStorage.removeItem('theme');
  });

  it('should default to light when no preference is stored', () => {
    configureModule();
    expect(service.theme()).toBe('light');
  });

  it('should restore a stored "dark" preference', () => {
    configureModule('dark');
    expect(service.theme()).toBe('dark');
  });

  it('should use dark when prefers-color-scheme is dark and nothing is stored', () => {
    configureModule(undefined, true);
    expect(service.theme()).toBe('dark');
  });

  it('should toggle from light to dark', () => {
    configureModule();
    expect(service.theme()).toBe('light');
    service.toggle();
    expect(service.theme()).toBe('dark');
  });

  it('should toggle from dark to light', () => {
    configureModule('dark');
    expect(service.theme()).toBe('dark');
    service.toggle();
    expect(service.theme()).toBe('light');
  });

  it('should persist the theme to cookie on toggle', () => {
    configureModule();
    service.toggle();
    expect(document.cookie).toContain('theme=' + btoa('dark'));
  });

  it('should apply color-scheme to document.body on toggle', () => {
    configureModule();
    service.toggle();
    const doc = TestBed.inject(DOCUMENT);
    expect(doc.body.style.colorScheme).toBe('dark');
  });
});
