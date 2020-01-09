import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {NgxMultifileUploadComponent} from './ngx-multifile-upload.component';

describe('TaskFileUploadComponent', () => {
    let component: NgxMultifileUploadComponent;
    let fixture: ComponentFixture<NgxMultifileUploadComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NgxMultifileUploadComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NgxMultifileUploadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
