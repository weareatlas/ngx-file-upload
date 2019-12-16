import { IRequestOption } from './request-option';

export interface IConfiguration {

    // Allowed File Types
    allowedContentTypes?: string[];

    // Allow multiple files
    allowMultiple?: boolean;

    // Maximum files for each upload
    maxFileCount?: number;

    // Maximum file sizs (MB)
    maxFileSize?: number;

    // Disbale the file upload on selecting files
    disableOnUpload?: boolean;

    // Endpoint to upload the file
     request: IRequestOption;

     // Class to apply when a file is dragged over a drop zone
     dragOverClass?: string;

}
