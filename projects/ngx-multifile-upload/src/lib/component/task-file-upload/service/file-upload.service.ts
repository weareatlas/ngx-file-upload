import {Observable, Subject} from 'rxjs';
import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpEventType} from '@angular/common/http';
import {FileUpload, IFileUpload} from '../file-upload';
import {ProgressState} from '../model/progress-state';
import {catchError, mergeMap, tap} from 'rxjs/operators';
import {ConfigurationReaderService} from './cofiguration-reader.service';
import {DisallowedContentTypeError, FileSizeLimitExceededError, MaximumFileCountExceededError} from '../model/error';
import {BodyType} from '../model/body-type';

@Injectable({
    providedIn: 'root',
  })
export class FileUploadService implements OnDestroy  {

    private bytesPerMB = 1000 * 1000;

    constructor( private http: HttpClient, private configurationReaderService: ConfigurationReaderService) {
    }

    public fileUploadMapping = [];

    private error = new Subject<Error>();

    public error$ = this.error.asObservable();

    private unsubscribe$: Subject<void> = new Subject();

    // upload file
    public upload(x: IFileUpload): Observable<any> {

      const fileReadCompleted = new Subject();
      let fileUpload: FileUpload;
      if ('Request' in x) {
        fileUpload = x as FileUpload;
      } else {
        return null;
      }

      const requestUrl = this.configurationReaderService.buildUrl(fileUpload.Request.url);


      if (this.possibleBodyType === BodyType.Binary) {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(fileUpload.file);

        fileReader.onload = () => {
          fileReadCompleted.next(fileReader.result);
          fileReadCompleted.complete();
        };

        fileReader.onerror = (error) => {
          fileReadCompleted.error(error);
          fileReadCompleted.complete();
        };

      } else {
        return this.extracted(fileUpload, requestUrl, fileUpload.formData);
      }
      return fileReadCompleted.pipe(
        mergeMap((result) => this.extracted(fileUpload, requestUrl, result))
      );
    }

  private extracted(fileUpload: FileUpload, requestUrl: URL, data: any): Observable<any> {
    return this.http.request(fileUpload.Request.method, requestUrl.toString(), {
      body: data,
      reportProgress: true,
      observe: 'events',
      responseType: 'text',
      headers: this.configurationReaderService.buildHeaders(fileUpload.Request.headers),
      params: this.configurationReaderService.buildParms(fileUpload.Request.params)
    })
      .pipe(
        tap((event) => {
          switch (event.type) {
            case HttpEventType.Sent:
              fileUpload.response = `Uploading started.`;
              break;
            case HttpEventType.UploadProgress:
              // Compute and show the % done:
              const percentDone = Math.round(100 * event.loaded / event.total);
              const formatted = percentDone + '%';
              fileUpload.progress = {state: ProgressState.InProgress, percent: percentDone, formattedValue: formatted};
              break;
            case HttpEventType.Response:
              if (event.status === 200 || event.status === 201 || event.status === 204) {
                fileUpload.progress = {state: ProgressState.Completed, percent: 100, formattedValue: '100%'};
              }
              fileUpload.response = event;
              break;
          }
        }),
        catchError((error) => {
          return new Observable((s) => {
            fileUpload.progress = {state: ProgressState.Failed, percent: 0, formattedValue: ''};
            fileUpload.error = error;
          });
        })
      );
  }

// Build FileUpload object
   public createFileUploadAsync(fileList: FileList | File[]): Observable<FileUpload[]> {

    return new Observable<FileUpload[]>( (subscriber) => {
        let files: File[] = fileList as File[];

        if (files instanceof FileList) {
            files = Array.from(files);
        }

        const allowedFiles: FileUpload[] = [];

/*        if (files && files.length && this.configuration.maxFileCount) {

            if (files.length > this.configuration.maxFileCount) {
                const errorMessage = `You can upload maximum ${this.configuration.maxFileSize} files at a time.`;
                const fileSizeExceedError = new MaximumFileCountExceededError(errorMessage);
                // this.error.next(fileSizeExceedError);
                // return;
            }
        }*/
        for (const file of files) {

            const fileUpload = new FileUpload(file, this.configuration.request);

            if (this.configuration.maxFileSize && (file.size < this.configuration.maxFileSize * this.bytesPerMB)) {
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

    get possibleBodyType(): BodyType {

      if (this.configuration.request.headers) {

        const contentType = this.configuration.request.headers.filter( f => f.key.toLowerCase() === 'content-type');

        if (contentType && contentType.length > 0 && contentType[0].key.toLowerCase() === 'content-type'  &&
            contentType[0].value.toLowerCase() === 'application/octet-stream') {
          return BodyType.Binary;
        } else {
          return BodyType.FormData;
        }
      }
      return BodyType.FormData;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
