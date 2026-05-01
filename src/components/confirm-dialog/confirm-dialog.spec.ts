import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('ConfirmDialog', () => {
  let component: ConfirmDialog;
  let fixture: ComponentFixture<ConfirmDialog>;
  let mockDialogRef: any;
  let mockData: ConfirmDialogData;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn(),
    };

    mockData = {
      title: 'Test Title',
      message: 'Test Message',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
    };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        provideAnimations(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close with false when onCancel is called', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should close with true when onConfirm is called', () => {
    component.onConfirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should render title and message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h2[mat-dialog-title]');
    const message = compiled.querySelector('mat-dialog-content p');

    expect(title?.textContent).toContain('Test Title');
    expect(message?.textContent).toContain('Test Message');
  });
});
