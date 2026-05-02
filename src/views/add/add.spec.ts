import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Add } from './add';
import { TodosRestService } from '../../shared/rest/todos-rest.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('Add', () => {
  let component: Add;
  let fixture: ComponentFixture<Add>;
  let mockTodosRestService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockTodosRestService = {
      addTodo: vi.fn().mockReturnValue(of({ id: 201, userId: 1, title: 'New Todo', completed: false })),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Add],
      providers: [
        provideAnimations(),
        { provide: TodosRestService, useValue: mockTodosRestService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Add);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should navigate to todos on cancel', () => {
    fixture.detectChanges();
    (component as any).cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/todos']);
  });

  it('should call addTodo and navigate on save', () => {
    fixture.detectChanges();
    
    // Set some data
    (component as any).model.set({ userId: 1, title: 'New Todo', completed: false });
    
    (component as any).save();
    
    expect(component.isSaving()).toBe(false);
    expect(mockTodosRestService.addTodo).toHaveBeenCalledWith({ userId: 1, title: 'New Todo', completed: false });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/todos']);
  });
});
