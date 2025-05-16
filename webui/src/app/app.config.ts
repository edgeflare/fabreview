import {
  ApplicationConfig,
  // provideBrowserGlobalErrorListeners,
  // provideZonelessChangeDetection,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

import {routes} from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {environment} from '@env';
import {initOidc, OIDC_ROUTES} from '@edgeflare/ng-oidc';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideBrowserGlobalErrorListeners(),
    // provideZonelessChangeDetection(),
    provideExperimentalZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptorsFromDi(), withInterceptors([])),
    ...initOidc(environment.oidcConfig),
    provideRouter(OIDC_ROUTES),
    provideRouter(routes, withComponentInputBinding()),
  ],
};
