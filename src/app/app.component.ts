import {AfterViewInit, Component, OnInit} from '@angular/core';
import {IConfiguration} from '../../projects/ngx-multifile-upload/src/lib/component/task-file-upload/model/configuration-type';
import {FileUpload} from '../../projects/ngx-multifile-upload/src/lib/component/task-file-upload/file-upload';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

   public get configuration(): IConfiguration {
   return {
     allowedContentTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'],
     maxFileSize: 1,
     allowMultiple: true,
     request: {
       url: 'http://localhost/files',
       method: 'POST'
     }
   };
 }
  public get files(): File[] {
    return [new File([], 'test.jpg')];
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  onUploaded(event: FileUpload) {
    console.log(event.response);
  }

  onDeleted(event: any) {
    console.log(event);
  }

  onFailed(event: any) {
    console.log(event);
  }

  onClicked(event: any) {
    console.log(event);
  }
}
