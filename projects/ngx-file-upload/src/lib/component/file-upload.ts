import {IRequestOption} from './model/request-option';
import {IProgress} from './model/progress';
import {ProgressState} from './model/progress-state';

export interface IFileUpload {
    file: File;
    progress: IProgress;
    response: any;
    error?: {
        message?: string;
    };
    delete: () => void;
    isDeleted: boolean;
}

export class FileUpload implements IFileUpload {

    public parseError: string | Error;
    public error?: {
        message?: string;
    };
    public response: any;
    public responseCode: number;
    public responseBody: any;
    public isDeleted = false;
    public progress: IProgress = {
        percent: 0,
        state: ProgressState.NotStarted,
        formattedValue: ''
    };

    constructor(public file: File, private requestOptions: IRequestOption) {
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

    public delete = () => {
        this.isDeleted = true;
        this.file = null;
        this.response = null;
    }
}
