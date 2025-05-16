import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {PlatformService} from '@app/core';

@Component({
  selector: 'e-footer',
  imports: [CommonModule, MatToolbarModule, MatIconModule],
  template: `
    <mat-toolbar class="flex flex-row flex-wrap justify-around" color="primary" [ngStyle]="isHandset() ? {'min-height': '5rem'} : {}">
      <button mat-button class="" aria-label="github repo">
        <a class="flex" target="_blank" href="https://github.com/edgeflare/fabreview">
          <span class="text-blue-700 font-semibold text-lg">
            <img style="height: 1.25rem;" src="https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg" alt="">
          </span> &nbsp;
        </a>
      </button>

      <button mat-button class="" aria-label="discord url">
        <a class="flex" target="_blank" href="https://discord.gg/28j47Px9">
          <span class="text-blue-700 font-semibold text-lg">
            <img style="height: 1.25rem;" src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/66e3d80db9971f10a9757c99_Symbol.svg" alt="">
          </span> &nbsp;
        </a>
      </button>
    `,
  styles: ``,
})
export class Footer {
  private platform = inject(PlatformService);
  isHandset = this.platform.isHandset;
}
