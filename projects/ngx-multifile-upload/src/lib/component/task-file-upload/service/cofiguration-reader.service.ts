import { Observable, Subject } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { IConfiguration } from '../model/configuration-type';
import { Configuration } from '../model/configuration';
import { ConfigurationError } from '../model/error';

@Injectable({
    providedIn: 'root',
  })
export class ConfigurationReaderService implements OnDestroy  {

    private unsubscribe$: Subject<void> = new Subject();

    public config: IConfiguration;

    constructor() { }

    // read cofiguration
    read(): Observable<IConfiguration | Error> {

        return new Observable<IConfiguration | Error> ( (subscriber) => {
            if (this.config) {

                const configuration = new Configuration();

                // allowed content types
                if (this.config.allowedContentTypes) {
                    configuration.allowedContentTypes = this.config.allowedContentTypes;
                }

                // if multiple files can be uploaded
                if (this.config.allowMultiple) {
                    configuration.allowMultiple = this.config.allowMultiple;
                }

                // maxium file allowed
                if (this.config.maxFileCount) {
                    configuration.maxFileCount = this.config.maxFileCount;
                }

                // maximum size for each file
                if (this.config.maxFileSize) {
                    configuration.maxFileSize = this.config.maxFileSize;
                }

                // class to apply when file is dragged over a drop zone
                if (this.config.dragOverClass) {
                    configuration.dragOverClass = this.config.dragOverClass;
                } else {
                    configuration.dragOverClass = 'default-drag-over';
                }

                // drop zone class
                if (this.config.dropZoneClass) {
                    configuration.dropZoneClass = this.config.dropZoneClass;
                } else {
                    configuration.dropZoneClass = 'default-drop-zone';
                }

                // file upload progress class
                if (this.config.fileUploadProgressClass) {
                    configuration.fileUploadProgressClass = this.config.fileUploadProgressClass;
                } else {
                    configuration.fileUploadProgressClass = 'default-file-upload-progress';
                }

                // Request details
                if (this.config.request) {

                    if (this.config.request && this.config.request.url !== '') {

                        configuration.request = {
                             method: this.config.request.method,
                             url: this.config.request.url,
                             headers: this.config.request.headers ,
                             params: this.config.request.params };
                    } else {
                        subscriber.error(new ConfigurationError(`Please specify the endpoint to upload the file.`));
                    }

                } else {
                    subscriber.error(new ConfigurationError(`Please specify the request parameters.`));
                }

                this.config = configuration;
                subscriber.next(configuration);
                subscriber.complete();
            }
        }).pipe(takeUntil(this.unsubscribe$));
    }


    public buildHeaders(headers: any): {} {

        const objHeader = {};
        if (headers) {
            headers.forEach((header) => {
                if (header.value != null) {
                    objHeader[header.key] = header.value;
                }
            });
            return objHeader;
        }
        return objHeader;
    }


    public buildParms(params: any): {} {

        const objParms = {};
        if (params) {
            params.forEach((param) => {
                if (param.value != null) {
                    objParms[param.key] = param.value;
                }
            });
            return objParms;
        }
        return objParms;
    }

    public buildUrl(url: string, params: any): URL {

        const uploadUrl = new URL(url);

        if (params) {
            params.forEach((param) => {
                if (param.value != null) {
                    uploadUrl.searchParams.append(param.key, param.value);
                }
            });
            return uploadUrl;
        }

        return uploadUrl;
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
