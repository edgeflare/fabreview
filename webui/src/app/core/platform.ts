import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {Injectable, PLATFORM_ID, inject} from '@angular/core';
import {Observable, map, shareReplay} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';
import {Platform} from '@angular/cdk/platform';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private platform = inject(Platform);

  readonly isBrowser: boolean;
  readonly IOS: boolean;
  readonly ANDROID: boolean;
  readonly isMac: boolean;
  readonly modifierKeyPrefix: string;
  private breakpointObserver = inject(BreakpointObserver);

  constructor() {
    this.isBrowser = this.platform.isBrowser;
    this.IOS = !this.isBrowser && this.platform.IOS;
    this.ANDROID = !this.isBrowser && this.platform.ANDROID;
    this.isMac = isPlatformBrowser(inject(PLATFORM_ID)) && navigator.userAgent.includes('Mac');
    this.modifierKeyPrefix = this.isMac ? '⌘' : '^';
  }

  /** Observables for detecting various device types */
  isHandset$ = this.observeBreakpoint(Breakpoints.Handset);
  isTablet$ = this.observeBreakpoint(Breakpoints.Tablet);

  /** Signals derived from the Observables */
  isHandset = toSignal(this.isHandset$);
  isTablet = toSignal(this.isTablet$);

  /**
   * Observes a specific breakpoint and returns an Observable indicating
   * whether the current viewport matches that breakpoint.
   */
  private observeBreakpoint(breakpoint: string): Observable<boolean> {
    return this.breakpointObserver.observe(breakpoint).pipe(
      map((result) => result.matches),
      shareReplay(1),
    );
  }
}
