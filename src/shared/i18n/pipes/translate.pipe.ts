import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';

/**
 * Translates a dot-notation key using the active locale.
 *
 * Usage in templates:
 *   {{ 'common.save' | translate }}
 *   {{ 'common.greeting' | translate: { name: 'Ana' } }}
 *
 * The pipe is **impure** so it re-evaluates whenever the translation
 * service's locale changes. For performance-sensitive lists consider
 * using `translationService.translate()` directly inside a `computed()`.
 */
@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18n.translate(key, params);
  }
}
