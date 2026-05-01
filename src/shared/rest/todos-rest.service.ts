import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { TodosItem } from '../models/todos';
import type { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TodosRestService {
  private readonly API = 'https://jsonplaceholder.typicode.com';
  private readonly httpClient = inject(HttpClient);

  public getTodos(): Observable<TodosItem[]> {
    return this.httpClient.get<TodosItem[]>(`${this.API}/todos`);
  }

  public getTodo(id: number): Observable<TodosItem> {
    return this.httpClient.get<TodosItem>(`${this.API}/todos/${id}`);
  }
}
