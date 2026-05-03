import { TestBed } from '@angular/core/testing';
import { CustomPaginatorIntl } from './custom-paginator-intl.service';
import { TranslationService } from './translation.service';
import { signal, WritableSignal } from '@angular/core';

describe('CustomPaginatorIntl', () => {
  let service: CustomPaginatorIntl;
  let mockLoadingSignal: WritableSignal<boolean>;

  beforeEach(() => {
    mockLoadingSignal = signal(false);

    const mockTranslationService = {
      loading: mockLoadingSignal,
      translate: vi.fn((key: string, params?: Record<string, string | number>) => {
        if (key === 'paginator.itemsPerPageLabel') return 'Items per page';
        if (key === 'paginator.nextPageLabel') return 'Next';
        if (key === 'paginator.previousPageLabel') return 'Prev';
        if (key === 'paginator.firstPageLabel') return 'First';
        if (key === 'paginator.lastPageLabel') return 'Last';
        if (key === 'paginator.rangeEmpty') return `0 of ${params?.['length']}`;
        if (key === 'paginator.range') {
          return `${params?.['startIndex']} - ${params?.['endIndex']} of ${params?.['length']}`;
        }
        return key;
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        CustomPaginatorIntl,
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    });

    service = TestBed.inject(CustomPaginatorIntl);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize labels using the translation service', () => {
    TestBed.flushEffects();

    expect(service.itemsPerPageLabel).toBe('Items per page');
    expect(service.nextPageLabel).toBe('Next');
    expect(service.previousPageLabel).toBe('Prev');
    expect(service.firstPageLabel).toBe('First');
    expect(service.lastPageLabel).toBe('Last');
  });

  it('should emit changes when translation service finishes loading', () => {
    const changesSpy = vi.fn();
    service.changes.subscribe(changesSpy);

    // Initial flush
    TestBed.flushEffects();
    expect(changesSpy).toHaveBeenCalledTimes(1);

    // Simulate loading
    mockLoadingSignal.set(true);
    TestBed.flushEffects();
    // effect shouldn't call changes.next() because of the early return
    expect(changesSpy).toHaveBeenCalledTimes(1);

    // Simulate loading finished
    mockLoadingSignal.set(false);
    TestBed.flushEffects();

    // effect should trigger again and call changes.next()
    expect(changesSpy).toHaveBeenCalledTimes(2);
  });

  describe('getRangeLabel', () => {
    it('should format range for 0 length or 0 pageSize', () => {
      expect(service.getRangeLabel(0, 10, 0)).toBe('0 of 0');
      expect(service.getRangeLabel(0, 0, 10)).toBe('0 of 10');
    });

    it('should format range for valid pages', () => {
      // page 0, size 10, total 100 -> 1 - 10 of 100
      expect(service.getRangeLabel(0, 10, 100)).toBe('1 - 10 of 100');

      // page 1, size 10, total 100 -> 11 - 20 of 100
      expect(service.getRangeLabel(1, 10, 100)).toBe('11 - 20 of 100');
    });

    it('should format range when total is smaller than page size', () => {
      // page 0, size 10, total 5 -> 1 - 5 of 5
      expect(service.getRangeLabel(0, 10, 5)).toBe('1 - 5 of 5');
    });
  });
});
