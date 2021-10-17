import {AxiosRequestConfig} from 'axios';

/*
 * An interface to represent attaching a secure cookie or access token to an API request
 */
export interface CredentialSupplier {
    onCallApi(options: AxiosRequestConfig, isRetry: boolean): Promise<void>;
}
