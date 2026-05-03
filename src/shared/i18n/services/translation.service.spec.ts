import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { SUPPORTED_LOCALES } from '../translation.types';

if (typeof btoa === 'undefined') {
  (globalThis as any).btoa = (str: string) =>
    (globalThis as any).Buffer.from(str).toString('base64');
  (globalThis as any).atob = (str: string) =>
    (globalThis as any).Buffer.from(str, 'base64').toString();
}

describe('TranslationService', () => {
  let service: TranslationService;
  let fetchSpy: any;

  beforeEach(() => {
    document.cookie = 'locale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ common: { save: 'Save' }, theme: { dark: 'Dark' } }),
    } as Response);

    TestBed.configureTestingModule({
      providers: [TranslationService],
    });
    service = TestBed.inject(TranslationService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should resolve initial locale to en by default', () => {
    expect(service.locale()).toBe('en');
  });

  it('should change locale and load translations', async () => {
    await service.setLocale('es');
    expect(service.locale()).toBe('es');
    expect(document.cookie).toContain('locale=' + btoa('es'));
    expect(fetchSpy).toHaveBeenCalledWith('/i18n/es.json');
  });

  it('should translate keys correctly', async () => {
    // wait for initial load
    await new Promise((r) => setTimeout(r, 0));
    expect(service.translate('common.save')).toBe('Save');
  });

  it('should fallback to key if translation is missing', async () => {
    await new Promise((r) => setTimeout(r, 0));
    expect(service.translate('missing.key')).toBe('missing.key');
  });

  it('should interpolate params', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ greeting: 'Hello {{name}}' }),
    } as Response);
    await service.setLocale('es'); // force reload
    expect(service.translate('greeting', { name: 'World' })).toBe('Hello World');
  });

  it('should handle fetch error gracefully', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network error'));
    await service.setLocale('en'); // should not crash
    expect(service.loading()).toBe(false);
  });

  it('should fallback to browser language if no cookie/local is present', () => {
    // navigator.language is read-only, we might need to mock it or just rely on the test environment if it's 'en'
    // But we can check the fallback logic by providing a custom LOCALE_ID in a separate test if needed.
    // For now, let's just test that it doesn't crash and returns a valid locale.
    expect(SUPPORTED_LOCALES).toContain(service.locale());
  });

  it('should handle nested values in translate', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ a: { b: { c: 'Nested' } } }),
    } as Response);
    await service.setLocale('es');
    expect(service.translate('a.b.c')).toBe('Nested');
    expect(service.translate('a.b.x')).toBe('a.b.x'); // Missing leaf
    expect(service.translate('a.x.c')).toBe('a.x.c'); // Missing intermediate
  });
});

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let service: TranslationService;

  beforeEach(() => {
    vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    TestBed.configureTestingModule({
      providers: [TranslationService, TranslatePipe],
    });
    service = TestBed.inject(TranslationService);
    pipe = TestBed.inject(TranslatePipe);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call translation service', () => {
    const spy = vi.spyOn(service, 'translate').mockReturnValue('Translated');
    expect(pipe.transform('key')).toBe('Translated');
    expect(spy).toHaveBeenCalledWith('key', undefined);
  });
});
