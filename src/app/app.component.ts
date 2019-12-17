import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IConfiguration } from 'core-task/task-core-task';

import { TaskFileUpload} from 'core-task';



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

  @ViewChild(TaskFileUpload, {static: false}) task: any;


  public getconfiguration(): IConfiguration {

    return {
     allowedContentTypes: [ 'image/png', 'image/jpg', 'image/jpeg', 'image/gif' ], maxFileSize: 1, disableOnUpload: true,
     allowMultiple: true, request: {url: 'https://putsreq.com/4sS1oMfgxoydiTUMsoyA', method: 'POST'  } ,
     dragOverClass: 'mat-elevation-z20'  };

  }
  private remove() {

  }
  ngOnInit(): void {


  }

  ngAfterViewInit(): void {

    const i = 'sdsd';

  }
}
