import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'todos',
    loadComponent: () => import('../views/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'todos/:id',
    loadComponent: () => import('../views/edit/edit').then((m) => m.Edit),
  },
  {
    path: 'add',
    loadComponent: () => import('../views/add/add').then((m) => m.Add),
  },
  {
    path: '**',
    redirectTo: 'todos',
  },
];
