import { ProgressState } from './progress-state';

export interface IProgress {
    percent: number;
    state: ProgressState;
    formattedValue: string;
}
