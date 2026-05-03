import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';

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
