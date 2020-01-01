import { Subject, Observable, of } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { TaskFileUpload } from '../task-file-upload';
import { ProgressState } from '../model/progress-state';
import { tap, catchError} from 'rxjs/operators';
import { ConfigurationReaderService } from './cofiguration-reader.service';
import { FileSizeLimitExceededError, DisallowedContentTypeError, MaximumFileCountExceededError } from '../model/error';

@Injectable({
    providedIn: 'root',
  })
export class TaskFileUploadService implements OnDestroy  {

    private bytesPerMB = 1000 * 1000;

    constructor( private http: HttpClient, private configurationReaderService: ConfigurationReaderService) {

    }

    public fileUploadMapping =  [];
    private error = new Subject<Error>();
    public error$ = this.error.asObservable();

    private unsubscribe$: Subject<void> = new Subject();


    // upload file
    public upload(fileUpload: TaskFileUpload ): Observable<any> {

        const requestUrl = new URL(fileUpload.Request.url);

        return this.http.request(fileUpload.Request.method, requestUrl.toString(),
            {body: fileUpload.formData, reportProgress: true, observe: 'events',
            responseType: 'text', headers: fileUpload.Request.headers , params: fileUpload.Request.params })
            .pipe(
                tap( (event) => {
                switch (event.type) {
                    case HttpEventType.Sent:
                        fileUpload.response = `Uploading started.`;
                        break;
                    case HttpEventType.UploadProgress:
                        // Compute and show the % done:
                        const percentDone = Math.round(100 * event.loaded / event.total);
                        const formatted = percentDone + ' %';
                        fileUpload.progress = {state: ProgressState.InProgress , percent: percentDone, formattedValue: formatted };
                        break;

                    case HttpEventType.Response:
                        if (event.status === 200) {
                            fileUpload.progress = {state: ProgressState.Completed , percent: 100, formattedValue: '100 %'};
                        }
                        fileUpload.response = event;
                        break;
                    }
                }
                ), catchError( (error) => {
                    return new Observable( (s) => {
                        fileUpload.progress = {state: ProgressState.Failed , percent: 0, formattedValue: '' };
                        fileUpload.error = error;
                        console.log(error);
                    });
                })
            );
    }

   // Build FileUpload object
   public createFileUploadAsync(fileList: FileList | File[]): Observable<TaskFileUpload[]> {

    return new Observable<TaskFileUpload[]>( (subscriber) => {
        let files: File[] = fileList as File[];

        if (files instanceof FileList) {
            files = Array.from(files);
        }

        const allowedFiles: TaskFileUpload[] = [];

        if (files && files.length && this.configuration.maxFileCount) {

            if (files.length > this.configuration.maxFileCount) {
                const errorMessage = `You can upload maximumn ${this.configuration.maxFileSize} files at a time.`;
                const fileSizeExceedError = new MaximumFileCountExceededError(errorMessage);
                // this.error.next(fileSizeExceedError);
                // return;
            }
        }
        for (const file of files) {

            const fileUpload = new TaskFileUpload(file, this.configuration.request);

            if (this.configuration.maxFileSize &&
                 (file.size < this.configuration.maxFileSize * this.bytesPerMB)) {

                const isContentTypeValid = this.configuration.
                allowedContentTypes.find( contnetType => file.type === contnetType);

                if (isContentTypeValid) {
                    fileUpload.parseError = '';


                } else {
                    const errorMessage = `${file.name} failed to upload because its content type, ${file.type}, is not allowed.`;
                    const disallowedContentTypeError = new DisallowedContentTypeError(errorMessage);
                    fileUpload.parseError = disallowedContentTypeError;
                }
            } else {
                const errorMessage = `${file.name} is larger than the limit of ${this.configuration.maxFileSize}MB
                 for a single file.`;
                const fileSizeExceedError = new FileSizeLimitExceededError(errorMessage);
                fileUpload.parseError = fileSizeExceedError;
            }

            this.fileUploadMapping.push(fileUpload.FileInfo.name);
            allowedFiles.push(fileUpload);

        }

        subscriber.next(allowedFiles);
    } );
  }

    get configuration() {
        return this.configurationReaderService.config;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
