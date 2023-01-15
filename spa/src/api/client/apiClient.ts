import axios, {AxiosRequestConfig} from 'axios';
import {Guid} from 'guid-typescript';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';
import {UserInfo} from '../entities/userInfo';
import {AppConfiguration} from '../../configuration/appConfiguration';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {CredentialSupplier} from '../../plumbing/oauth/credentialSupplier';
import {AxiosUtils} from '../../plumbing/utilities/axiosUtils';
import {ApiClientOptions} from './apiClientOptions';

/*
 * A high level class used by the rest of the SPA to trigger API calls
 */
export class ApiClient {

    private readonly _apiBaseUrl: string;
    private readonly _sessionId: string;
    private readonly _credentialSupplier: CredentialSupplier;

    public constructor(configuration: AppConfiguration, sessionId: string, credentialSupplier: CredentialSupplier) {

        this._apiBaseUrl = configuration.apiBaseUrl;
        if (!this._apiBaseUrl.endsWith('/')) {
            this._apiBaseUrl += '/';
        }

        this._sessionId = sessionId;
        this._credentialSupplier = credentialSupplier;
    }

    /*
     * We download user info from the API rather than using the id token
     */
    public async getUserInfo(callerOptions?: ApiClientOptions): Promise<UserInfo> {

        return this._callApi(
            'userinfo',
            'GET',
            null,
            callerOptions);
    }

    /*
     * Get a list of companies
     */
    public async getCompanyList(callerOptions?: ApiClientOptions): Promise<Company[]> {

        return this._callApi(
            'companies',
            'GET',
            null,
            callerOptions);
    }

    /*
     * Get a list of transactions for a single company
     */
    public async getCompanyTransactions(id: string, callerOptions?: ApiClientOptions): Promise<CompanyTransactions> {

        return this._callApi(
            `companies/${id}/transactions`,
            'GET',
            null,
            callerOptions);
    }

    /*
     * A parameterized method containing application specific logic for managing API calls
     */
    private async _callApi(
        path: string,
        method: string,
        dataToSend: any,
        callerOptions?: ApiClientOptions): Promise<any> {

        // Get the full path
        const url = `${this._apiBaseUrl}${path}`;

        try {

            // Call the API
            return await this._callApiWithCredential(url, method, dataToSend, false, callerOptions);

        } catch (error1) {

            // Report Ajax errors if this is not a 401
            if (!this._isApi401Error(error1)) {
                throw ErrorFactory.fromHttpError(error1, url, 'Web API');
            }

            try {

                // The general pattern for calling an OAuth secured API is to retry 401s once
                return await this._callApiWithCredential(url, method, dataToSend, true, callerOptions);

            } catch (error2) {

                // Report Ajax errors for the retry
                throw ErrorFactory.fromHttpError(error2, url, 'Web API');
            }
        }
    }

    /*
     * Do the work of calling the API
     */
    private async _callApiWithCredential(
        url: string,
        method: string,
        dataToSend: any,
        isRetry: boolean,
        callerOptions?: ApiClientOptions): Promise<any> {

        const options = {
            url,
            method,
            data: dataToSend,
            headers: this._getHeaders(callerOptions?.causeError),
        } as AxiosRequestConfig;

        // Manage sending credentials from the SPA to the API
        await this._credentialSupplier.onCallApi(options, isRetry);

        // Make the API request
        const response = await axios.request(options);
        AxiosUtils.checkJson(response.data);
        return response.data;
    }

    /*
     * Add headers for logging and advanced testing purposes
     */
    private _getHeaders(causeError?: boolean | undefined): any {

        const headers: any = {

            // Context headers included in API logs
            'x-mycompany-api-client':     'FinalSPA',
            'x-mycompany-session-id':     this._sessionId,
            'x-mycompany-correlation-id': Guid.create().toString(),
        };

        // A special header can be sent to ask the API to throw a simulated exception
        if (causeError) {
            headers['x-mycompany-test-exception'] = 'SampleApi';
        }

        return headers;
    }

    /*
     * API 401s are handled via a retry with a new token
     */
    private _isApi401Error(error: any) {

        if (error.response && error.response.status === 401) {
            return true;
        }

        return false;
    }
}
