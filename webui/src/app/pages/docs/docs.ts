import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {PlatformService} from '@app/core';
import {MatTableModule} from '@angular/material/table';
import {NAV_ITEMS} from '@app/components/layout';
import {RouterModule} from '@angular/router';
import {environment} from '@env';

@Component({
  selector: 'e-docs',
  standalone: true,
  imports: [
    CommonModule,
    ClipboardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    RouterModule,
  ],
  templateUrl: './docs.html',
  styles: `
    table {
      width: 100%;
    }
  `,
})
export class Docs {
  private platform = inject(PlatformService);

  isHandset = this.platform.isHandset;

  displayedColumns: string[] = ['name', 'exturl'];
  dataSource = NAV_ITEMS;

  enrollCmd = `FABRIC_PROXY_API=${environment.fabricProxy}/api/v1
curl -X POST -H "authorization: Bearer $JWT_ACCESS_TOKEN" $FABRIC_PROXY_API/account/enroll`;

  sendTxCmd = `TX_URL=$FABRIC_PROXY_API/default/fabreviewccv1/submit-transaction
curl -H "authorization: Bearer $JWT_ACCESS_TOKEN" $TX_URL \\
  -d '{"func": "FunctionName", "args": ["arg1", "[\\"arg2-item1\\", \\"arg2-item2\\"]", "{\\"arg3-key1\\": \\"arg3-value1\\"}"]}'`;
}
