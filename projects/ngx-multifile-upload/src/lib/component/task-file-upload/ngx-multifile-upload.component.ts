import {AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ConfigurationReaderService} from './service/cofiguration-reader.service';
import {IConfiguration} from './model/configuration-type';
import {fromEvent, Observable, Subject, Subscription} from 'rxjs';
import {FileUpload, IFileUpload} from './file-upload';
import {first, takeUntil, tap} from 'rxjs/operators';
import {ProgressState} from './model/progress-state';
import {FileUploadService} from './service/file-upload.service';

@Component({
  selector: 'ngx-multifile-upload',
  templateUrl: './ngx-multifile-upload.component.html',
  styleUrls: ['./ngx-multifile-upload.component.css'],
  providers: [FileUploadService, ConfigurationReaderService]
})
export class NgxMultifileUploadComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {

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

  private clickEventObservable$: Observable<Event>;

  private fileInputChangeEventObservable$: Observable<any>;

  private dragOverEventObservable$: Observable<any>;

  private dragLeaveEventObservable$: Observable<any>;

  private dropEventObservable$: Observable<any>;

  private unsubscribe$: Subject<void> = new Subject();

  private clickSubscription: Subscription;

  private dragOverSubscription: Subscription;

  private dragLeaveSubscription: Subscription;

  private dropSubscription: Subscription;

  private inputChangeSubscription: Subscription;

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

  ngOnInit() {
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
        this.subscribeToFileSources();
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
      this.configurationReaderService.config = this.configuration;
      return this.configurationReaderService.read().pipe(
        tap(() => {
          this.isConfigurationValid = true;
          this.registerFileSources();
          this.subscribeToFileSources();
        }, (error) => {
          this.isConfigurationValid = false;
          this.failed.emit(error);
        })
      );
    } catch (error) {
      this.failed.emit(error);
    }
  }

  // Register file source
  public registerFileSources() {
    // These events should only be called once before needing to resubscribe.
    this.clickEventObservable$ = fromEvent(this.getParentElement, 'click').pipe(first(), takeUntil(this.unsubscribe$));
    this.dropEventObservable$ = fromEvent(this.getParentElement, 'drop').pipe(first(), takeUntil(this.unsubscribe$));
    this.fileInputChangeEventObservable$ = fromEvent(this.getInputElement, 'change').pipe(first(), takeUntil(this.unsubscribe$));

    this.dragOverEventObservable$ = fromEvent(this.getParentElement, 'dragover').pipe(takeUntil(this.unsubscribe$));
    this.dragLeaveEventObservable$ = fromEvent(this.getParentElement, 'dragleave').pipe(takeUntil(this.unsubscribe$));
  }

  public subscribeToFileSources() {
    this.clickSubscription = this.registerClickHandler();
    this.inputChangeSubscription = this.registerFileInput();
    this.registerDropZone();
  }

  // register click handler on the parent DOM element
  private registerClickHandler(): Subscription {
    return this.clickEventObservable$.subscribe((event) => {
      this.getInputElement.click();
    });
  }

  // register file input component change event
  private registerFileInput(): Subscription {
    return this.fileInputChangeEventObservable$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event) => {
        if (event.target.files && event.target.files.length > 0) {
          this.taskFileUploadService.createFileUploadAsync(event.target.files)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((fileUploads: FileUpload[]) => {
              this.deRegisterFileSources();
              // this.fileUploadSubject.next(fileUploads);
              this.doUpload(fileUploads);
              this.cd.markForCheck();
            });
        }
      });
  }

  private registerDragOver(): Subscription {
    return this.dragOverEventObservable$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event) => {
        event.preventDefault();
        event.stopPropagation();
        this.getParentElement.className = this.configurationReaderService.config.dragOverClass;
      });
  }

  private registerDragLeave(): Subscription {
    return this.dragLeaveEventObservable$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event) => {
        event.preventDefault();
        event.stopPropagation();
        this.getParentElement.className = this.configurationReaderService.config.dropZoneClass;
      });

  }

  private registerDrop(): Subscription {
    return this.dropEventObservable$.subscribe((event) => {
      event.preventDefault();
      event.stopPropagation();


      const maxFileCount = this.configurationReaderService.config.allowMultiple ? this.maxFileCount : 1;

      if (event.dataTransfer.files && event.dataTransfer.files.length > 0 && event.dataTransfer.files.length === maxFileCount) {

        this.getParentElement.className = this.configurationReaderService.config.dropZoneClass;
        // create the file upload object
        this.taskFileUploadService.createFileUploadAsync(event.dataTransfer.files)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((fileUploads: FileUpload[]) => {
            this.deRegisterFileSources();
            // this.fileUploadSubject.next(fileUpload);
            this.doUpload(fileUploads);
          });
      } else {
        this.getParentElement.className = this.configurationReaderService.config.dropZoneClass;
      }
    });
  }

  // Register drop zone and subscribe dragover,dragleave and drop events to get the dragged files
  private registerDropZone() {
    this.dragOverSubscription = this.registerDragOver();
    this.dragLeaveSubscription = this.registerDragLeave();
    this.dropSubscription = this.registerDrop();
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

  // DeRegister file sources
  private deRegisterFileSources(): void {
    this.clickSubscription.unsubscribe();
    this.dragOverSubscription.unsubscribe();
    this.dragLeaveSubscription.unsubscribe();
    this.dropSubscription.unsubscribe();
    this.inputChangeSubscription.unsubscribe();
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

  ngAfterContentInit(): void {
  }
}
