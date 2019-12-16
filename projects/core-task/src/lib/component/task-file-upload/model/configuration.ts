import { IConfiguration } from './configuration-type';
import { IRequestOption } from './request-option';

export class Configuration implements IConfiguration {
    allowedContentTypes?: string[];
    allowMultiple?: boolean = false;
    maxFileCount?: number;
    maxFileSize?: number;
    disableOnUpload?: boolean = false;
    request: IRequestOption;
}
