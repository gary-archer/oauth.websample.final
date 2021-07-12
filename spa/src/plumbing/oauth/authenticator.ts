/*
 * An interface to abstract authentication differences between web and mobile hosts
 */
export interface Authenticator {

    // Set up a web worker to isolate the storage of access tokens
    initializeWebWorker(worker: Worker): Promise<void>;

    // Commands that use the access token are run in the web worker's isolated context
    callApiWithAccessToken(action: (token: string) => Promise<any>): Promise<void>;

    // Perform a login redirect
    login(): Promise<void>;

    // Handle a main window login response when the page loads
    handlePageLoad(): Promise<void>;

    // Perform a logout redirect
    logout(): Promise<void>;

    // For testing, make the access token act like it is expired
    expireAccessToken(): Promise<void>;

    // For testing, make the refresh token act like it is expired
    expireRefreshToken(): Promise<void>;
}
