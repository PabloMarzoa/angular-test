import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import type { TodosItem } from '../models/todos';
import { delay, finalize, timer, type Observable } from 'rxjs';

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

  public loadTodos(): void {
    this.isLoading.set(true);
    const startIndex = this.pageIndex() * this.pageSize();
    const limit = this.pageSize();
    this.httpClient
      .get<TodosItem[]>(`${this.API}/todos?_limit=${limit}&_start=${startIndex}`)
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

  public getTodo(id: number): Observable<TodosItem> {
    return this.httpClient.get<TodosItem>(`${this.API}/todos/${id}`);
  }

  public deleteTodo(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/todos/${id}`);
  }
}
