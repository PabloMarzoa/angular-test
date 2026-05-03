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

    vi.advanceTimersByTime(500); // Advance virtual time to bypass delay(500)

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

  it('should update pagination and load todos', () => {
    vi.useFakeTimers();
    const mockTodos: TodosItem[] = [{ id: 2, userId: 1, title: 'Test 2', completed: true }];

    service.updatePagination(1, 20);

    expect(service.pageIndex()).toBe(1);
    expect(service.pageSize()).toBe(20);

    const req = httpTestingController.expectOne(
      'https://jsonplaceholder.typicode.com/todos?_limit=20&_start=20',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockTodos);

    vi.advanceTimersByTime(500);
    expect(service.todos()).toEqual(mockTodos);
    vi.useRealTimers();
  });

  it('should delete a todo', () => {
    service.deleteTodo(1).subscribe();

    const req = httpTestingController.expectOne('https://jsonplaceholder.typicode.com/todos/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should update a todo via PUT with delay', () => {
    vi.useFakeTimers();
    const updatedTodo = { userId: 1, title: 'Updated', completed: true };
    let result: any;
    service.updateTodo(1, updatedTodo).subscribe((res) => (result = res));

    const req = httpTestingController.expectOne(`${service['API']}/todos/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedTodo);

    req.flush({ ...updatedTodo, id: 1 });
    vi.advanceTimersByTime(500); // Simulate delay

    expect(result).toEqual({ ...updatedTodo, id: 1 });
    vi.useRealTimers();
  });

  it('should apply userId filter as query param', () => {
    service.updateFilter({ userId: 2, title: '' });

    const req = httpTestingController.expectOne(
      (r) =>
        r.url === 'https://jsonplaceholder.typicode.com/todos' &&
        r.params.get('userId') === '2' &&
        !r.params.has('title_like'),
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
    expect(service.pageIndex()).toBe(0);
  });

  it('should apply title filter as title_like query param', () => {
    service.updateFilter({ userId: null, title: 'angular' });

    const req = httpTestingController.expectOne(
      (r) =>
        r.url === 'https://jsonplaceholder.typicode.com/todos' &&
        r.params.get('title_like') === 'angular' &&
        !r.params.has('userId'),
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should apply both userId and title filters together', () => {
    service.updateFilter({ userId: 3, title: 'test' });

    const req = httpTestingController.expectOne(
      (r) =>
        r.url === 'https://jsonplaceholder.typicode.com/todos' &&
        r.params.get('userId') === '3' &&
        r.params.get('title_like') === 'test',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should not include userId or title_like when filter is empty', () => {
    service.loadTodos();

    const req = httpTestingController.expectOne(
      (r) =>
        r.url === 'https://jsonplaceholder.typicode.com/todos' &&
        !r.params.has('userId') &&
        !r.params.has('title_like'),
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should add a new todo via POST with delay', () => {
    vi.useFakeTimers();
    const newTodo = { userId: 1, title: 'New Todo', completed: false };
    let result: any;
    service.addTodo(newTodo).subscribe((res) => (result = res));

    const req = httpTestingController.expectOne(`${service['API']}/todos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTodo);

    req.flush({ ...newTodo, id: 201 });
    vi.advanceTimersByTime(500);

    expect(result).toEqual({ ...newTodo, id: 201 });
    vi.useRealTimers();
  });

  it('should return the current filter via getter', () => {
    const filterValue = { userId: 5, title: 'test' };
    service.updateFilter(filterValue);
    // Flush the HTTP request triggered by updateFilter
    httpTestingController.expectOne((r) => r.url.includes('/todos')).flush([]);
    
    expect(service.currentFilter).toEqual(filterValue);
  });

  it('should not reload todos if updateFilter is called with same values', () => {
    const filterValue = { userId: 5, title: 'test' };
    service.updateFilter(filterValue);
    const req = httpTestingController.expectOne((r) => r.url.includes('/todos'));
    req.flush([]);

    service.updateFilter(filterValue);
    httpTestingController.expectNone((r) => r.url.includes('/todos'));
  });

  it('should persist changes to StorageService via effect', () => {
    const storageSpy = vi.spyOn(service['storageService'], 'setLocal');
    
    service.updatePagination(5, 50);
    // Flush the HTTP request triggered by updatePagination
    httpTestingController.expectOne((r) => r.url.includes('/todos')).flush([]);

    TestBed.flushEffects();
    expect(storageSpy).toHaveBeenCalled();
  });
});
