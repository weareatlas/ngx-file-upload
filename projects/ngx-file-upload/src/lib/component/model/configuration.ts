import { IConfiguration } from './configuration-type';
import { IRequestOption } from './request-option';

export class Configuration implements IConfiguration {
    allowedContentTypes?: string[];
    allowMultiple = false;
    maxFileSize?: number;
    request: IRequestOption;
    dropZoneClass: string ;
    dragOverClass: string ;
    fileUploadProgressClass: string;
}
