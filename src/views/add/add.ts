import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TodosRestService } from '../../shared/rest/todos-rest.service';
import { form, FormField } from '@angular/forms/signals';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../shared/i18n/pipes/translate.pipe';
import { finalize } from 'rxjs/operators';
import type { TodoNew } from '../../shared/models/todos';

@Component({
  selector: 'app-add',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    FormField,
  ],
  templateUrl: './add.html',
  styleUrl: './add.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Add {
  private readonly router = inject(Router);
  private readonly todosRestService = inject(TodosRestService);

  readonly isSaving = signal(false);
  protected readonly numberOptions = [1, 2, 3, 4];

  protected readonly model = signal<TodoNew>({
    userId: 1,
    title: '',
    completed: false,
  });

  protected readonly addForm = form(this.model, (s) => {});

  protected cancel(): void {
    this.router.navigate(['/todos']);
  }

  protected save(): void {
    this.isSaving.set(true);
    this.todosRestService.addTodo(this.model()).pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe(() => {
      this.router.navigate(['/todos']);
    });
  }
}
