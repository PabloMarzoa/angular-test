import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { TodosRestService } from '../../shared/rest/todos-rest.service';
import { of } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { signal } from '@angular/core';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let mockTodosRestService: any;

  beforeEach(async () => {
    mockTodosRestService = {
      todos: signal([]),
      isLoading: signal(false),
      length: signal(100),
      pageSize: signal(10),
      pageIndex: signal(0),
      pageSizeOptions: signal([10, 20, 30]),
      loadTodos: vi.fn(),
      updatePagination: vi.fn(),
      deleteTodo: vi.fn().mockReturnValue(of(null))
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: TodosRestService, useValue: mockTodosRestService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose pagination getters from service', () => {
    expect(component.length).toBe(100);
    expect(component.pageSize).toBe(10);
    expect(component.pageIndex).toBe(0);
    expect(component.pageSizeOptions).toEqual([10, 20, 30]);
  });

  it('should call updatePagination on PageEvent', () => {
    const event: PageEvent = { pageIndex: 2, pageSize: 20, length: 100 };
    (component as any).onPageChange(event);
    expect(mockTodosRestService.updatePagination).toHaveBeenCalledWith(2, 20);
  });

  it('should log on editTodo', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const mockTodo = { id: 1, userId: 1, title: 'Test', completed: false };
    (component as any).editTodo(mockTodo);
    expect(consoleSpy).toHaveBeenCalledWith('edit', mockTodo);
  });

  it('should delete todo and reload', () => {
    const mockTodo = { id: 1, userId: 1, title: 'Test', completed: false };
    (component as any).deleteTodo(mockTodo);
    
    expect(mockTodosRestService.deleteTodo).toHaveBeenCalledWith(1);
    expect(mockTodosRestService.loadTodos).toHaveBeenCalled();
  });

  it('should render spinner when loading', () => {
    mockTodosRestService.isLoading.set(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-spinner')).toBeTruthy();
  });

  it('should render the list of todos when loaded', () => {
    mockTodosRestService.isLoading.set(false);
    mockTodosRestService.todos.set([
      { id: 1, userId: 1, title: 'Learn Angular', completed: false },
      { id: 2, userId: 1, title: 'Master Vitest', completed: true },
    ]);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('mat-list-item');
    expect(items.length).toBe(2);
    expect(compiled.querySelector('mat-spinner')).toBeFalsy();
  });
});
