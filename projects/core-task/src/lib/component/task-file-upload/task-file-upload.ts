import { IRequestOption } from './model/request-option';
import { IProgress } from './model/progress';
import { ProgressState } from './model/progress-state';
import { HttpResponse } from '@angular/common/http';

export class TaskFileUpload {

    public parseError: string | Error;
    public error: string ;
    public response: any    ;
    public responseCode: number;
    public responseBody: any;

    constructor(private file: File, private requestOptions: IRequestOption) {

    }

    public get formData(): FormData {

        if (this.file) {
            const formData = new FormData();
            formData.append('file', this.file);
            return formData;
        }
        return null;
    }
    public get Request(): IRequestOption {
        return this.requestOptions;
    }

    public get FileInfo(): File {
        return this.file;
    }

    public progress: IProgress = {
        percent: 0,
        state: ProgressState.NotStarted,
        formattedValue: ''
    };


}

