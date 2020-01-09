import { IRequestOption } from './model/request-option';
import { IProgress } from './model/progress';
import { ProgressState } from './model/progress-state';

export class TaskFileUpload {

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

    public parseError: string | Error;
    public error: string;
    public response: any;
    public responseCode: number;
    public responseBody: any;
    public isDeleted = false;

    public progress: IProgress = {
        percent: 0,
        state: ProgressState.NotStarted,
        formattedValue: ''
    };

    delete = () => {
      this.isDeleted = true;
      this.file = null;
      this.response = null;
    }
}
