import {UIError} from '../../plumbing/errors/uiError';

/*
 * State about application level errors
 */
export interface AppErrorState {

    // The area is Startup, Login or Logout
    area: string;

    // The error when available
    error: UIError | null;
}
