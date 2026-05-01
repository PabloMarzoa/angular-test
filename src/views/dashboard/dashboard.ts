import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { TodosRestService } from '../../shared/rest/todos-rest.service';
import type { TodosItem } from '../../shared/models/todos';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '../../shared/i18n/pipes/translate.pipe';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { take } from 'rxjs';
import { Filter } from '../../components/filter/filter';
import type { FilterValue } from '../../components/filter/filter.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-dashboard',
  imports: [MatListModule, MatIcon, TranslatePipe, MatPaginatorModule, MatProgressSpinnerModule, Filter, MatDialogModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly todosRestService = inject(TodosRestService);
  protected readonly todos = this.todosRestService.todos;
  protected readonly isLoading = this.todosRestService.isLoading;

  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.todosRestService.loadTodos();
  }

  get length(): number {
    return this.todosRestService.length();
  }

  get pageSize(): number {
    return this.todosRestService.pageSize();
  }

  get pageIndex(): number {
    return this.todosRestService.pageIndex();
  }

  get pageSizeOptions(): number[] {
    return this.todosRestService.pageSizeOptions();
  }

  protected onPageChange(event: PageEvent): void {
    this.todosRestService.updatePagination(event.pageIndex, event.pageSize);
  }

  protected onFilterChanged(value: FilterValue): void {
    this.todosRestService.updateFilter(value);
  }

  protected editTodo(todo: TodosItem): void {
    console.log('edit', todo);
  }

  protected deleteTodo(todo: TodosItem): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'common.delete',
        message: 'common.confirmDelete',
        confirmText: 'common.delete',
        cancelText: 'common.cancel',
      },
      width: '400px',
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.todosRestService
          .deleteTodo(todo.id)
          .pipe(take(1))
          .subscribe(() => {
            this.todosRestService.loadTodos();
          });
      }
    });
  }
}
