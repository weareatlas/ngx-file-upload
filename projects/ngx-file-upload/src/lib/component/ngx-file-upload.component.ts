import {ConfigurationReaderService} from './service/cofiguration-reader.service';
import {IConfiguration} from './model/configuration-type';
import {fromEvent, Subject} from 'rxjs';
import {FileUpload, IFileUpload} from './file-upload';
import {ProgressState} from './model/progress-state';
import {FileUploadService} from './service/file-upload.service';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import {first, takeUntil, tap} from 'rxjs/operators';

@Component({
  selector: 'ngx-file-upload',
  templateUrl: './ngx-file-upload.component.html',
  styleUrls: ['./ngx-file-upload.component.css'],
  providers: [FileUploadService, ConfigurationReaderService]
})
export class NgxFileUploadComponent implements AfterViewInit, OnDestroy {

  uploadStarted = false;

  @Input() files: File[];

  @Input() configuration: IConfiguration;

  @Input() public uploadText: string;

  @Output() uploaded: EventEmitter<File> = new EventEmitter<File>();

  @Output() deleted: EventEmitter<any> = new EventEmitter<any>();

  @Output() failed: EventEmitter<any> = new EventEmitter<any>();

  @Output() clicked: EventEmitter<any> = new EventEmitter<any>();

  private maxFileCount = 2;
  private isConfigurationValid = false;

  fileUploads: IFileUpload[];

  @ViewChild('taskFileInput', {static: true}) fileInput: ElementRef;

  @ViewChild('taskFileUploadParentContainer', {static: false}) parentElement: ElementRef;

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private configurationReaderService: ConfigurationReaderService,
              private taskFileUploadService: FileUploadService,
              private cd: ChangeDetectorRef) {
  }

  doUpload = (fileUploads, uploadStarted = true) => {
    this.fileUploads = fileUploads || [];
    if (uploadStarted) {
      this.getParentElement.className = this.configurationReaderService.config.fileUploadProgressClass;
    }
    this.uploadStarted = uploadStarted;
    if (fileUploads) {
      fileUploads.forEach((fileUpload) => {
        const uploadEvent = this.taskFileUploadService.upload(fileUpload);
        if (!uploadEvent) {
          // There is no upload event available for this file.
          return;
        }
        uploadEvent.pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe((d) => {
          if (fileUpload.progress.state === ProgressState.Completed) {
            this.uploaded.emit(fileUpload);
          }
        });
      });
    }
    this.cd.detectChanges();
  }

  click(fileUpload: FileUpload, event: any) {
    event.stopPropagation();
    this.clicked.emit(fileUpload);
  }

  delete(fileUploads: IFileUpload[], fileUpload: FileUpload, event: any) {
    event.stopPropagation();
    const fileUploadMapping = this.taskFileUploadService.fileUploadMapping.filter(file => file !== fileUpload.file.name);
    this.taskFileUploadService.fileUploadMapping = fileUploadMapping;
    this.fileInput.nativeElement.value = '';
    if (fileUpload.response) {
      if (this.hasJsonStructure(fileUpload)) {
        this.deleted.emit(JSON.parse(fileUpload.response.body));
      } else {
        this.deleted.emit(fileUpload.response.body);
      }
      fileUpload.delete();
    } else {
      fileUpload.isDeleted = true;
      this.deleted.emit(null);
    }

    if (this.taskFileUploadService.fileUploadMapping && this.taskFileUploadService.fileUploadMapping.length === 0) {
      this.getParentElement.className = this.configurationReaderService.config.dropZoneClass;
      if (this.uploadStarted) {
        this.uploadStarted = false;
        this.registerFileSources();
        // this.subscribeToFileSources();

      }
    }
  }

  ngAfterViewInit(): void {
    this.parseConfiguration().subscribe((configuration) => {
      let fileUploads = [];
      let uploadStarted = false;
      // Load default files
      if (this.files) {
        fileUploads = this.files.map((file) => {
          return {
            file,
            progress: {
              state: ProgressState.Exists
            }
          } as IFileUpload;
        });
        uploadStarted = true;
      }
      this.doUpload(fileUploads, uploadStarted);
    });
  }

  // parse configuration
  public parseConfiguration() {
    try {
      this.registerClickEvent();
      this.configurationReaderService.config = this.configuration;
      return this.configurationReaderService.read().pipe(
        tap(() => {
          this.isConfigurationValid = true;
          this.registerFileSources();
          // this.subscribeToFileSources();
          // this.registerFileSources();
        }, (error) => {
          this.isConfigurationValid = false;
          this.failed.emit(error);
        })
      );
    } catch (error) {
      this.failed.emit(error);
    }
  }


  registerClickEvent() {

    fromEvent(this.getParentElement, 'click').pipe(takeUntil(this.unsubscribe$)).subscribe((event) => {
      // this.getInputElement.focus();
      event.stopPropagation();

      if (this.getInputElement.files && this.getInputElement.files.length < 1) {
        this.getInputElement.click();
      }

    });


    fromEvent(this.getParentElement, 'dragover').pipe(takeUntil(this.unsubscribe$)).subscribe((event) => {

      event.preventDefault();
      event.stopPropagation();
      if (this.getInputElement.files && this.getInputElement.files.length < 1) {
        this.getParentElement.className = this.configurationReaderService.config.dragOverClass;
      }
    });

    fromEvent(this.getParentElement, 'dragleave').pipe(takeUntil(this.unsubscribe$)).subscribe((event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.getInputElement.files && this.getInputElement.files.length < 1) {
        this.getParentElement.className = this.configurationReaderService.config.dropZoneClass;
      }
    });


  }

  // Register file source
  public registerFileSources() {
    // These events should only be called once before needing to resubscribe.

    fromEvent(this.getInputElement, 'change').pipe(first(), takeUntil(this.unsubscribe$)).subscribe((event: any) => {

      if (event.target.files && event.target.files.length > 0) {
        this.taskFileUploadService.createFileUploadAsync(event.target.files)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((fileUploads: FileUpload[]) => {
            this.doUpload(fileUploads);
            this.cd.markForCheck();
          });
      }
    });


    fromEvent(this.getParentElement, 'drop').pipe(first(), takeUntil(this.unsubscribe$)).subscribe((event: any) => {

      event.preventDefault();
      event.stopPropagation();


      const maxFileCount = this.configurationReaderService.config.allowMultiple ? this.maxFileCount : 1;

      if (event.dataTransfer.files && event.dataTransfer.files.length > 0 && event.dataTransfer.files.length <= maxFileCount) {
        this.getParentElement.className = this.configurationReaderService.config.dropZoneClass;
        // create the file upload object
        this.taskFileUploadService.createFileUploadAsync(event.dataTransfer.files)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((fileUploads: FileUpload[]) => {
            this.doUpload(fileUploads);
          });
      } else {
        this.getParentElement.className = this.configurationReaderService.config.dropZoneClass;
      }

    });


  }

  // Gets reference to file input element
  private get getInputElement(): HTMLInputElement {
    if (this.fileInput) {
      return this.fileInput.nativeElement as HTMLInputElement;
    }
  }

  // get reference to the input element

  private get getParentElement(): HTMLElement {
    if (this.parentElement) {
      return this.parentElement.nativeElement as HTMLElement;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private hasJsonStructure(str) {
    if (typeof str !== 'string') {
      return false;
    }
    try {
      const result = JSON.parse(str);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]' || type === '[object Array]';
    } catch (err) {
      return false;
    }
  }
}
