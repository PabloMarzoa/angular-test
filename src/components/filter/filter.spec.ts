import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Filter } from './filter';
import type { FilterValue } from './filter.model';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('Filter', () => {
  let component: Filter;
  let fixture: ComponentFixture<Filter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Filter],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(Filter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should NOT emit filterChanged on initial load (form not dirty)', () => {
    const spy = vi.fn();
    component.filterChanged.subscribe(spy);
    TestBed.flushEffects();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should have a select with options 1 to 4 plus the empty option', () => {
    const selectEl = fixture.nativeElement.querySelector('mat-select');
    expect(selectEl).toBeTruthy();
    expect((component as any).numberOptions).toEqual([1, 2, 3, 4]);
  });

  it('should have a text input', () => {
    const inputEl = fixture.nativeElement.querySelector('input[type="search"]');
    expect(inputEl).toBeTruthy();
  });

  it('should emit filterChanged with null userId when userId is 0 (empty selection)', () => {
    const emittedValues: FilterValue[] = [];
    component.filterChanged.subscribe((v) => emittedValues.push(v));

    // Simulate user interaction by marking form dirty
    (component as any).filterForm().markAsDirty();
    (component as any).model.update((m: any) => ({ ...m, userId: 0 }));
    TestBed.flushEffects();

    const last = emittedValues[emittedValues.length - 1];
    expect(last.userId).toBeNull();
  });

  it('should emit filterChanged with numeric userId when a number is selected', () => {
    const emittedValues: FilterValue[] = [];
    component.filterChanged.subscribe((v) => emittedValues.push(v));

    (component as any).filterForm().markAsDirty();
    (component as any).model.update((m: any) => ({ ...m, userId: 3 }));
    TestBed.flushEffects();

    const last = emittedValues[emittedValues.length - 1];
    expect(last.userId).toBe(3);
  });

  it('should emit filterChanged when title in model changes', () => {
    const emittedValues: FilterValue[] = [];
    component.filterChanged.subscribe((v) => emittedValues.push(v));

    (component as any).filterForm().markAsDirty();
    (component as any).model.update((m: any) => ({ ...m, title: 'angular' }));
    TestBed.flushEffects();

    const last = emittedValues[emittedValues.length - 1];
    expect(last.title).toBe('angular');
  });

  it('should expose numberOptions as [1, 2, 3, 4]', () => {
    expect((component as any).numberOptions).toEqual([1, 2, 3, 4]);
  });
});
