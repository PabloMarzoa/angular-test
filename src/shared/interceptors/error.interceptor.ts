import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const dialog = inject(MatDialog);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Determine the error message key
      const commonErrors = [0, 404, 500];
      const errorCode = commonErrors.includes(error.status) ? error.status : 'default';
      const messageKey = `httpErrors.${errorCode}`;

      const dialogRef = dialog.open(ConfirmDialog, {
        data: {
          title: 'httpErrors.title',
          message: messageKey,
          confirmText: 'common.retry',
          cancelText: 'common.cancel',
        },
        width: '400px',
        disableClose: true,
      });

      return dialogRef.afterClosed().pipe(
        switchMap((retry: boolean) => {
          if (retry) {
            // Re-run the chain with the same request
            return next(req);
          } else {
            // Navigate to dashboard if not already there
            if (!router.url.startsWith('/todos') || router.url.includes('/:id')) {
              if (router.url !== '/todos') {
                router.navigate(['/todos']);
              }
            }
            return throwError(() => error);
          }
        }),
      );
    }),
  );
};
