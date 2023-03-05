import {AxiosRequestConfig} from 'axios';

/*
 * An interface to represent attaching a credential to an API request
 */
export interface CredentialSupplier {
    onCallApi(options: AxiosRequestConfig, isRetry: boolean): Promise<void>;
}
