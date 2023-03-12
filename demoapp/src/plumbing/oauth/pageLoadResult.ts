/*
 * The result of calling handle page load
 */
export interface PageLoadResult {

    // Whether the authenticator redirected this micro UI
    redirected: boolean;

    // Otherwise, the current path to restore, when processing a login response
    pathToRestore?: string;
}
