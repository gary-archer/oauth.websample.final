import {PageLoadResult} from './pageLoadResult';

export interface Authenticator {

    // Get the authenticated state, or handle an OpenID Connect authorization response
    handlePageLoad(): Promise<PageLoadResult>;

    // Trigger a login redirect to the authorization server
    login(): Promise<void>;

    // Trigger a logout redirect to the authorization server
    logout(): Promise<void>;
}