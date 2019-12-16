import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskFileUploadComponent } from './task-file-upload.component';

describe('TaskFileUploadComponent', () => {
  let component: TaskFileUploadComponent;
  let fixture: ComponentFixture<TaskFileUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskFileUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
