import {AfterViewInit, Component, OnInit} from '@angular/core';
import {IConfiguration} from '../../projects/ngx-multifile-upload/src/lib/component/task-file-upload/model/configuration-type';
import {FileUpload} from '../../projects/ngx-multifile-upload/src/lib/component/task-file-upload/file-upload';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  /*   public get configuration(): IConfiguration {
     return {
       allowedContentTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'],
       maxFileSize: 1,
       allowMultiple: true,
       request: {
         url: 'http://localhost:3333/api/upload',
         method: 'POST'
       }
     };
   }*/


  public get configuration1(): IConfiguration {

    let link = 'http://localhost:3333/api/uploadBuffer';





    const head = [
      /*      {key: 'x-ms-blob-type', value: 'BlockBlob'},
            {key: 'x-ms-version', value: '2019-02-02'},
            {key: 'x-ms-blob-content-disposition', value: 'inline'},
            {key: 'x-ms-blob-content-type', value: 'image/jpeg'},*/
      {key: 'Content-Type', value: 'application/octet-stream'}
    ];

/*        const parms = [{key: 'st', value: '2020-01-29T093A07%3A11Z'},
          {key: 'se', value: '2050-01-30T09%3A07%3A00Z'},
          {key: 'sp', value: 'racwdl'},
          {key: 'sv', value: '2018-03-28'},
          {key: 'sr', value: 'b'},
          {key: 'sig', value: 'BCb%2FmnNXubZt%2BGh%2Fi3BgR%2Bd%2F0BK8BBAW1A%2FxJX7VJMg%3D'}
        ];*/

    const parms = [{key: 'name', value: 'ashish'},
    ];

    return {
      allowedContentTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'],
      maxFileSize: 1,
      allowMultiple: true,
      request: {
        url: link,
        method: 'POST',
        headers: head,
        params: parms
      }
    };
  }

  public get configuration(): IConfiguration {

    let link = 'http://localhost:3333/api/uploadBuffer';





    const head = [
      /*      {key: 'x-ms-blob-type', value: 'BlockBlob'},
            {key: 'x-ms-version', value: '2019-02-02'},
            {key: 'x-ms-blob-content-disposition', value: 'inline'},
            {key: 'x-ms-blob-content-type', value: 'image/jpeg'},*/
      {key: 'Content-Type', value: 'application/octet-stream'}
    ];



    return {
      allowedContentTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'],
      maxFileSize: 1,
      allowMultiple: true,
      request: {
        url: link,
        method: 'POST',
        headers: head
      }
    };
  }

  public get files(): File[] {
    return [new File([], 'test.jpg')];
  }

  ngOnInit(): void {
    let link = 'http://localhost:3333/api/uploadBuffer';

    const oReq = new XMLHttpRequest();
    oReq.open('POST', link, true);
    oReq.onprogress = (oEvent) => {
      console.log(oEvent);
    };

    const  blob = new Blob(['abc123'], {type: 'application/octet-stream'});

    oReq.send(blob);
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
