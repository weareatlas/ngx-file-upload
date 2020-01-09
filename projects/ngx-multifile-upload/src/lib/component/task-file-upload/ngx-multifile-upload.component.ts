import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {ConfigurationReaderService} from './service/cofiguration-reader.service';
import {IConfiguration} from './model/configuration-type';
import {fromEvent, Observable, Subject, Subscription} from 'rxjs';
import {TaskFileUpload} from './task-file-upload';
import {takeUntil} from 'rxjs/operators';
import {ProgressState} from './model/progress-state';
import {FileUploadService} from './service/file-upload.service';

@Component({
  selector: 'ngx-multifile-upload',
  templateUrl: './ngx-multifile-upload.component.html',
  styleUrls: ['./ngx-multifile-upload.component.css']
})
export class NgxMultifileUploadComponent implements OnInit, AfterViewInit, OnDestroy {

  uploadStarted = false;

  @Input() configuration: IConfiguration;

  @Input() public uploadText: string;

  @Output() uploaded: EventEmitter<TaskFileUpload> = new EventEmitter<TaskFileUpload>();

  @Output() deleted: EventEmitter<any> = new EventEmitter<any>();

  @Output() failed: EventEmitter<any> = new EventEmitter<any>();

  private isConfigurationValid = false;

  // Observable subscribed on the view
  private fileUploadSubject = new Subject<TaskFileUpload[]>();

  public fileUploadObservable$ = this.fileUploadSubject.asObservable();

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

  constructor(private configurationReaderService: ConfigurationReaderService, private taskFileUploadService: FileUploadService) {
  }

  ngOnInit() {
  }

  delete(fileUploads: TaskFileUpload[], fileUpload: TaskFileUpload, event: any) {
    event.stopPropagation();
    const fileUploadMapping = this.taskFileUploadService.fileUploadMapping.filter(file => file !== fileUpload.FileInfo.name);
    this.taskFileUploadService.fileUploadMapping = fileUploadMapping;

    if (this.hasJsonStructure(fileUpload)) {
      this.deleted.emit(JSON.parse(fileUpload.response.body));
    } else {
      this.deleted.emit(fileUpload.response.body);
    }

    this.fileInput.nativeElement.value = '';

    fileUpload.delete();

    if (this.taskFileUploadService.fileUploadMapping && this.taskFileUploadService.fileUploadMapping.length === 0) {
      this.getParentElement.className = this.configurationReaderService.config.dropZoneClass;
      this.uploadStarted = false;
      this.registerFileSources();
      this.subscribeToFileSources();
    }
  }

  ngAfterViewInit(): void {
    this.parseConfiguration();
    this.fileUploadObservable$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.getParentElement.className = this.configurationReaderService.config.fileUploadProgressClass;
      this.uploadStarted = true;
      data.forEach((fileUpload) => {
        this.taskFileUploadService.upload(fileUpload).pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe((d) => {
          if (fileUpload.progress.state === ProgressState.Completed) {
            this.uploaded.emit(fileUpload);
          }
        });
      });
    });
  }

  // parse configuration
  public parseConfiguration() {
    try {
      this.configurationReaderService.config = this.configuration;
      this.configurationReaderService.read().subscribe(this.parseConfigurationObserver());
    } catch (error) {
      this.failed.emit(error);
    }
  }

  // configuration reader callback
  private parseConfigurationObserver() {
    return {
      next: configuration => {
        this.isConfigurationValid = true;
        this.registerFileSources();
        this.subscribeToFileSources();
      },
      error: error => {
        this.isConfigurationValid = false;
        // console.error(error);
        this.failed.emit(error);
      }
      // complete: () => console.log('Configuration reader complete.')
    };
  }

  // Register file source
  public registerFileSources() {
    this.clickEventObservable$ = fromEvent(this.getParentElement, 'click').pipe(takeUntil(this.unsubscribe$));
    this.fileInputChangeEventObservable$ = fromEvent(this.getInputElement, 'change').pipe(takeUntil(this.unsubscribe$));
    this.dragOverEventObservable$ = fromEvent(this.getParentElement, 'dragover').pipe(takeUntil(this.unsubscribe$));
    this.dragLeaveEventObservable$ = fromEvent(this.getParentElement, 'dragleave').pipe(takeUntil(this.unsubscribe$));
    this.dropEventObservable$ = fromEvent(this.getParentElement, 'drop').pipe(takeUntil(this.unsubscribe$));
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
            .subscribe((fileUpload: TaskFileUpload[]) => {
              this.deRegisterFileSources();
              this.fileUploadSubject.next(fileUpload);
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
      this.getParentElement.className = this.configurationReaderService.config.dropZoneClass;
      // create the file upload object
      this.taskFileUploadService.createFileUploadAsync(event.dataTransfer.files)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((fileUpload: TaskFileUpload[]) => {
          this.deRegisterFileSources();
          this.fileUploadSubject.next(fileUpload);
        });
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
}
