import { HttpParams } from '@angular/common/http';

export interface IRequestOption {
    url: string;
    method?: string;
    formData?: FormData | { [key: string]: string };
    headers?: Array<{ key: string, value: string }>;
    params?: HttpParams | {[param: string]: string | string[]; } | Array<{ key: string, value: string }>;
}
