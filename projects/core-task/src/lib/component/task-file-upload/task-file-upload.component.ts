import { Component, OnInit, Input, Output, AfterViewInit, ViewChild, ElementRef, OnDestroy, EventEmitter } from '@angular/core';
import { ConfigurationReaderService } from './service/cofiguration-reader.service';
import { IConfiguration } from './model/configuration-type';
import { Subject, fromEvent, Observable } from 'rxjs';
import {TaskFileUpload } from './task-file-upload';
import { takeUntil } from 'rxjs/operators';
import { ProgressState } from './model/progress-state';
import { TaskFileUploadService } from './service/task-file-upload.service';



@Component({
  selector: 'task-file-upload',
  templateUrl: './task-file-upload.component.html',
  styleUrls: ['./task-file-upload.component.css']
})
export class TaskFileUploadComponent implements OnInit, AfterViewInit, OnDestroy {


   @Input() configuration: IConfiguration;
   @Input() public initialMessage: string;
   @Input() public taskTitle: string;
   @Input() public taskSubTitle: string;

   @Output() uploaded: EventEmitter<TaskFileUpload> = new EventEmitter<TaskFileUpload>();
   @Output() deleted: EventEmitter<any> = new EventEmitter<any>();
   @Output() error: EventEmitter<any> = new EventEmitter<any>();




   private isConfigurationValid = false;

   // Observable subscribed on the view
   private fileUploadSubject = new Subject<TaskFileUpload[]>();
   public fileUploadObservable$ = this.fileUploadSubject.asObservable();

  //  private error = new Subject<Error>();
  //  public error$ = this.error.asObservable();


   @ViewChild('taskFileInput' , {static: true}) taskFileInput: ElementRef;
   @ViewChild('taskFileUploadParentContainer' , {static: false}) parentElement: ElementRef;


   private clickEventObservable$: Observable<Event>;
   private fileInputChangeEventObservable$: Observable<any>;
   private dragOverEventObservable$: Observable<any>;
   private dragLeaveEventObservable$: Observable<any>;
   private dropEventObservable$: Observable<any>;

   private unsubscribe$: Subject<void> = new Subject();


  constructor(private configurationReaderService: ConfigurationReaderService, private taskFileUploadService: TaskFileUploadService) {

   }

  ngOnInit() {
  }

   delete(response: any) {
    this.deleted.emit(JSON.parse(response.body));

  }
  private start() {

      this.parseConfiguration();

      this.fileUploadObservable$.subscribe ( (data) => {
        data.forEach((fileUpload) =>  {

            this.taskFileUploadService.upload(fileUpload).subscribe( (d) => {

              if (fileUpload.progress.state === ProgressState.Completed) {
                this.uploaded.emit(fileUpload);
              }

              });
          });
      });
  }

  ngAfterViewInit(): void {

    this.start();

  }


      // parse configuration
  public parseConfiguration() {

      try {
          this.configurationReaderService.config = this.configuration;
          this.configurationReaderService.Read().subscribe( this.parseConfigurationObserver());

        } catch (error) {
          this.error.emit(error);
        }
  }


        // configuration reader callback
    private parseConfigurationObserver() {
          return {
              next: configuration =>  {
                  this.isConfigurationValid = true;
                  this.registerFileSources();
                  this.subscribeToFileSources();
              },
              error: error => {
                  this.isConfigurationValid = false;
                  // console.error(error);
                  this.error.emit(error);
              }
              // complete: () => console.log('Configuration reader complete.') 
            };
    }

    // Register file source
  public registerFileSources() {

        this.clickEventObservable$ = fromEvent(this.getParentElement, 'click');
        this.fileInputChangeEventObservable$ = fromEvent(this.getInputElement, 'change');
        this.dragOverEventObservable$  = fromEvent(this.getParentElement, 'dragover');
        this.dragLeaveEventObservable$  = fromEvent(this.getParentElement, 'dragleave');
        this.dropEventObservable$ = fromEvent(this.getParentElement, 'drop');
  }


  public subscribeToFileSources() {

    this.registerClickHandler();
    this.registerFileInput();
    this.registerDropZone();

  }





    // register click handler on the parent DOM element
  private registerClickHandler() {

    this.clickEventObservable$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe( (event) => { this.getInputElement.click(); });
  }


  // register file input component change event
  private registerFileInput() {

    this.fileInputChangeEventObservable$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe( (event) => {

        this.taskFileUploadService.createFileUploadAsync(event.target.files).subscribe( (fileUpload: TaskFileUpload[]) => {
          this.deRegisterFileSources();
          this.fileUploadSubject.next(fileUpload);

      });

      });
  }


  // Register drop zone and subscribe dragover,dragleave and drop events to get the dragged files
  private registerDropZone() {


    this.dragOverEventObservable$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe( (event) => {

        event.preventDefault();
        event.stopPropagation();

        this.getParentElement.className = this.configurationReaderService.config.dragOverClass;
      });

    this.dragLeaveEventObservable$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe( (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.getParentElement.className = '';
      });

    this.dropEventObservable$
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe( (event) => {

          event.preventDefault();
          event.stopPropagation();
          this.getParentElement.className = '';

          // create the file upload object
          this.taskFileUploadService.createFileUploadAsync (event.dataTransfer.files).subscribe( (fileUpload: TaskFileUpload[]) => {
              this.deRegisterFileSources();
              this.fileUploadSubject.next(fileUpload);
          });

      });

    }




      // Gets reference to file input element
    private get getInputElement(): HTMLInputElement {
        if (this.taskFileInput) {
            return this.taskFileInput.nativeElement as HTMLInputElement;
        }
    }

    private get getParentElement(): HTMLElement {
      if (this.parentElement) {
          return this.parentElement.nativeElement as HTMLElement;
      }
  }


  ngOnDestroy(): void {
      this.deRegisterFileSources();
  }


  // DeRegister file sources
  private deRegisterFileSources(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
