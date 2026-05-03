import {
  ChangeDetectionStrategy,
  Component,
  effect,
  signal,
  output,
  input,
  untracked,
  viewChild,
  ElementRef,
} from '@angular/core';
import { form, FormField, debounce, disabled } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import type { FilterValue } from './filter.model';
import { TranslatePipe } from '../../shared/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-filter',
  imports: [FormField, MatFormFieldModule, MatSelectModule, MatInputModule, TranslatePipe],
  templateUrl: './filter.html',
  styleUrl: './filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Filter {
  private readonly titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');
  readonly isDisabled = input<boolean>(false);

  public focusTitleInput(): void {
    this.titleInput()?.nativeElement.focus();
  }

  readonly filterChanged = output<FilterValue>();
  readonly initialFilter = input<FilterValue | null>(null);

  protected readonly numberOptions = [1, 2, 3, 4];

  protected readonly model = signal({
    userId: 0,
    title: '',
  });

  protected readonly filterForm = form(this.model, (s) => {
    debounce(s.title, 750);
    disabled(s.userId, () => this.isDisabled());
    disabled(s.title, () => this.isDisabled());
  });

  private isInitialized = false;

  constructor() {
    effect(
      () => {
        const initial = this.initialFilter();
        if (initial && !this.isInitialized) {
          this.isInitialized = true;
          untracked(() => {
            this.model.set({
              userId: initial.userId ?? 0,
              title: initial.title ?? '',
            });
          });
        }
      },
      { allowSignalWrites: true },
    );

    effect(() => {
      const value = this.model();
      if (!untracked(() => this.filterForm().dirty())) return;

      this.filterChanged.emit({
        userId: value.userId === 0 ? null : value.userId,
        title: value.title,
      });
    });

    effect(() => {
      if (!this.isDisabled()) {
        untracked(() => {
          setTimeout(() => this.focusTitleInput(), 0);
        });
      }
    });
  }
}
