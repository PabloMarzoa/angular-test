import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Edit } from './edit';
import { TodosRestService } from '../../shared/rest/todos-rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('Edit', () => {
  let component: Edit;
  let fixture: ComponentFixture<Edit>;
  let mockTodosRestService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockTodosRestService = {
      getTodo: vi
        .fn()
        .mockReturnValue(of({ id: 1, userId: 2, title: 'Test Todo', completed: true })),
      updateTodo: vi
        .fn()
        .mockReturnValue(of({ id: 1, userId: 2, title: 'Updated Todo', completed: false })),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('1'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [Edit],
      providers: [
        provideAnimations(),
        { provide: TodosRestService, useValue: mockTodosRestService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Edit);
    component = fixture.componentInstance;
    vi.stubGlobal('history', { state: {} });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should create and populate model if state is provided', () => {
    const mockTodo = { userId: 2, title: 'Test Todo', completed: true };
    vi.stubGlobal('history', { state: { todo: mockTodo } });

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.id()).toBe(1);
    expect((component as any).model()).toEqual(mockTodo);
    expect(component.isLoading()).toBe(false);
    expect(mockTodosRestService.getTodo).not.toHaveBeenCalled();
  });

  it('should redirect if state is missing', () => {
    vi.stubGlobal('history', { state: {} });
    fixture.detectChanges();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/todos']);
  });

  it('should redirect if no id in route', () => {
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);
    fixture.detectChanges();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/todos']);
  });

  it('should navigate to dashboard on cancel', () => {
    fixture.detectChanges();
    (component as any).cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/todos']);
  });

  it('should call updateTodo and navigate on save', () => {
    const mockTodo = { userId: 2, title: 'Test Todo', completed: true };
    vi.stubGlobal('history', { state: { todo: mockTodo } });

    fixture.detectChanges();
    (component as any).save();

    expect(component.isSaving()).toBe(false);
    expect(mockTodosRestService.updateTodo).toHaveBeenCalledWith(1, mockTodo);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/todos']);
  });
});
