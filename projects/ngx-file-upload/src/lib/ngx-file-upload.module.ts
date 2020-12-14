import {NgModule} from '@angular/core';
import {NgxFileUploadComponent} from './component/ngx-file-upload.component';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {HttpClientModule} from '@angular/common/http';
import {MatIconModule} from '@angular/material/icon';
import {FlexLayoutModule} from '@angular/flex-layout';

@NgModule({
  declarations: [
    NgxFileUploadComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatProgressBarModule,
    MatListModule,
    MatIconModule,
    FlexLayoutModule
  ],
  exports: [
    NgxFileUploadComponent
  ]
})
export class NgxFileUploadModule {
}
