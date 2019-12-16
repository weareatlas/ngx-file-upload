import { NgModule } from '@angular/core';
import { TaskFileUploadComponent } from './component/task-file-upload/task-file-upload.component';
import { MatButtonModule, MatCard, MatCardModule, MatIconModule, MatDivider,
   MatDividerModule, MatProgressBarModule, MatListModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';




@NgModule({
  declarations: [ TaskFileUploadComponent],
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatListModule,
    CommonModule,
    FlexLayoutModule,
    HttpClientModule
  ],
  exports: [TaskFileUploadComponent]
})
export class CoreTaskModule { }
