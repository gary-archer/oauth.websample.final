import {TraceLine} from '../../plumbing/oauth/trace/traceLine';

/*
 * State managed by the trace view
 */
export interface TraceViewState {
    lines: TraceLine[];
}
