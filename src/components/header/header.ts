import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { ThemeService } from '../../shared/theme/theme.service';
import { TranslationService } from '../../shared/i18n/services/translation.service';
import { TranslatePipe } from '../../shared/i18n/pipes/translate.pipe';
import { SUPPORTED_LOCALES, SupportedLocale } from '../../shared/i18n/translation.types';
import { OnlineService } from '../../shared/network/online.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    TranslatePipe,
  ],
})
export class HeaderComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly i18n = inject(TranslationService);
  public readonly online = inject(OnlineService);

  protected readonly locales: SupportedLocale[] = SUPPORTED_LOCALES;

  protected readonly localeLabels: Record<SupportedLocale, string> = {
    en: 'EN',
    es: 'ES',
  };
}
