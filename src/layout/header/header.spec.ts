import { TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header';
import { ThemeService } from '../../shared/theme/theme.service';
import { TranslationService } from '../../shared/i18n/services/translation.service';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('HeaderComponent', () => {
  let themeSpy: any;
  let i18nSpy: any;

  beforeEach(async () => {
    themeSpy = {
      theme: vi.fn().mockReturnValue('light'),
      toggle: vi.fn(),
    };

    i18nSpy = {
      locale: vi.fn().mockReturnValue('en'),
      setLocale: vi.fn(),
      translate: vi.fn().mockReturnValue('Translated'),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, NoopAnimationsModule],
      providers: [
        { provide: ThemeService, useValue: themeSpy },
        { provide: TranslationService, useValue: i18nSpy },
      ],
    }).compileComponents();
  });

  it('should toggle theme on button click', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button[mat-icon-button]'));
    btn.triggerEventHandler('click', null);

    expect(themeSpy.toggle).toHaveBeenCalled();
  });

  it('should switch locale on select change', async () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const select = fixture.debugElement.query(By.css('mat-select'));
    select.triggerEventHandler('valueChange', 'es');

    expect(i18nSpy.setLocale).toHaveBeenCalledWith('es');
  });

  it('should render dark mode icon when theme is dark', () => {
    themeSpy.theme.mockReturnValue('dark');
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.css('mat-icon')).nativeElement;
    expect(icon.textContent.trim()).toBe('light_mode');
  });
});
