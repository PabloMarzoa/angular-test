import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import type { TodosItem } from '../models/todos';
import type { FilterValue } from '../../components/filter/filter.model';
import { delay, finalize, type Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TodosRestService {
  private readonly API = 'https://jsonplaceholder.typicode.com';
  private readonly httpClient = inject(HttpClient);

  public readonly todos = signal<TodosItem[]>([]);
  public readonly isLoading = signal<boolean>(true);
  public readonly length = signal<number>(100); // fixed, I do not find a way to get the total number of items
  public readonly pageSize = signal<number>(10);
  public readonly pageIndex = signal<number>(0);
  public readonly pageSizeOptions = signal<number[]>([10, 20, 30]);
  private readonly filter = signal<FilterValue>({ userId: null, title: '' });

  public loadTodos(): void {
    this.isLoading.set(true);
    const startIndex = this.pageIndex() * this.pageSize();
    const { userId, title } = this.filter();

    let params = new HttpParams()
      .set('_limit', this.pageSize())
      .set('_start', startIndex);

    if (userId !== null) {
      params = params.set('userId', userId);
    }
    if (title.trim()) {
      params = params.set('title_like', title.trim());
    }

    this.httpClient
      .get<TodosItem[]>(`${this.API}/todos`, { params })
      .pipe(
        delay(500),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe((data) => this.todos.set(data));
  }

  public updatePagination(pageIndex: number, pageSize: number): void {
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);
    this.loadTodos();
  }

  public updateFilter(value: FilterValue): void {
    this.pageIndex.set(0); // Reset to first page on filter change
    this.filter.set(value);
    this.loadTodos();
  }

  public getTodo(id: number): Observable<TodosItem> {
    return this.httpClient.get<TodosItem>(`${this.API}/todos/${id}`);
  }

  public deleteTodo(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/todos/${id}`);
  }
}
