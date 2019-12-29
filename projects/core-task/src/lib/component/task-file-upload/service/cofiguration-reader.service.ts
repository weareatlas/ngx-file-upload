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

    public  config: IConfiguration;

    constructor() {


    }

    // read upload cofiguration
    Read(): Observable<IConfiguration | Error> {


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

                // disable on file selection
                if (this.config.disableOnUpload) {
                    configuration.disableOnUpload = this.config.disableOnUpload;
                }

                if (this.config.dragOverClass) {
                    configuration.dragOverClass = this.config.dragOverClass;
                } else {
                    configuration.dragOverClass = 'default-drag-over';
                }

                if (this.config.dropZoneClass) {
                    configuration.dropZoneClass = this.config.dropZoneClass;
                } else {
                    configuration.dropZoneClass = 'default-drop-zone';
                }

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
        }).
        pipe(takeUntil(this.unsubscribe$));

    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
