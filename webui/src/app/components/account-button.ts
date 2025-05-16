import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {RouterModule} from '@angular/router';
import {AuthService} from '@edgeflare/ng-oidc';

@Component({
  selector: 'e-account-button',
  imports: [MatIconModule, MatMenuModule, RouterModule, MatButtonModule],
  template: `
<div>
  @if (!isAuthenticated()) {
  <button mat-button (click)="login()" aria-label="login">Login</button>
  }
  @else if (isAuthenticated()) {
  <div>
    <button mat-button [matMenuTriggerFor]="menu">
      <mat-icon>account_circle</mat-icon>
    </button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item routerLink="/account" aria-label="account">Account</button>
      <button mat-menu-item (click)="logout()">Logout</button>
    </mat-menu>
  </div>
  }
</div>
  `,
  styles: ``,
})
export class AccountButton {
  private authService = inject(AuthService);

  isAuthenticated = this.authService.isAuthenticated;

  login() {
    this.authService.signinRedirect();
  }

  logout() {
    this.authService.signoutRedirect();
  }
}
