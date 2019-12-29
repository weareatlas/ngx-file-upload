import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IConfiguration } from 'projects/core-task/src/lib/component/task-file-upload/model/configuration-type';
import { TaskFileUpload } from 'core-task/public-api';




@Component({
  selector: 'task-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'task-library';


  private initialMessage = 'Drag & Drop files or click to upload .';
  private taskTitle = 'This is a Title';
  private taskSubTitle = 'This is sub-title.';

  // @ViewChild(TaskFileUpload, {static: false}) task: any;


  public getconfiguration(): IConfiguration {

    return {
     allowedContentTypes: [ 'image/png', 'image/jpg', 'image/jpeg', 'image/gif' ], maxFileSize: 1, disableOnUpload: true,
     allowMultiple: true, request: {url: 'https://putsreq.com/WRYT0psnRc5ikZoxkYX2/inspect', method: 'POST'  } };

     //
  }
  private remove() {

  }
  ngOnInit(): void {


  }

  ngAfterViewInit(): void {

  }


  private fileUploaded(event: TaskFileUpload) {
    console.log(event.response);
  }

  private fileDeleted(data: any) {
    console.log(data);
  }

  private error(eror: any) {
    console.log(eror);
  }
}
