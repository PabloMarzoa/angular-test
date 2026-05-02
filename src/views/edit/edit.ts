import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { catchError, finalize } from 'rxjs/operators';
import type { TodoNew, TodosItem } from '../../shared/models/todos';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-edit',
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
  templateUrl: './edit.html',
  styleUrl: './edit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Edit implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly todosRestService = inject(TodosRestService);

  readonly id = signal<number | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);

  protected readonly numberOptions = [1, 2, 3, 4];

  protected readonly model = signal<TodoNew>({
    userId: 0,
    title: '',
    completed: false,
  });

  protected readonly editForm = form(this.model, (s) => {});

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const state = history.state as { todo?: TodosItem } | null;

    if (idParam && state?.todo) {
      this.id.set(parseInt(idParam, 10));
      this.model.set({
        userId: state.todo.userId,
        title: state.todo.title,
        completed: state.todo.completed,
      });
      this.isLoading.set(false);
    } else {
      this.router.navigate(['/todos']);
    }
  }

  protected cancel(): void {
    this.router.navigate(['/todos']);
  }

  protected save(): void {
    const todoId = this.id();
    if (!todoId) return;

    this.isSaving.set(true);
    this.todosRestService.updateTodo(todoId, this.model()).pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe(() => {
      this.router.navigate(['/todos']);
    });
  }
}
