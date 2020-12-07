import {IRequestOption} from './request-option';

export interface IConfiguration {

    // Allowed File Types
    allowedContentTypes?: string[];

    // Allow multiple files
    allowMultiple?: boolean;

    // Maximum file sizes (MB)
    maxFileSize?: number;

    // Endpoint to upload the file
    request: IRequestOption;

    // Class to apply when a file is dragged over a drop zone
    dragOverClass?: string;

    // Class to apply when the component is displayed in the page
    dropZoneClass?: string;

    // Class to apply when a file upload is in progress
    fileUploadProgressClass?: string;

}
