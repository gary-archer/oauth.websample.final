/*
 * Details provided to the web authenticator
 */
export interface WebAuthenticatorOptions {

    webBaseUrl: string;

    onLoggedOut: () => void;
}
