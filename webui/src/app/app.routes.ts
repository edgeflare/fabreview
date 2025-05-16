import {Routes} from '@angular/router';
import {authGuard} from '@edgeflare/ng-oidc';
import {Layout} from '@components/layout';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {path: 'home', loadComponent: () => import('./pages/home/home').then((m) => m.Home)},
      {path: 'docs', loadComponent: () => import('./pages/docs/docs').then((m) => m.Docs)},
      {
        path: 'explore',
        children: [
          {
            path: ':dashboard',
            loadComponent: () => import('./pages/explore').then((m) => m.Explore),
          },
          {path: '**', redirectTo: 'hyperledger-explorer'},
        ],
      },
      {
        path: 'write',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/edit-review/edit-review').then((m) => m.EditReview),
      },
      {
        path: 'edit/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/edit-review/edit-review').then((m) => m.EditReview),
      },
      {
        path: 'account',
        canActivate: [authGuard],
        loadComponent: () => import('@edgeflare/ng-oidc').then((m) => m.AccountComponent),
      },
      {path: '**', redirectTo: 'home', pathMatch: 'full'},
    ],
  },
];
