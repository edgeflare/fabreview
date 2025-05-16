import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
  WritableSignal,
} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule, RouterOutlet} from '@angular/router';
import {AccountButton} from '@components/account-button';
import {rxResource} from '@angular/core/rxjs-interop';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CommonModule} from '@angular/common';
import {Entity} from '@app/interfaces';
import {environment} from '@env';
import {of} from 'rxjs';
import {PlatformService} from '@app/core';
import {Footer} from '@components/footer';
import {NAV_ITEMS} from '@components/layout';
import {NavItem} from './nav-items';

@Component({
  selector: 'e-sidenav-layout',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    RouterOutlet,
    RouterModule,
    AccountButton,
    MatProgressSpinnerModule,
    Footer,
  ],
  templateUrl: './layout.html',
  styles: `
    .sidenav-container {
      height: 100%;
    }
    .sidenav {
      width: 200px;
    }
    .sidenav .mat-toolbar {
      background: inherit;
    }
    .mat-toolbar.mat-primary {
      position: sticky;
      top: 0;
      z-index: 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {
  private platform = inject(PlatformService);

  isHandset = this.platform.isHandset;
  navItemChanged = output<NavItem | null>();
  expandedNavItems = signal<NavItem[]>([]);
  isSidenavOpen: WritableSignal<boolean> = signal(!this.isHandset());
  chaincode = environment.chaincode.name;
  isFabricExplorer = () => window.location.pathname === '/explore/hyperledger-explorer';

  toggleSidenav() {
    this.isSidenavOpen.update((open) => !open);
  }

  navItems = rxResource({
    loader: () => {
      // const navItemId = this.activatedRoute.firstChild?.snapshot.params['exampleParamId'];
      // return this.http.get<NavItem[]>(`${environment.api}?queryParam=${navItemId}`);
      return of(NAV_ITEMS);
    },
  });

  isNavItemExpanded(element: NavItem): boolean {
    return this.expandedNavItems().includes(element);
  }

  toggleNavItemExpanded(element: NavItem, event?: MouseEvent) {
    event?.stopPropagation();

    if (this.isNavItemExpanded(element)) {
      // collapse the nav row
      this.expandedNavItems.update((rows) => rows.filter((row) => row !== element));
      this.navItemChanged.emit(null);
    } else {
      // expand the nav row
      this.expandedNavItems.update((rows) => [...rows, element]);
      this.navItemChanged.emit(element);

      // close the sidenav on mobile
      if (this.isHandset()) {
        this.isSidenavOpen.set(false);
      }
    }
  }
}
