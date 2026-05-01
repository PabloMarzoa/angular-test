import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { TodosRestService } from '../../shared/rest/todos-rest.service';
import type { TodosItem } from '../../shared/models/todos';
import { take } from 'rxjs';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  imports: [MatListModule, MatIcon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly todosRestService = inject(TodosRestService);
  protected readonly todos = signal<TodosItem[]>([]);
  protected readonly typesOfShoes: string[] = [
    'Boots',
    'Clogs',
    'Loafers',
    'Moccasins',
    'Sneakers',
  ];

  ngOnInit(): void {
    this.getTodos();
  }

  private getTodos(): void {
    this.todosRestService
      .getTodos()
      .pipe(take(1))
      .subscribe((todos) => {
        this.todos.set(todos);
      });
  }
}
