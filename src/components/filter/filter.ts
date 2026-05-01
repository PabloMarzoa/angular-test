import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  inject,
  Injector,
  signal,
  output,
  input,
  untracked,
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
export class Filter implements OnInit {
  readonly isDisabled = input<boolean>(false);

  private readonly injector = inject(Injector);

  readonly filterChanged = output<FilterValue>();

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

  ngOnInit(): void {
    effect(
      () => {
        const value = this.model();
        if (!untracked(() => this.filterForm().dirty())) return;
        this.filterChanged.emit({
          userId: value.userId === 0 ? null : value.userId,
          title: value.title,
        });
      },
      { injector: this.injector },
    );
  }
}
