import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TodosRestService } from './todos-rest.service';
import type { TodosItem } from '../models/todos';

describe('TodosRestService', () => {
  let service: TodosRestService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TodosRestService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TodosRestService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get all todos and update the signal', () => {
    vi.useFakeTimers();
    const mockTodos: TodosItem[] = [{ id: 1, userId: 1, title: 'Test 1', completed: false }];

    service.loadTodos();

    const req = httpTestingController.expectOne(
      'https://jsonplaceholder.typicode.com/todos?_limit=10&_start=0',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockTodos);

    vi.advanceTimersByTime(500); // Avanzar el tiempo virtual para superar el delay(500)

    expect(service.todos()).toEqual(mockTodos);
    vi.useRealTimers();
  });

  it('should get a single todo by id', () => {
    const mockTodo: TodosItem = { id: 1, userId: 1, title: 'Test 1', completed: false };

    service.getTodo(1).subscribe((todo) => {
      expect(todo).toEqual(mockTodo);
    });

    const req = httpTestingController.expectOne('https://jsonplaceholder.typicode.com/todos/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockTodo);
  });
});
