import { Injectable, effect, inject } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslationService } from './translation.service';

@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl {
  private readonly translationService = inject(TranslationService);

  constructor() {
    super();

    effect(() => {
      if (this.translationService.loading()) return;

      this.itemsPerPageLabel = this.translationService.translate('paginator.itemsPerPageLabel');
      this.nextPageLabel = this.translationService.translate('paginator.nextPageLabel');
      this.previousPageLabel = this.translationService.translate('paginator.previousPageLabel');
      this.firstPageLabel = this.translationService.translate('paginator.firstPageLabel');
      this.lastPageLabel = this.translationService.translate('paginator.lastPageLabel');

      this.changes.next();
    });
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return this.translationService.translate('paginator.rangeEmpty', { length });
    }
    const len = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < len ? Math.min(startIndex + pageSize, len) : startIndex + pageSize;
    
    return this.translationService.translate('paginator.range', { 
      startIndex: startIndex + 1, 
      endIndex, 
      length: len 
    });
  };
}
