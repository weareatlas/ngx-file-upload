import {IConfiguration} from '../../projects/ngx-file-upload/src/lib/component/model/configuration-type';
import {FileUpload} from '../../projects/ngx-file-upload/src/lib/component/file-upload';
import {AfterViewInit, Component, OnInit} from '@angular/core';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

    files: File[];

    public get configuration(): IConfiguration {
        return {
            allowedContentTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'],
            maxFileSize: 1,
            allowMultiple: true,
            request: {
                url: 'http://localhost:3333/api/upload',
                method: 'POST'
            }
        };
    }

    ngOnInit(): void {
        this.files = [new File([], 'test.jpg')];

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

    reset() {
        this.files = [];
    }
}
