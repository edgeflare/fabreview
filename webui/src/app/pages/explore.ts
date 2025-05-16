import {CommonModule} from '@angular/common';
import {Component, inject, Input, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterModule} from '@angular/router';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {PlatformService} from '@app/core';
import {NAV_ITEMS} from '@app/components/layout';

@Component({
  selector: 'e-explore',
  imports: [CommonModule, MatToolbarModule, MatButtonModule, RouterModule],
  template: `
    <iframe
      [ngStyle]="{'min-height': isHandset() ? 'calc(100vh - 7rem)' : 'calc(100vh - 8rem)'}"
      width="100%"
      height="100%"
      [src]="safeUrl">
    </iframe>
  `,
  styles: ``,
})
export class Explore implements OnInit, OnChanges {
  private platform = inject(PlatformService);
  private sanitizer = inject(DomSanitizer);

  readonly dashboards = NAV_ITEMS;
  @Input() dashboard!: string;
  safeUrl!: SafeResourceUrl;
  readonly isHandset = this.platform.isHandset;

  ngOnInit() {
    this.updateIframeUrl();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dashboard']) this.updateIframeUrl();
  }

  updateIframeUrl() {
    this.safeUrl = this.getSafeUrl(this.dashboard);
  }

  getSafeUrl(route: string): SafeResourceUrl {
    const selected = this.dashboards.find((d) => d.route === route) ?? this.dashboards[0];
    return this.sanitizer.bypassSecurityTrustResourceUrl(selected.exturl || '');
  }
}
