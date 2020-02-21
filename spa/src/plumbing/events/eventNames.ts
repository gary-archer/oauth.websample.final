/*
 * Constants for event names
 */
export class EventNames {

    // Used to publish application level errors
    public static readonly error: string = 'error';

    // Used to handle reload events
    public static readonly reload: string = 'reload';

    // Used when trace messages arrive from the OIDC client library
    public static readonly trace: string = 'trace';
}
