import { HttpClient, HttpParams } from '@angular/common/http';
import { effect, inject, Injectable, signal, untracked } from '@angular/core';
import type { TodosItem, TodoNew } from '../models/todos';
import type { FilterValue } from '../../components/filter/filter.model';
import { delay, finalize, type Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';

const STORAGE_KEYS = {
  FILTER: 'todos_filter',
  PAGINATION: 'todos_pagination',
};

@Injectable({ providedIn: 'root' })
export class TodosRestService {
  private readonly API = 'https://jsonplaceholder.typicode.com';
  private readonly httpClient = inject(HttpClient);
  private readonly storageService = inject(StorageService);

  public readonly todos = signal<TodosItem[]>([]);
  public readonly isLoading = signal<boolean>(true);
  public readonly length = signal<number>(100);

  // Load initial values from Storage
  private readonly initialPagination = this.storageService.getLocal<{
    pageSize: number;
    pageIndex: number;
  }>(STORAGE_KEYS.PAGINATION);
  private readonly initialFilter = this.storageService.getLocal<FilterValue>(STORAGE_KEYS.FILTER);

  public readonly pageSize = signal<number>(this.initialPagination?.pageSize ?? 10);
  public readonly pageIndex = signal<number>(this.initialPagination?.pageIndex ?? 0);
  public readonly pageSizeOptions = signal<number[]>([10, 20, 30]);
  private readonly filter = signal<FilterValue>(this.initialFilter ?? { userId: null, title: '' });

  public get currentFilter(): FilterValue {
    return this.filter();
  }

  constructor() {
    effect(() => {
      const pagination = { pageSize: this.pageSize(), pageIndex: this.pageIndex() };
      const filter = this.filter();

      untracked(() => {
        this.storageService.setLocal(STORAGE_KEYS.PAGINATION, pagination);
        this.storageService.setLocal(STORAGE_KEYS.FILTER, filter);
      });
    });
  }

  public loadTodos(): void {
    this.isLoading.set(true);
    const startIndex = this.pageIndex() * this.pageSize();
    const { userId, title } = this.filter();

    let params = new HttpParams().set('_limit', this.pageSize()).set('_start', startIndex);

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
    const current = this.filter();
    // Prevents reload when restoring filter
    if (current.userId === value.userId && current.title === value.title) {
      return;
    }
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

  public updateTodo(id: number, todo: TodoNew): Observable<TodosItem> {
    return this.httpClient.put<TodosItem>(`${this.API}/todos/${id}`, todo).pipe(delay(500));
  }

  public addTodo(todo: TodoNew): Observable<TodosItem> {
    return this.httpClient.post<TodosItem>(`${this.API}/todos`, todo).pipe(delay(500));
  }
}
