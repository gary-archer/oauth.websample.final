import {UIError} from '../../plumbing/errors/uiError';

/*
 * State about application level errors
 */
export interface AppErrorProps {

    // The area is Startup, Login or Logout
    initialArea: string;

    // The error when available
    initialError: UIError | null;
}
